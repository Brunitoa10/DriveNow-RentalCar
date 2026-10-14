"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@modules/admin-auth/guard";
import { container } from "@server/container";
import { runAction, type ActionResult } from "@shared/lib/result";
import type { CarFormValues } from "./validation/car.schema";

const { carService } = container;

/** Toda mutación invalida el catálogo público y el panel. */
const revalidateCatalog = () => {
  revalidatePath("/", "layout");
};

export async function createCarAction(values: CarFormValues): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    await assertAdmin();
    const car = await carService.create(values);
    revalidateCatalog();
    return { id: car.id };
  });
}

export async function updateCarAction(id: string, values: CarFormValues): Promise<ActionResult> {
  return runAction(async () => {
    await assertAdmin();
    await carService.update(id, values);
    revalidateCatalog();
  });
}

export async function togglePublishAction(id: string): Promise<ActionResult> {
  return runAction(async () => {
    await assertAdmin();
    await carService.togglePublished(id);
    revalidateCatalog();
  });
}

export async function updateCarLocationAction(id: string, lat: number, lng: number): Promise<ActionResult> {
  return runAction(async () => {
    await assertAdmin();
    await carService.updateLocation(id, lat, lng);
    revalidatePath("/admin", "layout");
  });
}

export async function deleteCarAction(id: string): Promise<ActionResult> {
  return runAction(async () => {
    await assertAdmin();
    await carService.delete(id);
    revalidateCatalog();
  });
}
