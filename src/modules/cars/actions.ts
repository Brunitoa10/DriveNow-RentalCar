"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@modules/admin-auth/guard";
import { container } from "@server/container";
import { DomainError } from "@shared/lib/errors";
import { runAction, type ActionResult } from "@shared/lib/result";
import type { CarFormValues } from "./validation/car.schema";

/** Toda mutación invalida el catálogo público y el panel. */
const revalidateCatalog = () => {
  revalidatePath("/", "layout");
};

export async function createCarAction(values: CarFormValues): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    await assertAdmin();
    const car = await container.carService.create(values);
    revalidateCatalog();
    return { id: car.id };
  });
}

export async function updateCarAction(id: string, values: CarFormValues): Promise<ActionResult> {
  return runAction(async () => {
    await assertAdmin();
    await container.carService.update(id, values);
    revalidateCatalog();
  });
}

export async function togglePublishAction(id: string): Promise<ActionResult> {
  return runAction(async () => {
    await assertAdmin();
    await container.carService.togglePublished(id);
    revalidateCatalog();
  });
}

export async function updateCarLocationAction(id: string, lat: number, lng: number): Promise<ActionResult> {
  return runAction(async () => {
    await assertAdmin();
    await container.carService.updateLocation(id, lat, lng);
    revalidatePath("/admin", "layout");
  });
}

export async function deleteCarAction(id: string): Promise<ActionResult> {
  return runAction(async () => {
    await assertAdmin();
    await container.carService.delete(id);
    revalidateCatalog();
  });
}

/** Sube la foto a Supabase Storage desde el servidor (la service key nunca llega al navegador). */
export async function uploadCarPhotoAction(formData: FormData): Promise<ActionResult<{ url: string }>> {
  return runAction(async () => {
    await assertAdmin();
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) throw new DomainError("Elegí una imagen");
    return { url: await container.photoStorage.upload(file, "cars") };
  });
}
