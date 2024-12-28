import { Button } from "@/components/ui/button";
import Link from "next/link";

export function DriveToday() {
  return (
    <div className="p-6 lg:my-32 max-w-7xl mx-auto">
      <div className="bg-[url('/images/background/background-2.png')] bg-center bg-no-repeat bg-cover rounded-xl p-8 lg:p-24 relative shadow-lg">
        <div className="bg-black/60 rounded-xl p-6 lg:p-16 text-center">
          <h3 className="text-3xl lg:text-5xl font-extrabold text-white">
            Drive Your Dream Car Today
          </h3>
          <p className="text-lg lg:text-2xl text-gray-200 mt-4">
            Unlock the ultimate driving experience with our exclusive selection of luxury vehicles.
            Take the first step to making your dream ride a reality.
          </p>
          <Link href="/sign-in">
            <Button
              className="mt-8 px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-500 transition"
              aria-label="Register to start your trip"
            >
              Register to Start Your Trip
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
