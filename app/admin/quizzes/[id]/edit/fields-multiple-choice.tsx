"use client";

import { PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  options: string[];
  correctIndex: number;
  onChange: (opts: string[], idx: number) => void;
};

const MAX_OPTIONS = 6;
const MIN_OPTIONS = 2;

export function FieldsMultipleChoice({ options, correctIndex, onChange }: Props) {
  function updateOption(i: number, val: string) {
    const next = [...options];
    next[i] = val;
    onChange(next, correctIndex);
  }

  function addOption() {
    if (options.length >= MAX_OPTIONS) return;
    onChange([...options, ""], correctIndex);
  }

  function removeOption(i: number) {
    if (options.length <= MIN_OPTIONS) return;
    const next = options.filter((_, idx) => idx !== i);
    const newCorrect = correctIndex >= next.length ? next.length - 1 : correctIndex;
    onChange(next, newCorrect);
  }

  function selectCorrect(i: number) {
    onChange(options, i);
  }

  return (
    <div className="space-y-2">
      <Label className="font-display">Opciones</Label>
      <p className="text-xs text-ink-soft font-body">
        Seleccioná la opción correcta con el radio.
      </p>

      <div className="space-y-2">
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="radio"
              name="correct-choice"
              checked={correctIndex === i}
              onChange={() => selectCorrect(i)}
              className="accent-terracotta shrink-0"
              aria-label={`Opción ${i + 1} correcta`}
            />
            <Input
              value={opt}
              onChange={(e) => updateOption(i, e.target.value)}
              placeholder={`Opción ${i + 1}`}
              maxLength={200}
              required
              className="flex-1"
            />
            {options.length > MIN_OPTIONS && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => removeOption(i)}
                aria-label="Eliminar opción"
              >
                <Trash2Icon className="size-3.5 text-destructive" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {options.length < MAX_OPTIONS && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addOption}
          className="font-display"
        >
          <PlusIcon className="size-3.5" />
          Agregar opción
        </Button>
      )}
    </div>
  );
}
