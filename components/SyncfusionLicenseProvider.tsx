"use client";

import { useEffect } from "react";
import { registerSyncfusionLicense } from "@/lib/syncfusion-license";

export default function SyncfusionLicenseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Register Syncfusion license on client-side mount
    registerSyncfusionLicense();
  }, []);

  return <>{children}</>;
}
