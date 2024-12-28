import { Reveal } from "@/components/Shared/Reveal";
import { FeatureData } from "./Feature.data";

export function Feature() {
  return (
    <div className="max-w-6xl mx-auto p-6 lg:py-40">
      <h3 className="text-2xl lg:text-6xl font-bold text-center mb-4 lg:mb-8">
        Key Features
      </h3>
      <p className="text-lg mt-4 lg:mt-6 lg:mb-12 text-center">
        Experience unparalleled comfort and safety with our client-centered solutions,
        designed to exceed expectations at every step.
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-8">
        {FeatureData.map(({ icon: Icon, text, bg, delay }) => (
          <Reveal
            key={text}
            className="p-6 rounded-xl hover:shadow-lg flex flex-col items-center"
            position="right"
            delay={delay}
          >
            <div className={`rounded-full ${bg} w-16 h-16 flex justify-center items-center mb-4`}>
              <Icon className="w-8 h-8" />
            </div>
            <p className="font-bold text-center text-xl">{text}</p>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
