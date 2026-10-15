import "server-only";
import type { Tables } from "@server/database.types";
import { unwrap, unwrapMaybe, type Db } from "@server/supabase";
import { NotFoundError } from "@shared/lib/errors";
import { branchSchema, type Branch, type BranchInput, type BranchRepository } from "./branch";

const toDomain = (r: Tables<"branches">): Branch => ({
  id: r.id,
  name: r.name,
  address: r.address,
  city: r.city,
  phone: r.phone,
  lat: r.lat,
  lng: r.lng,
});

export class SupabaseBranchRepository implements BranchRepository {
  constructor(private readonly db: Db) {}

  async findAll(): Promise<Branch[]> {
    return unwrap(await this.db.from("branches").select("*").order("name")).map(toDomain);
  }

  async findById(id: string): Promise<Branch | null> {
    const row = unwrapMaybe(await this.db.from("branches").select("*").eq("id", id).maybeSingle());
    return row ? toDomain(row) : null;
  }

  async create(input: BranchInput): Promise<Branch> {
    const row = unwrap(
      await this.db.from("branches").insert({ ...input, phone: input.phone || null }).select("*").single(),
    );
    return toDomain(row);
  }

  async delete(id: string): Promise<void> {
    unwrap(await this.db.from("branches").delete().eq("id", id));
  }
}

export class BranchService {
  constructor(private readonly branches: BranchRepository) {}

  list(): Promise<Branch[]> {
    return this.branches.findAll();
  }

  async getById(id: string): Promise<Branch> {
    const branch = await this.branches.findById(id);
    if (!branch) throw new NotFoundError("Sucursal");
    return branch;
  }

  create(raw: unknown): Promise<Branch> {
    return this.branches.create(branchSchema.parse(raw));
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await this.branches.delete(id);
  }
}
