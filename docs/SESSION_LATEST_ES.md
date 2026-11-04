# Resumen de Sesión - MYNEXT

## ¿Qué se ha hecho hoy?
1. **Solución a la Nueva Reseña de Google ("Gurpreet Singh" / "Restaurante Buon Appetito")**:
   - Detectado por qué no aparecía: la tabla `mynext_testimonials` de Supabase solo tenía 7 registros y, a diferencia de los proyectos (`projects`), las reseñas se sobreescribían directamente sin fusionar las reseñas añadidas localmente en `fallbackData.ts`. Además, la clave de caché de sesión guardaba los 7 registros.
   - Implementada la función de fusión y deduplicación `mergeTestimonialsList` en `src/main.ts` (idéntica a la de proyectos) tanto en la carga inicial/caché como en la respuesta de Supabase en segundo plano.
   - Actualizada la versión de caché a `mynext_cms_cache_v4` para invalidar datos antiguos en el navegador de los usuarios.
   - Añadida la tarjeta estática de la reseña en `index.html` e `index-en.html` (en ambos sets del carrusel infinito) para garantizar visibilidad inmediata antes de cargar JS e indexación SEO.
   - Verificado con Playwright: las 8 reseñas únicas se renderizan ahora sin fallo en el marquee animado.
2. **Animación Doodle Crew Footer de 21st.dev ("BY MUSA")**:
   - Integrado el componente React interactivo en el footer de la web (`index.html` e `index-en.html`).
   - Personalizado el rótulo en tinta para mostrar **"BY MUSA"** con 6 personajes animados, interacción en pupilas, saltos y bocadillos al hacer clic.
   - Modificado el botón píldora inferior derecho para mostrar: **`Echo con mucho amor❤️`** con punto cian pulsante.
3. **Solución del Error de Cloudflare Turnstile en Red Local / Móvil**:
   - Resuelto el error *"No es posible conectarse al sitio web"* con detección automática de red local/desarrollo (`192.168.1.26`, `localhost`) aplicando la clave de pruebas universal de Cloudflare (`1x00000000000000000000AA`), manteniendo la clave de producción en el dominio real.
4. **Optimización del Retraso de Scroll en Planes y Contacto**:
   - Eliminado el conflicto entre GSAP y la regla CSS `.reveal { transition: all 1s }`.
   - Desactivado `backdrop-filter: blur(24px)` en móvil para el formulario y optimizado el radio de desenfoque de los fondos de planes.
   - Desacoplado el reseteo de scroll del menú móvil para hacer scroll suave con compensación de cabecera (`headerOffset = 70`).
5. **Header Inteligente en Móvil (Smart Header)**:
   - **Al inicio (`scrollY <= 60`)**: El header se mantiene estático y visible en su posición superior.
   - **Scroll hacia abajo (`delta > 6px`)**: El header se oculta suavemente hacia arriba (`translateY(-120%)`) para despejar la pantalla y facilitar la lectura en el móvil.
   - **Scroll hacia arriba (`delta < -6px`)**: El header reaparece al instante en modo compacto para permitir al usuario acceder a la navegación o al menú.

## Archivos Modificados
- `src/main.ts`: función de fusión inteligente de testimonios (`mergeTestimonialsList`), salto de caché a `v4`, header dinámico para móvil y optimizaciones de scroll.
- `index.html`, `index-en.html`: tarjeta estática de la reseña de Gurpreet Singh (Buon Appetito) en sets 1 y 2, Turnstile local, Footer Doodle Crew.
- `docs/SESSION_LATEST_ES.md` y `docs/ROADMAP.md`: documentación de sesión actualizada.

## Problemas Solucionados
- **Nueva reseña de Google no visible**: Gurpreet Singh (Restaurante Buon Appetito) ya se muestra de forma permanente y fusionada en el carrusel de opiniones.
- **Header móvil invasivo**: Se auto-oculta al scrollear hacia abajo y reaparece al subir.
- **Error Turnstile en móvil ("No es posible conectarse al sitio web")**: Eliminado en red local.
- **Retraso de scroll en Planes y Contacto**: Resuelto eliminando el choque de transiciones CSS con GSAP.

## Qué Queda Pendiente
- Comprobar la experiencia visual directamente desde el móvil recargando `http://192.168.1.26:5173/` o en producción.
