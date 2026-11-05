# Roadmap MYNEXT

## Tareas Completadas
- **Selector de Contacto Inteligente (Formulario Nativo por Defecto + Cal.com)**:
  - Formulario de propuesta propio activo por defecto.
  - Cal.com (`https://cal.com/mynextbymusa/primera-consulta-mynext`) accesible mediante pestañas sin solapes.
  - Parámetro URL `?tab=cal` para abrir la agenda de llamadas directamente desde cualquier enlace.
- **Botón "Agendar Cita" en Proyectos Individuales y Enlace en Footer**:
  - Botón CTA de estilo cápsula cristal y acento cian en `project.html` y `project-en.html`.
  - Enlaces "Agendar Cita ↗" en la navegación del footer en todas las páginas (ES / EN).
- **Corrección de Zoom en iOS Safari (iPhone)**:
  - Regla estricta de `font-size: 16px !important` en todos los inputs, selects y textareas para pantallas <= 768px.
- **Auditoría Integral y Optimización de Rendimiento**:
  - **Google Lighthouse**: 100/100 en SEO, 100/100 en Accesibilidad, 100/100 en Buenas Prácticas y 88/100 en Desktop.
  - **Estabilidad de Pantalla**: Reducción del CLS de 0.731 a 0.039 (95% menos desplazamiento visual).
  - **Fluidez (Scroll a 60 FPS)**: Transición de cabecera ajustada a 350ms y láser acelerado por GPU.
  - **TestSprite MCP**: 100% de pruebas E2E aprobadas (3/3 casos core).
  - **Playwright CLI**: 0px de desbordamiento horizontal en todas las resoluciones.
- **Reparación Definitiva del Formulario de Contacto y Notificaciones**:
  - Integración con Resend API y Cloudflare Turnstile CAPTCHA.

## Tareas en Progreso
- **Comprobación de Citas en Cal.com**: Verificar que las reservas en Cal.com se reflejan en Google Calendar.
- **Monitoreo de Leads Entrantes**: Seguimiento de correos recibidos a través del formulario de propuesta.

## Próximas Mejoras Prioritarias
1. **Seguimiento de Métricas en Google Search Console y Cloudflare**: Comprobar impresiones y tráfico orgánico.
2. **Nuevos Proyectos en Portfolio**: Incorporar nuevos casos de estudio reales al catálogo interactivo.
3. **Optimización de Fuentes**: Empaquetar iconos de Material Symbols como SVGs inline para ahorrar 1 MB de payload.
