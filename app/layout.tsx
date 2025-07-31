import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Noto",
  description: "Upload PDFs, add notes, and create flashcards for better studying",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider appearance={{
          layout: {
            logoImageUrl: "/icons/logo.svg",

          },
          elements: {
            card: "shadow-lg border rounded-xl p-6",
            headerTitle: "text-2xl font-bold text-blue-600",
            // customize other elements like social buttons, inputs, etc.
          },
          variables: {
            colorPrimary: "#2563eb", // Tailwind blue-600
          }
        }}>

          {children}
        </ClerkProvider>

      </body>
    </html>
  );
}
