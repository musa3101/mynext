# Roadmap MYNEXT

## Tareas Completadas
- **Rediseño y Afinado de Alta Precisión del Favicon (Marfil Editorial Maxi-M)**:
  - Eliminada la sombra difusa (*drop shadow*) del archivo original de Canva para lograr bordes limpios sin desenfoques.
  - Isotipo escalado al 88% (+35% de superficie) para que la "M" llene el círculo de Google Search con máxima legibilidad.
  - Fondo Marfil Cálido (`#FAF5EB`) con Isotipo Negro Ónix (`#0A0A0C`).
  - Paquete completo de producción exportado: `favicon.ico`, `favicon-48x48.png`, `favicon-192x192.png`, `favicon-512x512.png`, `apple-touch-icon.png` y `favicon.png`.
- **Envío de Sitemap e Indexación en Google Search Console**: Sitemap `https://mynextbymusa.com/sitemap.xml` validado en estado **Correcto** con **20 páginas descubiertas** y solicitudes de indexación enviadas para páginas principales y casos de estudio.
- **Auditoría y Optimización de Rendimiento y Fluidez (`Playwright` + `Chrome DevTools CDP` + `TestSprite Cloud`)**: Scroll a **60 FPS constantes (100% fluidez)** en Desktop y Móvil (`CPU 4× + 4G Lenta`), reducción del **73% en animaciones infinitas en segundo plano** (`134 → 36`), reducción del **39% en memoria JS Heap** (`6.17 MB`), `LCP` de `56 ms–128 ms` en Desktop y `2.48 s` en Móvil 4G Lento, y `6/6` tests de Playwright + `84/84` tests unitarios aprobados.
- **Persistencia en Supabase de Cookies y Leads de Contacto**: Tablas `mynext_cookie_consents` y `mynext_client_emails` con RLS y seguimiento automático en `src/lib/leadTracker.ts`.
- **SEO Técnico, AEO, GEO y Descubrimiento para Agentes IA**: Implementación de `/.well-known/api-catalog`, `/ai-catalog.json`, `/llms.txt`, cabeceras `Link` en `public/_headers` y JSON-LD `@graph` completo en las 6 páginas bilingües.
- **Reporte Diario Dual Optimizado (WhatsApp + Email)**: Monitor con reintento automático (`10/10` webs operativas), métricas Cloudflare RUM y plantilla HTML Dark/Light Hybrid.
- **Rediseño Estético del Footer**: Acabado dark glass midnight (`#0c0f1d` → `#04050a`) con acentos cian y píldora "Made by Musa".
- **Desbloqueo de Crawlers de IA en Cloudflare Edge**: Reglas WAF para autorizar `GPTBot`, `PerplexityBot`, `ClaudeBot` y `Google-Extended` con `200 OK`.
- **Seguridad Cloudflare Completa**: TLS 1.2 Mínimo, DNSSEC activo, HSTS precargado, Hotlink Protection, WAF Custom y Rate Limiting.
- **Traducción Bilingüe 100% (ES/EN)**: Arquitectura con URLs canónicas y `hreflang` simétrico en las 20 URLs del `sitemap.xml`.

## Tareas en Progreso
- **Propagación en Google Search**: Rastreo e indexación progresiva por parte de Googlebot de las 20 URLs bilingües y actualización del nuevo favicon por parte de `Googlebot-Image`.

## Próximas Mejoras Prioritarias
1. **Despliegue y Solicitud de Rastreo**: Subir commit a Git para publicar en Cloudflare Pages y solicitar indexación en Search Console.
2. **Seguimiento de Cobertura en Search Console**: Revisar métricas de impresiones y páginas indexadas en Google Search Console.
3. **Bot Interactivo con Meta Cloud API**: Integrar webhook bidireccional para consultar comandos en vivo desde WhatsApp.
4. **Nuevos Proyectos en Portfolio**: Incorporar nuevos casos de estudio al catálogo dinámico a medida que se entreguen a clientes.
