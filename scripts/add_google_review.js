#!/usr/bin/env node

/**
 * MYNEXT - Quick Inject Google Maps Review to Supabase
 * Script interactivo y por linea de comandos para inyectar reseñas manualmente de forma instantánea.
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const val = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
          process.env[key.trim()] = val;
        }
      }
    });
  }
}

loadEnv();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://elfdkbqlvawaprgidqhd.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

function getArgs() {
  const args = {};
  process.argv.slice(2).forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, ...valParts] = arg.substring(2).split('=');
      args[key] = valParts.join('=').replace(/^["']|["']$/g, '');
    }
  });
  return args;
}

async function addReviewToSupabase(reviewData) {
  if (!SUPABASE_KEY) {
    console.error('❌ Error: SUPABASE_KEY no encontrado en .env');
    process.exit(1);
  }

  const payload = {
    name: reviewData.name,
    company: reviewData.company || 'Cliente Verificado Google',
    content_es: reviewData.content,
    content_en: reviewData.content,
    rating: parseInt(reviewData.rating) || 5,
    author_photo: reviewData.photo || '',
    relative_time: 'Reciente',
    source: 'google',
    active: true
  };

  console.log(`\n📡 Enviando reseña de "${payload.name}" a Supabase...`);

  try {
    let res = await fetch(`${SUPABASE_URL}/rest/v1/mynext_testimonials`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const compatiblePayload = {
        name: payload.name,
        company: payload.company,
        content: payload.content,
        rating: payload.rating,
        image_url: payload.author_photo || null,
        active: true
      };

      res = await fetch(`${SUPABASE_URL}/rest/v1/mynext_testimonials`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(compatiblePayload)
      });
    }

    if (res.ok) {
      console.log(`\n🎉 ¡ ÉXITO ! La reseña de "${payload.name}" (${payload.rating} ⭐) se ha guardado en Supabase.`);
      console.log(`✨ Ya está visible instantáneamente en el carrusel de la web.\n`);
    } else {
      const errTxt = await res.text();
      console.error('❌ Error guardando en Supabase:', errTxt);
    }
  } catch (err) {
    console.error('❌ Error de conexión:', err.message);
  }
}

async function promptInteractive() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query) => new Promise((resolve) => rl.question(query, resolve));

  console.log('\n--- 📝 INYECTAR NUEVA RESEÑA DE GOOGLE MAPS ---');
  const name = await question('👤 Nombre del cliente (ej: Javier M.): ');
  if (!name.trim()) {
    console.log('⚠️ Nombre obligatorio. Operación cancelada.');
    rl.close();
    return;
  }

  const content = await question('💬 Comentario de la reseña: ');
  if (!content.trim()) {
    console.log('⚠️ Comentario obligatorio. Operación cancelada.');
    rl.close();
    return;
  }

  const company = await question('🏢 Empresa / Negocio (Opcional - Enter para omitir): ');
  const ratingStr = await question('⭐ Puntuación (1-5, por defecto 5): ');
  const photo = await question('🖼️ URL Foto de perfil (Opcional - Enter para omitir): ');

  rl.close();

  await addReviewToSupabase({
    name: name.trim(),
    content: content.trim(),
    company: company.trim() || 'Cliente Verificado',
    rating: parseInt(ratingStr) || 5,
    photo: photo.trim()
  });
}

async function main() {
  const args = getArgs();
  if (args.name && args.content) {
    await addReviewToSupabase(args);
  } else {
    await promptInteractive();
  }
}

main();
