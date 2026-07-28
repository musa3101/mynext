#!/bin/bash

# ==========================================
# MYNEXT - AUTOMATIZACIÓN DE ENTORNO LOCAL
# ==========================================
echo "🚀 Iniciando el entorno de desarrollo Pro de MYNEXT..."

# 1. Cambiar a rama de desarrollo para evitar despliegues accidentales en Cloudflare
echo "🌿 Cambiando a la rama de desarrollo (dev)..."
git checkout -b dev || git checkout dev

# 2. Instalar dependencias por si acaso
echo "📦 Instalando dependencias..."
npm install

# 3. Configurar Keep-Alive para Supabase (para evitar auto-pausado en plan gratuito)
if [ -f .env ]; then
  echo "🔍 Detectado archivo .env, configurando Keep-Alive para Supabase..."
  # Extraer URL y anon key de Supabase desde .env (limpiando comillas y espacios)
  SB_URL=$(grep "VITE_SUPABASE_URL" .env | cut -d'=' -f2- | tr -d '\r' | tr -d '"' | tr -d "'" | xargs)
  SB_KEY=$(grep "VITE_SUPABASE_ANON_KEY" .env | cut -d'=' -f2- | tr -d '\r' | tr -d '"' | tr -d "'" | xargs)
  
  if [ -n "$SB_URL" ] && [ -n "$SB_KEY" ]; then
    # Crear carpeta de GitHub workflows si no existe
    mkdir -p .github/workflows
    
    # Escribir keep-alive.yml (consulta universal /auth/v1/health)
    cat <<EOF > .github/workflows/keep-alive.yml
name: Keep Supabase Alive

on:
  schedule:
    # Se ejecuta a las 00:00 cada martes y viernes (dos veces por semana)
    - cron: '0 0 * * 2,5'
  workflow_dispatch: # Permite ejecución manual desde GitHub

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Supabase Health Endpoint
        run: |
          URL="\${{ secrets.SUPABASE_URL }}"
          KEY="\${{ secrets.SUPABASE_ANON_KEY }}"
          if [ -z "\$URL" ]; then
            URL="$SB_URL"
          fi
          if [ -z "\$KEY" ]; then
            KEY="$SB_KEY"
          fi
          echo "Pinging Supabase at \$URL..."
          curl --fail -s -X GET "\$URL/auth/v1/health" \\
            -H "apikey: \$KEY" > /dev/null
          echo "Ping successful!"
EOF
    echo "✅ Archivo .github/workflows/keep-alive.yml creado."

    # Escribir .gitlab-ci.yml
    cat <<EOF > .gitlab-ci.yml
keep_alive:
  stage: deploy
  rules:
    - if: \$CI_PIPELINE_SOURCE == "schedule"
  image: alpine:latest
  script:
    - apk add --no-cache curl
    - |
      URL="\${SUPABASE_URL}"
      KEY="\${SUPABASE_ANON_KEY}"
      if [ -z "\$URL" ]; then
        URL="$SB_URL"
      fi
      if [ -z "\$KEY" ]; then
        KEY="$SB_KEY"
      fi
      echo "Pinging Supabase at \$URL..."
      curl --fail -s -X GET "\$URL/auth/v1/health" \\
        -H "apikey: \$KEY" > /dev/null
      echo "Ping successful!"
EOF
    echo "✅ Archivo .gitlab-ci.yml creado."
  else
    echo "⚠️ No se encontraron credenciales de Supabase en .env, omitiendo Keep-Alive."
  fi
else
  echo "⚠️ No se encontró el archivo .env, omitiendo Keep-Alive."
fi

# 4. Lanzar el servidor local automáticamente
echo "🔥 Levantando localhost..."
npm run dev
