"use client";

import { AlertCircle, Building2, Home, Loader2, Route as RouteIcon } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Branch } from "@modules/branches/branch";
import { formatCurrency, formatNumber } from "@shared/lib/format";
import { Map, type MapMarker } from "@shared/ui/map/Map";
import { createReservationAction, quoteAction } from "../actions";
import type { QuoteResult } from "../application/reservation.service";
import type { DeliveryMode } from "../domain/reservation";
import { DateRangeField, firstFreeRange } from "./DateRangeField";
import { QuoteBreakdown } from "./QuoteBreakdown";

interface BookingPanelProps {
  car: { id: string; name: string; pricePerDay: number; branchId: string | null };
  branches: Branch[];
  blocked: { from: Date; to: Date }[];
}

type Customer = { customerName: string; customerEmail: string; customerPhone: string; deliveryAddress: string };

export function BookingPanel({ car, branches, blocked }: BookingPanelProps) {
  const initialBranch = branches.find((b) => b.id === car.branchId)?.id ?? branches[0]?.id ?? null;

  const [range, setRange] = useState<DateRange | undefined>(() => firstFreeRange(blocked));
  const [mode, setMode] = useState<DeliveryMode>("BRANCH");
  const [pickupId, setPickupId] = useState<string | null>(initialBranch);
  const [dropoffId, setDropoffId] = useState<string | null>(initialBranch);
  const [point, setPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [customer, setCustomer] = useState<Customer>({ customerName: "", customerEmail: "", customerPhone: "", deliveryAddress: "" });

  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isQuoting, startQuote] = useTransition();
  const [isSubmitting, startSubmit] = useTransition();

  const quoteInput = useMemo(
    () => ({
      carId: car.id,
      startDate: range?.from,
      endDate: range?.to,
      deliveryMode: mode,
      pickupBranchId: mode === "BRANCH" ? pickupId : null,
      dropoffBranchId: mode === "BRANCH" ? dropoffId : null,
      deliveryLat: mode === "HOME" ? point?.lat ?? null : null,
      deliveryLng: mode === "HOME" ? point?.lng ?? null : null,
    }),
    [car.id, range, mode, pickupId, dropoffId, point],
  );

  const readyToQuote = !!range?.from && !!range?.to && (mode === "BRANCH" ? !!pickupId : !!point);

  // Cotización en vivo: el precio lo calcula siempre el servidor
  useEffect(() => {
    if (!readyToQuote) {
      setQuote(null);
      return;
    }
    const id = setTimeout(() => {
      startQuote(async () => {
        const result = await quoteAction(quoteInput as Parameters<typeof quoteAction>[0]);
        if (result.ok) {
          setQuote(result.data);
          setQuoteError(null);
        } else {
          setQuote(null);
          setQuoteError(result.error);
        }
      });
    }, 250);
    return () => clearTimeout(id);
  }, [quoteInput, readyToQuote]);

  const markers = useMemo<MapMarker[]>(() => {
    if (mode === "HOME") {
      const origin = branches.find((b) => b.id === quote?.originBranch?.id);
      return origin ? [{ id: origin.id, lat: origin.lat, lng: origin.lng, tone: "ink", glyph: "DN", title: origin.name }] : [];
    }
    return branches.map((b) => ({
      id: b.id,
      lat: b.lat,
      lng: b.lng,
      title: b.name,
      tone: b.id === pickupId ? "ink" : b.id === dropoffId ? "brass" : "muted",
      glyph: b.id === pickupId ? "A" : b.id === dropoffId ? "B" : "",
    }));
  }, [mode, branches, pickupId, dropoffId, quote?.originBranch?.id]);

  const submit = () => {
    setSubmitError(null);
    startSubmit(async () => {
      const result = await createReservationAction({
        ...(quoteInput as Parameters<typeof quoteAction>[0]),
        ...customer,
        deliveryAddress: mode === "HOME" ? customer.deliveryAddress : null,
      });
      if (result.ok) {
        window.location.assign(result.data.redirectUrl);
      } else {
        setSubmitError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
      }
    });
  };

  const fieldError = (key: keyof Customer) => fieldErrors[key]?.[0];

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-lift">
      <div className="flex items-baseline justify-between border-b px-6 py-5">
        <p>
          <span className="num text-2xl font-semibold">{formatCurrency(car.pricePerDay)}</span>
          <span className="text-sm text-muted-foreground"> / día</span>
        </p>
        <span className="text-xs text-muted-foreground">Seguro y asistencia incluidos</span>
      </div>

      <div className="space-y-6 p-6">
        {/* Fechas */}
        <Section step={1} title="Fechas">
          <DateRangeField value={range} onChange={setRange} blocked={blocked} />
        </Section>

        {/* Entrega */}
        <Section step={2} title="Retiro y devolución">
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-secondary p-1">
            <ModeButton active={mode === "BRANCH"} onClick={() => setMode("BRANCH")} icon={Building2} label="Sucursal" />
            <ModeButton active={mode === "HOME"} onClick={() => setMode("HOME")} icon={Home} label="A domicilio" />
          </div>

          {mode === "BRANCH" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <BranchSelect label="Retiro (A)" value={pickupId} onChange={setPickupId} branches={branches} />
              <BranchSelect label="Devolución (B)" value={dropoffId} onChange={setDropoffId} branches={branches} />
            </div>
          ) : (
            <div className="space-y-2">
              <Input
                placeholder="Dirección u hotel (referencia para el chofer)"
                value={customer.deliveryAddress}
                onChange={(e) => setCustomer({ ...customer, deliveryAddress: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                {point ? "Podés mover el punto tocando otro lugar del mapa." : "Tocá el mapa para marcar dónde te lo entregamos."}
              </p>
            </div>
          )}

          <Map
            className="h-56"
            markers={markers}
            route={quote?.route?.geometry}
            routeEstimated={quote?.route?.source === "estimated"}
            onPick={mode === "HOME" ? setPoint : undefined}
            picked={mode === "HOME" ? point : null}
            fitBounds={mode === "BRANCH" || !!quote?.route}
          />

          {quote?.route && (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <RouteIcon className="h-3.5 w-3.5" />
              {mode === "HOME" ? `Desde ${quote.originBranch?.name}: ` : "Entre sucursales: "}
              <span className="num font-medium text-foreground">
                {formatNumber(quote.route.distanceKm, 1)} km · {Math.round(quote.route.durationMin)} min
              </span>
              {quote.route.source === "estimated" && "(estimado)"}
            </p>
          )}
        </Section>

        {/* Cotización */}
        <div className="relative min-h-[88px] rounded-xl bg-secondary/60 p-4">
          {isQuoting && <Loader2 className="absolute right-4 top-4 h-4 w-4 animate-spin text-muted-foreground" />}
          {quote ? (
            <>
              <QuoteBreakdown lines={quote.quote.lines} total={quote.quote.total} />
              {!quote.available && (
                <Alert>El auto ya está reservado en esas fechas. Probá con otro rango.</Alert>
              )}
            </>
          ) : quoteError ? (
            <Alert>{quoteError}</Alert>
          ) : (
            <p className="text-sm text-muted-foreground">Completá fechas y lugar de entrega para ver el precio final.</p>
          )}
        </div>

        {/* Datos del cliente */}
        <Section step={3} title="Tus datos" hint="Sin crear cuenta">
          <Field label="Nombre completo" error={fieldError("customerName")}>
            <Input
              autoComplete="name"
              value={customer.customerName}
              onChange={(e) => setCustomer({ ...customer, customerName: e.target.value })}
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Email" error={fieldError("customerEmail")}>
              <Input
                type="email"
                autoComplete="email"
                value={customer.customerEmail}
                onChange={(e) => setCustomer({ ...customer, customerEmail: e.target.value })}
              />
            </Field>
            <Field label="Teléfono" error={fieldError("customerPhone")}>
              <Input
                type="tel"
                autoComplete="tel"
                value={customer.customerPhone}
                onChange={(e) => setCustomer({ ...customer, customerPhone: e.target.value })}
              />
            </Field>
          </div>
        </Section>

        {submitError && <Alert>{submitError}</Alert>}

        <Button
          size="lg"
          className="h-12 w-full text-base"
          disabled={!quote?.available || isSubmitting || isQuoting}
          onClick={submit}
        >
          {isSubmitting && <Loader2 className="animate-spin" />}
          {quote ? `Reservar y pagar ${formatCurrency(quote.quote.total, true)}` : "Reservar"}
        </Button>
        <p className="text-center text-xs text-muted-foreground">Cancelación sin cargo hasta 48 h antes del retiro.</p>
      </div>
    </div>
  );
}

// ── Subcomponentes de presentación ───────────────────────────────────────

function Section({ step, title, hint, children }: { step: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-ink text-[10px] text-background">{step}</span>
          {title}
        </h3>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </section>
  );
}

function ModeButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Home;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition",
        active ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4" strokeWidth={1.5} />
      {label}
    </button>
  );
}

function BranchSelect({
  label,
  value,
  onChange,
  branches,
}: {
  label: string;
  value: string | null;
  onChange: (id: string) => void;
  branches: Branch[];
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value ?? undefined} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Elegí sucursal" />
        </SelectTrigger>
        <SelectContent>
          {branches.map((b) => (
            <SelectItem key={b.id} value={b.id}>
              {b.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function Alert({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      {children}
    </p>
  );
}
