
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
  console.log('Testing Supabase connection...');

  const tables = ['mynext_projects', 'mynext_testimonials', 'mynext_settings', 'mynext_services'];

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.error(`Error querying ${table}:`, error);
    } else {
      console.log(`Table ${table} exists. Rows found (max 1):`, data.length);
    }
  }
}

testSupabase();
