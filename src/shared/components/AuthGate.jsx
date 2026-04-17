'use client';

import { useState, useEffect } from 'react';

const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || '1234';

/**
 * Reusable PIN auth gate. Wraps children and shows PIN input until authenticated.
 * @param {string} title - Title shown above the PIN input
 * @param {string} subtitle - Subtitle text
 * @param {string} backHref - Link for "back" navigation
 * @param {string} backLabel - Label for back link
 */
export default function AuthGate({ children, title = 'Mikita', subtitle = 'Nail Bar', backHref = '/', backLabel = '← Volver al cotizador' }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

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

  if (authenticated) return children;

  return (
    <main className="max-w-sm mx-auto px-4 min-h-dvh flex flex-col items-center justify-center">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-mikita-chocolate">{title}</h1>
        <p className="text-mikita-cocoa font-[var(--font-dancing)]">{subtitle}</p>
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
        {pinError && (
          <p className="text-center text-sm text-mikita-danger animate-fade-in">PIN incorrecto</p>
        )}
      </form>
      <a href={backHref} className="mt-8 text-xs text-mikita-cocoa/40 hover:text-mikita-cocoa transition-colors">
        {backLabel}
      </a>
    </main>
  );
}
