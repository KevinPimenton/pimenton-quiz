"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = {
  correct: boolean;
  onChange: (v: boolean) => void;
};

export function FieldsTrueFalse({ correct, onChange }: Props) {
  return (
    <div className="space-y-2">
      <Label className="font-display">Respuesta correcta</Label>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={cn(
            "flex-1 rounded-card border-2 py-3 font-display font-semibold text-sm transition-colors",
            correct
              ? "border-terracotta bg-terracotta/10 text-terracotta"
              : "border-terracotta/15 bg-cream-50 text-ink-soft hover:border-terracotta/40"
          )}
        >
          Verdadero
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={cn(
            "flex-1 rounded-card border-2 py-3 font-display font-semibold text-sm transition-colors",
            !correct
              ? "border-terracotta bg-terracotta/10 text-terracotta"
              : "border-terracotta/15 bg-cream-50 text-ink-soft hover:border-terracotta/40"
          )}
        >
          Falso
        </button>
      </div>
    </div>
  );
}
