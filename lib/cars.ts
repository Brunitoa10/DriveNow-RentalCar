import { db } from "./db";

export async function getPublishedCars() {
  return await db.car.findMany({
    where: {
      isPublish: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}
