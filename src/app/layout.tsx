import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Monitoreo de la calidad del aire en exteriores - Kunak",
  description:
    "La solución profesional para la monitorización de la calidad del aire. Datos fiables y trazables para decisiones operativas y cumplimiento normativo.",
  metadataBase: new URL("https://kunakair.com"),
  openGraph: {
    title: "Monitoreo de la calidad del aire en exteriores - Kunak",
    description:
      "La solución profesional para la monitorización de la calidad del aire. Datos fiables y trazables para decisiones operativas y cumplimiento normativo.",
    locale: "es_ES",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-ES"
      className={`${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
