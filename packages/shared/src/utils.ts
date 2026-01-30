export type RetryOptions = {
  retries?: number;
  delayMs?: number;
  backoffFactor?: number;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
};

export async function withRetry<T>(
  fn: () => Promise<T>, // Removed (attempt: number)
  {
    retries = 3,
    delayMs = 500,
    backoffFactor = 2,
    shouldRetry = () => true,
  }: RetryOptions = {},
): Promise<T> {
  if (retries <= 0) {
    throw new Error("retries must be >= 1");
  }

  let attempt = 0;
  let lastError: unknown;

  while (attempt < retries) {
    try {
      // Just call the function without arguments
      return await fn();
    } catch (err) {
      lastError = err;
      attempt++;

      // Check if we should stop retrying
      if (attempt >= retries || !shouldRetry(err, attempt)) {
        throw err;
      }

      // Calculate exponential backoff: delayMs * (backoffFactor ^ (attempt - 1))
      const delay = delayMs * Math.pow(backoffFactor, attempt - 1);

      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError;
}
