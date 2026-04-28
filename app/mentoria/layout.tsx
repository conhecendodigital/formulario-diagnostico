import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aplicação para Mentoria",
  description: "Preencha o formulário para aplicar para a mentoria.",
};

export default function MentoriaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
