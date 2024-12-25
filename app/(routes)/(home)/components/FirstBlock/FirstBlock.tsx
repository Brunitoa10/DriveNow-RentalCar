
import { Reveal } from "@/components/Shared/Reveal";
import Image from "next/image";

export function FirstBlock() {
  return (
    <div className="grid gap-8 items-center lg:grid-cols-2 lg:px-12 lg:py-16 px-6 py-8">
      <Reveal className="text-center lg:text-left" position="bottom">
        <h1 className="text-3xl font-bold lg:text-6xl">
          Premium Car Rental in Miami
        </h1>
        <p className="text-justify text-base lg:text-lg mt-4">
          Experience the thrill of driving luxury vehicles with our Premium Car Rental in Miami.
          Choose from brands like Mercedes-Benz, BMW, and Audi, perfect for business or leisure.
          Enjoy meticulously maintained cars with convenient pickup and drop-off locations citywide.
          Book now and elevate your Miami experience with unmatched style and comfort.
        </p>
      </Reveal>
      <Reveal className="flex justify-center lg:justify-end" position="right">
        <Image
          src="/images/FordMustangShelbyShadowBlack.png"
          alt="Rental Cars"
          width={800}
          height={800}
          priority
          className="rounded-lg shadow-lg w-full max-w-md sm:max-w-lg lg:max-w-xl"
        />
      </Reveal>
    </div>
  );
}
