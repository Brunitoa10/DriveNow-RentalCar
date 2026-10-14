"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RatingInput } from "@shared/ui/RatingInput";
import { Textarea } from "@shared/ui/Textarea";
import { submitReviewAction } from "../actions";
import { REVIEW_CRITERIA, type ReviewCriterion } from "../review";

type Scores = Record<ReviewCriterion | "overall", number>;

export function ReviewForm({ code, carName }: { code: string; carName: string }) {
  const [scores, setScores] = useState<Scores>({ overall: 0, comfort: 0, cleanliness: 0, performance: 0, efficiency: 0, value: 0 });
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const complete = Object.values(scores).every((v) => v > 0);

  if (done) {
    return (
      <div className="flex items-center gap-3 rounded-xl border bg-success/5 p-5 text-success">
        <CheckCircle2 className="h-5 w-5" />
        <p className="text-sm font-medium">¡Gracias! Tu reseña ya está publicada.</p>
      </div>
    );
  }

  return (
    <form
      className="space-y-6 rounded-2xl border bg-card p-6"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const result = await submitReviewAction({ code, ...scores, comment });
          if (result.ok) setDone(true);
          else setError(result.error);
        });
      }}
    >
      <div>
        <p className="eyebrow">Tu opinión</p>
        <h3 className="display mt-2 text-3xl">¿Cómo te fue con el {carName}?</h3>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-secondary/60 p-4">
        <Label className="font-semibold">Calificación general</Label>
        <RatingInput label="General" value={scores.overall} onChange={(v) => setScores({ ...scores, overall: v })} size={28} />
      </div>

      <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {REVIEW_CRITERIA.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between gap-3">
            <Label className="text-sm text-muted-foreground">{label}</Label>
            <RatingInput label={label} value={scores[key]} onChange={(v) => setScores({ ...scores, [key]: v })} size={18} />
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm text-muted-foreground">Comentario (opcional)</Label>
        <Textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={800} placeholder="Contanos qué destacarías…" />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={!complete || isPending}>
        {isPending && <Loader2 className="animate-spin" />}
        Publicar reseña
      </Button>
    </form>
  );
}
