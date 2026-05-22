import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/database.types";

/**
 * Rutas que requieren autenticación de admin.
 * Si el usuario NO está logueado y accede a una de estas, se redirige a /admin/login.
 */
const PROTECTED_PREFIXES = ["/admin"];

/**
 * Rutas a las que NO debe acceder un usuario logueado (lo redirigimos a su dashboard).
 */
const AUTH_ONLY_PATHS = ["/admin/login"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANTE: getUser() refresca la sesión y valida el JWT contra el servidor.
  // NO usar getSession() acá porque solo lee el cookie sin validar.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Si NO hay user y la ruta requiere auth → redirigir a login
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  const isAuthOnly = AUTH_ONLY_PATHS.includes(pathname);

  if (isProtected && !isAuthOnly && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin/login";
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Si HAY user y está en una página solo-para-no-logueados → redirigir a dashboard
  if (isAuthOnly && user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin/dashboard";
    redirectUrl.searchParams.delete("redirectTo");
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
