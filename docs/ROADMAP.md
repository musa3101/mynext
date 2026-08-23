# Roadmap MYNEXT

## Tareas Completadas
- **Rediseño del Logo en Header de Proyectos**: Reemplazado el logo plano de "MYNEXT" por el isotipo circular MN enmarcado en degradado cyan brillante y efectos hover interactivos en `project.html` y `project-en.html`.
- **Limpieza de Workspace**: Eliminación de capturas de auditoría viejas en `docs/audit_screenshots`, reportes de auditoría obsoletos y directorios de caché temporales (`.testsprite`, `.wrangler`).
- **Sección CTA & Modal de Contacto en Páginas de Proyecto**: Formulario interactivo con envío AJAX, tarjeta de alta conversión y botones directos (WhatsApp y Email) antes del footer en `project.html` y `project-en.html`.
- **Actualización de Caso de Estudio RBARI Restaurant**: Textos bilingües optimizados (ES/EN) con carta digital y reservas telefónicas integradas.
- **Sincronización y Normalización de Imágenes (.webp)**: 100% de proyectos con imágenes optimizadas y funcionando en Supabase y cliente local.
- **Reporte Diario Dual (Email + WhatsApp) & Web Analytics RUM**: Integración de Cloudflare Web Analytics con métricas reales por web y monitor de estado 10/10 en verde (listo en la rama de desarrollo `dev`).
- **Seguridad Cloudflare Completa**: TLS 1.2 Mínimo, DNSSEC activo con registro DS en Cloudflare Registrar, HSTS precargado, Hotlink Protection, WAF Custom y Rate Limiting.
- **Indexación Google Search & Search Console**: WAF configurado para acceso de rastreadores oficiales, sitemap sincronizado y metaetiquetas bilingües.
- **Favicons de Alto Contraste**: Set completo en Cyan Eléctrico (`#00F2FF`) sobre fondo oscuro para Google Search.
- **Backend & CMS Supabase**: Tablas de proyectos, testimonios 5.0 ⭐ de Google Maps, hero, about, services y settings sincronizadas.
- **Keep-Alive & Resiliencia**: Monitor anti-pausa y auto-recuperación en GitHub Actions y GitLab CI (actualizados y configurados).
- **Traducción Bilingüe 100% (ES/EN)**: Arquitectura con `i18nstack` y URLs canónicas hreflang.

## Tareas en Progreso
- **Despliegue Limpio del Historial a GitHub**: Reconstrucción limpia de la rama `main` desde el commit seguro `e9309bf` para omitir el commit con secreto expuesto y reactivar GitHub Actions para el bot de WhatsApp.
- Actualización de la caché de miniaturas de favicon en Google Search (solicitud enviada en Search Console).

## Próximas Mejoras Prioritarias
- **Auditoría Completa de TestSprite**: Ejecutar auditorías automatizadas del entorno de producción.
- **Google Places API**: Vincular cuenta de facturación en Google Cloud para activación automática periódica.
- **Nuevos Proyectos en Portfolio**: Incorporar nuevos proyectos al portfolio dinámico a medida que se entreguen a clientes.
