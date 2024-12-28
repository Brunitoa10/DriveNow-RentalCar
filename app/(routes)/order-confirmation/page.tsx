import { OrderConfirmationContent } from "./components/OrderConfirmationContent";
import { OrderConfirmationLayout } from "./components/OrderConfirmationLayout";

export default function OrderConfirmationPage() {
  return (
    <OrderConfirmationLayout>
      <OrderConfirmationContent />
    </OrderConfirmationLayout>
  );
}
