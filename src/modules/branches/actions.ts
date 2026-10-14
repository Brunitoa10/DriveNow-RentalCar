"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@modules/admin-auth/guard";
import { container } from "@server/container";
import { runAction, type ActionResult } from "@shared/lib/result";
import type { BranchInput } from "./branch";

const { branchService } = container;

export async function createBranchAction(values: BranchInput): Promise<ActionResult> {
  return runAction(async () => {
    await assertAdmin();
    await branchService.create(values);
    revalidatePath("/", "layout");
  });
}

export async function deleteBranchAction(id: string): Promise<ActionResult> {
  return runAction(async () => {
    await assertAdmin();
    await branchService.delete(id);
    revalidatePath("/", "layout");
  });
}
