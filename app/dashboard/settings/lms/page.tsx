import { Metadata } from "next";
import { LMSSettingsPage } from "@/components/dashboard/LMSSettingsPage";

export const metadata: Metadata = {
  title: "LMS Settings - Noto",
  description: "Manage your Learning Management System connections and import settings",
};

export default function LMSSettings() {
  return <LMSSettingsPage />;
}