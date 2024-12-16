import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Car } from "@prisma/client";
import { addDays } from "date-fns";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { CalendarSelector } from "./CalendarSelector";
import { ModalAddReservationProps } from "./ModalAddReservation.types";

export function ModalAddReservation(props: ModalAddReservationProps) {
  const { car } = props;
  const [dateSelected,setDateSelected] = useState<{
    from: Date | undefined,
    to: Date | undefined,
  }>({
    from: new Date(),
    to: addDays(new Date(),5),
  })
  const onReserveCar = async (car: Car, dateSelected: DateRange) => {
    console.log("Reserve car :: ");
  };
  return (
      <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="w-full mt-3">
          Reserve car
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Selected the dates in they want rent car
          </AlertDialogTitle>
          <AlertDialogDescription>
            <CalendarSelector setDateSelected={setDateSelected} carPriceDay={car.priceDay}/>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => onReserveCar(car,dateSelected)}>Reserve car</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
