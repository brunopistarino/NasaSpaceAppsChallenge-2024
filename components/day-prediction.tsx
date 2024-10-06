import { DayData, ProcessedDayData } from "@/lib/types";

interface Props {
  temperature: ProcessedDayData;
  precipitation: DayData;
}

export default function DayPrediction({ temperature, precipitation }: Props) {
  const date = new Date(temperature.date);
  const month = date.toLocaleString("default", { month: "short" });
  const day = date.getDate();

  return (
    <div className="flex flex-col items-center hover:bg-muted py-2 px-4 rounded cursor-default">
      <p className="whitespace-nowrap">
        <span className="text-muted-foreground">{month}</span> {day}
      </p>
      <p className="font-medium text-3xl">{Math.round(temperature.celsius)}°</p>
      <p>
        {Math.round(precipitation.raw_value)}{" "}
        <span className="text-muted-foreground">ml</span>
      </p>
    </div>
  );
}
