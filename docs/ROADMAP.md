# Project Roadmap: MYNEXT

## 1. Tareas Completadas
- [x] **Cargador 3D Principal**: Reemplazo del hourglass SVG por los cubos 3D animados que deletrean `MYNEXT.`.
- [x] **Optimización de Portafolio**: Corrección de la imagen maqueta de "Evaluna Llena" en el listado.
- [x] **Efecto Parallax**: Restauración del efecto interactivo de inclinación en el logo Hero (`#hg`).
- [x] **Scroll de Navegación**: Retorno automático al banner de planes cuando el usuario va hacia atrás.
- [x] **Accesibilidad (a11y)**: Jerarquía de títulos semántica en `index.html` e `index-en.html`, etiquetas `.sr-only` para lectores de pantalla y `aria-label` en enlaces de idioma.
- [x] **SEO Basico**: Creación de `robots.txt` y un `sitemap.xml` bilingüe indexable para el dominio `https://mynextbymusa.com`.
- [x] **Cargador de Planes**: Integración de cargador Love, Death & Robots en negro/rojo para la navegación intermedia.
- [x] **Responsividad Técnica**: Tarjetas técnicas sin skew en móviles y texto visible por defecto.

## 2. Tareas en Progreso
- [ ] **Validación en Cloudflare**: Monitoreo de los logs de despliegue en la plataforma Cloudflare Pages tras actualizar a la versión de compilación limpia.
- [ ] **QA Manual Multi-dispositivo**: Pruebas de velocidad de carga y fluidez de transiciones en navegadores Safari, Chrome (iOS/Android/MacOS).

## 3. Próximas Mejoras Prioritarias
1. **Optimización de Recursos (Assets)**:
   - Conversión de imágenes del portafolio al formato optimizado `.webp` o `.avif` para acelerar el despliegue inicial.
   - Ofuscación/Compresión de JavaScript de producción para proteger scripts clave.
2. **Formulario de Contacto**:
   - Integración directa del backend para notificaciones instantáneas de formularios vía email/WhatsApp.
3. **Métricas y Analíticas**:
   - Adición de un script ligero de analíticas respetuoso con la privacidad para trazar el embudo de conversión de clientes.
