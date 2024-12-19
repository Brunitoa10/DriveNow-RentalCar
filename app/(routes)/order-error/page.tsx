import { NavBar } from "@/components/Shared/NavBar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function OrderErrorPage() {
  return (
    <div>
        <NavBar/>
        <div className="p-6 mx-auto max-w-7xl">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
                <h1  className="text-2xl font-bold">OPS!</h1>
                <p className="text-lg">
                    Please try again later
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
