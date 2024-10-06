"use client";

import { DayData, ProcessedDayData } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Thermometer, Droplets, Calendar, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Props {
  temperature: ProcessedDayData;
  precipitation: DayData;
}

export default function DayPrediction({ temperature, precipitation }: Props) {
  const date = new Date(temperature.date);
  const month = date.toLocaleString("default", { month: "long" });
  const day = date.getDate();
  const year = date.getFullYear();

  const renderContent = () => {
    return (
      <div className="grid gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Calendar className="mr-2 h-4 w-4" /> Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{`${month} ${day}, ${year}`}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Thermometer className="mr-2 h-4 w-4" /> Temperature
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Celsius</p>
                <p className="text-2xl font-bold">
                  {temperature.celsius.toFixed(1)}°C
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fahrenheit</p>
                <p className="text-2xl font-bold">
                  {temperature.fahrenheit.toFixed(1)}°F
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Kelvin</p>
                <p className="text-2xl font-bold">
                  {temperature.kelvin.toFixed(1)}K
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Droplets className="mr-2 h-4 w-4" /> Precipitation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {precipitation.raw_value.toFixed(1)} mm
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex flex-col items-center hover:bg-muted py-2 px-4 rounded cursor-pointer transition-colors">
          <p className="whitespace-nowrap text-sm">
            <span className="text-muted-foreground">
              {date.toLocaleString("default", { month: "short" })}
            </span>{" "}
            {day}
          </p>
          <p className="font-medium text-3xl">
            {Math.round(temperature.celsius)}°
          </p>
          <p className="text-sm whitespace-nowrap">
            {Math.round(precipitation.raw_value)}{" "}
            <span className="text-muted-foreground">mm</span>
          </p>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-2">
            Weather Prediction
          </DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
