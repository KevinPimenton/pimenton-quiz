"use client";

import { useState, useTransition } from "react";
import { PencilIcon, Trash2Icon, GripVerticalIcon, ClockIcon, StarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  type QuestionRow,
  QUESTION_TYPE_SHORT,
  describeCorrectAnswer,
} from "@/lib/game/question-helpers";
import { deleteQuestionAction } from "../questions/actions";

type Props = {
  question: QuestionRow;
  index: number;
  onEdit: () => void;
  isDragging?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
};

export function QuestionCard({ question, index, onEdit, isDragging, dragHandleProps }: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPendingDelete, startDelete] = useTransition();

  function handleDelete() {
    startDelete(async () => {
      const result = await deleteQuestionAction(question.id, question.quiz_id);
      if (result.error) {
        toast.error(result.error);
      } else {
        setDeleteOpen(false);
      }
    });
  }

  return (
    <>
      <div
        className={`rounded-card border border-terracotta/15 bg-cream-50 p-4 flex items-start gap-3 transition-shadow ${
          isDragging ? "shadow-lg opacity-90" : ""
        }`}
      >
        {/* Drag handle */}
        <button
          type="button"
          className="shrink-0 mt-0.5 cursor-grab active:cursor-grabbing text-ink-soft/40 hover:text-ink-soft transition-colors touch-none"
          aria-label="Arrastrar para reordenar"
          {...dragHandleProps}
        >
          <GripVerticalIcon className="size-4" />
        </button>

        {/* Index */}
        <span className="shrink-0 font-display font-bold text-2xl text-terracotta/40 w-7 text-right leading-none mt-0.5">
          {index + 1}
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-body text-sm font-medium text-ink line-clamp-2">{question.text}</p>
          <p className="font-body text-xs text-ink-soft mt-1 line-clamp-1">
            {describeCorrectAnswer(question)}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant="secondary" className="font-display text-xs">
              {QUESTION_TYPE_SHORT[question.type]}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-ink-soft font-body">
              <ClockIcon className="size-3" />
              {question.time_limit}s
            </span>
            <span className="flex items-center gap-1 text-xs text-ink-soft font-body">
              <StarIcon className="size-3" />
              {question.points_base}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onEdit}
            aria-label="Editar pregunta"
          >
            <PencilIcon className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setDeleteOpen(true)}
            aria-label="Eliminar pregunta"
            className="text-destructive/60 hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2Icon className="size-3.5" />
          </Button>
        </div>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta pregunta?</AlertDialogTitle>
            <AlertDialogDescription className="line-clamp-2">
              &ldquo;{question.text}&rdquo;
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPendingDelete}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPendingDelete}
              className="bg-destructive/10 text-destructive hover:bg-destructive/20 font-display"
            >
              {isPendingDelete ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
