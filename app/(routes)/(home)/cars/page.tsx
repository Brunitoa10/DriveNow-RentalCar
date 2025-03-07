import { NavBar } from "@/components/Shared/NavBar";
import { getPublishedCars } from "@/lib/cars";
import { ListCars } from "../../(dashboard)/dashboard/components/ListCars";

export default async function pageCars() {
  const cars = await getPublishedCars();
  return (
    <div>
        <NavBar/>
        <ListCars cars={cars}/>
    </div>
  )
}
