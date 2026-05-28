"use client";

import { useState, useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createQuizAction, type QuizActionState } from "../quizzes/actions";

const INITIAL: QuizActionState = {
  error: null,
  fieldErrors: null,
  success: false,
};

export function NewQuizButton() {
  const [open, setOpen] = useState(false);
  const [state, action, isPending] = useActionState(createQuizAction, INITIAL);

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="font-display font-semibold rounded-button bg-terracotta hover:bg-terracotta-600 text-cream" />
        }
      >
        + Nuevo quiz
      </DialogTrigger>
      <DialogContent className="bg-cream-50">
        <form action={action}>
          <DialogHeader>
            <DialogTitle className="font-display text-terracotta">Crear nuevo quiz</DialogTitle>
            <DialogDescription>
              Después podés agregar preguntas en el editor.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="font-display">Título</Label>
              <Input
                id="title"
                name="title"
                required
                maxLength={200}
                placeholder="Ej: Trivia sobre delivery apps"
                aria-invalid={!!state.fieldErrors?.title}
              />
              {state.fieldErrors?.title && (
                <p className="text-sm text-destructive">{state.fieldErrors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-display">Descripción (opcional)</Label>
              <Textarea
                id="description"
                name="description"
                maxLength={1000}
                placeholder="Una breve descripción del quiz..."
                rows={3}
              />
              {state.fieldErrors?.description && (
                <p className="text-sm text-destructive">{state.fieldErrors.description}</p>
              )}
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
              {isPending ? "Creando..." : "Crear quiz"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
