import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flashcards | Noto",
  description: "Create and study with intelligent flashcards using spaced repetition",
};

export default function FlashcardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}