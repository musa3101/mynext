# 📍 Configuración de Google Places API para MYNEXT

Esta guía explica cómo conectar la API oficial de Google Places con tu proyecto de MYNEXT y Supabase para sincronizar automáticamente las opiniones y reseñas de 5 estrellas de tu ficha de Google Maps.

---

## 🔑 1. Obtener Credenciales en Google Cloud Console

1. Entra a [Google Cloud Console](https://console.cloud.google.com/).
2. Crea un proyecto o selecciona uno existente (ej: `MYNEXT-Web`).
3. Ve a **APIs y Servicios** > **Biblioteca**.
4. Busca y activa:
   - **Places API** (o **Places API (New)**).
5. Ve a **APIs y Servicios** > **Credenciales** y haz clic en **Crear credenciales** > **Clave de API (API Key)**.
6. *(Recomendado)* Restringe la clave de API para uso exclusivo de Places API.

---

## 🗺️ 2. Obtener tu Place ID de Google Maps

1. Abre el buscador oficial de Place ID de Google: [Google Place ID Finder](https://developers.google.com/maps/documentation/javascript/get-api-key?hl=es).
2. Escribe el nombre de tu negocio en Palma de Mallorca (ej: `MYNEXT Palma` o el nombre de tu ficha de Google Business Profile).
3. Copia la cadena `Place ID` que aparece en el mapa (empieza por `ChIJ...`).

---

## ⚙️ 3. Añadir Variables de Entorno

### A. En local (`.env`):
Añade las siguientes líneas a tu archivo `.env`:
```env
GOOGLE_PLACES_API_KEY="AIzaSy..."
GOOGLE_PLACE_ID="ChIJ..."
```

### B. En GitHub Secrets (para automatización diaria):
Ve a tu repositorio en GitHub > **Settings** > **Secrets and variables** > **Actions** y añade:
- `GOOGLE_PLACES_API_KEY`: Tu API Key de Google Cloud.
- `GOOGLE_PLACE_ID`: Tu Place ID de Google Maps.
- `SUPABASE_URL`: `https://elfdkbqlvawaprgidqhd.supabase.co`
- `SUPABASE_ANON_KEY`: Tu clave anónima pública de Supabase.

---

## 🚀 4. Ejecución de la Sincronización Manual

Para probar o forzar una actualización de reseñas en cualquier momento, ejecuta en tu terminal:

```bash
npm run sync-reviews
```

El script consultará las reseñas en Google Places API, filtrará las puntuaciones de 5 estrellas y las guardará/actualizará en tu base de datos Supabase, haciéndolas aparecer instantáneamente en el carrusel de tu web.
