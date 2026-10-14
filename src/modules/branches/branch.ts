import { z } from "zod";

export interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string | null;
  lat: number;
  lng: number;
}

export const branchSchema = z.object({
  name: z.string().trim().min(2, "Ingresá un nombre").max(60),
  address: z.string().trim().min(4, "Ingresá la dirección").max(120),
  city: z.string().trim().min(2).max(60),
  phone: z.string().trim().max(30).optional().nullable(),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

export type BranchInput = z.infer<typeof branchSchema>;

export interface BranchRepository {
  findAll(): Promise<Branch[]>;
  findById(id: string): Promise<Branch | null>;
  create(input: BranchInput): Promise<Branch>;
  delete(id: string): Promise<void>;
}
