"use client";
import { FloatingNavigation } from "@/components/navigation/FloatingNavigation";
import { FloatingSidebar } from "@/components/navigation/FloatingSidebar";
import { usePathname } from "next/navigation";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathName = usePathname();
  const isPdfPage = pathName.startsWith("/documents/");
  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="w-full">
        <div className="">{children}</div>
      </main>

      {/* Floating Navigation */}
      {!isPdfPage && <FloatingNavigation />}

      {/* Floating Sidebar */}
      {/* {!isPdfPage && <FloatingSidebar />} */}

      {/* Toast Notifications */}
    </div>
  );
}
