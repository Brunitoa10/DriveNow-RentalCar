import Image, { type ImageProps } from "next/image";

const OPTIMIZABLE_HOSTS = ["supabase.co", "images.unsplash.com"];

const canOptimize = (src: string) => {
  if (src.startsWith("/")) return true;
  try {
    const { hostname } = new URL(src);
    return OPTIMIZABLE_HOSTS.some((h) => hostname === h || hostname.endsWith(`.${h}`));
  } catch {
    return false;
  }
};

/** next/image que no rompe con URLs de hosts no configurados en next.config. */
export function CarImage({ src, alt, ...props }: Omit<ImageProps, "src"> & { src: string }) {
  return <Image src={src} alt={alt} unoptimized={!canOptimize(src)} {...props} />;
}
