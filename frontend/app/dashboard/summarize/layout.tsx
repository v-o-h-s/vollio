import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Document Summarizer - Noto",
  description: "Generate AI-powered summaries from your PDF library",
};

export default function SummarizeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}