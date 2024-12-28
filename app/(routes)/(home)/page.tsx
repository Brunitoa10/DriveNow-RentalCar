import { NavBar } from "@/components/Shared/NavBar";
import { Feature } from "./components/Features/Feature";
import { FirstBlock } from "./components/FirstBlock";
import { OurFleet } from "./components/OurFleet";
import { SliderBrands } from "./components/SliderBrands";

export default function Home() {
    return (
        <div>
          <NavBar/>
          <FirstBlock/>
          <SliderBrands/>
          <Feature/>
          <OurFleet/>
        </div>
    );
  }
  