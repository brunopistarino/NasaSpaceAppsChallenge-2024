import {
  getDataFromRequest,
  getDataRequestProgress,
  submitDataRequest,
} from "./actions/dataRequest";
import { DataRequest, DayData, Geometry, ProcessedDayData } from "./types";

// Array of datasets numbers
// const datatypes = Array.from({ length: 48 }, (_, i) => i + 42);
const datatypes = Array.from({ length: 4 }, (_, i) => i + 42);

export async function dataRequest(geometry: Geometry) {
  const dataReq = await submitAllDataRequest(geometry);

  if (dataReq.error != null) {
    return {
      dataTemperature: null,
      dataPrecipitation: null,
      error: dataReq.error,
    };
  }

  return {
    dataTemperature: await processDataTemperature(dataReq.dataTemperature),
    dataPrecipitation: await processDataPrecipitation(
      dataReq.dataPrecipitation
    ),
    error: null,
  };
}

export async function submitAllDataRequest(geometry: Geometry) {
  const dataTemperature: DataRequest[] = [];
  const dataPrecipitation: DataRequest[] = [];
  const intervalType = 0;
  const operationType = 5;

  // Time format: MM/DD/YYYY. From today, plus nine months
  const today = new Date();
  const begintime = `${
    today.getMonth() + 1
  }/${today.getDate()}/${today.getFullYear()}`;
  today.setMonth(today.getMonth() + 9);
  const endtime = `${
    today.getMonth() + 1
  }/${today.getDate()}/${today.getFullYear()}`;

  // Helper function to process requests in batches
  const processBatch = async (batch: number[]) => {
    const results = await Promise.allSettled(
      batch.map(async (datatype) => {
        try {
          const requestId = await submitDataRequest({
            datatype,
            begintime,
            endtime,
            intervalType,
            operationType,
            geometry,
          });
          await getDataRequestProgress(requestId);
          const data = await getDataFromRequest(requestId);

          if (datatype % 2 === 0) {
            dataTemperature.push(data);
          } else {
            dataPrecipitation.push(data);
          }

          return true; // Success
        } catch (error) {
          console.error(`Error processing datatype ${datatype}:`, error);
          return false; // Failure
        }
      })
    );

    // Count the number of successful requests
    const successCount = results.filter(
      (result) => result.status === "fulfilled" && result.value === true
    ).length;
    return successCount;
  };

  // Process requests in batches of 2
  const batchSize = 4;
  let totalSuccesses = 0;
  for (let i = 0; i < datatypes.length; i += batchSize) {
    const batch = datatypes.slice(i, i + batchSize);
    const successes = await processBatch(batch);
    totalSuccesses += successes;
  }

  // Ensure at least 50% success (or a custom threshold)
  const successThreshold = Math.ceil(datatypes.length / 2); // At least half should succeed
  if (totalSuccesses < successThreshold) {
    const errorString = `Only ${totalSuccesses} out of ${datatypes.length} requests succeeded.`;
    return {
      dataTemperature: null,
      dataPrecipitation: null,
      error: errorString,
    };
  }

  return { dataTemperature, dataPrecipitation, error: null };
}

async function processDataTemperature(data: DataRequest[]) {
  const dataFinal: ProcessedDayData[] = [];
  const amount: number = data.length;
  const days: number = data[0].data.length;

  for (let i = 0; i < days; i++) {
    let sum = 0;
    for (let j = 0; j < amount; j++) {
      sum += data[j].data[i].raw_value;
    }
    const average = sum / amount;
    const dayData: ProcessedDayData = {
      year: data[0].data[i].year,
      month: data[0].data[i].month,
      day: data[0].data[i].day,
      date: data[0].data[i].date,
      kelvin: average,
      celsius: average - 273.15,
      fahrenheit: ((average - 273.15) * 9) / 5 + 32,
    };
    dataFinal.push(dayData);
  }
  return dataFinal;
}

async function processDataPrecipitation(data: DataRequest[]) {
  const dataFinal: DayData[] = [];
  const amount: number = data.length;
  const days: number = data[0].data.length;

  for (let i = 0; i < days; i++) {
    let sum = 0;
    for (let j = 0; j < amount; j++) {
      sum += data[j].data[i].raw_value;
    }
    const dayData: DayData = {
      year: data[0].data[i].year,
      month: data[0].data[i].month,
      day: data[0].data[i].day,
      date: data[0].data[i].date,
      raw_value: sum,
    };
    dataFinal.push(dayData);
  }
  return dataFinal;
}
