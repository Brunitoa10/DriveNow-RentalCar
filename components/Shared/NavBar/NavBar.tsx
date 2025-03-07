"use client";

import { LogoDashboard } from "@/app/(routes)/(dashboard)/dashboard/components/LogoDashboard";
import { Button } from "@/components/ui/button";
import { useAuth, UserButton } from "@clerk/nextjs";
import { Heart, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function NavBar() {
  const { userId } = useAuth();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Toggle mobile menu visibility
  const toggleMobileMenu = () => setMobileMenuOpen(!isMobileMenuOpen);

  return (
    <nav className="flex items-center justify-between w-full h-20 px-2 border-b gap-x-4 md:px-6 bg-background">
      {/* Logo */}
      <LogoDashboard />

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-x-7">
        <Button>
          <Link href="/cars" className="text-sm font-medium hover:underline">
            List Cars
          </Link>
        </Button>
        <Button>
          <Link href="/dashboard" className="text-sm font-medium hover:underline">
            Dashboard
          </Link>
        </Button>
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

      {/* Mobile Navigation - Hamburger Menu */}
      <div className="md:hidden flex items-center">
        <button
          onClick={toggleMobileMenu}
          className="text-2xl p-2"
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu - conditional rendering based on isMobileMenuOpen state */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-background py-4 flex flex-col items-center gap-y-4">
          <Link href="/cars" className="text-sm font-medium hover:underline">
            Cars
          </Link>
          <Link href="/dashboard" className="text-sm font-medium hover:underline">
            Dashboard
          </Link>

          {userId ? (
            <>
              <Link href="/loved-cars" aria-label="Loved Cars" className="text-sm">
                <Heart className="cursor-pointer" strokeWidth={1} />
              </Link>
              <UserButton />
            </>
          ) : (
            <Link href="/sign-in" className="flex items-center gap-x-3 text-sm">
              <Button>Sign In</Button>
              <User className="w-4 h-4" aria-label="User Icon" />
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
