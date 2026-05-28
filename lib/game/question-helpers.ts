import type { Database } from "@/lib/database.types";

export type QuestionType = Database["public"]["Enums"]["question_type"];

export type QuestionRow = Database["public"]["Tables"]["questions"]["Row"];
export type QuizRow = Database["public"]["Tables"]["quizzes"]["Row"];

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: "Opción múltiple",
  true_false: "Verdadero o Falso",
  order: "Ordenar",
};

export const QUESTION_TYPE_SHORT: Record<QuestionType, string> = {
  multiple_choice: "Múltiple",
  true_false: "V/F",
  order: "Ordenar",
};

export const TIME_LIMIT_OPTIONS = [10, 20, 30, 60, 90] as const;

export const LIMITS = {
  quizTitle: { min: 1, max: 200 },
  quizDescription: { min: 0, max: 1000 },
  questionText: { min: 1, max: 500 },
  optionText: { min: 1, max: 200 },
  nickname: { min: 1, max: 30 },
  timeLimit: { min: 5, max: 120 },
  orderItemsCount: { min: 3, max: 6 },
} as const;

export function describeCorrectAnswer(q: QuestionRow): string {
  const options = q.options as unknown;
  const correct = q.correct_answer as unknown;

  if (q.type === "multiple_choice" && Array.isArray(options) && typeof correct === "number") {
    return String(options[correct] ?? "");
  }
  if (q.type === "true_false" && typeof correct === "boolean") {
    return correct ? "Verdadero" : "Falso";
  }
  if (q.type === "order" && Array.isArray(options)) {
    return options.map((o, i) => `${i + 1}. ${o}`).join(" → ");
  }
  return "";
}
