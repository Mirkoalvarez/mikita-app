'use client';

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-3 border-mikita-warm border-t-mikita-chocolate rounded-full animate-spin" />
    </div>
  );
}
