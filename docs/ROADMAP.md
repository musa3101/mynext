# Roadmap MYNEXT

## Tareas Completadas
- Rediseño del formulario de contacto con campos estructurados (Nombre, Email, Teléfono, Tipo de Proyecto, Presupuesto, Idea).
- Configuración de plantilla HTML Table en FormSubmit para que los correos lleguen organizados y limpios a Gmail sin ir a Spam.
- Implementación de correo de respuesta automática (Autoresponder) enviado al cliente al solicitar una propuesta.
- Reactivación, restauración y migración de tablas al backend Supabase exclusivo (`mynext-WEB`).
- Implementación de Keep-Alive automático y auto-recuperación (self-healing) inteligente con restauración automática ante pausas en GitHub Actions y GitLab CI.
- Implementación de Reporte Diario de Estado automatizado vía email (9:00 AM) usando la API de Resend y GitHub Actions.
- **Corrección de GitLab CI y Reporte de Estado**: Optimización de `.gitlab-ci.yml` con reglas de workflow para evitar falsas alertas de pipelines fallidas en git push y ajuste de cabeceras en `.github/workflows/daily-report.yml` para evitar falsos positivos de Cloudflare (403).
- Favicon e isotipo oficial optimizado a 192x192 px con especificaciones exactas para Google Search.
- Galería dinámica de proyectos con fotos físicas (menús QR, soportes de reseñas de Google Maps, vinilados y tarjetas de visita).
- Sincronización automática de proyectos con Supabase (`npm run sync-projects`).
- Integración y unificación canónica de las 7 reseñas reales de Google Maps (5,0 ⭐) en `fallbackData.ts` y base de datos Supabase con soporte bilingüe (ES/EN).
- Sincronización completa de todas las tablas de contenido del CMS de Supabase (about, hero, contact, services y faq) con el contenido real de la web.
- Optimización extrema de rendimiento de scroll a 60–120 FPS en iOS/móvil y fix del carrusel táctil de reseñas.
- Revisión y traducción al inglés al 100% siguiendo la skill `i18nstack`.
- Limpieza profunda de archivos temporales, código muerto y depuración de dependencias npm.
- **Métricas & SEO Local**: Implementación de Schema.org completo (LocalBusiness con 5.0 ⭐ aggregateRating, FAQPage para Rich Snippets en Google, OfferCatalog para los planes 280€/380€ y BreadcrumbList en todas las subpáginas).
- **Google Search Console**: Metaetiquetas de verificación integradas en todo el sitio y `sitemap.xml` 100% actualizado (2026-08-15).
- **Seguimiento de Conversiones**: Módulo `analytics.ts` para capturar clics en WhatsApp, llamadas, envíos de formulario y clics a proyectos del portfolio.
- **Auditoría Chrome & Rendimiento Ultra-Fluido**: Pruebas automatizadas en Google Chrome nativo; scroll a 100% fluidez (0 jank frames) con `content-visibility: auto` y `decoding="async"`, junto con preconnect en fuentes críticas (FCP < 140ms).

## Tareas en Progreso
- Verificación del dominio en Google Search Console y alta del sitemap `https://mynextbymusa.com/sitemap.xml`.

## Próximas Mejoras Prioritarias
- Incorporar nuevos proyectos al portfolio dinámico a medida que se entreguen a clientes.
- Vincular cuenta de facturación en Google Cloud para activación automática periódica de Places API.
