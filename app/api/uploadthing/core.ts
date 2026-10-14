import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { isAdmin } from "@modules/admin-auth/guard";

const f = createUploadthing();

/** Sólo el panel admin puede subir fotos de autos. */
export const ourFileRouter = {
  carPhoto: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      if (!(await isAdmin())) throw new UploadThingError("No autorizado");
      return {};
    })
    .onUploadComplete(({ file }) => ({ url: file.ufsUrl })),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
