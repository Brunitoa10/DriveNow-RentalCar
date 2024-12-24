import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { TableReserves } from "./components/TableReserves";

export default async function ReservesPage() {
    const {userId} = await auth();
    if(!userId){
        return redirect("/");
    }
    const orders = await db.order.findMany({
        where: {
            userId: userId
        },
        orderBy: {
            createdAt: "desc"
        }
    })
  return (
    <div>
        <h1 className="mb-4 text-3xl">Reserves page</h1>
        {orders.length == 0 ? (
            <div className="flex flex-col justify-center gap-4 items-center">
                <h2 className="text-xl">Oh! You haven`t reserved a car yet.</h2>
                <h3 className="font-bold">place your orders through our vehicle page</h3>
                <Button>
                    <Link href="/cars">List of cars</Link>
                </Button>
            </div>) : (
                <TableReserves orders={orders}/>
            )}
    </div>
  )
}
