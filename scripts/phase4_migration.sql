-- ============================================
-- Mikita Nail Bar — Phase 4 Migration
-- Configuración + Presupuestos en la nube
-- ============================================

-- Configuración general (key-value)
CREATE TABLE IF NOT EXISTS configuracion (
  clave TEXT PRIMARY KEY,
  valor TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insertar template de WhatsApp por defecto
INSERT INTO configuracion (clave, valor) VALUES (
  'whatsapp_template',
  '¡Hola {nombre}! ✨ Este es el presupuesto de tu servicio en Mikita:

{servicios}
{decoraciones}
{remociones}
{extras}

💰 *TOTAL ESTIMADO: {total}*

Válido por 48hs. ¡Te esperamos! 🤎'
) ON CONFLICT (clave) DO NOTHING;

-- Presupuestos (antes en localStorage)
CREATE TABLE IF NOT EXISTS presupuestos (
  id SERIAL PRIMARY KEY,
  client_name TEXT,
  phone TEXT,
  servicio TEXT,
  total INT NOT NULL DEFAULT 0,
  detalles TEXT,
  creado_en TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- RLS Policies
-- ============================================

ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;
ALTER TABLE presupuestos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON configuracion FOR SELECT USING (true);
CREATE POLICY "Allow anon write" ON configuracion FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read" ON presupuestos FOR SELECT USING (true);
CREATE POLICY "Allow anon write" ON presupuestos FOR ALL USING (true) WITH CHECK (true);
