import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Task Manager | Prueba técnica BitClout",
  description: "Prueba técnica - gestor de tareas con Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900`}
      >
        <div className="min-h-screen flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-6xl bg-white shadow-xl rounded-2xl border border-slate-100 overflow-hidden">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}

