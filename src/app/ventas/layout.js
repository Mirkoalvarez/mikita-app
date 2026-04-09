'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || '1234';

export default function VentasLayout({ children }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('mikita_admin_auth');
      if (saved === 'true') setAuthenticated(true);
    }
  }, []);

  // Close mobile menu on navigation
  useEffect(() => { setMenuOpen(false); }, [pathname]);

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
    { href: '/ventas', label: '🛒 POS', short: '🛒' },
    { href: '/ventas/caja', label: '💵 Caja', short: '💵' },
    { href: '/ventas/historial', label: '📊 Historial', short: '📊' },
    { href: '/admin', label: '⚙️ Admin', short: '⚙️' },
  ];

  return (
    <div className="flex flex-col md:flex-row h-dvh bg-mikita-cream overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="w-64 bg-white/50 border-r border-mikita-warm/40 hidden md:flex flex-col shrink-0">
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
      <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Mobile Top Bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white/60 border-b border-mikita-warm/40 shrink-0 backdrop-blur-sm">
          <Link href="/">
            <h1 className="text-lg font-bold text-mikita-chocolate leading-tight">Mikita <span className="font-normal text-mikita-cocoa text-sm">POS</span></h1>
          </Link>
          <button 
            onClick={() => setMenuOpen(!menuOpen)} 
            className="p-2 text-mikita-cocoa rounded-lg hover:bg-mikita-cream active:bg-mikita-warm transition-colors"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </header>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-b border-mikita-warm/40 p-3 space-y-1 animate-fade-in z-40 shadow-lg">
            {navLinks.map(l => {
              const isActive = pathname === l.href;
              return (
                <Link key={l.href} href={l.href} className={`block px-4 py-3 text-sm rounded-xl font-medium transition-colors ${isActive ? 'bg-mikita-chocolate text-mikita-cream' : 'text-mikita-chocolate hover:bg-mikita-cream'}`}>
                  {l.label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Mobile Bottom Tab Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-mikita-warm/40 z-50 safe-area-pb">
          <div className="flex justify-around py-1">
            {navLinks.map(link => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={`flex flex-col items-center py-2 px-3 rounded-xl text-[10px] font-medium transition-colors min-w-[56px] ${
                    isActive ? 'text-mikita-chocolate' : 'text-mikita-cocoa/50'
                  }`}
                >
                  <span className="text-lg leading-none mb-0.5">{link.short}</span>
                  <span>{link.label.replace(/^[^\s]+\s/, '')}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-3 md:p-6 pb-20 md:pb-6">
          {children}
        </div>
      </main>
    </div>
  );
}
