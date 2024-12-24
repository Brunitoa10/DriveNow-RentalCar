"use client";

import { ModalAddReservation } from "@/components/Shared/ModalAddReservation";
import { useLovedCars } from "@/hooks/use-loved-car";
import { Car } from "@prisma/client";
import { Fuel, Gauge, Gem, Heart, Users, Wrench } from "lucide-react";
import Image from "next/image";

export function ListLovedCars() {
  const {lovedItems, removeLovedItem } = useLovedCars();

  return (
    <>
      {lovedItems.length === 0 ? (
        <h2>You still do not have cars that you like</h2>
      ) : (
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
              {lovedItems.map((car: Car) => {
                const { priceDay, name, photo, id, type, transmission, people, engine, cv } = car;
                return (
                  <div key={id} className="p-1 rounded-lg shadow-md hover:shadow-lg ">
                  <Image src={photo} alt={name} width={400} height={600} className="rounded-lg" />
                  <div className="p-3">
                      <div className="flex flex-col mb-3 gap-x-4">
                          <p className="text-xl min-h-16 lg:min-h-fit">{name}</p>
                          <p>{priceDay}U$/day</p>
                      </div>
                      <p className="flex items-center">
                          <Gem className="w-4 h-4 mr-2" strokeWidth={1}/>
                          {type}
                      </p>
                      <p className="flex items-center">
                          <Wrench className="w-4 h-4 mr-2" strokeWidth={1}/>
                          {transmission}
                      </p>
                      <p className="flex items-center">
                          <Users className="w-4 h-4 mr-2" strokeWidth={1}/>
                          {people}
                      </p>
                      <p className="flex items-center">
                          <Fuel className="w-4 h-4 mr-2" strokeWidth={1}/>
                          {engine}
                      </p>
                      <p className="flex items-center">
                          <Gauge className="w-4 h-4 mr-2" strokeWidth={1}/>
                          {cv} CV
                      </p>
                      <div className="flex items-center justify-center gap-x-3">
                          <ModalAddReservation car={car}/>
                          <Heart className="mt-2 cursor-pointer fill-black" onClick={() => removeLovedItem(car.id)}/>
                      </div>
                  </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
