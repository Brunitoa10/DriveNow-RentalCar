import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import "@fontsource-variable/manrope";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { siteConfig } from "@shared/config/site";

export const metadata: Metadata = {
  title: { default: `${siteConfig.name} · ${siteConfig.tagline}`, template: `%s · ${siteConfig.name}` },
  description: siteConfig.description,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="min-h-screen">
        <NextTopLoader color="hsl(37 42% 50%)" showSpinner={false} height={2} />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
