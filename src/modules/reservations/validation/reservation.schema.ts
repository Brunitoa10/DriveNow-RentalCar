import { z } from "zod";

const dateField = z.coerce.date({ invalid_type_error: "Fecha inválida" });

/** Parte del pedido que define el precio (sirve para cotizar en vivo). */
export const quoteSchema = z
  .object({
    carId: z.string().uuid(),
    startDate: dateField,
    endDate: dateField,
    deliveryMode: z.enum(["BRANCH", "HOME"]),
    pickupBranchId: z.string().uuid().nullable().optional(),
    dropoffBranchId: z.string().uuid().nullable().optional(),
    deliveryLat: z.number().min(-90).max(90).nullable().optional(),
    deliveryLng: z.number().min(-180).max(180).nullable().optional(),
  })
  .refine((v) => v.endDate > v.startDate, {
    message: "La devolución debe ser posterior al retiro",
    path: ["endDate"],
  })
  .refine((v) => v.deliveryMode !== "BRANCH" || !!v.pickupBranchId, {
    message: "Elegí una sucursal de retiro",
    path: ["pickupBranchId"],
  })
  .refine((v) => v.deliveryMode !== "HOME" || (v.deliveryLat != null && v.deliveryLng != null), {
    message: "Marcá en el mapa el punto de entrega",
    path: ["deliveryLat"],
  });

export const reservationSchema = z
  .object({
    customerName: z.string().trim().min(3, "Ingresá tu nombre completo").max(80),
    customerEmail: z.string().trim().toLowerCase().email("Email inválido"),
    customerPhone: z.string().trim().min(6, "Teléfono inválido").max(30),
    deliveryAddress: z.string().trim().max(160).nullable().optional(),
  })
  .and(quoteSchema);

export const lookupSchema = z.object({
  code: z.string().trim().toUpperCase().min(4, "Código inválido"),
  email: z.string().trim().toLowerCase().email("Email inválido"),
});

export type QuoteInput = z.input<typeof quoteSchema>;
export type ReservationInput = z.input<typeof reservationSchema>;
