# Roadmap MYNEXT

## Tareas Completadas
- Rediseño del formulario de contacto con campos estructurados (Nombre, Email, WhatsApp, Tipo de Proyecto, Presupuesto).
- Configuración de plantilla HTML Table en FormSubmit para que los correos lleguen organizados y limpios a Gmail sin ir a Spam.
- Implementación de correo de respuesta automática (Autoresponder) enviado al cliente al solicitar una propuesta.
- Favicon e isotipo oficial optimizado a 192x192 px con especificaciones exactas para Google Search.
- Galería dinámica de proyectos con fotos físicas (menús QR, soportes de reseñas de Google Maps, vinilados y tarjetas).
- Optimización extrema de rendimiento de scroll a 60–120 FPS en iOS/móvil y fix del carrusel táctil de reseñas.
- Revisión y traducción al inglés al 100% siguiendo la skill `i18nstack`.
- Limpieza profunda de archivos temporales, código muerto y depuración de dependencias npm.
- Configuración de credenciales de Google Places API (`GOOGLE_PLACES_API_KEY`, `GOOGLE_PLACE_ID`) en `.env`.
- Integración de script de extracción local con Google Chrome (`scripts/scrape_google_maps_reviews.js`).
- Unificación canónica de las 6 reseñas verificadas de Google Maps en `src/lib/fallbackData.ts` y `scripts/sync_google_reviews.js`.

## Tareas en Progreso
- Verificación de indexación SEO local en Google Search Console y ficha de Google Business Profile.

## Próximas Mejoras Prioritarias
- Vincular método de pago en Google Cloud Billing si se requiere sincronización automática diaria con GitHub Actions.
- Incorporar nuevos proyectos al portfolio dinámico a medida que se entreguen a clientes.
