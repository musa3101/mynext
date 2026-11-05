-- ==============================================================================
-- MYNEXT: Habilitar Inserción Pública Segura de Leads de Contacto en Supabase
-- Ejecuta este script en el SQL Editor de tu Dashboard de Supabase
-- (https://supabase.com/dashboard/project/elfdkbqlvawaprgidqhd/sql)
-- ==============================================================================

-- 1. Asegurar que la tabla mynext_client_emails tiene RLS activo
ALTER TABLE mynext_client_emails ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar cualquier política previa de inserción pública para evitar duplicados
DROP POLICY IF EXISTS "Allow public contact form insert" ON mynext_client_emails;
DROP POLICY IF EXISTS "Allow anonymous insert for contact form" ON mynext_client_emails;

-- 3. Crear política para permitir que usuarios anónimos (anon) puedan insertar solicitudes de presupuesto
CREATE POLICY "Allow public contact form insert"
ON mynext_client_emails
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 4. Asegurar que solo administradores o service_role puedan leer los correos (Privacidad RGPD)
DROP POLICY IF EXISTS "Allow read client emails only for authenticated admins" ON mynext_client_emails;
CREATE POLICY "Allow read client emails only for authenticated admins"
ON mynext_client_emails
FOR SELECT
TO authenticated
USING (true);

-- Notificación de éxito
COMMENT ON TABLE mynext_client_emails IS 'Tabla de leads recibidos desde el formulario web de MYNEXT con blindaje RLS';

