import type { Metadata } from "next";
import { requireAdminPage } from "@modules/admin-auth/guard";
import { AdminMobileBar, AdminSidebar } from "@shared/layout/AdminNav";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { default: "Panel", template: "%s · Panel DriveNow" }, robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <AdminMobileBar />
      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-5 py-8 lg:px-10 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
