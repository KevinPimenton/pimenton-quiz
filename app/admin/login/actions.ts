"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ============================================================================
// SCHEMAS DE VALIDACIÓN
// ============================================================================

const loginSchema = z.object({
  email: z.string().trim().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});

const signupSchema = z
  .object({
    email: z.string().trim().email("Email inválido"),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

// ============================================================================
// TYPES
// ============================================================================

export type AuthActionState = {
  error: string | null;
  fieldErrors: Record<string, string> | null;
  success: boolean;
};

const INITIAL_STATE: AuthActionState = {
  error: null,
  fieldErrors: null,
  success: false,
};

// ============================================================================
// SIGN IN
// ============================================================================

export async function signInAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path[0]?.toString();
      if (path && !fieldErrors[path]) fieldErrors[path] = issue.message;
    }
    return { ...INITIAL_STATE, error: "Datos inválidos", fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return {
      ...INITIAL_STATE,
      error:
        error.message === "Invalid login credentials"
          ? "Email o contraseña incorrectos"
          : error.message,
    };
  }

  revalidatePath("/", "layout");
  redirect("/admin/dashboard");
}

// ============================================================================
// SIGN UP
// ============================================================================

export async function signUpAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path[0]?.toString();
      if (path && !fieldErrors[path]) fieldErrors[path] = issue.message;
    }
    return { ...INITIAL_STATE, error: "Datos inválidos", fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { ...INITIAL_STATE, error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/admin/dashboard");
}

// ============================================================================
// SIGN OUT
// ============================================================================

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/admin/login");
}
