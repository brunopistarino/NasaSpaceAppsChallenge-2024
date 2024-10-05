interface Props {
  date: string;
  temperature: number;
}

export default function DayPrediction({ date, temperature }: Props) {
  const month = new Date(date).toLocaleString("default", { month: "short" });
  const day = new Date(date).getDate();

  return (
    <div className="flex flex-col items-center hover:bg-muted p-2 rounded">
      <p className="whitespace-nowrap">
        <span className="text-muted-foreground">{month}</span> {day}
      </p>
      <p className="font-medium text-3xl">{temperature}°</p>
    </div>
  );
}
