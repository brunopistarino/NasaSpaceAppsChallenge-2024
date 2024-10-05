/* eslint-disable @typescript-eslint/no-unused-vars */
import { Geometry } from '@/lib/types';

interface Props {
    datatype: number;
    begintime: string;
    endtime: string;
    intervalType: number;
    operationType: number;
    geometry: Geometry;
}

const API_URL = "https://climateserv.servirglobal.net/chirps/";

export async function submitDataRequest({
    datatype,
    begintime,
    endtime,
    intervalType,
    operationType,
    geometry
}:Props){
    const request = `${API_URL}submitDataRequest/?datatype=${datatype}&begintime=${begintime}&endtime=${endtime}&intervaltype=${intervalType}&operationtype=${operationType}&geometry=${JSON.stringify(geometry)}`
    try{
        const response = await fetch(
            request
        )
        if (response.ok){
            const data: string[] = await response.json();
            return data[0];
        }
        throw new Error(request);
    }
    catch(error){
        throw new Error('Failed to submit data request');
    }
}

export async function getDataRequestProgress(requestId: string){
    let data: number = 0;

    while (data < 100) {
        try{
            const response = await fetch(
                `${API_URL}getDataRequestProgress/?id=${requestId}`,
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
            throw new Error('Failed to get data request progress');
        }
    }
}

export async function getDataFromRequest(requestId: string){
    try{
        const response = await fetch(
            `${API_URL}getDataFromRequest/?id=${requestId}`,
        )
        if (response.ok){
            const data = await response.json();
            return data;
        }
        throw new Error('Failed to get data from request');
    }
    catch(error){
        throw new Error('Failed to get data from request');
    }
}
