"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useForm, type Control, type FieldPath } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import type { Branch } from "@modules/branches/branch";
import { CarImage } from "@shared/ui/CarImage";
import { UploadButton } from "@shared/lib/uploadthing";
import { createCarAction, updateCarAction } from "../../actions";
import { CATEGORY_LABELS, FUEL_LABELS, TRANSMISSION_LABELS } from "../../domain/car";
import { carSchema, type CarFormValues } from "../../validation/car.schema";

const NO_BRANCH = "__none";

interface CarFormProps {
  carId?: string;
  defaultValues?: Partial<CarFormValues>;
  branches: Branch[];
}

/** Formulario único para crear y editar (antes eran dos archivos casi idénticos). */
export function CarForm({ carId, defaultValues, branches }: CarFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<CarFormValues>({
    resolver: zodResolver(carSchema),
    defaultValues: {
      name: "",
      brand: "",
      year: new Date().getFullYear(),
      category: "SEDAN",
      transmission: "AUTOMATICA",
      fuel: "NAFTA",
      seats: 5,
      horsepower: 150,
      engine: "",
      pricePerDay: 100,
      photo: "",
      branchId: null,
      isPublished: false,
      ...defaultValues,
    },
  });
  const { register, handleSubmit, control, watch, setValue, formState } = form;
  const errors = formState.errors;
  const photo = watch("photo");

  const onSubmit = handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const result = carId ? await updateCarAction(carId, values) : await createCarAction(values);
      if (!result.ok) {
        setServerError(result.error);
        return;
      }
      toast({ title: carId ? "Cambios guardados" : "Auto creado" });
      router.push("/admin/flota");
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6 rounded-xl border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre comercial" error={errors.name?.message}>
            <Input placeholder="Mustang Shelby GT500" {...register("name")} />
          </Field>
          <Field label="Marca" error={errors.brand?.message}>
            <Input placeholder="Ford" {...register("brand")} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <EnumSelect control={control} name="category" label="Categoría" options={CATEGORY_LABELS} />
          <EnumSelect control={control} name="transmission" label="Transmisión" options={TRANSMISSION_LABELS} />
          <EnumSelect control={control} name="fuel" label="Combustible" options={FUEL_LABELS} />
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <Field label="Año" error={errors.year?.message}>
            <Input type="number" {...register("year")} />
          </Field>
          <Field label="Plazas" error={errors.seats?.message}>
            <Input type="number" {...register("seats")} />
          </Field>
          <Field label="Potencia (CV)" error={errors.horsepower?.message}>
            <Input type="number" {...register("horsepower")} />
          </Field>
          <Field label="Precio / día (USD)" error={errors.pricePerDay?.message}>
            <Input type="number" step="0.01" {...register("pricePerDay")} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Motor" error={errors.engine?.message}>
            <Input placeholder="5.2 V8 sobrealimentado" {...register("engine")} />
          </Field>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Sucursal base</Label>
            <Controller
              control={control}
              name="branchId"
              render={({ field }) => (
                <Select value={field.value ?? NO_BRANCH} onValueChange={(v) => field.onChange(v === NO_BRANCH ? null : v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_BRANCH}>Sin asignar</SelectItem>
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <label className="flex items-center gap-3 rounded-lg border p-4">
          <input type="checkbox" className="h-4 w-4 accent-[hsl(var(--ink))]" {...register("isPublished")} />
          <span>
            <span className="block text-sm font-medium">Publicado en el catálogo</span>
            <span className="block text-xs text-muted-foreground">Los clientes pueden verlo y reservarlo.</span>
          </span>
        </label>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border bg-card p-4">
          <Label className="text-xs text-muted-foreground">Foto</Label>
          <div className="relative mt-2 aspect-[16/10] overflow-hidden rounded-lg bg-secondary">
            {photo ? (
              <CarImage src={photo} alt="Vista previa" fill sizes="320px" className="object-cover" />
            ) : (
              <div className="grid h-full place-items-center text-muted-foreground">
                <ImageIcon className="h-8 w-8" strokeWidth={1} />
              </div>
            )}
          </div>
          <UploadButton
            endpoint="carPhoto"
            className="mt-3 ut-button:h-9 ut-button:w-full ut-button:bg-ink ut-button:text-sm ut-button:after:bg-brass ut-allowed-content:text-xs ut-allowed-content:text-muted-foreground"
            content={{ button: "Subir foto", allowedContent: "JPG o PNG · hasta 4 MB" }}
            onClientUploadComplete={(res) => {
              const url = res?.[0]?.ufsUrl;
              if (url) setValue("photo", url, { shouldValidate: true });
            }}
            onUploadError={(e) => {
              toast({ title: "No se pudo subir", description: e.message, variant: "destructive" });
            }}
          />
          <div className="mt-3">
            <Field label="…o pegá una URL" error={errors.photo?.message}>
              <Input placeholder="https://…" {...register("photo")} />
            </Field>
          </div>
        </div>

        {serverError && <p className="text-sm text-destructive">{serverError}</p>}
        <Button type="submit" className="h-11 w-full" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" />}
          {carId ? "Guardar cambios" : "Crear auto"}
        </Button>
      </div>
    </form>
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

function EnumSelect({
  control,
  name,
  label,
  options,
}: {
  control: Control<CarFormValues>;
  name: FieldPath<CarFormValues>;
  label: string;
  options: Record<string, string>;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select value={String(field.value)} onValueChange={field.onChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(options).map(([value, text]) => (
                <SelectItem key={value} value={value}>
                  {text}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </div>
  );
}
