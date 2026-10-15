"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@modules/admin-auth/guard";
import { container } from "@server/container";
import { runAction, type ActionResult } from "@shared/lib/result";
import type { BranchInput } from "./branch";

export async function createBranchAction(values: BranchInput): Promise<ActionResult> {
  return runAction(async () => {
    await assertAdmin();
    await container.branchService.create(values);
    revalidatePath("/", "layout");
  });
}

export async function deleteBranchAction(id: string): Promise<ActionResult> {
  return runAction(async () => {
    await assertAdmin();
    await container.branchService.delete(id);
    revalidatePath("/", "layout");
  });
}
