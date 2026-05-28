"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { LIMITS } from "@/lib/game/question-helpers";

// ============================================================================
// TYPES
// ============================================================================

export type QuizActionState = {
  error: string | null;
  fieldErrors: Record<string, string> | null;
  success: boolean;
  quizId?: string;
};

const INITIAL: QuizActionState = {
  error: null,
  fieldErrors: null,
  success: false,
};

// ============================================================================
// SCHEMAS
// ============================================================================

const quizSchema = z.object({
  title: z
    .string()
    .trim()
    .min(LIMITS.quizTitle.min, "El título es obligatorio")
    .max(LIMITS.quizTitle.max, `Máximo ${LIMITS.quizTitle.max} caracteres`),
  description: z
    .string()
    .trim()
    .max(LIMITS.quizDescription.max, `Máximo ${LIMITS.quizDescription.max} caracteres`)
    .optional()
    .or(z.literal("")),
});

// ============================================================================
// HELPERS
// ============================================================================

function extractFieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path[0]?.toString();
    if (path && !result[path]) result[path] = issue.message;
  }
  return result;
}

async function getAuthedUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  return { supabase, userId: user.id };
}

// ============================================================================
// CREATE QUIZ
// ============================================================================

export async function createQuizAction(
  _prev: QuizActionState,
  formData: FormData
): Promise<QuizActionState> {
  const parsed = quizSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
  });

  if (!parsed.success) {
    return { ...INITIAL, error: "Datos inválidos", fieldErrors: extractFieldErrors(parsed.error) };
  }

  try {
    const { supabase, userId } = await getAuthedUserId();
    const { data, error } = await supabase
      .from("quizzes")
      .insert({
        admin_id: userId,
        title: parsed.data.title,
        description: parsed.data.description || null,
      })
      .select("id")
      .single();

    if (error || !data) {
      return { ...INITIAL, error: error?.message ?? "No se pudo crear el quiz" };
    }

    revalidatePath("/admin/dashboard");
    redirect(`/admin/quizzes/${data.id}/edit`);
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    return { ...INITIAL, error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

// ============================================================================
// UPDATE QUIZ
// ============================================================================

export async function updateQuizAction(
  quizId: string,
  _prev: QuizActionState,
  formData: FormData
): Promise<QuizActionState> {
  const parsed = quizSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
  });

  if (!parsed.success) {
    return { ...INITIAL, error: "Datos inválidos", fieldErrors: extractFieldErrors(parsed.error) };
  }

  const { supabase } = await getAuthedUserId();
  const { error } = await supabase
    .from("quizzes")
    .update({
      title: parsed.data.title,
      description: parsed.data.description || null,
    })
    .eq("id", quizId);

  if (error) return { ...INITIAL, error: error.message };

  revalidatePath(`/admin/quizzes/${quizId}/edit`);
  revalidatePath("/admin/dashboard");
  return { ...INITIAL, success: true };
}

// ============================================================================
// DELETE QUIZ
// ============================================================================

export async function deleteQuizAction(quizId: string): Promise<{ error: string | null }> {
  try {
    const { supabase } = await getAuthedUserId();
    const { error } = await supabase.from("quizzes").delete().eq("id", quizId);
    if (error) return { error: error.message };

    revalidatePath("/admin/dashboard");
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
}
