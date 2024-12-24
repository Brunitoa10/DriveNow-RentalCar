import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ListLovedCars } from "./components/ListLovedCar";

export default async function  LovedCarPage() {
  const {userId} = await auth();
  if(!userId){
    return redirect("/");
  }
  return (
    <div>
        <h1 className="text-2xl">Cars you have liked</h1>
        <ListLovedCars/>
    </div>
  );
}
