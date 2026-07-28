# Resumen de Sesión - 28 Jul 2026

## ¿Qué se ha hecho hoy?
- **Vista previa OpenGraph Cuadrada (WhatsApp / Redes):** Configuración de la tarjeta social de WhatsApp/Facebook al estilo TKO Tacos, mostrando un recuadro cuadrado a la izquierda con el logo oficial de MYNEXT centrado sobre fondo oscuro `#06060c`.
- **Generación Automática de Maquetas de Proyectos:** 
  - Creación de script automatizado con **Puppeteer** (`scripts/capture_real_websites.js`) que captura las webs reales (móvil y escritorio) aplicando ocultación automática de carteles de cookies y eliminación de recuadros azules de foco.
  - Creación de script con **Python/Pillow** (`scripts/generate_device_mockups.py`) que compone la maqueta de iMac + iPhone 15 Pro, aplicando luces radiales de estudio (cian y violeta) y marca de agua del logo MYNEXT al 3% de opacidad.
- **Rediseño del Portfolio y Carrusel Infinito:**
  - Eliminación de la barra superior de ventana de Safari en las tarjetas.
  - Reemplazo de los textos largos de descripción por etiquetas estilizadas de categoría en cian eléctrico (ej: `RESTAURANTE MARROQUÍ`, `CENTRO ISLÁMICO`, `REFORMAS & TABIQUERÍA`).
  - Ajuste del carrusel para que aparezca 100% lleno sin espacios vacíos a la izquierda, con autoplay cada 4 segundos y navegación ultra fluida sin saltos bruscos.
- **Solución a Rutas de Detalle:** Implementación de generación dinámica de slug de respaldo en `src/main.ts` para evitar que la página de detalle falle o muestre *"Proyecto No Encontrado"* al recargar (`Cmd` + `R`).
- **Fusión y Despliegue Oficial:** Realizado el commit y merge a `main`, subiendo todos los cambios a GitHub y GitLab.

## Archivos modificados
- `index.html` e `index-en.html` (Actualización de meta-etiquetas OpenGraph y Twitter en formato `summary` 512x512).
- `src/main.ts` (Rediseño de tarjetas de portfolio, etiquetas de categoría, autoplay a 4s y eliminación de saltos de scroll).
- `scripts/capture_real_websites.js` (Script Puppeteer para capturas reales sin cookies ni foco).
- `scripts/generate_device_mockups.py` (Script Python para composiciones iMac + iPhone con iluminación ambient y marca de agua).
- `public/assets/img/portfolio/*` (Actualización de las 7 imágenes de portada del portfolio).
- `public/assets/img/og-share.png` y `screen.png` (Nuevas vistas previas para compartir).

## Problemas solucionados
- **Tarjeta de WhatsApp Estilo TKO:** Ajustada la vista previa para que muestre el logo cuadrado centrado a la izquierda.
- **Pantallas de Carga y Carteles de Cookies:** Puppeteer ahora espera 3.5 segundos e inyecta reglas CSS para ocultar ventanas de cookies antes de tomar la captura.
- **Saltos Bruscos en Carrusel:** Eliminado el manejador que provocaba que el carrusel se devolviera al centro mientras el usuario arrastraba.
- **Error "Proyecto No Encontrado":** Solucionado mediante slug fallback generado a partir del título del proyecto.

## Qué queda pendiente para la próxima sesión
1. **Google Business Profile & SEO Local:** Ficha de Google Maps y envío del sitemap a Google Search Console.
2. **Sincronización Automática de Reseñas de Google:** Conectar Google Places API con Supabase para actualizar opiniones en tiempo real.
