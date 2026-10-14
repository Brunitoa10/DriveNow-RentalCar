import type { Metadata } from "next";
import { LookupForm } from "@modules/reservations/ui/LookupForm";

export const metadata: Metadata = { title: "Mis reservas" };

export default function MyReservationsPage() {
  return (
    <div className="container grid gap-12 py-16 lg:grid-cols-2 lg:items-center">
      <div>
        <p className="eyebrow">Mis reservas</p>
        <h1 className="display mt-3 text-5xl md:text-6xl">Consultá tu reserva</h1>
        <p className="mt-5 max-w-md text-muted-foreground">
          No necesitás una cuenta. Ingresá el código que recibiste al reservar y tu email para ver el estado, el recorrido y,
          al finalizar, calificar el auto.
        </p>
      </div>
      <div className="lg:max-w-md lg:justify-self-end lg:w-full">
        <LookupForm />
      </div>
    </div>
  );
}
