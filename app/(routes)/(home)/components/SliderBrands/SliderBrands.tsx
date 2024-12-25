"use client";

import { Reveal } from "@/components/Shared/Reveal";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { useEffect, useState } from "react";

export function SliderBrands() {
  const [brands, setBrands] = useState<string[]>([]);

  useEffect(() => {
    async function fetchBrands() {
      try {
        const response = await fetch("/api/brands/");
        if (response.ok) {
          const data = await response.json();
          setBrands(data);
        }
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    }

    fetchBrands();
  }, []);

  return (
    <Reveal className="flex gap-x-20 justify-center items-center lg:pb-20 mt-5 mb-10 " position="bottom">
      <Carousel
        className="w-full max-w-6xl mx-auto"
        plugins={[
          Autoplay({
            delay: 2000,
          }),
        ]}
      >
        <CarouselContent>
          {brands.map((url, index) => (
            <CarouselItem key={index} className="basis-4/4 md:basis-2/4 lg:basis-1/6">
              <Image
                src={`/images/brands/${url}`}
                alt={`Brand ${url}`}
                width={90}
                height={90}
                className="object-contain aspect-[3/2]"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-200 rounded-full p-2 cursor-pointer">
          <span>Prev</span>
        </CarouselPrevious>
        <CarouselNext className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-200 rounded-full p-2 cursor-pointer">
          <span>Next</span>
        </CarouselNext>
      </Carousel>
    </Reveal>
  );
}
