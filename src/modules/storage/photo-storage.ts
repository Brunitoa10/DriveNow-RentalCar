import "server-only";
import { randomUUID } from "node:crypto";
import type { Db } from "@server/supabase";
import { DomainError } from "@shared/lib/errors";

/** Puerto de almacenamiento de imágenes: hoy Supabase Storage, mañana S3/R2 sin tocar el resto. */
export interface PhotoStorage {
  upload(file: File, folder: string): Promise<string>;
}

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
export const MAX_PHOTO_BYTES = 4 * 1024 * 1024;

export class SupabasePhotoStorage implements PhotoStorage {
  constructor(
    private readonly db: Db,
    private readonly bucket: string,
  ) {}

  async upload(file: File, folder: string): Promise<string> {
    const ext = ALLOWED_TYPES[file.type];
    if (!ext) throw new DomainError("Formato no permitido (JPG, PNG, WEBP o AVIF)");
    if (file.size > MAX_PHOTO_BYTES) throw new DomainError("La foto supera los 4 MB");

    const path = `${folder}/${randomUUID()}.${ext}`;
    const { error } = await this.db.storage
      .from(this.bucket)
      .upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
    if (error) throw new Error(`[storage] ${error.message}`);

    return this.db.storage.from(this.bucket).getPublicUrl(path).data.publicUrl;
  }
}
