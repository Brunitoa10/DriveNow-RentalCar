import { CardCar } from "./CardCar";
import { ListCarsProps } from "./ListCars.types";

export function ListCars(props: ListCarsProps) {
  const { cars } = props;

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 my-4"
      aria-label="List of cars"
    >
      {cars.map((car) => (
        <CardCar car={car} key={car.id} />
      ))}
    </div>
  );
}
