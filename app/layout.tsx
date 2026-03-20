import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Diagnóstico de Perfil — Estudo Completo",
  description: "Formulário de diagnóstico para análise completa do seu perfil no Instagram. Receba um estudo personalizado em 48h.",
  openGraph: {
    title: "Diagnóstico de Perfil — Estudo Completo",
    description: "Preencha o formulário e receba uma análise profissional do seu Instagram em até 48h.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-black text-white antialiased" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        {/* Background glow effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-500/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-600/8 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
