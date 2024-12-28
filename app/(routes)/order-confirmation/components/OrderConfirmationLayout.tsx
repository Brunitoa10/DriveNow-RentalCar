import { NavBar } from "@/components/Shared/NavBar";
import { ReactNode } from "react";

interface OrderConfirmationLayoutProps {
  children: ReactNode;
}

export const OrderConfirmationLayout = ({
  children,
}: OrderConfirmationLayoutProps) => (
  <div>
    <NavBar />
    {children}
  </div>
);
