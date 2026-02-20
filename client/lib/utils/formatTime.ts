/**
 * Formats a duration in seconds into a human-readable string (days, hours, minutes, seconds).
 * @param seconds - The duration in seconds.
 * @returns A formatted string like "2 days, 1 hour, 30 minutes" or "45 seconds".
 */
export function formatDuration(seconds: number): string {
  if (seconds <= 0) return "0 seconds";

  const timeUnits = [
    { unit: "day", value: 86400 },
    { unit: "hour", value: 3600 },
    { unit: "minute", value: 60 },
    { unit: "second", value: 1 },
  ];

  const result: string[] = [];
  let remainingSeconds = seconds;

  for (const { unit, value } of timeUnits) {
    const count = Math.floor(remainingSeconds / value);
    if (count > 0) {
      result.push(`${count} ${unit}${count !== 1 ? "s" : ""}`);
      remainingSeconds %= value;
    }
  }

  // If no units were added (e.g. less than 1 second but > 0, though inputs are usually integers),
  // return "< 1 second" or handle as seconds.
  // Assuming input is integer seconds for now based on rate limiter usage.
  if (result.length === 0) return "0 seconds";

  return result.join(", ");
}
