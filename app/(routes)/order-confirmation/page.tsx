import { NavBar } from "@/components/Shared/NavBar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function OrderConfirmationPage() {
  return (
    <div>
        <NavBar/>
        <div className="p-6 mx-auto max-w-7xl">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
                <h1  className="text-2xl font-bold">Thank you for choosing DriveNowCar!</h1>
                <p className="text-lg">
                    We have received your request. You will shortly receive all the details of your reservation in your email.
                </p>
                <p className="text-lg">
                    You can view all your reservations within your profile.
                </p>
                <Link href="/">
                    <Button>
                        Back to product list
                    </Button>
                </Link>
            </div>
        </div>
    </div>
  );
}
