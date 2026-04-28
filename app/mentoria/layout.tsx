import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentoria Avance",
  description: "Preencha o formulário para aplicar para a Mentoria Avance.",
  openGraph: {
    title: "Mentoria Avance",
    description: "Formulário de qualificação para a Mentoria Avance.",
    images: [
      {
        url: "https://omatheusai.com.br/wp-content/uploads/2024/02/Logo-Matheus-IA-Branco.png", // Temporário até enviar a logo oficial
        width: 1200,
        height: 630,
        alt: "Mentoria Avance",
      }
    ],
  }
};

export default function MentoriaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
