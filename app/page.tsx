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

        <button
          disabled
          className="font-display font-semibold px-8 py-3 rounded-button bg-terracotta text-cream opacity-50 cursor-not-allowed"
        >
          Próximamente: Iniciar partida
        </button>
      </div>
    </main>
  );
}
