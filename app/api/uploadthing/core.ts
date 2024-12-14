import { auth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

const handlerAuth = async () => {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("UnAuthorized");
    }
    return { userId };
};

export const ourFileRouter = {
  photo: f({
    image: {
      maxFileSize: "4MB"
    }
  })
  .middleware(async () => {
    return await handlerAuth();
  })
  .onUploadComplete(() => {
    console.log("Upload complete!");
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
