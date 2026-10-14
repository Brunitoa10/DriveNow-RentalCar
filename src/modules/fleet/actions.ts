"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@modules/admin-auth/guard";
import { container } from "@server/container";
import { runAction, type ActionResult } from "@shared/lib/result";

export async function addMaintenanceAction(raw: unknown): Promise<ActionResult> {
  return runAction(async () => {
    await assertAdmin();
    await container.fleetService.addMaintenance(raw);
    revalidatePath("/admin", "layout");
  });
}
