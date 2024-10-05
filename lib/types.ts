export interface Geometry {
    type: string;
    coordinates: number[];
}

export interface DayData {
    year : number;
    month : number;
    day : number;
    date : string;
    raw_value : number;
}

export interface DataRequest {
    days: DayData[];
    datatype: number;
}

export interface ProcessedDayData {
    year : number;
    month : number;
    day : number;
    date : string;
    kelvin : number;
    celsius : number;
    fahrenheit : number;
}