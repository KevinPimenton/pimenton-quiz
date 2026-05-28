import Link from "next/link";
import { Card } from "@/components/ui/card";

type Props = {
  quiz: {
    id: string;
    title: string;
    description: string | null;
    updated_at: string;
  };
  questionCount: number;
};

export function QuizCard({ quiz, questionCount }: Props) {
  return (
    <Link href={`/admin/quizzes/${quiz.id}/edit`}>
      <Card className="rounded-card border-2 border-terracotta/15 bg-cream-50 p-5 hover:border-terracotta/40 transition-colors cursor-pointer h-full">
        <h3 className="font-display font-bold text-lg text-ink line-clamp-2">{quiz.title}</h3>
        {quiz.description && (
          <p className="font-body text-sm text-ink-soft mt-2 line-clamp-2">{quiz.description}</p>
        )}
        <div className="mt-4 flex items-center gap-3 text-xs text-ink-soft">
          <span className="font-display font-semibold text-terracotta">
            {questionCount} {questionCount === 1 ? "pregunta" : "preguntas"}
          </span>
          <span>·</span>
          <span>
            Actualizado {new Date(quiz.updated_at).toLocaleDateString("es-AR")}
          </span>
        </div>
      </Card>
    </Link>
  );
}
