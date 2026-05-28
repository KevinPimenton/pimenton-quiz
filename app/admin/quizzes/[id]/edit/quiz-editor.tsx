"use client";

import { useState } from "react";
import type { QuizRow, QuestionRow } from "@/lib/game/question-helpers";
import { QuizHeader } from "./quiz-header";
import { QuestionList } from "./question-list";
import { QuestionDialog } from "./question-dialog";

type Props = {
  quiz: Pick<QuizRow, "id" | "title" | "description">;
  questions: QuestionRow[];
};

export function QuizEditor({ quiz, questions }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionRow | null>(null);
  // Increments each time the dialog opens → forces QuestionForm to remount
  const [formKey, setFormKey] = useState(0);

  function openCreate() {
    setEditingQuestion(null);
    setFormKey((k) => k + 1);
    setDialogOpen(true);
  }

  function openEdit(q: QuestionRow) {
    setEditingQuestion(q);
    setFormKey((k) => k + 1);
    setDialogOpen(true);
  }

  return (
    <main className="min-h-screen bg-cream">
      <QuizHeader quiz={quiz} questionCount={questions.length} />
      <section className="max-w-3xl mx-auto px-6 py-8">
        <QuestionList questions={questions} onAdd={openCreate} onEdit={openEdit} />
      </section>
      <QuestionDialog
        quizId={quiz.id}
        question={editingQuestion}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        formKey={formKey}
      />
    </main>
  );
}
