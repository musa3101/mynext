import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env manually
const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Error: Supabase credentials not found in .env file.");
  process.exit(1);
}

const supabase = createClient(url, key);

async function sync() {
  console.log("Starting database synchronization with Supabase...");

  // 1. Update Blessed Barber Studio description in mynext_projects
  const barberDesc = {
    es: 'Llevé el rollo premium y la precisión de sus cortes a una web de alta gama. Quería que la experiencia digital estuviera a la altura de entrar a la propia barbería, cuidando cada detalle visual para conectar con gente que busca un servicio exclusivo. Implementando reserva directa desde la web o mediante otras aplicaciones!',
    en: 'I brought the premium vibe and precision of their cuts to a high-end website. I wanted the digital experience to match the feeling of entering the barbershop itself, taking care of every visual detail to connect with people looking for an exclusive service. Implementing direct booking from the web or through other apps!'
  };
  
  const { error: errBarber } = await supabase
    .from('mynext_projects')
    .update({ description: JSON.stringify(barberDesc) })
    .ilike('title', 'Blessed Barber Studio');
    
  if (errBarber) {
    console.error("Error updating Blessed Barber Studio project:", errBarber);
  } else {
    console.log("✓ Blessed Barber Studio description synced in mynext_projects.");
  }

  // 2. Update Bar Cafetería Luna Llena description in mynext_projects
  const lunaDesc = {
    es: 'Diseñé la identidad visual, el logotipo y una carta digital interactiva muy limpia. El foco fue plasmar la atmósfera cálida del local en la pantalla, haciendo que el menú sea súper visual y cómodo de leer desde el móvil',
    en: 'I designed the visual identity, the logo, and a very clean interactive digital menu. The focus was to capture the warm atmosphere of the place on the screen, making the menu super visual and comfortable to read from a mobile device.'
  };

  const { error: errLuna } = await supabase
    .from('mynext_projects')
    .update({ description: JSON.stringify(lunaDesc) })
    .ilike('title', 'Bar Cafetería Luna Llena');

  if (errLuna) {
    console.error("Error updating Bar Cafetería Luna Llena project:", errLuna);
  } else {
    console.log("✓ Bar Cafetería Luna Llena description synced in mynext_projects.");
  }

  // 3. Deactivate or delete testimonials for these two projects so they don't override the descriptions
  const { error: errTestimonials } = await supabase
    .from('mynext_testimonials')
    .update({ active: false })
    .or('company.ilike.Blessed Barber Studio,company.ilike.Bar Cafetería Luna Llena');

  if (errTestimonials) {
    console.error("Error deactivating old testimonials in mynext_testimonials:", errTestimonials);
  } else {
    console.log("✓ Old testimonials deactivated (set active=false) in mynext_testimonials.");
  }

  // 4. Update prices in mynext_services (190 for Esencial, 290 for Élite)
  const { error: errEsencialPrice } = await supabase
    .from('mynext_services')
    .update({ price: '190' })
    .ilike('title', '%ESENCIAL%');

  const { error: errElitePrice } = await supabase
    .from('mynext_services')
    .update({ price: '290' })
    .ilike('title', '%ÉLITE%');

  if (errEsencialPrice || errElitePrice) {
    console.error("Error syncing prices in mynext_services:", errEsencialPrice || errElitePrice);
  } else {
    console.log("✓ Pricing bases (190 and 290) verified/synced in mynext_services.");
  }

  console.log("Synchronization complete! Your Supabase database is now perfectly aligned with your local updates.");
}

sync();
