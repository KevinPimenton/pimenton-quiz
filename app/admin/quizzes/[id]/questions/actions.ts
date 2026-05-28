"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { LIMITS } from "@/lib/game/question-helpers";

export type QuestionActionState = {
  error: string | null;
  fieldErrors: Record<string, string> | null;
  success: boolean;
};

const INITIAL: QuestionActionState = { error: null, fieldErrors: null, success: false };

const baseTextSchema = z.object({
  text: z
    .string()
    .trim()
    .min(LIMITS.questionText.min, "El texto es obligatorio")
    .max(LIMITS.questionText.max, `Máximo ${LIMITS.questionText.max} caracteres`),
  type: z.enum(["multiple_choice", "true_false", "order"]),
});

async function getAuthedClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  return supabase;
}

function extractFieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path[0]?.toString();
    if (path && !result[path]) result[path] = issue.message;
  }
  return result;
}

function parseFormData(formData: FormData) {
  const base = baseTextSchema.safeParse({
    text: formData.get("text"),
    type: formData.get("type"),
  });
  if (!base.success) return { ok: false as const, error: extractFieldErrors(base.error) };

  const timeLimit = Number(formData.get("time_limit"));
  const pointsBase = Number(formData.get("points_base"));

  if (
    isNaN(timeLimit) ||
    timeLimit < LIMITS.timeLimit.min ||
    timeLimit > LIMITS.timeLimit.max
  ) {
    return { ok: false as const, error: { time_limit: `Entre ${LIMITS.timeLimit.min} y ${LIMITS.timeLimit.max} s` } };
  }
  if (isNaN(pointsBase) || pointsBase < 100 || pointsBase > 2000) {
    return { ok: false as const, error: { points_base: "Entre 100 y 2000 puntos" } };
  }

  let options: unknown;
  let correctAnswer: unknown;
  try {
    options = JSON.parse((formData.get("options") as string) ?? "[]");
    correctAnswer = JSON.parse((formData.get("correct_answer") as string) ?? "null");
  } catch {
    return { ok: false as const, error: { options: "Datos de pregunta inválidos" } };
  }

  return {
    ok: true as const,
    data: {
      text: base.data.text,
      type: base.data.type,
      time_limit: timeLimit,
      points_base: pointsBase,
      options,
      correct_answer: correctAnswer,
    },
  };
}

export async function createQuestionAction(
  quizId: string,
  _prev: QuestionActionState,
  formData: FormData
): Promise<QuestionActionState> {
  const parsed = parseFormData(formData);
  if (!parsed.ok) {
    return { ...INITIAL, error: "Datos inválidos", fieldErrors: parsed.error };
  }

  try {
    const supabase = await getAuthedClient();

    const { data: existing } = await supabase
      .from("questions")
      .select("order_index")
      .eq("quiz_id", quizId)
      .order("order_index", { ascending: false })
      .limit(1);

    const nextIndex =
      existing?.[0]?.order_index !== undefined ? existing[0].order_index + 1 : 0;

    const { error } = await supabase.from("questions").insert({
      quiz_id: quizId,
      text: parsed.data.text,
      type: parsed.data.type,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      options: parsed.data.options as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      correct_answer: parsed.data.correct_answer as any,
      time_limit: parsed.data.time_limit,
      points_base: parsed.data.points_base,
      order_index: nextIndex,
    });

    if (error) return { ...INITIAL, error: error.message };
    revalidatePath(`/admin/quizzes/${quizId}/edit`);
    return { ...INITIAL, success: true };
  } catch (err) {
    return { ...INITIAL, error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

export async function updateQuestionAction(
  questionId: string,
  quizId: string,
  _prev: QuestionActionState,
  formData: FormData
): Promise<QuestionActionState> {
  const parsed = parseFormData(formData);
  if (!parsed.ok) {
    return { ...INITIAL, error: "Datos inválidos", fieldErrors: parsed.error };
  }

  try {
    const supabase = await getAuthedClient();
    const { error } = await supabase
      .from("questions")
      .update({
        text: parsed.data.text,
        type: parsed.data.type,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        options: parsed.data.options as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        correct_answer: parsed.data.correct_answer as any,
        time_limit: parsed.data.time_limit,
        points_base: parsed.data.points_base,
      })
      .eq("id", questionId);

    if (error) return { ...INITIAL, error: error.message };
    revalidatePath(`/admin/quizzes/${quizId}/edit`);
    return { ...INITIAL, success: true };
  } catch (err) {
    return { ...INITIAL, error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

export async function deleteQuestionAction(
  questionId: string,
  quizId: string
): Promise<{ error: string | null }> {
  try {
    const supabase = await getAuthedClient();
    const { error } = await supabase.from("questions").delete().eq("id", questionId);
    if (error) return { error: error.message };
    revalidatePath(`/admin/quizzes/${quizId}/edit`);
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

export async function reorderQuestionsAction(
  quizId: string,
  orderedIds: string[]
): Promise<{ error: string | null }> {
  try {
    const supabase = await getAuthedClient();
    await Promise.all(
      orderedIds.map((id, index) =>
        supabase.from("questions").update({ order_index: index }).eq("id", id)
      )
    );
    revalidatePath(`/admin/quizzes/${quizId}/edit`);
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}
