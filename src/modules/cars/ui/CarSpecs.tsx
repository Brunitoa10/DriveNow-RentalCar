import { Cog, Fuel, Gauge, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { FUEL_LABELS, TRANSMISSION_LABELS, type Car } from "../domain/car";

type SpecCar = Pick<Car, "transmission" | "seats" | "fuel" | "horsepower">;

export function CarSpecs({ car, className }: { car: SpecCar; className?: string }) {
  const specs = [
    { icon: Users, label: `${car.seats} plazas` },
    { icon: Cog, label: TRANSMISSION_LABELS[car.transmission] },
    { icon: Fuel, label: FUEL_LABELS[car.fuel] },
    { icon: Gauge, label: `${car.horsepower} CV` },
  ];
  return (
    <ul className={cn("grid grid-cols-2 gap-x-4 gap-y-2 text-[13px] text-muted-foreground", className)}>
      {specs.map(({ icon: Icon, label }) => (
        <li key={label} className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
          {label}
        </li>
      ))}
    </ul>
  );
}
