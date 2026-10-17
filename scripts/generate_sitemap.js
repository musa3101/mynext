import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const today = new Date().toISOString().split('T')[0];

const projects = [
  { slug: 'blessed-barber-studio' },
  { slug: 'bar-cafeteria-luna-llena' },
  { slug: 'ecuaplac' },
  { slug: 'rbari-restaurant' },
  { slug: 'next-era' },
  { slug: 'mezquita-arrahma' },
  { slug: 'gran-marrakech' },
  { slug: 'tacos-marrakech' },
];

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <!-- Página Principal (Español) -->
  <url>
    <loc>https://mynextbymusa.com/</loc>
    <xhtml:link rel="alternate" hreflang="es" href="https://mynextbymusa.com/" />
    <xhtml:link rel="alternate" hreflang="en" href="https://mynextbymusa.com/index-en.html" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://mynextbymusa.com/" />
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Página Principal (English) -->
  <url>
    <loc>https://mynextbymusa.com/index-en.html</loc>
    <xhtml:link rel="alternate" hreflang="es" href="https://mynextbymusa.com/" />
    <xhtml:link rel="alternate" hreflang="en" href="https://mynextbymusa.com/index-en.html" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://mynextbymusa.com/" />
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Tarifas y Planes (Español) -->
  <url>
    <loc>https://mynextbymusa.com/planes/</loc>
    <xhtml:link rel="alternate" hreflang="es" href="https://mynextbymusa.com/planes/" />
    <xhtml:link rel="alternate" hreflang="en" href="https://mynextbymusa.com/planes/index-en.html" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://mynextbymusa.com/planes/" />
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Tarifas y Planes (English) -->
  <url>
    <loc>https://mynextbymusa.com/planes/index-en.html</loc>
    <xhtml:link rel="alternate" hreflang="es" href="https://mynextbymusa.com/planes/" />
    <xhtml:link rel="alternate" hreflang="en" href="https://mynextbymusa.com/planes/index-en.html" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://mynextbymusa.com/planes/" />
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Casos de Estudio y Detalle de Proyectos (Español & English) -->
`;

for (const p of projects) {
  // Spanish version
  xml += `  <url>
    <loc>https://mynextbymusa.com/project.html?slug=${p.slug}</loc>
    <xhtml:link rel="alternate" hreflang="es" href="https://mynextbymusa.com/project.html?slug=${p.slug}" />
    <xhtml:link rel="alternate" hreflang="en" href="https://mynextbymusa.com/project-en.html?slug=${p.slug}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://mynextbymusa.com/project.html?slug=${p.slug}" />
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
  // English version
  xml += `  <url>
    <loc>https://mynextbymusa.com/project-en.html?slug=${p.slug}</loc>
    <xhtml:link rel="alternate" hreflang="es" href="https://mynextbymusa.com/project.html?slug=${p.slug}" />
    <xhtml:link rel="alternate" hreflang="en" href="https://mynextbymusa.com/project-en.html?slug=${p.slug}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://mynextbymusa.com/project.html?slug=${p.slug}" />
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
}

xml += `</urlset>\n`;

const sitemapPath = path.resolve(__dirname, '../public/sitemap.xml');
fs.writeFileSync(sitemapPath, xml, 'utf-8');
console.log(`✅ sitemap.xml actualizado con éxito (${projects.length * 2 + 4} URLs bilingües, fecha: ${today})`);
