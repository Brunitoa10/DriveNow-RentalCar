import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@shared/ui/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <Logo />
      <p className="display text-8xl text-brass">404</p>
      <h1 className="display text-3xl">No encontramos esta página</h1>
      <Button asChild>
        <Link href="/">Volver al inicio</Link>
      </Button>
    </div>
  );
}
