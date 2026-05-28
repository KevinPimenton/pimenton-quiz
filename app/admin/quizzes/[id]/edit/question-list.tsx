"use client";

import { useState, useEffect, useTransition } from "react";
import { PlusIcon } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { QuestionRow } from "@/lib/game/question-helpers";
import { QuestionCard } from "./question-card";
import { reorderQuestionsAction } from "../questions/actions";

// ─── Sortable wrapper ─────────────────────────────────────────────────────────

function SortableCard({
  question,
  index,
  onEdit,
}: {
  question: QuestionRow;
  index: number;
  onEdit: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    position: isDragging ? "relative" : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <QuestionCard
        question={question}
        index={index}
        onEdit={onEdit}
        isDragging={isDragging}
        dragHandleProps={
          { ...attributes, ...listeners } as React.HTMLAttributes<HTMLButtonElement>
        }
      />
    </div>
  );
}

// ─── List ─────────────────────────────────────────────────────────────────────

type Props = {
  questions: QuestionRow[];
  onAdd: () => void;
  onEdit: (q: QuestionRow) => void;
};

export function QuestionList({ questions, onAdd, onEdit }: Props) {
  const [items, setItems] = useState<QuestionRow[]>(questions);
  const [, startTransition] = useTransition();

  // Keep in sync when server revalidates
  useEffect(() => {
    setItems(questions);
  }, [questions]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((q) => q.id === active.id);
    const newIndex = items.findIndex((q) => q.id === over.id);
    const prevItems = items;
    const reordered = arrayMove(items, oldIndex, newIndex);

    setItems(reordered);

    startTransition(async () => {
      const result = await reorderQuestionsAction(
        reordered[0].quiz_id,
        reordered.map((q) => q.id)
      );
      if (result.error) {
        toast.error(result.error);
        setItems(prevItems);
      }
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-xl text-ink">Preguntas</h2>
        <Button
          onClick={onAdd}
          className="font-display font-semibold rounded-button bg-terracotta hover:bg-terracotta-600 text-cream"
        >
          <PlusIcon className="size-4" />
          Agregar pregunta
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-card border-2 border-dashed border-terracotta/20 bg-cream-50 p-12 text-center">
          <p className="font-display font-semibold text-terracotta text-base">
            Todavía no hay preguntas
          </p>
          <p className="font-body text-sm text-ink-soft mt-2">
            Tocá &quot;Agregar pregunta&quot; para empezar.
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((q) => q.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {items.map((q, i) => (
                <SortableCard
                  key={q.id}
                  question={q}
                  index={i}
                  onEdit={() => onEdit(q)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
