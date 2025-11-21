"use client";
import { FloatingNavigation } from "@/components/navigation/FloatingNavigation";
import { FloatingSidebar } from "@/components/navigation/FloatingSidebar";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathName=usePathname();
  const isPdfPage=pathName.startsWith("/dashboard/pdfs/");
  return (
    <div className="min-h-screen bg-background">

      {/* Main Content */}
      <main className="w-full">
        <div className="">
          {children}
        </div>
      </main>

      {/* Floating Navigation */}
      {!isPdfPage && <FloatingNavigation />}

      {/* Floating Sidebar */}
      {!isPdfPage && <FloatingSidebar />}

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: "toast-solid-bg",
          style: {
            background: "#ffffff",
            color: "#000000",
            border: "1px solid #e5e7eb",
            backdropFilter: "none",
            WebkitBackdropFilter: "none",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            opacity: "1",
          },
          success: {
            style: {
              background: "#22c55e",
              color: "#ffffff",
              backdropFilter: "none",
              WebkitBackdropFilter: "none",
              opacity: "1",
            },
          },
          error: {
            style: {
              background: "#ef4444",
              color: "#ffffff",
              backdropFilter: "none",
              WebkitBackdropFilter: "none",
              opacity: "1",
            },
          },
        }}
      />
    </div>
  );
}
