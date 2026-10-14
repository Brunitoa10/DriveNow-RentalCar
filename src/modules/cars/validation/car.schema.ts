import { z } from "zod";

const currentYear = new Date().getFullYear();

/** Única fuente de verdad para validar autos (cliente y servidor). */
export const carSchema = z.object({
  name: z.string().trim().min(2, "Ingresá un nombre").max(80),
  brand: z.string().trim().min(2, "Ingresá la marca").max(40),
  year: z.coerce.number().int().min(1990).max(currentYear + 1),
  category: z.enum(["SEDAN", "SUV", "DEPORTIVO", "LUJO", "COMPACTO", "PICKUP"]),
  transmission: z.enum(["MANUAL", "AUTOMATICA"]),
  fuel: z.enum(["NAFTA", "DIESEL", "HIBRIDO", "ELECTRICO"]),
  seats: z.coerce.number().int().min(1).max(15),
  horsepower: z.coerce.number().int().min(40).max(2000),
  engine: z.string().trim().min(2, "Describí el motor").max(60),
  pricePerDay: z.coerce.number().positive("El precio debe ser mayor a 0").max(100_000),
  photo: z
    .string()
    .trim()
    .min(1, "Subí una foto o pegá una URL")
    .refine((v) => v.startsWith("/") || /^https:\/\//.test(v), "Debe ser una URL https o una ruta local"),
  branchId: z.string().uuid().nullable().optional(),
  isPublished: z.boolean().default(false),
});

export type CarInput = z.infer<typeof carSchema>;
export type CarFormValues = z.input<typeof carSchema>;
