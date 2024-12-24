"use client";

import { LogoDashboard } from "@/app/(routes)/(dashboard)/dashboard/components/LogoDashboard";
import { Button } from "@/components/ui/button";
import { useAuth, UserButton } from "@clerk/nextjs";
import { Heart, User } from "lucide-react";
import Link from "next/link";

export function NavBar() {
  const { userId } = useAuth();

  return (
    <nav  className="flex items-center justify-between w-full h-20 px-2 border-b gap-x-4 md:px-6 bg-background">
      <LogoDashboard/>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-x-7">
          <Link href="/cars" className="text-sm font-medium hover:underline">
            List Cars
          </Link>
          <Link href="/dashboard" className="text-sm font-medium hover:underline">
            Dashboard
          </Link>

          {userId ? (
            <>
              <Link href="/loved-cars" aria-label="Loved Cars">
                <Heart className="cursor-pointer" strokeWidth={1} />
              </Link>
              <UserButton />
            </>
          ) : (
            <Link href="/sign-in" className="flex items-center gap-x-3">
              <Button>Sign In</Button>
              <User className="w-4 h-4" aria-label="User Icon" />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
