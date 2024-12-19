'use client';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { useState } from 'react';

initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY!);

const CheckoutButton = () => {
  const [preferenceId, setPreferenceId] = useState<string | null>(null);

  const createPreference = async () => {
    try {
      const response = await fetch('/api/mercadopago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Producto',
          quantity: 1,
          price: 100,
        }),
      });

      const data = await response.json();
      setPreferenceId(data.id);
    } catch (error) {
      console.error('Error al crear preferencia:', error);
    }
  };

  return (
    <div>
      <button onClick={createPreference}>Pagar</button>
      {preferenceId && <Wallet initialization={{ preferenceId }} />}
    </div>
  );
};

export default CheckoutButton;
