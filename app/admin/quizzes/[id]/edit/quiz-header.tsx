"use client";

import { useState, useActionState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeftIcon, PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { updateQuizAction, type QuizActionState } from "@/app/admin/quizzes/actions";
import { DeleteQuizDialog } from "./delete-quiz-dialog";

type Props = {
  quiz: { id: string; title: string; description: string | null };
  questionCount: number;
};

const INITIAL: QuizActionState = { error: null, fieldErrors: null, success: false };

export function QuizHeader({ quiz, questionCount }: Props) {
  const [open, setOpen] = useState(false);
  const boundAction = updateQuizAction.bind(null, quiz.id);
  const [state, action, isPending] = useActionState(boundAction, INITIAL);

  useEffect(() => {
    if (state.success) {
      toast.success("Quiz actualizado");
      setOpen(false);
    }
    if (state.error) toast.error(state.error);
  }, [state.success, state.error]);

  return (
    <header className="border-b border-terracotta/15 bg-cream-50">
      <div className="max-w-3xl mx-auto px-6 py-4">
        <div className="flex items-center gap-3 mb-3">
          <Link
            href="/admin/dashboard"
            className="text-ink-soft hover:text-terracotta transition-colors"
          >
            <ArrowLeftIcon className="size-4" />
          </Link>
          <span className="font-body text-xs text-ink-soft">Dashboard</span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-extrabold text-ink truncate">
              {quiz.title}
            </h1>
            {quiz.description && (
              <p className="font-body text-sm text-ink-soft mt-1 line-clamp-2">
                {quiz.description}
              </p>
            )}
            <p className="font-body text-xs text-ink-soft mt-2">
              {questionCount} {questionCount === 1 ? "pregunta" : "preguntas"}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  className="font-display rounded-button"
                />
              }
            >
              <PencilIcon className="size-3.5" />
              Editar
            </DialogTrigger>
            <DialogContent className="bg-cream-50">
              <form action={action}>
                <DialogHeader>
                  <DialogTitle className="font-display text-terracotta">
                    Editar quiz
                  </DialogTitle>
                  <DialogDescription>
                    Cambiá el título o la descripción.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 my-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title" className="font-display">
                      Título
                    </Label>
                    <Input
                      id="edit-title"
                      name="title"
                      required
                      maxLength={200}
                      defaultValue={quiz.title}
                      aria-invalid={!!state.fieldErrors?.title}
                    />
                    {state.fieldErrors?.title && (
                      <p className="text-sm text-destructive">{state.fieldErrors.title}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-description" className="font-display">
                      Descripción (opcional)
                    </Label>
                    <Textarea
                      id="edit-description"
                      name="description"
                      maxLength={1000}
                      defaultValue={quiz.description ?? ""}
                      rows={3}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={isPending}
                    className="font-display rounded-button"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="font-display font-semibold rounded-button bg-terracotta hover:bg-terracotta-600 text-cream"
                  >
                    {isPending ? "Guardando..." : "Guardar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
            <DeleteQuizDialog quizId={quiz.id} quizTitle={quiz.title} />
          </div>
        </div>
      </div>
    </header>
  );
}
