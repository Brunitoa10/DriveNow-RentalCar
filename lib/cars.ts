import { db } from "./db"; // Importa la base de datos

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
