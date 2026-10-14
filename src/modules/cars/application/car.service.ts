import { NotFoundError } from "@shared/lib/errors";
import type { Car, CarFilters, CarWithRating } from "../domain/car";
import type { CarRepository } from "../domain/car.repository";
import { carSchema, type CarInput } from "../validation/car.schema";

/** Casos de uso del catálogo. Valida en el borde y delega persistencia al repositorio. */
export class CarService {
  constructor(private readonly cars: CarRepository) {}

  listPublished(filters: CarFilters = {}): Promise<CarWithRating[]> {
    return this.cars.findPublished(filters);
  }

  listAll(): Promise<Car[]> {
    return this.cars.findAll();
  }

  async getById(id: string): Promise<Car> {
    const car = await this.cars.findById(id);
    if (!car) throw new NotFoundError("Auto");
    return car;
  }

  async getPublished(id: string): Promise<Car> {
    const car = await this.getById(id);
    if (!car.isPublished) throw new NotFoundError("Auto");
    return car;
  }

  create(raw: unknown): Promise<Car> {
    const input: CarInput = carSchema.parse(raw);
    return this.cars.create(input);
  }

  async update(id: string, raw: unknown): Promise<Car> {
    await this.getById(id);
    return this.cars.update(id, carSchema.parse(raw));
  }

  async togglePublished(id: string): Promise<Car> {
    const car = await this.getById(id);
    return this.cars.setPublished(id, !car.isPublished);
  }

  async updateLocation(id: string, lat: number, lng: number): Promise<Car> {
    await this.getById(id);
    return this.cars.setLocation(id, lat, lng);
  }

  addMileage(id: string, km: number): Promise<void> {
    return this.cars.addMileage(id, km);
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await this.cars.delete(id);
  }
}
