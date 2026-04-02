import { Inter, Dancing_Script } from "next/font/google";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Mikita Nail Bar — Cotizador",
  description: "Cotizá tu servicio de uñas y belleza en Mikita Nail Bar. Envía tu presupuesto por WhatsApp al instante.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mikita",
  },

  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "mobile-web-app-capable": "yes",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#4D290A",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${dancingScript.variable}`}
    >
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180.png" />

      </head>
      <body
        className="min-h-dvh font-[var(--font-inter)]"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
