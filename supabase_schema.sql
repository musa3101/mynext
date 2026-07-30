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

-- Permitir lectura e inserción pública/sincronizada a las tablas activas
CREATE POLICY "Lectura pública de proyectos" ON mynext_projects FOR SELECT USING (true);
CREATE POLICY "Inserción y edición de proyectos" ON mynext_projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Lectura pública de testimonios" ON mynext_testimonials FOR SELECT USING (true);
CREATE POLICY "Inserción de testimonios" ON mynext_testimonials FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualización de testimonios" ON mynext_testimonials FOR UPDATE USING (true);
CREATE POLICY "Lectura pública de configuración" ON mynext_settings FOR SELECT USING (true);
CREATE POLICY "Lectura pública de servicios" ON mynext_services FOR SELECT USING (true);
