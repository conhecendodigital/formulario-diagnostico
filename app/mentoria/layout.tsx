import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentoria Avance",
  description: "Preencha o formulário para aplicar para a Mentoria Avance.",
  openGraph: {
    title: "Mentoria Avance",
    description: "Formulário de qualificação para a Mentoria Avance.",
  }
};

export default function MentoriaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
