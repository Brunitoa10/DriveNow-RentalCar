"use client"


import Image from "next/image";
import { CardCarProps } from "./CardCar.types";


export function CardCar(props: CardCarProps) {
  const { car } = props;
    return (
    <div className="relative p-1 bg-white rounded-lg shadow-md hover:shadow-lg">
        <Image src={car.photo} alt={car.name} width={400} height={600} className="rounded-lg"/>
        
    </div>
  )
}
