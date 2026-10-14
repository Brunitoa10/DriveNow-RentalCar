import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CarForm } from "@modules/cars/ui/admin/CarForm";
import { container } from "@server/container";
import { PageHeader } from "@shared/layout/PageHeader";

export const metadata: Metadata = { title: "Nuevo auto" };

export default async function NewCarPage() {
  const branches = await container.branchService.list();
  return (
    <>
      <Link href="/admin/flota" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Flota
      </Link>
      <PageHeader title="Nuevo auto" description="Cargá la ficha técnica, el precio y la foto." />
      <CarForm branches={branches} />
    </>
  );
}
