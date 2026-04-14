<p align="center">
  <img src="public/icons/icon-180.png" alt="Mikita Logo" width="80" height="80" style="border-radius: 20px;" />
</p>

<h1 align="center">Mikita Nail Bar</h1>

<p align="center">
  <strong>Cotizador + Punto de Venta para salones de uñas</strong><br/>
  PWA con cotizador mobile-first, sistema POS desktop-responsive, gestión de caja y exportación a Excel. Conectado a Supabase en la nube.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Supabase-Backend-3FCF8E?logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa&logoColor=white" alt="PWA" />
  <img src="https://img.shields.io/badge/Deploy-Vercel-000?logo=vercel" alt="Vercel" />
</p>

---

## ✨ Funcionalidades

### 📱 Cotizador (Mobile-first)

- **🔢 Multi-servicio** — Seleccioná uno o varios servicios de múltiples categorías (Manos, Pedicuría, Cejas, Pestañas, etc.)
- **💅 Diseñador de uñas** — Selector visual de 10 uñas para asignar decoraciones individuales
- **📊 Cálculo en tiempo real** — Total actualizado al instante con servicios, decoraciones, remociones y extras
- **📱 Envío por WhatsApp** — Mensaje personalizable que se envía con un toque via `wa.me`
- **📋 Copiar / Compartir** — Portapapeles o share nativo del dispositivo
- **📡 Offline-first** — Service Worker para funcionar sin conexión
- **🍎 Optimizada para iOS** — Safe-area insets, standalone mode, prevención de zoom

### 🛒 Punto de Venta — POS (Desktop-responsive)

- **Terminal de venta** — Grilla de servicios por categoría con ticket lateral (desktop) o bottom-sheet (mobile)
- **🏷️ Contador de items** — Badge en cada servicio mostrando la cantidad agregada al ticket
- **💵📱 Métodos de pago** — Efectivo y QR/Digital, con subtotales desglosados
- **% Descuento** — Descuento porcentual calculado automáticamente
- **✅ Toast de cobro** — Confirmación visual premium con monto, método e ícono

### 💰 Gestión de Caja

- **Apertura/Cierre** — Fondo inicial configurable, cierre de turno con totales discriminados
- **⚠️ Alertas** — Aviso si la caja del día anterior quedó abierta
- **Anulación** — Marcar ventas como anuladas sin borrar el registro
- **Historial mensual** — Acordeón expandible con el detalle de cada venta
- **📥 Excel** — Exportar cierre de caja individual o reporte completo del mes (2 hojas: Resumen + Detalle)
- **Edición retroactiva** — Agregar ventas y eliminar cajas cerradas (doble confirmación)

### ⚙️ Panel de Gestión (Admin)

- **CRUD completo** — Servicios, categorías, decoraciones, remociones, extras e inventario (todo en Supabase)
- **Reordenamiento** — Mover categorías y servicios con flechas ↑/↓
- **📋 Historial de presupuestos** — Persistido en Supabase (antes en localStorage)
- **💬 Template WhatsApp** — Personalizar el mensaje con variables `{nombre}`, `{servicios}`, `{total}`, etc.
- **📦 Inventario** — Control de stock y costos de insumos
- **🔐 PIN** — Acceso protegido por PIN configurable via variable de entorno

## 🚀 Getting Started

### Requisitos

- [Node.js](https://nodejs.org/) v18+
- npm
- Proyecto en [Supabase](https://supabase.com) (gratis)

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/mikita-app.git
cd mikita-app

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.local.example .env.local
# → Completar NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Base de datos (Supabase)

Ejecutar los scripts SQL en orden en el **SQL Editor** de Supabase:

1. `scripts/migration.sql` — Tablas principales (categorías, servicios, adicionales, inventario)
2. `scripts/pos_migration.sql` — Tablas POS (cajas, ventas)
3. `scripts/phase4_migration.sql` — Configuración y presupuestos en la nube

Opcionalmente ejecutar `scripts/seed.mjs` para cargar datos de ejemplo.

### Desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

### Build de producción

```bash
npm run build
npm start
```

## 🏗️ Tech Stack

| Tecnología | Uso |
|---|---|
| **Next.js 16** | Framework React con App Router |
| **Tailwind CSS v4** | Design system CSS-first con `@theme inline` |
| **Supabase** | Base de datos PostgreSQL, API REST y RLS |
| **SheetJS (xlsx)** | Exportación de reportes a Excel |
| **Service Worker** | Cache network-first para PWA offline |
| **Google Fonts** | Inter (UI) + Dancing Script (branding) |

## 📁 Estructura del Proyecto

```
mikita-app/
├── public/
│   ├── icons/                  # Iconos PWA
│   ├── manifest.json           # PWA manifest
│   └── sw.js                   # Service Worker
├── scripts/
│   ├── migration.sql           # Esquema principal Supabase
│   ├── pos_migration.sql       # Tablas POS (cajas/ventas)
│   ├── phase4_migration.sql    # Config + presupuestos
│   └── seed.mjs                # Datos de ejemplo
├── src/
│   ├── app/
│   │   ├── layout.js           # Root layout + fonts + meta
│   │   ├── page.js             # Cotizador principal
│   │   ├── globals.css         # Design system Tailwind v4
│   │   ├── admin/page.js       # Panel de gestión (CRUD + Config)
│   │   └── ventas/
│   │       ├── layout.js       # Layout POS (sidebar + tab bar)
│   │       ├── page.js         # Terminal de venta
│   │       ├── caja/page.js    # Apertura/cierre de caja
│   │       └── historial/page.js # Historial + Excel
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── ServiceSelector.jsx
│   │   ├── NailDesigner.jsx
│   │   ├── ExtrasSelector.jsx
│   │   ├── QuoteSummary.jsx
│   │   └── WhatsAppSection.jsx
│   ├── data/
│   │   └── services.json       # Catálogo offline (fallback)
│   └── lib/
│       ├── catalog.js          # Fetch catálogo desde Supabase
│       ├── excel.js            # Exportación a .xlsx
│       ├── formatters.js       # Formato ARS + teléfonos
│       ├── pos.js              # CRUD cajas y ventas
│       ├── storage.js          # Presupuestos (Supabase + fallback localStorage)
│       ├── supabase.js         # Cliente Supabase + CRUD servicios/config
│       └── whatsapp.js         # Mensajes con templates personalizables
```

## 🎨 Paleta de Colores

| Color | Hex | Uso |
|---|---|---|
| 🟫 Cream | `#F5EEDC` | Fondo principal |
| 🟤 Chocolate | `#4D290A` | Textos, botones, acentos |
| 🫘 Cocoa | `#8C6F5A` | Detalles secundarios |
| 🥇 Accent | `#C9A96E` | Highlights y precios |

## 🗺️ Roadmap

- [x] **Fase 1** — MVP Cotizador offline con LocalStorage
- [x] **Fase 2** — Integración con Supabase (CRUD completo, datos en la nube)
- [x] **Fase 3** — Sistema POS con caja, ventas y cierre de turno
- [x] **Fase 4** — Template WhatsApp, presupuestos en Supabase, historial detallado, Excel, edición de caja
- [ ] **Fase 5** — Sistema de turnos y agenda

## 🔒 Variables de Entorno

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key (pública, segura para el browser) |
| `NEXT_PUBLIC_ADMIN_PIN` | PIN de acceso al panel Admin y POS (default: `1234`) |

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor leé [CONTRIBUTING.md](CONTRIBUTING.md) antes de enviar un PR.

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

<p align="center">
  Hecho con 🤎 por <strong>Mikita Nail Bar</strong>
</p>
