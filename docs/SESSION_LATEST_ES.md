# Resumen de Sesión - 30 Jul 2026

## ¿Qué se ha hecho hoy?
- **Actualización de Tacos Marrakech:** Integradas fotos reales del menú QR impreso y soportes de reseñas de Google Maps en la galería del proyecto.
- **Integración de Blessed Barber Studio (x11):** Convertidas fotos de exposición de horarios con QR para reservas directas (Booksy y WhatsApp) y expositores de reseñas de Google Maps.
- **Branding Completo de Ecuaplac:** Incorporadas fotos de vinilado de furgonetas con QR de acceso directo a la web y tarjetas de visita físicas corporativas.
- **Nuevo Logo Monograma MN:** Procesado el nuevo isotipo de marca `MN` en PNG transparente de alta resolución y favicon oficial.
- **Optimización de Rendimiento de Scroll:** Desactivados repaints innecesarios en GSAP ScrollTrigger (`once: true`), añadido `IntersectionObserver` al marquee y aceleración por GPU.
- **Sincronización Total con Supabase:** Creado script ejecutable `npm run sync-projects` y migrada toda la información de los 8 proyectos a la base de datos de Supabase.
- **Revisión de Traducción (Skill i18nstack):** Localización completa al inglés adaptativo en `index-en.html`, `project-en.html` y descripciones del portfolio.
- **Compresión de Imágenes Pesadas:** Reducido el peso de las imágenes de galería de 120 MB a 2.7 MB (~400 KB/foto).
- **Limpieza de Proyecto:** Eliminados archivos temporales, scripts de un solo uso y 40 paquetes npm innecesarios.
- **Sitemap & SEO:** Actualizadas las fechas a hoy y agregadas las URLs de proyectos individuales.
- **Fusión y Despliegue Git:** Realizado commit, merge de `dev` a `main` y push exitoso a **GitHub** y **GitLab**.

## Archivos modificados
- `index.html` e `index-en.html` (Actualización de sección Sobre Mí, nuevo logo MN y optimización).
- `project.html` y `project-en.html` (Restauración de cabecera original y galerías dinámicas).
- `src/lib/fallbackData.ts` y `src/project.ts` (Galerías, bilingüismo y optimización de imágenes).
- `public/sitemap.xml` (Actualización de fechas y URLs de proyectos).
- `scripts/sync_projects_to_supabase.js` (Script de sincronización con Supabase).
- `.github/workflows/sync-google-reviews.yml` (Workflow de sincronización de reseñas de Google).

## Problemas solucionados
- **Pesadez en Carga:** Comprimidas imágenes de galería de 120 MB a 2.7 MB.
- **Lag al hacer Scroll:** Eliminados repaints de ScrollTrigger y pausado el marquee cuando no es visible.
- **Títulos de Galería Harcodeados:** Hechos dinámicos según el proyecto (restaurante, barbería, construcción).

## Qué queda pendiente
1. Envío del sitemap actualizado a Google Search Console.
2. Incorporar nuevos proyectos al portfolio a medida que se entreguen a clientes.
