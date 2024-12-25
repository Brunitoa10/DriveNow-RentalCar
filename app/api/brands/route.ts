// app/api/brands/route.ts

import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

export async function GET() {
  const directoryPath = path.join(process.cwd(), "public", "images", "brands");

  try {
    const files = await fs.promises.readdir(directoryPath);
    const imageFiles = files.filter((file) => file.match(/\.png$/i));
    return NextResponse.json(imageFiles);
  } catch (error) {
    console.error(error);
    return NextResponse.error();
  }
}
