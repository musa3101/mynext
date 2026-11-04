# Roadmap MYNEXT

## Tareas Completadas
- **Header Inteligente con Auto-Ocultado (Smart Auto-Hide Header)**:
  - Estático y visible al inicio de la página (`scrollY <= 60`).
  - Ocultado suave hacia arriba (`translateY(-120%)`) al hacer scroll hacia abajo para liberar la pantalla móvil.
  - Reaparición inmediata al hacer scroll hacia arriba en formato compacto accesible.
- **Animación Doodle Crew Footer ("BY MUSA")**:
  - Integración fluida del componente animado e interactivo de 21st.dev en el footer de la web (`index.html` e `index-en.html`).
  - Adaptación de la tipografía ilustrada al rótulo `"BY MUSA"` con 6 personajes animados, interacción en pupilas, flotadores y salto con bocadillos al hacer clic.
  - Botón píldora actualizado a: `Echo con mucho amor❤️`.
- **Corrección de Turnstile en Red Local y Móvil**:
  - Auto-detección de hostnames locales (`192.168.1.26`, `localhost`) para usar la clave universal de Cloudflare (`1x00000000000000000000AA`), eliminando el bloqueo *"No es posible conectarse al sitio web"*.
- **Optimización de Fluidez de Scroll en Planes y Contacto**:
  - Desacoplado el conflicto entre GSAP y CSS `transition: all 1s` en las clases `.reveal`.
  - Desactivado `backdrop-filter: blur(24px)` en móviles en `.form-container` para liberar ciclos de rasterizado de GPU.
  - Corrección del menú desplegable móvil para navegar de forma suave con compensación de cabecera (`headerOffset = 70`).
- **Auditoría y Optimización de Rendimiento Móvil (Playwright CLI)**.
- **Blindaje Antispam Definitivo (Cloudflare Turnstile + Honeypot + Pages Functions + Supabase)**.
- **Rediseño del Favicon (Marfil Editorial Maxi-M)**.
- **Indexación y SEO (Sitemap bilingüe, llms.txt, JSON-LD @graph)**.

## Tareas en Progreso
- **Verificación Móvil en Vivo**: Validar la fluidez y experiencia táctil en dispositivos móviles en red local.
- **Purgar caché de Cloudflare**: Ejecutar "Purgar todo" en Caching → Configuration tras el despliegue a producción.
- **Propagación en Google Search**: Rastreo progresivo por parte de Googlebot e indexación de nuevas URLs.

## Próximas Mejoras Prioritarias
1. **Seguimiento de Métricas en Cloudflare y Search Console**: Monitorear tráfico, impresiones y leads recibidos.
2. **Nuevos Proyectos en Portfolio**: Incorporar nuevos casos de estudio interactivos al catálogo dinámico.
3. **Bot Interactivo con Meta Cloud API**: Integrar webhook para notificaciones instantáneas de leads en WhatsApp.
