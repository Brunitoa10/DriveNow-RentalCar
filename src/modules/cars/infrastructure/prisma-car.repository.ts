import "server-only";
import type { Prisma, PrismaClient } from "@prisma/client";
import type { Car, CarFilters, CarWithRating } from "../domain/car";
import type { CarRepository } from "../domain/car.repository";
import type { CarInput } from "../validation/car.schema";

const carInclude = { branch: { select: { name: true } } } satisfies Prisma.CarInclude;
type CarRecord = Prisma.CarGetPayload<{ include: typeof carInclude }>;

/** Mapper: aísla el resto de la app del modelo de persistencia. */
const toDomain = (record: CarRecord): Car => ({
  id: record.id,
  name: record.name,
  brand: record.brand,
  year: record.year,
  category: record.category,
  transmission: record.transmission,
  fuel: record.fuel,
  seats: record.seats,
  horsepower: record.horsepower,
  engine: record.engine,
  pricePerDay: Number(record.pricePerDay),
  photo: record.photo,
  isPublished: record.isPublished,
  mileageKm: record.mileageKm,
  branchId: record.branchId,
  branchName: record.branch?.name ?? null,
  lat: record.lat,
  lng: record.lng,
  createdAt: record.createdAt,
});

const buildWhere = (filters: CarFilters): Prisma.CarWhereInput => ({
  isPublished: true,
  category: filters.category,
  transmission: filters.transmission,
  fuel: filters.fuel,
  seats: filters.minSeats ? { gte: filters.minSeats } : undefined,
  pricePerDay: filters.maxPrice ? { lte: filters.maxPrice } : undefined,
  OR: filters.query
    ? [
        { name: { contains: filters.query, mode: "insensitive" } },
        { brand: { contains: filters.query, mode: "insensitive" } },
      ]
    : undefined,
});

const buildOrderBy = (sort: CarFilters["sort"]): Prisma.CarOrderByWithRelationInput => {
  switch (sort) {
    case "price-asc":
      return { pricePerDay: "asc" };
    case "price-desc":
      return { pricePerDay: "desc" };
    default:
      return { createdAt: "desc" };
  }
};

export class PrismaCarRepository implements CarRepository {
  constructor(private readonly db: PrismaClient) {}

  async findPublished(filters: CarFilters): Promise<CarWithRating[]> {
    const records = await this.db.car.findMany({
      where: buildWhere(filters),
      orderBy: buildOrderBy(filters.sort),
      include: carInclude,
    });

    const ratings = await this.db.review.groupBy({
      by: ["carId"],
      where: { carId: { in: records.map((r) => r.id) } },
      _avg: { overall: true },
      _count: { _all: true },
    });
    const ratingByCar = new Map(ratings.map((r) => [r.carId, r]));

    const cars = records.map((record) => {
      const rating = ratingByCar.get(record.id);
      return {
        ...toDomain(record),
        ratingAverage: rating?._avg.overall ?? null,
        ratingCount: rating?._count._all ?? 0,
      };
    });

    if (filters.sort === "rating") {
      cars.sort((a, b) => (b.ratingAverage ?? 0) - (a.ratingAverage ?? 0));
    }
    return cars;
  }

  async findAll(): Promise<Car[]> {
    const records = await this.db.car.findMany({ orderBy: { createdAt: "desc" }, include: carInclude });
    return records.map(toDomain);
  }

  async findById(id: string): Promise<Car | null> {
    const record = await this.db.car.findUnique({ where: { id }, include: carInclude });
    return record ? toDomain(record) : null;
  }

  async create(input: CarInput): Promise<Car> {
    const record = await this.db.car.create({ data: input, include: carInclude });
    return toDomain(record);
  }

  async update(id: string, input: Partial<CarInput>): Promise<Car> {
    const record = await this.db.car.update({ where: { id }, data: input, include: carInclude });
    return toDomain(record);
  }

  async setPublished(id: string, isPublished: boolean): Promise<Car> {
    return this.update(id, { isPublished });
  }

  async setLocation(id: string, lat: number, lng: number): Promise<Car> {
    const record = await this.db.car.update({ where: { id }, data: { lat, lng }, include: carInclude });
    return toDomain(record);
  }

  async addMileage(id: string, km: number): Promise<void> {
    await this.db.car.update({ where: { id }, data: { mileageKm: { increment: Math.round(km) } } });
  }

  async delete(id: string): Promise<void> {
    await this.db.car.delete({ where: { id } });
  }
}
