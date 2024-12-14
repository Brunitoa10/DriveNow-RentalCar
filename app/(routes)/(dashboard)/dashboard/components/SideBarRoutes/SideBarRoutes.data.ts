import { Calendar, Car, Heart, User } from "lucide-react";

export const dataGeneralSideBar = [
    {
        icon: Car,
        label: "Cars",
        href: "/dashboard"
    },
    {
        icon: Calendar,
        label: "Cars Reserves",
        href: "/reserves"
    },
    {
        icon: Heart,
        label: "Loved Cars",
        href: "/loved-cars"
    },
];

export const dataAdminSideBar = [
    {
      icon: User,
      label: "Manage your cars",
      href: "/dashboard/admin/cars-manager",
    },
    {
      icon: Calendar,
      label: "All Reserves",
      href: "/dashboard/admin/reservations",
    },
  ];