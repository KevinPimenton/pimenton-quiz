import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LogoutButton } from "./logout-button";

export const metadata = {
  title: "Dashboard — Pimentón Quiz",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Defensa en profundidad: el proxy ya redirige, pero por si acaso
  if (!user) redirect("/admin/login");

  return (
    <main className="min-h-screen bg-cream">
      <header className="border-b border-terracotta/15 bg-cream-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="font-display text-2xl font-extrabold text-terracotta">
            Pimentón Quiz
          </div>
          <div className="flex items-center gap-4">
            <span className="font-body text-sm text-ink-soft hidden sm:block">
              {user.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center space-y-4">
          <h1 className="font-display text-4xl font-extrabold text-ink">
            Hola, admin
          </h1>
          <p className="font-body text-ink-soft max-w-xl mx-auto">
            Acá vas a poder crear tus quizzes, iniciar partidas en vivo y ver los
            resultados. Próximamente.
          </p>
        </div>

        <div className="mt-12 p-8 rounded-card border-2 border-dashed border-terracotta/20 text-center bg-cream-50">
          <p className="font-display font-semibold text-terracotta">
            Tus quizzes aparecerán aquí
          </p>
          <p className="font-body text-sm text-ink-soft mt-2">
            Próxima fase: crear y gestionar quizzes.
          </p>
        </div>
      </section>
    </main>
  );
}
