import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl text-center space-y-8">
        <div className="inline-block px-4 py-1.5 rounded-full bg-terracotta/10 border border-terracotta/20">
          <span className="font-display text-sm font-semibold text-terracotta tracking-wide uppercase">
            Pimentón
          </span>
        </div>

        <h1 className="font-display text-6xl md:text-7xl font-extrabold text-terracotta tracking-tight">
          Pimentón Quiz
        </h1>

        <p className="font-body font-light text-xl text-ink-soft max-w-lg mx-auto leading-relaxed">
          Expertos en apps de delivery. Operamos tu crecimiento.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            href="/admin/login"
            className="font-display font-semibold px-8 py-3 rounded-button bg-terracotta hover:bg-terracotta-600 text-cream transition-colors"
          >
            Ingresar como admin
          </Link>
          <button
            disabled
            className="font-display font-semibold px-8 py-3 rounded-button bg-cream-100 text-ink-soft opacity-50 cursor-not-allowed border-2 border-ink-soft/20"
          >
            Unirme a partida (próximamente)
          </button>
        </div>
      </div>
    </main>
  );
}
