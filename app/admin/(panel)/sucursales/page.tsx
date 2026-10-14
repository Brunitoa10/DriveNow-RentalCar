import type { Metadata } from "next";
import { BranchAdmin } from "@modules/branches/ui/BranchAdmin";
import { container } from "@server/container";
import { PageHeader } from "@shared/layout/PageHeader";

export const metadata: Metadata = { title: "Sucursales" };

export default async function AdminBranchesPage() {
  const branches = await container.branchService.list();
  return (
    <>
      <PageHeader title="Sucursales" description="Puntos de retiro y devolución. Son el origen de las rutas de entrega a domicilio." />
      <BranchAdmin branches={branches} />
    </>
  );
}
