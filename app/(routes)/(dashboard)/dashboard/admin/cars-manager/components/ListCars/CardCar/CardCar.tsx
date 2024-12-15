"use client"


import { Gem } from "lucide-react";
import Image from "next/image";
import { CardCarProps } from "./CardCar.types";


export function CardCar(props: CardCarProps) {
  const { car } = props;
    return (
    <div className="relative p-1 bg-white rounded-lg shadow-md hover:shadow-lg">
        <Image src={car.photo} alt={car.name} width={400} height={600} className="rounded-lg"/>
        {car.isPublish ? (
          <p className="absolute top-0 rigth-0 w-full p-1 text-center text-white bg-green-700">Published</p>
        ) : (
          <p className="absolute top-0 left-0 rigth-0 w-full p-1 text-center text-white bg-red-300">Not Published</p>
        )};
        <div className="relative p-3">
          <div className="flex flex-col mb-3 gap-x-4">
            <p className="text-xl min-h-16 lg:min-h-fit">{car.name}</p>
            <p>{car.priceDay}U$/day</p>
          </div>
          <div className="grid md:grid-cols-2 gap-x-4">
            <p className="flex items-center">
              <Gem className="h-4 w-4" mr-2 strokeWidth={1}/>
              {car.type}
            </p>
          </div>
        </div>
    </div>
  )
}
