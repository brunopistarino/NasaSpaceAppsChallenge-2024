interface Props {
  name: string;
  percentage: number;
}

export default function CropPrediction({ name, percentage }: Props) {
  return (
    <div className="flex justify-between">
      <p>{name}</p>
      <p>{percentage}%</p>
    </div>
  );
}
