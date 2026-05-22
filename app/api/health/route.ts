import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { error: authError } = await supabase.auth.getSession();
    if (authError) throw authError;

    const { error: dbError } = await supabase
      .from("quizzes")
      .select("id, title")
      .limit(1);

    if (dbError) throw dbError;

    return NextResponse.json({
      ok: true,
      supabase: "connected",
      schema: "loaded",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        supabase: "error",
        error: err instanceof Error ? err.message : "unknown",
      },
      { status: 500 }
    );
  }
}
