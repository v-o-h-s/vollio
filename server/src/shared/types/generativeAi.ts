/**
 * Token usage information from AI response
 */
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/**
 * Default empty token usage (for error cases or when not available)
 */
export const EMPTY_TOKEN_USAGE: TokenUsage = {
  promptTokens: 0,
  completionTokens: 0,
  totalTokens: 0,
};

/**
 * Generic result wrapper that includes token usage
 */
export interface GenerativeAiResult<T> {
  data: T;
  usage: TokenUsage;
  model: string;
}

/**
 * Create a GenerativeAiResult with empty usage (for error cases)
 */
export function createEmptyResult<T>(
  data: T,
  model: string
): GenerativeAiResult<T> {
  return {
    data,
    usage: EMPTY_TOKEN_USAGE,
    model,
  };
}

/**
 * Extract token usage from OpenRouter completion response
 */
export function extractTokenUsage(completion: any): TokenUsage {
  const usage = completion?.usage;
  if (!usage) {
    return EMPTY_TOKEN_USAGE;
  }

  return {
    promptTokens: usage.prompt_tokens ?? 0,
    completionTokens: usage.completion_tokens ?? 0,
    totalTokens: usage.total_tokens ?? 0,
  };
}
