import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Manually parse .env file
const envContent = fs.readFileSync('.env', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length === 2) {
    envVars[parts[0].trim()] = parts[1].trim();
  }
});

const supabase = createClient(
  envVars.VITE_SUPABASE_URL || '',
  envVars.VITE_SUPABASE_ANON_KEY || ''
);

async function checkDb() {
  const { data, error } = await supabase.from('mynext_projects').select('*');
  if (error) {
    console.error('Error fetching projects:', error);
  } else {
    console.log('Projects in Supabase DB:');
    data.forEach(p => {
      console.log(`- ID: ${p.id}, Title: ${p.title}, Image URL: ${p.image_url}, sort_order: ${p.sort_order}`);
    });
  }
}

checkDb();
