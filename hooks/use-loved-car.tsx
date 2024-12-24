import { Car } from "@prisma/client";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { toast } from "./use-toast";

interface UseLovedCarsType {
  lovedItems: Car[];
  addLovedItem: (data: Car) => void;
  removeLovedItem: (id: string) => void;
}

export const useLovedCars = create(
  persist<UseLovedCarsType>(
    (set, get) => ({
      lovedItems: [],

      addLovedItem: (data: Car) => {
        const currentLovedItems = get().lovedItems;
        const existingItem = currentLovedItems.find((item) => item.id === data.id);

        if (existingItem) {
          toast({
            title: "The car already exists in the list",
          });
          return;
        }

        set({
          lovedItems: [...currentLovedItems, data],
        });

        toast({
          title: "Car added to the list",
        });
      },

      removeLovedItem: (id: string) => {
        const currentLovedItems = get().lovedItems;
        const updatedLovedItems = currentLovedItems.filter((item) => item.id !== id);

        if (currentLovedItems.length === updatedLovedItems.length) {
          toast({
            title: "Car not found",
          });
        }

        set({ lovedItems: updatedLovedItems });

        toast({
          title: "Car removed from the list",
        });
      },
    }),
    {
      name: "loved-products-storage",
      storage: createJSONStorage(() => localStorage)
    }
  )
);
