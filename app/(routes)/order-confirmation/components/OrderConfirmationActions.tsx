import { Button } from "@/components/ui/button";
import Link from "next/link";

export const OrderConfirmationActions = () => (
  <div className="flex justify-center mt-4">
    <Link href="/" passHref>
      <Button>Back to product list</Button>
    </Link>
  </div>
);
