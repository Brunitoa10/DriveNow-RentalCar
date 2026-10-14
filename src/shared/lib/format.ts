import { format } from "date-fns";
import { es } from "date-fns/locale";
import { siteConfig } from "@shared/config/site";

const currencyFormatter = new Intl.NumberFormat(siteConfig.locale, {
  style: "currency",
  currency: siteConfig.currency,
  maximumFractionDigits: 0,
});

const preciseCurrencyFormatter = new Intl.NumberFormat(siteConfig.locale, {
  style: "currency",
  currency: siteConfig.currency,
  minimumFractionDigits: 2,
});

export const formatCurrency = (value: number, precise = false) =>
  (precise ? preciseCurrencyFormatter : currencyFormatter).format(value);

export const formatNumber = (value: number, digits = 0) =>
  new Intl.NumberFormat(siteConfig.locale, { maximumFractionDigits: digits }).format(value);

export const formatPercent = (ratio: number) =>
  new Intl.NumberFormat(siteConfig.locale, { style: "percent", maximumFractionDigits: 0 }).format(ratio);

export const formatDate = (date: Date | string, pattern = "d MMM yyyy") =>
  format(new Date(date), pattern, { locale: es });

export const formatDateRange = (from: Date | string, to: Date | string) =>
  `${formatDate(from, "d MMM")} – ${formatDate(to, "d MMM yyyy")}`;

export const pluralize = (count: number, singular: string, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`;
