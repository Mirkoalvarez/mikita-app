/**
 * Seed Supabase with data from services.json
 * Run: node scripts/seed.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vdfjxskdnlhkalzfyjkl.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkZmp4c2tkbmxoa2FsemZ5amtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0ODYwODAsImV4cCI6MjA5MTA2MjA4MH0.g5JX8P91iwAqq7gypR_uLtU2QhjylpvHO1w3jgQ9d8M';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const data = JSON.parse(readFileSync(join(__dirname, '..', 'src', 'data', 'services.json'), 'utf8'));

async function seed() {
  console.log('🌱 Seeding Supabase...\n');

  // 1. Insert categorías
  console.log('📂 Inserting categorias...');
  for (let i = 0; i < data.categorias.length; i++) {
    const cat = data.categorias[i];
    const { error } = await supabase.from('categorias').upsert({
      id: cat.id,
      nombre: cat.nombre,
      icon: cat.icon,
      orden: i,
    }, { onConflict: 'id' });
    if (error) console.error(`  ✗ ${cat.nombre}:`, error.message);
    else console.log(`  ✓ ${cat.nombre}`);
  }

  // 2. Insert servicios
  console.log('\n💅 Inserting servicios...');
  for (const cat of data.categorias) {
    for (const srv of cat.servicios) {
      const { error } = await supabase.from('servicios').upsert({
        id: srv.id,
        categoria_id: cat.id,
        nombre: srv.nombre,
        precio: srv.precio,
        duracion: srv.duracion,
        activo: true,
      }, { onConflict: 'id' });
      if (error) console.error(`  ✗ ${srv.nombre}:`, error.message);
      else console.log(`  ✓ ${srv.nombre} — $${srv.precio}`);
    }
  }

  // 3. Insert decoraciones
  console.log('\n🎨 Inserting decoraciones...');
  for (const deco of data.adicionales.decoraciones) {
    const { error } = await supabase.from('decoraciones').upsert({
      id: deco.id,
      nombre: deco.nombre,
      precio: deco.precio,
      tipo: deco.tipo,
    }, { onConflict: 'id' });
    if (error) console.error(`  ✗ ${deco.nombre}:`, error.message);
    else console.log(`  ✓ ${deco.nombre}`);
  }

  // 4. Insert remociones
  console.log('\n🧼 Inserting remociones...');
  for (const remo of data.adicionales.remociones) {
    const { error } = await supabase.from('remociones').upsert({
      id: remo.id,
      nombre: remo.nombre,
      precio: remo.precio,
    }, { onConflict: 'id' });
    if (error) console.error(`  ✗ ${remo.nombre}:`, error.message);
    else console.log(`  ✓ ${remo.nombre}`);
  }

  // 5. Insert extras
  console.log('\n✨ Inserting extras...');
  for (const extra of data.adicionales.extras) {
    const { error } = await supabase.from('extras').upsert({
      id: extra.id,
      nombre: extra.nombre,
      precio: extra.precio,
    }, { onConflict: 'id' });
    if (error) console.error(`  ✗ ${extra.nombre}:`, error.message);
    else console.log(`  ✓ ${extra.nombre}`);
  }

  console.log('\n✅ Seed completed!');
}

seed().catch(console.error);
