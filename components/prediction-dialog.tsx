import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AccuracySlider } from "./accuracy-slider";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { Progress } from "./ui/progress";
import { AlertDialogCancel } from "@radix-ui/react-alert-dialog";

interface Props {
  handleSubmit: (n: number) => void;
  disabled: boolean;
  load: number;
  handleLoad: (n: number) => void;
}

export default function PredictionDialog({
  handleSubmit,
  disabled,
  load,
  handleLoad,
}: Props) {
  const [value, setValue] = useState(1);
  const [confirmed, setConfirmed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (n: number) => {
    setValue(n);
  };

  useEffect(() => {
    if (confirmed && load == 100) {
      setConfirmed(false);
      setIsOpen(false);
      handleLoad(0);
    }
  }, [confirmed, handleLoad, load]);

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogTrigger asChild>
        <Button
          disabled={disabled}
          className="font-semibold"
          onClick={() => setIsOpen(true)}
        >
          Hacer predicción
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {confirmed ? "Generando reporte" : "Confirmar precisión"}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogContent>
          {!confirmed && (
            <>
              <AccuracySlider value={value} onChange={handleChange} />
              <AlertDialogDescription>
                A mayor precisión, mayor tiempo de espera.
              </AlertDialogDescription>
              <AlertDialogDescription>
                Estimado: 20-30 segundos por unidad de precisión.
              </AlertDialogDescription>
            </>
          )}

          {confirmed ? (
            <>
              <AlertDialogDescription>Generando reporte</AlertDialogDescription>
              <Progress value={load} className="w-[80%]" />
            </>
          ) : (
            <>
              <>
                <Button
                  onClick={() => {
                    handleSubmit(value);
                    setConfirmed(true);
                  }}
                  className="font-semibold"
                >
                  Generar predicción
                </Button>
              </>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
            </>
          )}
        </AlertDialogContent>
      </AlertDialogContent>
    </AlertDialog>
  );
}
