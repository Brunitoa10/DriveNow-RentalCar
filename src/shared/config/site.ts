/**
 * Configuración central del sitio. Todo texto/valor "de negocio" que se repite
 * vive acá para no tener strings mágicos dispersos en los componentes.
 */
export const siteConfig = {
  name: "DriveNow",
  tagline: "Alquiler de autos premium",
  description:
    "Flota premium con entrega a domicilio, sucursales estratégicas y reservas en minutos.",
  city: "Miami",
  locale: "es-AR",
  currency: "USD",
  contact: {
    email: "reservas@drivenow.com",
    phone: "+1 305 555 0142",
  },
  map: {
    center: { lat: 25.7743, lng: -80.1937 },
    zoom: 11,
    tileUrl: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    tileAttribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  nav: [
    { href: "/autos", label: "Flota" },
    { href: "/sucursales", label: "Sucursales" },
    { href: "/mis-reservas", label: "Mis reservas" },
  ],
} as const;

export const brandLogos = [
  "AstonMartinLogo2003.png",
  "BmwLogo2020Gray.png",
  "ChevroletCorvetteLogo2020.png",
  "FordLogo2017.png",
  "hondaLogo2000FullBlack.png",
  "HyundaiLogo2011.png",
  "Lamborghini.png",
  "MaseratiLogo2020.png",
  "MercedesBenzLogo2011.png",
  "NissanLogo2020Black.png",
  "PorscheLogo2014Full.png",
  "ToyotaLogo2020Europe.png",
] as const;
