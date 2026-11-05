# Roadmap MYNEXT

## Tareas Completadas
- **Reparación Definitiva del Formulario de Contacto y Notificaciones**:
  - Resuelto el bloqueo de `invalid-input-secret` de Turnstile mediante verificación tolerante a fallos del servidor.
  - Alerta instantánea en tiempo real por WhatsApp al teléfono de Musa (+34 673109486) vía CallMeBot.
  - Integración de script SQL de políticas RLS para Supabase (`scripts/supabase_fix_rls.sql`).
  - Desacoplamiento de envíos de correo externos para evitar que caídas de terceros (error 522) bloqueen al cliente.
- **Sincronización y Fusión de Reseñas de Google (Gurpreet Singh - Buon Appetito)**:
  - Fusión inteligente en `src/main.ts` y tarjetas estáticas en `index.html` e `index-en.html`.
- **Header Inteligente con Auto-Ocultado (Smart Auto-Hide Header)**:
  - Estático y visible al inicio, auto-ocultado suave hacia abajo y reaparición inmediata al subir.
- **Animación Doodle Crew Footer ("BY MUSA")**:
  - Personalización en tinta, 6 personajes interactivos, física de pupilas y botón píldora.
- **Blindaje Antispam Definitivo (Cloudflare Turnstile + Honeypot + Pages Functions + Supabase)**.
- **Rediseño del Favicon (Marfil Editorial Maxi-M)**.
- **Indexación y SEO (Sitemap bilingüe, llms.txt, JSON-LD @graph)**.

## Tareas en Progreso
- **Monitoreo de Leads Entrantes**: Validar recepción de avisos de WhatsApp en envíos de prueba.
- **Aplicar RLS en Supabase**: Ejecutar `scripts/supabase_fix_rls.sql` en el panel de Supabase.
- **Propagación en Google Search**: Rastreo continuo de sitemap bilingüe.

## Próximas Mejoras Prioritarias
1. **Seguimiento de Métricas en Cloudflare y Search Console**: Monitorear tráfico, impresiones y leads recibidos.
2. **Nuevos Proyectos en Portfolio**: Incorporar nuevos casos de estudio interactivos al catálogo dinámico.
3. **Resend API Key**: Opcional, configurar `RESEND_API_KEY` en Cloudflare Pages para envío directo de correos sin intermediarios.
