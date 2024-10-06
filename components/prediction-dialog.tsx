import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AccuracySlider } from "./accuracy-slider";
import { Button } from "./ui/button";
import { useState } from "react";

interface Props {
  handleSubmit: (n: number) => void;
  disabled: boolean;
}

export default function PredictionDialog({ handleSubmit, disabled }: Props) {
  const [value, setValue] = useState(1);

  const handleChange = (n: number) => {
    setValue(n);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={disabled} className="font-semibold">
          Hacer predicción
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar precisión</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <AccuracySlider value={value} onChange={handleChange} />
          <DialogDescription>
            A mayor precisión, mayor tiempo de espera.
          </DialogDescription>
          <DialogDescription>
            Estimado: 20-30 segundos por unidad de precisión.
          </DialogDescription>
          <DialogClose asChild>
            <Button
              onClick={() => handleSubmit(value)}
              className="font-semibold"
            >
              Generar predicción
            </Button>
          </DialogClose>
        </DialogContent>
      </DialogContent>
    </Dialog>
  );
}
