import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Toaster } from "react-hot-toast";
import { SidebarProvider } from "@/components/dashboard/SidebarProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <DashboardSidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8 lg:pl-12">{children}</div>
        </main>
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
                background: "#fffff",
                color: "#ffffff",
                backdropFilter: "none",
                WebkitBackdropFilter: "none",
                opacity: "1",
              },
            },
          }}
        />
      </div>
    </SidebarProvider>
  );
}
