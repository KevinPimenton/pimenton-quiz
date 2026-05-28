"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2Icon } from "lucide-react";
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
import { toast } from "sonner";
import { deleteQuizAction } from "@/app/admin/quizzes/actions";

type Props = {
  quizId: string;
  quizTitle: string;
};

export function DeleteQuizDialog({ quizId, quizTitle }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteQuizAction(quizId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Quiz eliminado");
        router.push("/admin/dashboard");
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 font-display rounded-button text-destructive hover:text-destructive hover:bg-destructive/10"
          />
        }
      >
        <Trash2Icon className="size-3.5" />
        Eliminar
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Eliminar &quot;{quizTitle}&quot;?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Se borrarán el quiz y todas sus preguntas. Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive/10 text-destructive hover:bg-destructive/20 font-display"
          >
            {isPending ? "Eliminando..." : "Eliminar quiz"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
