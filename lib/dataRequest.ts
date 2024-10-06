import {
  getDataFromRequest,
  getDataRequestProgress,
  submitDataRequest,
} from "./actions/dataRequest";
import { DataRequest, DayData, Geometry, ProcessedDayData } from "./types";

interface Props {
  geometry: Geometry;
  accuracy: number;
  handleLoad: (value: number) => void;
}

export async function dataRequest({ geometry, accuracy, handleLoad }: Props) {
  const datatypes = Array.from({ length: 4 * accuracy }, (_, i) => i + 42);

  const dataReq = await submitAllDataRequest(geometry, datatypes, handleLoad);

  if (dataReq.error != null) {
    return {
      dataTemperature: null,
      dataPrecipitation: null,
      error: dataReq.error,
    };
  }

  handleLoad(100);

  return {
    dataTemperature: await processDataTemperature(dataReq.dataTemperature),
    dataPrecipitation: await processDataPrecipitation(
      dataReq.dataPrecipitation
    ),
    error: null,
  };
}

export async function submitAllDataRequest(
  geometry: Geometry,
  datatypes: number[],
  handleLoad: (value: number) => void
) {
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

          return true;
        } catch (error) {
          console.error(`Error processing datatype ${datatype}:`, error);
          return false;
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
    handleLoad(((i + batchSize) / datatypes.length) * 100 - 5);
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
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const days: number = data[0].data.length;

  for (let i = 0; i < days; i++) {
    let sum = 0;
    for (let j = 0; j < amount; j++) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      sum += data[j].data[i].raw_value;
    }
    const average = sum / amount;
    const dayData: ProcessedDayData = {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      year: data[0].data[i].year,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      month: data[0].data[i].month,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      day: data[0].data[i].day,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
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
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const days: number = data[0].data.length;

  for (let i = 0; i < days; i++) {
    let sum = 0;
    for (let j = 0; j < amount; j++) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      sum += data[j].data[i].raw_value;
    }
    const dayData: DayData = {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      year: data[0].data[i].year,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      month: data[0].data[i].month,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      day: data[0].data[i].day,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      date: data[0].data[i].date,
      raw_value: sum,
    };
    dataFinal.push(dayData);
  }
  return dataFinal;
}
