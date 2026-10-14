import "server-only";
import type { PrismaClient } from "@prisma/client";
import { NotFoundError } from "@shared/lib/errors";
import { branchSchema, type Branch, type BranchInput, type BranchRepository } from "./branch";

export class PrismaBranchRepository implements BranchRepository {
  constructor(private readonly db: PrismaClient) {}

  findAll(): Promise<Branch[]> {
    return this.db.branch.findMany({ orderBy: { name: "asc" } });
  }

  findById(id: string): Promise<Branch | null> {
    return this.db.branch.findUnique({ where: { id } });
  }

  create(input: BranchInput): Promise<Branch> {
    return this.db.branch.create({ data: { ...input, phone: input.phone || null } });
  }

  async delete(id: string): Promise<void> {
    await this.db.branch.delete({ where: { id } });
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
