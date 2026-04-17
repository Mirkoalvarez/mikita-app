import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠ Supabase credentials missing — running in offline mode');
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ─── CATEGORIAS ───

export async function fetchCategorias() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .order('orden', { ascending: true });
  if (error) { console.error('fetchCategorias:', error); return null; }
  return data;
}

export async function upsertCategoria(cat) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('categorias')
    .upsert(cat, { onConflict: 'id' })
    .select()
    .single();
  if (error) { console.error('upsertCategoria:', error); return null; }
  return data;
}

export async function insertCategoria(cat) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('categorias')
    .insert(cat)
    .select()
    .single();
  if (error) { console.error('insertCategoria:', error); return null; }
  return data;
}

export async function deleteCategoria(id) {
  if (!supabase) return false;
  const { error } = await supabase.from('categorias').delete().eq('id', id);
  if (error) { console.error('deleteCategoria:', error); return false; }
  return true;
}

// ─── SERVICIOS ───

export async function fetchServicios() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('servicios')
    .select('*, categorias(nombre, icon)')
    .eq('activo', true)
    .order('orden', { ascending: true })
    .order('nombre'); // fallback sort by name if orden is the same (e.g. 0)
  if (error) { console.error('fetchServicios:', error); return null; }
  return data;
}

export async function fetchServiciosByCategoria(categoriaId) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('servicios')
    .select('*')
    .eq('categoria_id', categoriaId)
    .eq('activo', true)
    .order('orden', { ascending: true })
    .order('nombre');
  if (error) { console.error('fetchServiciosByCat:', error); return null; }
  return data;
}

export async function upsertServicio(srv) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('servicios')
    .upsert(srv, { onConflict: 'id' })
    .select()
    .single();
  if (error) { console.error('upsertServicio:', error); return null; }
  return data;
}

export async function insertServicio(srv) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('servicios')
    .insert(srv)
    .select()
    .single();
  if (error) { console.error('insertServicio:', error); return null; }
  return data;
}

export async function deleteServicio(id) {
  if (!supabase) return false;
  const { error } = await supabase.from('servicios').delete().eq('id', id);
  if (error) { console.error('deleteServicio:', error); return false; }
  return true;
}

// ─── DECORACIONES ───

export async function fetchDecoraciones() {
  if (!supabase) return null;
  const { data, error } = await supabase.from('decoraciones').select('*').order('nombre');
  if (error) { console.error('fetchDecoraciones:', error); return null; }
  return data;
}

export async function insertDecoracion(d) {
  if (!supabase) return null;
  const { data, error } = await supabase.from('decoraciones').insert(d).select().single();
  if (error) { console.error('insertDecoracion:', error); return null; }
  return data;
}

export async function upsertDecoracion(d) {
  if (!supabase) return null;
  const { data, error } = await supabase.from('decoraciones').upsert(d, { onConflict: 'id' }).select().single();
  if (error) { console.error('upsertDecoracion:', error); return null; }
  return data;
}

export async function deleteDecoracion(id) {
  if (!supabase) return false;
  const { error } = await supabase.from('decoraciones').delete().eq('id', id);
  if (error) { console.error('deleteDecoracion:', error); return false; }
  return true;
}

// ─── REMOCIONES ───

export async function fetchRemociones() {
  if (!supabase) return null;
  const { data, error } = await supabase.from('remociones').select('*').order('nombre');
  if (error) { console.error('fetchRemociones:', error); return null; }
  return data;
}

export async function insertRemocion(r) {
  if (!supabase) return null;
  const { data, error } = await supabase.from('remociones').insert(r).select().single();
  if (error) { console.error('insertRemocion:', error); return null; }
  return data;
}

export async function upsertRemocion(r) {
  if (!supabase) return null;
  const { data, error } = await supabase.from('remociones').upsert(r, { onConflict: 'id' }).select().single();
  if (error) { console.error('upsertRemocion:', error); return null; }
  return data;
}

export async function deleteRemocion(id) {
  if (!supabase) return false;
  const { error } = await supabase.from('remociones').delete().eq('id', id);
  if (error) { console.error('deleteRemocion:', error); return false; }
  return true;
}

// ─── EXTRAS ───

export async function fetchExtras() {
  if (!supabase) return null;
  const { data, error } = await supabase.from('extras').select('*').order('nombre');
  if (error) { console.error('fetchExtras:', error); return null; }
  return data;
}

export async function insertExtra(e) {
  if (!supabase) return null;
  const { data, error } = await supabase.from('extras').insert(e).select().single();
  if (error) { console.error('insertExtra:', error); return null; }
  return data;
}

export async function upsertExtra(e) {
  if (!supabase) return null;
  const { data, error } = await supabase.from('extras').upsert(e, { onConflict: 'id' }).select().single();
  if (error) { console.error('upsertExtra:', error); return null; }
  return data;
}

export async function deleteExtra(id) {
  if (!supabase) return false;
  const { error } = await supabase.from('extras').delete().eq('id', id);
  if (error) { console.error('deleteExtra:', error); return false; }
  return true;
}

// ─── INVENTARIO ───

export async function fetchInventario() {
  if (!supabase) return null;
  const { data, error } = await supabase.from('inventario').select('*').order('item');
  if (error) { console.error('fetchInventario:', error); return null; }
  return data;
}

export async function insertInventario(item) {
  if (!supabase) return null;
  const safe = {
    ...item,
    stock_actual: Math.max(0, item.stock_actual || 0),
    costo_insumo: Math.max(0, item.costo_insumo || 0),
  };
  const { data, error } = await supabase.from('inventario').insert(safe).select().single();
  if (error) { console.error('insertInventario:', error); return null; }
  return data;
}

export async function upsertInventario(item) {
  if (!supabase) return null;
  const safe = {
    ...item,
    stock_actual: Math.max(0, item.stock_actual || 0),
    costo_insumo: Math.max(0, item.costo_insumo || 0),
  };
  const { data, error } = await supabase.from('inventario').upsert(safe, { onConflict: 'id' }).select().single();
  if (error) { console.error('upsertInventario:', error); return null; }
  return data;
}

export async function deleteInventario(id) {
  if (!supabase) return false;
  const { error } = await supabase.from('inventario').delete().eq('id', id);
  if (error) { console.error('deleteInventario:', error); return false; }
  return true;
}

// ─── CONFIGURACIÓN (key-value) ───

export async function getConfig(clave) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('configuracion')
    .select('valor')
    .eq('clave', clave)
    .single();
  if (error && error.code !== 'PGRST116') { console.error('getConfig:', error); return null; }
  return data?.valor || null;
}

export async function setConfig(clave, valor) {
  if (!supabase) return false;
  const { error } = await supabase
    .from('configuracion')
    .upsert({ clave, valor, updated_at: new Date().toISOString() }, { onConflict: 'clave' });
  if (error) { console.error('setConfig:', error); return false; }
  return true;
}

// ─── PRESUPUESTOS (antes en localStorage) ───

export async function fetchPresupuestos(limit = 100) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('presupuestos')
    .select('*')
    .order('creado_en', { ascending: false })
    .limit(limit);
  if (error) { console.error('fetchPresupuestos:', error); return null; }
  return data;
}

export async function insertPresupuesto(p) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('presupuestos')
    .insert(p)
    .select()
    .single();
  if (error) { console.error('insertPresupuesto:', error); return null; }
  return data;
}

export async function deletePresupuesto(id) {
  if (!supabase) return false;
  const { error } = await supabase.from('presupuestos').delete().eq('id', id);
  if (error) { console.error('deletePresupuesto:', error); return false; }
  return true;
}
