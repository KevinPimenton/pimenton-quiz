import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.getSession();

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      supabase: "connected",
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
