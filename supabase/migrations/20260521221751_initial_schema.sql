-- ============================================================================
-- PIMENTÓN QUIZ — SCHEMA INICIAL
-- ============================================================================
-- Tablas: quizzes, questions, games, players, answers
-- Notas:
-- - No creamos tabla "users" propia: usamos auth.users de Supabase Auth.
-- - RLS habilitado en todas las tablas.
-- - Políticas de admin usan auth.uid().
-- - Operaciones de jugadores anónimos se harán vía Route Handlers con
--   service_role key (bypass RLS).
-- ============================================================================

-- ============================================================================
-- 1. QUIZZES
-- ============================================================================

CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  description TEXT CHECK (char_length(description) <= 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quizzes_admin_id ON public.quizzes(admin_id);

COMMENT ON TABLE public.quizzes IS 'Quizzes creados por admins. Cada quiz pertenece a un admin (auth.users).';

-- ============================================================================
-- 2. QUESTIONS
-- ============================================================================

CREATE TYPE question_type AS ENUM ('multiple_choice', 'true_false', 'order');

CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  type question_type NOT NULL,
  text TEXT NOT NULL CHECK (char_length(text) BETWEEN 1 AND 500),
  options JSONB NOT NULL,
  correct_answer JSONB NOT NULL,
  time_limit INT NOT NULL DEFAULT 20 CHECK (time_limit BETWEEN 5 AND 120),
  points_base INT NOT NULL DEFAULT 1000 CHECK (points_base BETWEEN 100 AND 2000),
  order_index INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (quiz_id, order_index)
);

CREATE INDEX idx_questions_quiz_id_order ON public.questions(quiz_id, order_index);

COMMENT ON TABLE public.questions IS 'Preguntas de cada quiz. options/correct_answer son JSONB con estructura distinta según type.';
COMMENT ON COLUMN public.questions.options IS 'multiple_choice: ["a","b","c","d"] | true_false: ["Verdadero","Falso"] | order: ["item1","item2","item3","item4"]';
COMMENT ON COLUMN public.questions.correct_answer IS 'multiple_choice: índice (0-3) | true_false: true|false | order: array de índices en orden correcto ej: [2,0,3,1]';

-- ============================================================================
-- 3. GAMES
-- ============================================================================

CREATE TYPE game_status AS ENUM ('lobby', 'active', 'paused', 'finished');

CREATE TABLE public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE RESTRICT,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pin VARCHAR(6) NOT NULL UNIQUE CHECK (pin ~ '^[0-9]{6}$'),
  status game_status NOT NULL DEFAULT 'lobby',
  current_question_index INT NOT NULL DEFAULT 0,
  current_question_started_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ
);

CREATE INDEX idx_games_pin ON public.games(pin);
CREATE INDEX idx_games_admin_id ON public.games(admin_id);
CREATE INDEX idx_games_status ON public.games(status) WHERE status IN ('lobby', 'active', 'paused');

COMMENT ON TABLE public.games IS 'Partidas en vivo. El PIN de 6 dígitos es único globalmente y se usa para unirse.';

-- ============================================================================
-- 4. PLAYERS
-- ============================================================================

CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL CHECK (char_length(nickname) BETWEEN 1 AND 30),
  score INT NOT NULL DEFAULT 0,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (game_id, nickname)
);

CREATE INDEX idx_players_game_id ON public.players(game_id);

COMMENT ON TABLE public.players IS 'Jugadores en una partida. nickname es único por partida (no por sistema).';

-- ============================================================================
-- 5. ANSWERS
-- ============================================================================

CREATE TABLE public.answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  answer JSONB NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_taken_ms INT NOT NULL CHECK (time_taken_ms >= 0),
  points_earned INT NOT NULL DEFAULT 0 CHECK (points_earned >= 0),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (player_id, question_id)
);

CREATE INDEX idx_answers_game_question ON public.answers(game_id, question_id);
CREATE INDEX idx_answers_player ON public.answers(player_id);

COMMENT ON TABLE public.answers IS 'Respuestas de jugadores a cada pregunta. UNIQUE(player_id, question_id) evita doble respuesta.';

-- ============================================================================
-- 6. TRIGGER: updated_at automático en quizzes
-- ============================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_quizzes_set_updated_at
  BEFORE UPDATE ON public.quizzes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 7. RLS — Row Level Security
-- ============================================================================

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

-- ---------- POLÍTICAS: QUIZZES (admin scope) ----------

CREATE POLICY "Admins ven sus propios quizzes"
  ON public.quizzes FOR SELECT
  TO authenticated
  USING (auth.uid() = admin_id);

CREATE POLICY "Admins crean sus propios quizzes"
  ON public.quizzes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Admins actualizan sus propios quizzes"
  ON public.quizzes FOR UPDATE
  TO authenticated
  USING (auth.uid() = admin_id)
  WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Admins borran sus propios quizzes"
  ON public.quizzes FOR DELETE
  TO authenticated
  USING (auth.uid() = admin_id);

-- ---------- POLÍTICAS: QUESTIONS (vía quiz ownership) ----------

CREATE POLICY "Admins ven preguntas de sus quizzes"
  ON public.questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes
      WHERE quizzes.id = questions.quiz_id
        AND quizzes.admin_id = auth.uid()
    )
  );

CREATE POLICY "Admins crean preguntas en sus quizzes"
  ON public.questions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quizzes
      WHERE quizzes.id = questions.quiz_id
        AND quizzes.admin_id = auth.uid()
    )
  );

CREATE POLICY "Admins actualizan preguntas de sus quizzes"
  ON public.questions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes
      WHERE quizzes.id = questions.quiz_id
        AND quizzes.admin_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quizzes
      WHERE quizzes.id = questions.quiz_id
        AND quizzes.admin_id = auth.uid()
    )
  );

CREATE POLICY "Admins borran preguntas de sus quizzes"
  ON public.questions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes
      WHERE quizzes.id = questions.quiz_id
        AND quizzes.admin_id = auth.uid()
    )
  );

-- ---------- POLÍTICAS: GAMES (admin scope) ----------

CREATE POLICY "Admins ven sus propias partidas"
  ON public.games FOR SELECT
  TO authenticated
  USING (auth.uid() = admin_id);

CREATE POLICY "Admins crean sus propias partidas"
  ON public.games FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Admins actualizan sus propias partidas"
  ON public.games FOR UPDATE
  TO authenticated
  USING (auth.uid() = admin_id)
  WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Admins borran sus propias partidas"
  ON public.games FOR DELETE
  TO authenticated
  USING (auth.uid() = admin_id);

-- ---------- POLÍTICAS: PLAYERS / ANSWERS ----------
-- Sin políticas para usuarios autenticados normales.
-- Las operaciones de jugadores se harán vía Route Handlers con service_role.
-- Solo permitimos a admins LEER (para mostrar leaderboards en host screen).

CREATE POLICY "Admins ven jugadores de sus partidas"
  ON public.players FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.games
      WHERE games.id = players.game_id
        AND games.admin_id = auth.uid()
    )
  );

CREATE POLICY "Admins ven respuestas de sus partidas"
  ON public.answers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.games
      WHERE games.id = answers.game_id
        AND games.admin_id = auth.uid()
    )
  );

-- ============================================================================
-- 8. REALTIME — Publicar tablas para suscripciones
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.games;
ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.answers;
