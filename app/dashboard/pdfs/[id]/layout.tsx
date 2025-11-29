import { Metadata } from "next";

export const metadata: Metadata = {
  title: "View PDF - Noto",
  description: "View your PDF document and its AI-powered summary.",
};

export default function Layout({
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