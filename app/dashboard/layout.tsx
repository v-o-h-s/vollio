import { FloatingNavigation } from "@/components/navigation/FloatingNavigation";
import { FloatingSidebar } from "@/components/navigation/FloatingSidebar";
import { Toaster } from "react-hot-toast";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
          {children}
        </div>
      </main>

      {/* Floating Navigation */}
      <FloatingNavigation />

      {/* Floating Sidebar */}
      <FloatingSidebar />

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
