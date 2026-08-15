# Resumen de Sesión - 15 Ago 2026

## ¿Qué se ha hecho hoy?
- **Optimización Integral de SEO Local & Microdatos Estructurados (Schema.org / JSON-LD):**
  - **Esquema LocalBusiness & ProfessionalService:** Enriquecido con valoración agregada de 5,0 ⭐ basada en las 7 reseñas verificadas de Google Maps (`aggregateRating`), geolocalización precisa de Palma de Mallorca, horarios y catálogo oficial de ofertas (`OfferCatalog`) con los planes Básico (280€) y Business (380€).
  - **Esquema FAQPage (Rich Snippets):** Implementado el esquema estructurado de Preguntas Frecuentes tanto en español (`index.html`) como en inglés (`index-en.html`) para habilitar los desplegables interactivos directos en la página de resultados de Google.
  - **Esquema BreadcrumbList:** Añadido a las páginas de planes (`planes/index.html` y `planes/index-en.html`) y a las páginas de casos de estudio (`project.html` y `project-en.html`).
- **Preparación para Google Search Console:**
  - Añadida la metaetiqueta `google-site-verification` a todas las páginas HTML (`index.html`, `index-en.html`, `planes/index.html`, `planes/index-en.html`, `project.html`, `project-en.html`).
  - Actualizado el mapa del sitio oficial (`public/sitemap.xml`) con fecha 15 de agosto de 2026, jerarquía de prioridades y directivas para rastreadores.
- **Sistema de Métricas y Seguimiento de Conversiones:**
  - Creado el módulo `src/lib/analytics.ts` con escucha automática de eventos comerciales de alto valor: clics en WhatsApp, llamadas directas al teléfono, envíos del formulario de contacto, selección de planes de precios, navegación en el portfolio y apertura de FAQs.
  - Integrado de forma asíncrona y sin latencia en `src/main.ts` y `src/project.ts`.
- **Verificación y Compilación:**
  - Compilación de producción con TypeScript y Vite (`npm run build`) completada con 0 errores y 100% tipado estricto.

## Archivos modificados
- `src/lib/analytics.ts` (Nuevo)
- `index.html`
- `index-en.html`
- `planes/index.html`
- `planes/index-en.html`
- `project.html`
- `project-en.html`
- `public/sitemap.xml`
- `src/main.ts`
- `src/project.ts`
- `docs/SESSION_LATEST_ES.md`
- `docs/ROADMAP.md`

## Problemas solucionados
- **Falta de Microdatos para Rich Snippets:** Google no tenía acceso estructurado a las valoraciones 5.0 ⭐ de Google Maps ni a las preguntas frecuentes del negocio. Ahora los rastreadores leen el catálogo y los datos locales de inmediato.
- **Carencia de Medición de Leads:** No existía registro de qué acciones tomaban los usuarios antes de contactar. Ahora cada conversión (WhatsApp, llamadas, formulario) queda trazada y lista para conectarse con GA4 o logs.
- **Sitemap Desactualizado:** Fechas del sitemap renovadas a la versión actual.

## Qué queda pendiente
1. Verificar la propiedad en Google Search Console (mediante registro DNS TXT en Cloudflare o metaetiqueta).
2. Vincular la cuenta de facturación en Google Cloud Console para la sincronización periódica desatendida de Google Places API.
3. Incorporar nuevos proyectos al portfolio dinámico a medida que se entreguen a clientes.
