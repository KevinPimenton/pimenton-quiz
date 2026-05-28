import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogoutButton } from "./logout-button";
import { NewQuizButton } from "./new-quiz-button";
import { QuizCard } from "./quiz-card";

export const metadata = {
  title: "Dashboard — Pimentón Quiz",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: quizzes } = await supabase
    .from("quizzes")
    .select("id, title, description, created_at, updated_at")
    .order("updated_at", { ascending: false });

  const quizIds = quizzes?.map((q) => q.id) ?? [];
  const { data: questionCounts } = await supabase
    .from("questions")
    .select("quiz_id")
    .in("quiz_id", quizIds.length ? quizIds : ["00000000-0000-0000-0000-000000000000"]);

  const counts = (questionCounts ?? []).reduce<Record<string, number>>((acc, q) => {
    acc[q.quiz_id] = (acc[q.quiz_id] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-cream">
      <header className="border-b border-terracotta/15 bg-cream-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/admin/dashboard" className="font-display text-2xl font-extrabold text-terracotta">
            Pimentón Quiz
          </Link>
          <div className="flex items-center gap-4">
            <span className="font-body text-sm text-ink-soft hidden sm:block">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl font-extrabold text-ink">Tus quizzes</h1>
            <p className="font-body text-ink-soft mt-1">
              Creá quizzes y lanzá partidas en vivo.
            </p>
          </div>
          <NewQuizButton />
        </div>

        {(!quizzes || quizzes.length === 0) ? (
          <div className="rounded-card border-2 border-dashed border-terracotta/20 bg-cream-50 p-12 text-center">
            <p className="font-display font-semibold text-terracotta text-lg">
              Todavía no tenés quizzes
            </p>
            <p className="font-body text-sm text-ink-soft mt-2">
              Tocá &quot;Nuevo quiz&quot; arriba para empezar.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes.map((q) => (
              <QuizCard
                key={q.id}
                quiz={q}
                questionCount={counts[q.id] ?? 0}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
