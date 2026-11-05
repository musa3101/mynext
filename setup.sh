#!/bin/bash
# ==========================================
# MYNEXT - SETUP 2.0 DE MUSA
# ==========================================
set -e

# Ejecutar el inicio de sesión oficial del Setup 2.0
if [ -f scripts/session-start.sh ]; then
  bash scripts/session-start.sh
else
  echo "🌿 Asegurando rama dev..."
  git checkout dev 2>/dev/null || git checkout -b dev
fi
