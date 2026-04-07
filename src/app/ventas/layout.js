'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || '1234';

export default function VentasLayout({ children }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('mikita_admin_auth');
      if (saved === 'true') setAuthenticated(true);
    }
  }, []);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      setAuthenticated(true);
      sessionStorage.setItem('mikita_admin_auth', 'true');
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 2000);
    }
  };

  if (!authenticated) {
    return (
      <main className="max-w-sm mx-auto px-4 min-h-dvh flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-mikita-chocolate">Mikita POS</h1>
          <p className="text-mikita-cocoa font-[var(--font-dancing)]">Acceso a Ventas</p>
        </div>
        <form onSubmit={handlePinSubmit} className="w-full space-y-4">
          <div>
            <label className="block text-xs text-mikita-cocoa/70 mb-1 font-medium">PIN de acceso</label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={8}
              value={pin}
              onChange={e => setPin(e.target.value)}
              placeholder="••••"
              autoFocus
              className={`w-full px-4 py-4 rounded-2xl bg-white/80 border-2 text-mikita-chocolate text-center text-2xl tracking-[0.5em] placeholder:tracking-[0.3em] placeholder:text-mikita-cocoa/20 focus:outline-none transition-all min-h-[56px]
                ${pinError ? 'border-mikita-danger animate-[shake_0.3s]' : 'border-mikita-warm/40 focus:border-mikita-cocoa'}`}
            />
          </div>
          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-mikita-chocolate text-mikita-cream font-bold text-base hover:bg-mikita-chocolate-light active:scale-[0.98] transition-all min-h-[52px]"
          >
            Ingresar
          </button>
        </form>
        <Link href="/" className="mt-8 text-xs text-mikita-cocoa/40 hover:text-mikita-cocoa transition-colors">
          ← Volver al cotizador
        </Link>
      </main>
    );
  }

  const navLinks = [
    { href: '/ventas', label: '🛒 POS (Venta Nueva)' },
    { href: '/ventas/caja', label: '💵 Cierre de Caja' },
    { href: '/ventas/historial', label: '📊 Historial Mensual' },
    { href: '/admin', label: '⚙️ Panel Admin' },
  ];

  return (
    <div className="flex h-screen bg-mikita-cream overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="w-64 bg-white/50 border-r border-mikita-warm/40 hidden md:flex flex-col">
        <div className="p-6 border-b border-mikita-warm/30">
          <Link href="/">
            <h1 className="text-2xl font-bold text-mikita-chocolate">Mikita</h1>
            <p className="text-mikita-cocoa font-[var(--font-dancing)] text-lg -mt-1">Punto de Venta</p>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navLinks.map(link => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-mikita-chocolate text-mikita-cream shadow-md' 
                    : 'text-mikita-chocolate/70 hover:bg-mikita-warm/50 hover:text-mikita-chocolate'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Nav Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white/50 border-b border-mikita-warm/40 shrink-0">
          <div>
            <h1 className="text-lg font-bold text-mikita-chocolate">Mikita POS</h1>
          </div>
          <div className="relative group">
            <button className="p-2 text-mikita-cocoa">☰ Menú</button>
            <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-mikita-warm shadow-xl rounded-xl p-2 hidden group-hover:block z-50">
              {navLinks.map(l => (
                <Link key={l.href} href={l.href} className="block px-3 py-2 text-sm text-mikita-chocolate hover:bg-mikita-cream rounded-lg">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
