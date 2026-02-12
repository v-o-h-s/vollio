/**
 * Get client IP from request (considering proxies)
 */
export function getClientIp(request: any): string {
  return (
    request.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    request.headers["x-real-ip"] ||
    request.ip ||
    "unknown"
  );
}
