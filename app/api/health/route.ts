import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function extractError(err: unknown): { message: string; code?: string; details?: string; hint?: string } {
  if (err instanceof Error) return { message: err.message };
  if (typeof err === "object" && err !== null) {
    const e = err as Record<string, unknown>;
    return {
      message: typeof e.message === "string" ? e.message : JSON.stringify(err),
      code: typeof e.code === "string" ? e.code : undefined,
      details: typeof e.details === "string" ? e.details : undefined,
      hint: typeof e.hint === "string" ? e.hint : undefined,
    };
  }
  return { message: String(err) };
}

export async function GET() {
  const checks: Record<string, unknown> = {};

  try {
    checks.envUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    checks.envAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    checks.envServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    checks.region = process.env.VERCEL_REGION || "local";

    const supabase = await createClient();
    checks.clientCreated = true;

    const sessionResult = await supabase.auth.getSession();
    checks.authError = sessionResult.error ? extractError(sessionResult.error) : null;
    checks.hasSession = !!sessionResult.data.session;

    const queryResult = await supabase.from("quizzes").select("id").limit(1);
    checks.dbError = queryResult.error ? extractError(queryResult.error) : null;
    checks.queryRowCount = queryResult.data?.length ?? null;

    const ok = !checks.authError && !checks.dbError;

    return NextResponse.json({
      ok,
      supabase: ok ? "connected" : "error",
      schema: ok ? "loaded" : "error",
      checks,
      timestamp: new Date().toISOString(),
    }, { status: ok ? 200 : 500 });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      supabase: "error",
      error: extractError(err),
      checks,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
