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
          Make prediction
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {confirmed ? "Generating report" : "Confirm accuracy"}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogContent>
          {!confirmed && (
            <>
              <AccuracySlider value={value} onChange={handleChange} />
              <AlertDialogDescription>
                The higher the precision, the longer the waiting time.
              </AlertDialogDescription>
              <AlertDialogDescription>
                Estimated: 20-30 seconds per unit of accuracy.
              </AlertDialogDescription>
            </>
          )}

          {confirmed ? (
            <>
              <AlertDialogDescription>Generating report</AlertDialogDescription>
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
                  Generate prediction
                </Button>
              </>
              <AlertDialogCancel onClick={() => setIsOpen(false)}>
                Cancel
              </AlertDialogCancel>
            </>
          )}
        </AlertDialogContent>
      </AlertDialogContent>
    </AlertDialog>
  );
}
