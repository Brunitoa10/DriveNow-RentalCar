"use client";

import { Eye, EyeOff, Loader2, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { deleteCarAction, togglePublishAction } from "../../actions";

export function CarRowActions({ id, name, isPublished }: { id: string; name: string; isPublished: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, success: string) =>
    startTransition(async () => {
      const result = await fn();
      if (result.ok) {
        toast({ title: success });
        router.refresh();
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    });

  return (
    <div className="flex items-center justify-end gap-1">
      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin text-muted-foreground" />}
      <Button
        variant="ghost"
        size="icon"
        title={isPublished ? "Ocultar del catálogo" : "Publicar"}
        onClick={() => run(() => togglePublishAction(id), isPublished ? "Auto oculto" : "Auto publicado")}
      >
        {isPublished ? <EyeOff /> : <Eye />}
      </Button>
      <Button asChild variant="ghost" size="icon" title="Editar">
        <Link href={`/admin/flota/${id}`}>
          <Pencil />
        </Link>
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" title="Eliminar" className="text-destructive hover:text-destructive">
            <Trash2 />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar {name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Se borran también sus reservas, reseñas e historial. Si sólo querés sacarlo del catálogo, ocultalo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => run(() => deleteCarAction(id), "Auto eliminado")}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
