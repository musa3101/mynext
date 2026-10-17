-- Tabla de Proyectos
CREATE TABLE IF NOT EXISTS mynext_projects (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    full_description TEXT,
    image_url TEXT,
    project_url TEXT,
    technologies TEXT,
    featured BOOLEAN DEFAULT true,
    active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    gallery_title JSONB,
    gallery_subtitle JSONB,
    gallery JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Testimonios / Reseñas de Google Maps
CREATE TABLE IF NOT EXISTS mynext_testimonials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    position TEXT,
    company TEXT,
    content TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    image_url TEXT,
    google_review_id TEXT UNIQUE,
    author_photo TEXT,
    relative_time TEXT,
    source TEXT DEFAULT 'google',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    active BOOLEAN DEFAULT true
);

-- Modificaciones seguras si la tabla ya existía
ALTER TABLE mynext_testimonials ADD COLUMN IF NOT EXISTS google_review_id TEXT UNIQUE;
ALTER TABLE mynext_testimonials ADD COLUMN IF NOT EXISTS author_photo TEXT;
ALTER TABLE mynext_testimonials ADD COLUMN IF NOT EXISTS relative_time TEXT;
ALTER TABLE mynext_testimonials ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'google';


-- Tabla de Configuración General
CREATE TABLE IF NOT EXISTS mynext_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Servicios / Planes
CREATE TABLE IF NOT EXISTS mynext_services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    features JSONB,
    price DECIMAL(10,2),
    active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0
);

-- Políticas de Seguridad (RLS)
ALTER TABLE mynext_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE mynext_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE mynext_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE mynext_services ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública estricta para visitantes y crawlers
CREATE POLICY "Lectura pública de proyectos" ON mynext_projects FOR SELECT USING (true);
CREATE POLICY "Lectura pública de testimonios" ON mynext_testimonials FOR SELECT USING (true);
CREATE POLICY "Lectura pública de configuración" ON mynext_settings FOR SELECT USING (true);
CREATE POLICY "Lectura pública de servicios" ON mynext_services FOR SELECT USING (true);

-- Restringir inserción, edición y borrado a usuarios autenticados / service_role
CREATE POLICY "Gestión administrativa de proyectos" ON mynext_projects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Gestión administrativa de testimonios" ON mynext_testimonials FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Gestión administrativa de configuración" ON mynext_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Gestión administrativa de servicios" ON mynext_services FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================================
-- NUEVAS TABLAS (supabase-postgres-best-practices):
-- 1. mynext_cookie_consents (Registro RGPD de consentimiento de cookies)
-- 2. mynext_client_emails   (Registro de emails y propuestas de clientes)
-- ============================================================================

-- 1. Tabla de Consentimiento de Cookies (mynext_cookie_consents)
-- Best practice (schema-primary-keys & schema-data-types):
-- bigint generated always as identity PK (secuencial, sin fragmentación de índice UUIDv4)
-- text en lugar de varchar(n), timestamptz en lugar de timestamp
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

-- Best practice (schema-constraints): Añadir CHECK constraints de forma idempotente
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

-- Best practice (query-missing-indexes): Índices B-tree para ordenación cronológica y filtrado
CREATE INDEX IF NOT EXISTS mynext_cookie_consents_created_at_idx
    ON public.mynext_cookie_consents (created_at DESC);

CREATE INDEX IF NOT EXISTS mynext_cookie_consents_status_idx
    ON public.mynext_cookie_consents (consent_status);

CREATE INDEX IF NOT EXISTS mynext_cookie_consents_visitor_id_idx
    ON public.mynext_cookie_consents (visitor_id);


-- 2. Tabla de Mails / Solicitudes de Clientes (mynext_client_emails)
-- Best practice (schema-primary-keys & schema-data-types):
-- bigint generated always as identity PK, text para campos variables, timestamptz
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

-- Best practice (schema-constraints): Validación idempotente de email y estado del lead
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

-- Best practice (query-missing-indexes & query-partial-indexes):
-- Índice cronológico descendente, índice por email de cliente e índice parcial para leads pendientes ('new')
CREATE INDEX IF NOT EXISTS mynext_client_emails_created_at_idx
    ON public.mynext_client_emails (created_at DESC);

CREATE INDEX IF NOT EXISTS mynext_client_emails_email_idx
    ON public.mynext_client_emails (lower(client_email));

CREATE INDEX IF NOT EXISTS mynext_client_emails_unread_idx
    ON public.mynext_client_emails (created_at DESC)
    WHERE status = 'new';


-- Best practice (security-rls-basics & security-privileges):
-- Activar RLS obligatorio. Los visitantes anónimos (rol anon) SOLO pueden INSERTAR (nunca leer datos privados de otros clientes).
-- Solo el administrador autenticado (authenticated / service_role) puede leer, actualizar o borrar registros.
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


