import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LoginCard } from "./login-card";

export const metadata = {
  title: "Ingresar — Pimentón Quiz",
};

export default async function LoginPage() {
  // Doble check por si el proxy no atrapó (defensa en profundidad)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/admin/dashboard");

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12 bg-cream">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-extrabold text-terracotta tracking-tight">
            Pimentón Quiz
          </h1>
          <p className="font-body font-light text-ink-soft mt-2">
            Acceso para administradores
          </p>
        </div>
        <LoginCard />
      </div>
    </main>
  );
}
