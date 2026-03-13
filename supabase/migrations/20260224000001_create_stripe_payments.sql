-- =============================================================================
-- Migración: stripe_payments
-- Propósito : Registrar cada sesión de pago Stripe completada.
--             Evita acreditar créditos más de una vez si Stripe reintenta el evento.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.stripe_payments (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_session_id TEXT        UNIQUE NOT NULL,
    user_id          UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
    credits_added    INTEGER     NOT NULL DEFAULT 0,
    amount_total     INTEGER,        -- en centavos / unidad menor de la moneda
    currency         TEXT,
    customer_email   TEXT,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.stripe_payments ENABLE ROW LEVEL SECURITY;

-- Política: cada usuario solo ve sus propios pagos
CREATE POLICY "Users can view own payments"
    ON public.stripe_payments
    FOR SELECT
    USING (auth.uid() = user_id);

-- Índices para búsquedas frecuentes del webhook
CREATE INDEX IF NOT EXISTS idx_stripe_payments_session
    ON public.stripe_payments(stripe_session_id);

CREATE INDEX IF NOT EXISTS idx_stripe_payments_user
    ON public.stripe_payments(user_id);

COMMENT ON TABLE public.stripe_payments IS
    'Registro de sesiones de pago Stripe procesadas. Evita acreditación duplicada de VPO créditos.';
