"use client";

import { Button } from "@/components/ui/button";
import { useAuth, UserButton } from "@clerk/nextjs";
import { Heart, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function NavBar() {
    const {userId} = useAuth();

  return (
    <div className="max-w-5xl py-5 mx-auto">
        <div className="justify-between lg:flex">
           <Link href="/" className="flex items-center justify-center gap-x-2">
                <Image src="/logo.svg" alt="DriveNow" width={50} height={50} />
                <span className="text-xl font-bold">DriveNowCar</span>
           </Link>
           <div className="flex items-center justify-center gap-x-7">
                <Link href="/cars" className="flex items-center justify-center gap-x-2">
                        List Cars
                </Link>
                <Link href="/dashboard" className="flex items-center justify-center gap-x-2">
                        Dashboard
                </Link>
                {userId ? (
                    <>
                        <Link href="/loved-cars">
                            <Heart className={`cursor-pointer`} strokeWidth={1} />
                        </Link>
                        <UserButton/>
                    </>
                ):(
                    <Link href="/sign-in" className="flex gap-x-3">
                        <Button>Sign In</Button>
                        <User className="ml-2 w-4 h-4"/>
                    </Link>
                )}
           </div>
        </div>
    </div>
  )
}
