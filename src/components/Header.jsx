'use client';

export default function Header() {
  return (
    <header className="w-full pt-6 pb-4 px-4 text-center bg-mikita-cream sticky top-0 z-50">
      <div className="flex flex-col items-center gap-0">
        <h1 className="text-3xl font-bold tracking-tight text-mikita-chocolate" style={{ letterSpacing: '-0.02em' }}>
          Mikita
        </h1>
        <span className="text-lg text-mikita-cocoa font-[var(--font-dancing)] -mt-1">
          Nail Bar
        </span>
      </div>
      <div className="mt-2 h-px bg-gradient-to-r from-transparent via-mikita-cocoa/30 to-transparent" />
    </header>
  );
}
