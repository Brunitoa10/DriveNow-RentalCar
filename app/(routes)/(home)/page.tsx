import { NavBar } from "@/components/Shared/NavBar";
import { FirstBlock } from "./components/FirstBlock";
import { SliderBrands } from "./components/SliderBrands";

export default function Home() {
    return (
        <div>
          <NavBar/>
          <FirstBlock/>
          <SliderBrands/>
        </div>
    );
  }
  