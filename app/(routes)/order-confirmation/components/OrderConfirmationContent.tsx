import { OrderConfirmationActions } from "./OrderConfirmationActions";
import { OrderConfirmationMessage } from "./OrderConfirmationMessage";

export const OrderConfirmationContent = () => (
  <main className="p-6 mx-auto max-w-7xl">
    <OrderConfirmationMessage />
    <OrderConfirmationActions />
  </main>
);
