"use client";

import { useState, useEffect, useActionState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  type QuestionRow,
  type QuestionType,
  QUESTION_TYPE_LABELS,
  TIME_LIMIT_OPTIONS,
} from "@/lib/game/question-helpers";
import {
  createQuestionAction,
  updateQuestionAction,
  type QuestionActionState,
} from "../questions/actions";
import { FieldsMultipleChoice } from "./fields-multiple-choice";
import { FieldsTrueFalse } from "./fields-true-false";
import { FieldsOrder } from "./fields-order";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDefaultOptions(type: QuestionType): string[] {
  if (type === "multiple_choice") return ["", ""];
  if (type === "order") return ["", "", ""];
  return [];
}

function getDefaultCorrectAnswer(type: QuestionType): unknown {
  if (type === "multiple_choice") return 0;
  if (type === "true_false") return true;
  return [];
}

function initOptions(question: QuestionRow | null, type: QuestionType): string[] {
  if (!question) return getDefaultOptions(type);
  const raw = question.options;
  return Array.isArray(raw) ? (raw as string[]) : getDefaultOptions(type);
}

function initCorrectAnswer(question: QuestionRow | null, type: QuestionType): unknown {
  if (!question) return getDefaultCorrectAnswer(type);
  return question.correct_answer;
}

// ─── Form ─────────────────────────────────────────────────────────────────────

const EMPTY_STATE: QuestionActionState = { error: null, fieldErrors: null, success: false };

type FormProps = {
  quizId: string;
  question: QuestionRow | null;
  onSuccess: () => void;
};

function QuestionForm({ quizId, question, onSuccess }: FormProps) {
  const mode = question ? "edit" : "create";
  const initType: QuestionType = question?.type ?? "multiple_choice";

  const [questionType, setQuestionType] = useState<QuestionType>(initType);
  const [options, setOptions] = useState<string[]>(() => initOptions(question, initType));
  const [correctAnswer, setCorrectAnswer] = useState<unknown>(() =>
    initCorrectAnswer(question, initType)
  );
  const [timeLimit, setTimeLimit] = useState(String(question?.time_limit ?? 30));

  const boundAction =
    mode === "create"
      ? createQuestionAction.bind(null, quizId)
      : updateQuestionAction.bind(null, question!.id, quizId);

  const [state, action, isPending] = useActionState(boundAction, EMPTY_STATE);

  useEffect(() => {
    if (state.success) onSuccess();
    if (state.error) toast.error(state.error);
  }, [state.success, state.error, onSuccess]);

  function handleTypeChange(val: string | null) {
    if (!val) return;
    const t = val as QuestionType;
    setQuestionType(t);
    setOptions(getDefaultOptions(t));
    setCorrectAnswer(getDefaultCorrectAnswer(t));
  }

  const serializedCorrectAnswer =
    questionType === "order"
      ? JSON.stringify(options.map((_, i) => i))
      : JSON.stringify(correctAnswer);

  return (
    <form action={action}>
      {/* Hidden fields */}
      <input type="hidden" name="type" value={questionType} />
      <input type="hidden" name="options" value={JSON.stringify(options)} />
      <input type="hidden" name="correct_answer" value={serializedCorrectAnswer} />
      <input type="hidden" name="time_limit" value={timeLimit} />

      <DialogHeader>
        <DialogTitle className="font-display text-terracotta">
          {mode === "create" ? "Nueva pregunta" : "Editar pregunta"}
        </DialogTitle>
        <DialogDescription>
          Completá los campos y elegí el tipo de respuesta.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 my-4 max-h-[55vh] overflow-y-auto pr-1">
        {/* Type selector */}
        <div className="space-y-2">
          <Label className="font-display">Tipo de pregunta</Label>
          <Select value={questionType} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(QUESTION_TYPE_LABELS) as [QuestionType, string][]).map(
                ([val, label]) => (
                  <SelectItem key={val} value={val}>
                    {label}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Question text */}
        <div className="space-y-2">
          <Label htmlFor="q-text" className="font-display">
            Pregunta
          </Label>
          <Textarea
            id="q-text"
            name="text"
            required
            maxLength={500}
            rows={3}
            defaultValue={question?.text ?? ""}
            placeholder="¿Cuál es la capital de Francia?"
            aria-invalid={!!state.fieldErrors?.text}
          />
          {state.fieldErrors?.text && (
            <p className="text-sm text-destructive">{state.fieldErrors.text}</p>
          )}
        </div>

        {/* Type-specific fields */}
        {questionType === "multiple_choice" && (
          <FieldsMultipleChoice
            options={options}
            correctIndex={typeof correctAnswer === "number" ? correctAnswer : 0}
            onChange={(opts, idx) => {
              setOptions(opts);
              setCorrectAnswer(idx);
            }}
          />
        )}
        {questionType === "true_false" && (
          <FieldsTrueFalse correct={correctAnswer === true} onChange={setCorrectAnswer} />
        )}
        {questionType === "order" && (
          <FieldsOrder items={options} onChange={setOptions} />
        )}

        {/* Time & points */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="font-display">Tiempo límite</Label>
            <Select value={timeLimit} onValueChange={(v) => { if (v) setTimeLimit(v); }}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_LIMIT_OPTIONS.map((t) => (
                  <SelectItem key={t} value={String(t)}>
                    {t} seg
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="q-points" className="font-display">
              Puntos
            </Label>
            <Input
              id="q-points"
              type="number"
              name="points_base"
              defaultValue={question?.points_base ?? 1000}
              min={100}
              max={2000}
              step={100}
              required
              aria-invalid={!!state.fieldErrors?.points_base}
            />
            {state.fieldErrors?.points_base && (
              <p className="text-sm text-destructive">{state.fieldErrors.points_base}</p>
            )}
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button
          type="submit"
          disabled={isPending}
          className="font-display font-semibold rounded-button bg-terracotta hover:bg-terracotta-600 text-cream"
        >
          {isPending
            ? "Guardando..."
            : mode === "create"
            ? "Agregar pregunta"
            : "Guardar cambios"}
        </Button>
      </DialogFooter>
    </form>
  );
}

// ─── Dialog shell ─────────────────────────────────────────────────────────────

type Props = {
  quizId: string;
  question: QuestionRow | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  formKey: number;
};

export function QuestionDialog({ quizId, question, open, onOpenChange, formKey }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-cream-50 sm:max-w-md">
        <QuestionForm
          key={formKey}
          quizId={quizId}
          question={question}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
