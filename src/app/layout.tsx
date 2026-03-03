import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Asesoría Previsional IA | Sistema Inteligente de Pensiones",
  description: "Sistema de asesoría previsional potenciado por IA para análisis de SCOMP, generación de informes y contratos de pensión en Chile.",
  keywords: ["Asesoría Previsional", "AFP", "SCOMP", "Pensiones Chile", "Renta Vitalicia", "IA", "Inteligencia Artificial"],
  authors: [{ name: "Asesor Previsional IA" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Asesoría Previsional IA",
    description: "Sistema inteligente de asesoría previsional para Chile",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
