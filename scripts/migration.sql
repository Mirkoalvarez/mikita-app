-- ============================================
-- Mikita Nail Bar — Supabase Migration
-- ============================================

-- Categorías (Manos, Podología, Cejas, etc.)
CREATE TABLE IF NOT EXISTS categorias (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  icon TEXT DEFAULT '💅',
  orden INT DEFAULT 0
);

-- Servicios (cada tratamiento)
CREATE TABLE IF NOT EXISTS servicios (
  id SERIAL PRIMARY KEY,
  categoria_id INT REFERENCES categorias(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  precio INT NOT NULL DEFAULT 0,
  duracion TEXT DEFAULT '30 min',
  activo BOOLEAN DEFAULT true
);

-- Decoraciones (Nail Art, Francesitas, etc.)
CREATE TABLE IF NOT EXISTS decoraciones (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  precio INT NOT NULL DEFAULT 0,
  tipo TEXT CHECK (tipo IN ('por_uña', 'por_par', 'full')) DEFAULT 'por_uña'
);

-- Remociones
CREATE TABLE IF NOT EXISTS remociones (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  precio INT NOT NULL DEFAULT 0
);

-- Extras
CREATE TABLE IF NOT EXISTS extras (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  precio INT NOT NULL DEFAULT 0
);

-- Inventario (con checks para no negativos)
CREATE TABLE IF NOT EXISTS inventario (
  id SERIAL PRIMARY KEY,
  item TEXT NOT NULL,
  stock_actual INT DEFAULT 0 CHECK (stock_actual >= 0),
  costo_insumo INT DEFAULT 0 CHECK (costo_insumo >= 0),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- RLS Policies (permitir lectura/escritura con anon key)
-- ============================================

ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE decoraciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE remociones ENABLE ROW LEVEL SECURITY;
ALTER TABLE extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventario ENABLE ROW LEVEL SECURITY;

-- Read policies (everyone can read)
CREATE POLICY "Allow public read" ON categorias FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON servicios FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON decoraciones FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON remociones FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON extras FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON inventario FOR SELECT USING (true);

-- Write policies (anon can write — PIN protection is client-side)
CREATE POLICY "Allow anon write" ON categorias FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon write" ON servicios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon write" ON decoraciones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon write" ON remociones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon write" ON extras FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon write" ON inventario FOR ALL USING (true) WITH CHECK (true);
