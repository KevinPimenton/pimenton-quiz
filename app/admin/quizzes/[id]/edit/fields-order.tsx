"use client";

import { PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LIMITS } from "@/lib/game/question-helpers";

type Props = {
  items: string[];
  onChange: (items: string[]) => void;
};

export function FieldsOrder({ items, onChange }: Props) {
  function updateItem(i: number, val: string) {
    const next = [...items];
    next[i] = val;
    onChange(next);
  }

  function addItem() {
    if (items.length >= LIMITS.orderItemsCount.max) return;
    onChange([...items, ""]);
  }

  function removeItem(i: number) {
    if (items.length <= LIMITS.orderItemsCount.min) return;
    onChange(items.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-2">
      <Label className="font-display">Ítems en orden correcto</Label>
      <p className="text-xs text-ink-soft font-body">
        Los jugadores deben ordenarlos de arriba a abajo tal como están acá.
      </p>

      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="shrink-0 font-display font-bold text-sm text-terracotta/60 w-5 text-right">
              {i + 1}.
            </span>
            <Input
              value={item}
              onChange={(e) => updateItem(i, e.target.value)}
              placeholder={`Ítem ${i + 1}`}
              maxLength={200}
              required
              className="flex-1"
            />
            {items.length > LIMITS.orderItemsCount.min && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => removeItem(i)}
                aria-label="Eliminar ítem"
              >
                <Trash2Icon className="size-3.5 text-destructive" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {items.length < LIMITS.orderItemsCount.max && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addItem}
          className="font-display"
        >
          <PlusIcon className="size-3.5" />
          Agregar ítem
        </Button>
      )}
    </div>
  );
}
