import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./syncfusion.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ReduxProvider } from "@/lib/store/provider";
import SyncfusionLicenseProvider from "@/components/SyncfusionLicenseProvider";
import { EditorProvider } from "@/components/editor";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
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
  description:
    "Upload PDFs, add notes, and create flashcards for better studying",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
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
        <ThemeProvider defaultTheme="light" storageKey="noto-theme">
          <ClerkProvider
            appearance={{
              layout: {
                logoImageUrl: "/logo.png",
              },
              elements: {
                card: "shadow-lg border rounded-xl p-6",
                headerTitle: "text-2xl font-bold text-blue-600",
                // customize other elements like social buttons, inputs, etc.
              },
              variables: {
                colorPrimary: "#2563eb", // Tailwind blue-600
              },
            }}
          >
            <SyncfusionLicenseProvider>
              <ReduxProvider>
                <EditorProvider>{children}</EditorProvider>
              </ReduxProvider>
            </SyncfusionLicenseProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
