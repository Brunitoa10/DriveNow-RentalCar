
import { Toaster } from "@/components/ui/toaster";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Outfit, Roboto_Mono } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

// Configuración de las fuentes
const geistSans = Outfit({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Roboto_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Admin DriveNow",
  description: "DriveNow by: TechnologyAdvanceSolutions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <NextTopLoader color="000"/>
          {children}
          <Toaster/>
        </body>
      </html>
    </ClerkProvider>
  );
}
