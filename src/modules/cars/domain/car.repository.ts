import type { CarInput } from "../validation/car.schema";
import type { Car, CarFilters, CarWithRating } from "./car";

/**
 * Puerto (interfaz) del repositorio de autos.
 * Los servicios dependen de esta abstracción, no de Prisma (DIP).
 */
export interface CarRepository {
  findPublished(filters: CarFilters): Promise<CarWithRating[]>;
  findAll(): Promise<Car[]>;
  findById(id: string): Promise<Car | null>;
  create(input: CarInput): Promise<Car>;
  update(id: string, input: Partial<CarInput>): Promise<Car>;
  setPublished(id: string, isPublished: boolean): Promise<Car>;
  setLocation(id: string, lat: number, lng: number): Promise<Car>;
  addMileage(id: string, km: number): Promise<void>;
  delete(id: string): Promise<void>;
}
