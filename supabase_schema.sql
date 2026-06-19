-- Tabla de Proyectos
CREATE TABLE IF NOT EXISTS mynext_projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    client_name TEXT,
    project_url TEXT,
    category TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0
);

-- Tabla de Testimonios
CREATE TABLE IF NOT EXISTS mynext_testimonials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    position TEXT,
    company TEXT,
    content TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    active BOOLEAN DEFAULT true
);

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

-- Permitir lectura pública a las tablas activas
CREATE POLICY "Lectura pública de proyectos" ON mynext_projects FOR SELECT USING (true);
CREATE POLICY "Lectura pública de testimonios" ON mynext_testimonials FOR SELECT USING (true);
CREATE POLICY "Lectura pública de configuración" ON mynext_settings FOR SELECT USING (true);
CREATE POLICY "Lectura pública de servicios" ON mynext_services FOR SELECT USING (true);
