"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

export function OurFleet() {
     const [category_car, setCategoryCar] = useState<string[]>([]);
    
      useEffect(() => {
        async function fetchCategoryCar() {
          try {
            const response = await fetch("/api/categoryCar/");
            if (response.ok) {
              const data = await response.json();
              setCategoryCar(data);
            }
          } catch (error) {
            console.error("Error fetching brands:", error);
          }
        }
    
        fetchCategoryCar();
      }, []);
  return (
    <div className="max-w-6xl mx-auto p-6 text-center py-12 lg:py-40">
        <h3 className="text-2xl lg:text-6xl font-bold">Our Vehicle Feet</h3>
        <p className="text-lg mt-2 lg:mt-5 lg:text-center text-center w-full mx-auto max-w-2xl mb-5 lg:mb-10">
            Discover our extensive vehicle fleet, carefully selected to meet the transportation needs of our customers.
            From compact and efficient models to premium and high-capacity options, we ensure quality, comfort,
            and reliability for every journey. We take pride in offering mobility solutions that combine innovation,
            style, and performance, delivering an exceptional experience for every user.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-center justify-center mb-10 max-w-4xl mx-auto">
            {category_car.map((name, index) => (
                <div key={index} className="rounded-xl overflow-hidden shadow-lg">
                <Image
                    src={`/images/categoryCar/${name}`}
                    alt={`CategoryCar ${name}`}
                    width={800}
                    height={800}
                    className="object-cover aspect-[4/3] w-full h-auto"
                />
                </div>
            ))}
            </div>
    </div>
  );
}
