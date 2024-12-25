import Image from "next/image";
import Link from "next/link";

export function LogoDashboard() {
  return (
    <Link href="/" className="flex items-center gap-2 border-b cursor-pointer px-6 py-4">
      {/* Logo con tamaño responsivo */}
      <Image
        src="/logo.svg"
        alt="Logo DriveNow"
        width={100}
        height={100}
        priority
        className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36"
      />
      
      {/* Título con ajuste de tamaño responsivo */}
      <h1 className="text-xl font-bold sm:text-2xl md:text-3xl lg:text-4xl">
        DriveNow Cars
      </h1>
    </Link>
  );
}
