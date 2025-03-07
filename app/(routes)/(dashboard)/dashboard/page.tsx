import { getPublishedCars } from "@/lib/cars";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ListCars } from "./components/ListCars";

export default async function DashboardPage() {
  const {userId} = await auth();
  if(!userId){
    return redirect("/");
  }

  const cars = await getPublishedCars();

  return (
    <div>
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">List of cars</h2>
      </div>
     <ListCars cars={cars}/>
    </div>
  )
}
