import { Slider } from "@/components/ui/slider";

interface PrecisionSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function AccuracySlider({ value, onChange }: PrecisionSliderProps) {
  return (
    <div className="w-full max-w-2xl space-y-4">
      <h2 className="text-2xl font-bold mb-4">Precision</h2>
      <div className="flex items-center space-x-4">
        <Slider
          min={1}
          max={12}
          step={1}
          value={[value]}
          onValueChange={(newValue) => onChange(newValue[0])}
          className="flex-grow"
        />
        <span className="text-2xl font-semibold min-w-[2ch] text-right">
          {value}
        </span>
      </div>
    </div>
  );
}
