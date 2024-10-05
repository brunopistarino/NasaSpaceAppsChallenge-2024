import { DataRequest, Geometry, ProcessedDayData } from "../types";

interface Props {
    datatype: number;
    begintime: string;
    endtime: string;
    intervalType: number;
    operationType: number;
    geometry: Geometry;
}

export async function dataRequest({
    geometry
}:Props){
    const {dataTemperature, dataPrecipitation, error} = await submitAllDataRequest(geometry);
    if (error){
        return {dataTemperature: null, dataPrecipitation: null, error};
    }
    // Combine each day's data and make the final data object of each array of data with the average of each day
    const dataTemperatureFinal: ProcessedDayData[] = processData(dataTemperature);
    const dataPrecipitationFinal: ProcessedDayData[] = processData(dataPrecipitation);

    return {dataTemperature: dataTemperatureFinal, dataPrecipitation: dataPrecipitationFinal, error: null};
}

export async function submitAllDataRequest(geometry: Geometry){
    const dataTemperature:DataRequest[] = [];
    const dataPrecipitation:DataRequest[] = [];
    const intervalType = 0;
    const operationType = 5;

    // time format: MM/DD/YYYY. From today, plus nine months
    const today = new Date();
    const begintime = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
    today.setMonth(today.getMonth() + 9);
    const endtime = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;

    // Make an array of numbers from 42 to 89
    const datatypes = Array.from({length: 48}, (_, i) => i + 42);
    // generate an array of promises
    const promises = datatypes.map(async (datatype) => {
        submitDataRequest({
            datatype,
            begintime,
            endtime,
            intervalType,
            operationType,
            geometry
        }).then((requestId) => {
            getDataRequestProgress(requestId).then(() => {
                getDataFromRequest(requestId).then((data) => {
                    if (datatype % 2 === 0){
                        dataTemperature.push(data);
                    }
                    else{
                        dataPrecipitation.push(data);
                    }
                })
            })
        })
    })
    await Promise.all(promises).catch((error) => {
        console.error(error);
        const errorString: string = 'Failed to get data from request';
        return {dataTemperature: null, dataPrecipitation: null, error: errorString};
    });
    return {dataTemperature, dataPrecipitation, error: null};
}



export async function submitDataRequest({
    datatype,
    begintime,
    endtime,
    intervalType,
    operationType,
    geometry
}:Props){
    try{
        const response = await fetch(
            `${process.env.API_URL}/submitDataRequest/?datatype=${datatype}&begintime=${begintime}&endtime=${endtime}&intervaltype=${intervalType}&operationtype=${operationType}&geometry=${JSON.stringify(geometry)}`,
        )
        if (response.ok){
            const data: string[] = await response.json();
            return data[0];
        }
        throw new Error('Failed to submit data request');
    }
    catch(error){
        console.error(error);
        throw new Error('Failed to submit data request');
    }
}

export async function getDataRequestProgress(requestId: string){
    let data: number = 0;

    while (data < 100) {
        try{
            const response = await fetch(
                `${process.env.API_URL}/getDataRequestProgress/?id=${requestId}`,
            )
            if (response.ok){
                const dataArray = await response.json();
                data = dataArray[0];
            }
            else{
                throw new Error('Failed to get data request progress');
            }
        }
        catch(error){
            console.error(error);
            throw new Error('Failed to get data request progress');
        }
    }
}

export async function getDataFromRequest(requestId: string){
    try{
        const response = await fetch(
            `${process.env.API_URL}/getDataFromRequest/?id=${requestId}`,
        )
        if (response.ok){
            const data = await response.json();
            return data;
        }
        throw new Error('Failed to get data from request');
    }
    catch(error){
        console.error(error);
        throw new Error('Failed to get data from request');
    }
}


function processData(data: DataRequest[]){
    const dataFinal: ProcessedDayData[] = [];
    const amount = data.length;
    const days = data[0].days.length;

    for (let i = 0; i < days; i++){
        let sum = 0;
        for (let j = 0; j < amount; j++){
            sum += data[j].days[i].raw_value;
        }
        const average = sum / amount;
        const dayData: ProcessedDayData = {
            year: data[0].days[i].year,
            month: data[0].days[i].month,
            day: data[0].days[i].day,
            date: data[0].days[i].date,
            kelvin: average,
            celsius: average - 273.15,
            fahrenheit: (average - 273.15) * 9/5 + 32
        }
        dataFinal.push(dayData);
    }
    return dataFinal;   
}