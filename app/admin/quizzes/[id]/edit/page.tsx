import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { QuizEditor } from "./quiz-editor";

export const metadata = {
  title: "Editor de quiz — Pimentón Quiz",
};

export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("id, title, description, created_at, updated_at")
    .eq("id", id)
    .single();

  if (!quiz) redirect("/admin/dashboard");

  const { data: questions } = await supabase
    .from("questions")
    .select("id, text, type, options, correct_answer, time_limit, points_base, order_index, quiz_id, created_at")
    .eq("quiz_id", id)
    .order("order_index", { ascending: true });

  return <QuizEditor quiz={quiz} questions={questions ?? []} />;
}
