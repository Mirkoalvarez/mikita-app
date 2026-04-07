-- ============================================
-- Mikita Nail Bar — POS & Ventas Migration
-- ============================================

-- Cajas Registradoras (Turnos)
CREATE TABLE IF NOT EXISTS cajas (
  id SERIAL PRIMARY KEY,
  estado TEXT CHECK (estado IN ('abierta', 'cerrada')) DEFAULT 'abierta',
  fecha_apertura TIMESTAMPTZ DEFAULT now(),
  fecha_cierre TIMESTAMPTZ,
  fondo_inicial INT DEFAULT 0,
  observaciones TEXT
);

-- Ventas (Tickets del POS)
CREATE TABLE IF NOT EXISTS ventas (
  id SERIAL PRIMARY KEY,
  caja_id INT REFERENCES cajas(id) ON DELETE CASCADE,
  monto_total INT NOT NULL DEFAULT 0,
  metodo_pago TEXT CHECK (metodo_pago IN ('efectivo', 'digital')) NOT NULL,
  detalle JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array de servicios cobrados
  descuento INT DEFAULT 0,
  estado TEXT CHECK (estado IN ('completada', 'anulada')) DEFAULT 'completada',
  creado_en TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- RLS Policies (permitir lectura/escritura con anon key)
-- ============================================

ALTER TABLE cajas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;

-- Read policies (everyone can read)
CREATE POLICY "Allow public read" ON cajas FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON ventas FOR SELECT USING (true);

-- Write policies (anon can write — PIN protection is client-side)
CREATE POLICY "Allow anon write" ON cajas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon write" ON ventas FOR ALL USING (true) WITH CHECK (true);
