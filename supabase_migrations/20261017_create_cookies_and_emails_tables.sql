-- ============================================================================
-- MIGRACIÓN SUPABASE: Registro de Cookies (RGPD) y Mails de Clientes (Leads)
-- Diseñada con @skill:supabase-postgres-best-practices
-- Proyecto: mynext-WEB (elfdkbqlvawaprgidqhd)
-- ============================================================================

-- 1. Tabla de Consentimiento de Cookies (mynext_cookie_consents)
-- [schema-primary-keys]: BIGINT GENERATED ALWAYS AS IDENTITY evita fragmentación de índice UUIDv4
-- [schema-data-types]: TEXT sin límite artificial varchar(n), TIMESTAMPTZ con zona horaria
CREATE TABLE IF NOT EXISTS public.mynext_cookie_consents (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    visitor_id TEXT NOT NULL,
    consent_status TEXT NOT NULL DEFAULT 'accepted-all',
    analytics_allowed BOOLEAN NOT NULL DEFAULT true,
    marketing_allowed BOOLEAN NOT NULL DEFAULT true,
    page_url TEXT,
    language TEXT NOT NULL DEFAULT 'es',
    user_agent TEXT,
    screen_resolution TEXT,
    referrer TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- [schema-constraints]: Restricciones CHECK idempotentes mediante bloque DO $$
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'mynext_cookie_consents_status_check'
          AND conrelid = 'public.mynext_cookie_consents'::regclass
    ) THEN
        ALTER TABLE public.mynext_cookie_consents
        ADD CONSTRAINT mynext_cookie_consents_status_check
        CHECK (consent_status IN ('accepted-all', 'rejected-non-essential', 'custom'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'mynext_cookie_consents_lang_check'
          AND conrelid = 'public.mynext_cookie_consents'::regclass
    ) THEN
        ALTER TABLE public.mynext_cookie_consents
        ADD CONSTRAINT mynext_cookie_consents_lang_check
        CHECK (language IN ('es', 'en'));
    END IF;
END $$;

-- [query-missing-indexes]: Índices para consultas de auditoría y analítica de consentimiento
CREATE INDEX IF NOT EXISTS mynext_cookie_consents_created_at_idx
    ON public.mynext_cookie_consents (created_at DESC);

CREATE INDEX IF NOT EXISTS mynext_cookie_consents_status_idx
    ON public.mynext_cookie_consents (consent_status);

CREATE INDEX IF NOT EXISTS mynext_cookie_consents_visitor_id_idx
    ON public.mynext_cookie_consents (visitor_id);


-- 2. Tabla de Mails / Propuestas de Clientes (mynext_client_emails)
CREATE TABLE IF NOT EXISTS public.mynext_client_emails (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_phone TEXT,
    project_type TEXT NOT NULL DEFAULT 'General',
    budget_plan TEXT,
    message TEXT,
    source_page TEXT,
    language TEXT NOT NULL DEFAULT 'es',
    cookie_consent TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- [schema-constraints]: Validación de formato de email y estados permitidos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'mynext_client_emails_status_check'
          AND conrelid = 'public.mynext_client_emails'::regclass
    ) THEN
        ALTER TABLE public.mynext_client_emails
        ADD CONSTRAINT mynext_client_emails_status_check
        CHECK (status IN ('new', 'read', 'replied', 'archived'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'mynext_client_emails_email_check'
          AND conrelid = 'public.mynext_client_emails'::regclass
    ) THEN
        ALTER TABLE public.mynext_client_emails
        ADD CONSTRAINT mynext_client_emails_email_check
        CHECK (position('@' in client_email) > 1);
    END IF;
END $$;

-- [query-missing-indexes & query-partial-indexes]:
-- Índice cronológico, índice por email en minúsculas e índice parcial para leads sin leer ('new')
CREATE INDEX IF NOT EXISTS mynext_client_emails_created_at_idx
    ON public.mynext_client_emails (created_at DESC);

CREATE INDEX IF NOT EXISTS mynext_client_emails_email_idx
    ON public.mynext_client_emails (lower(client_email));

CREATE INDEX IF NOT EXISTS mynext_client_emails_unread_idx
    ON public.mynext_client_emails (created_at DESC)
    WHERE status = 'new';


-- 3. Seguridad Row-Level Security (RLS)
-- [security-rls-basics & security-rls-performance]:
-- Visitantes web (anon) solo tienen permiso de INSERT (protege la privacidad de los leads frente a terceros).
-- Lectura/gestión reservada a usuarios autenticados y service_role, envolviendo (SELECT auth.uid()) para cachear por consulta.
ALTER TABLE public.mynext_cookie_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mynext_client_emails ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'mynext_cookie_consents'
          AND policyname = 'Inserción pública de consentimiento de cookies'
    ) THEN
        CREATE POLICY "Inserción pública de consentimiento de cookies"
            ON public.mynext_cookie_consents
            FOR INSERT
            TO anon, authenticated
            WITH CHECK (
                length(trim(visitor_id)) > 0
                AND consent_status IN ('accepted-all', 'rejected-non-essential', 'custom')
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'mynext_cookie_consents'
          AND policyname = 'Gestión administrativa de cookies'
    ) THEN
        CREATE POLICY "Gestión administrativa de cookies"
            ON public.mynext_cookie_consents
            FOR ALL
            TO authenticated
            USING ((SELECT auth.uid()) IS NOT NULL)
            WITH CHECK ((SELECT auth.uid()) IS NOT NULL);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'mynext_client_emails'
          AND policyname = 'Inserción pública de emails de clientes'
    ) THEN
        CREATE POLICY "Inserción pública de emails de clientes"
            ON public.mynext_client_emails
            FOR INSERT
            TO anon, authenticated
            WITH CHECK (
                length(trim(client_name)) > 0
                AND position('@' in client_email) > 1
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'mynext_client_emails'
          AND policyname = 'Gestión administrativa de emails de clientes'
    ) THEN
        CREATE POLICY "Gestión administrativa de emails de clientes"
            ON public.mynext_client_emails
            FOR ALL
            TO authenticated
            USING ((SELECT auth.uid()) IS NOT NULL)
            WITH CHECK ((SELECT auth.uid()) IS NOT NULL);
    END IF;
END $$;
