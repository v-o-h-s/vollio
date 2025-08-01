import { registerLicense } from "@syncfusion/ej2-base";

/**
 * Register Syncfusion license key
 * This should be called once at the application startup
 */
export function registerSyncfusionLicense() {
  const licenseKey = process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY;

  if (licenseKey) {
    registerLicense(licenseKey);
    console.log("Syncfusion license registered successfully");
  } else {
    console.warn("Syncfusion license key not found in environment variables");
  }
}
