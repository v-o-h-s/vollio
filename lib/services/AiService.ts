import { OpenAI } from "openai";
import {
  createServerError,
  type ServerErrorContext,
  logServerError,
} from "@/lib/utils/error-handling/errorHandling";
import { ErrorType } from "@/lib/utils/error-handling/errors";
// Simple retry helper for server-side operations
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      // Don't retry on certain error types
      if (
        error?.status === 401 ||
        error?.status === 403 ||
        error?.status === 400
      ) {
        throw error;
      }

      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }

      // Wait before retrying with exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, delay * Math.pow(2, attempt))
      );
    }
  }

  throw lastError;
}

// AI Service configuration
const AI_CONFIG = {
  maxTokens: 4000,
  temperature: 0.7,
  maxRetries: 3,
  timeoutMs: 30000,
  rateLimitPerMinute: 60,
  models: {
    default: "tngtech/deepseek-r1t2-chimera",
    fast: "tngtech/deepseek-r1t2-chimera",
    creative: "tngtech/deepseek-r1t2-chimera",
  },
} as const;

// Message interface for type safety
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// Completion options interface
export interface CompletionOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  userId?: string;
  context?: Partial<ServerErrorContext>;
}

// Streaming completion options
export interface StreamingOptions extends CompletionOptions {
  onChunk?: (chunk: string) => void;
  onComplete?: (fullResponse: string) => void;
  onError?: (error: Error) => void;
}

// AI Service response interface
export interface AIServiceResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason?: string;
}

// Initialize OpenAI client with proper configuration
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPEN_ROUTER_API_KEY,
  timeout: AI_CONFIG.timeoutMs,
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "X-Title": "Noto PDF App",
  },
});

/**
 * Validates AI service configuration
 */
function validateConfiguration(): void {
  if (!process.env.OPEN_ROUTER_API_KEY) {
    throw createServerError(
      ErrorType.EXTERNAL_SERVICE_ERROR,
      "OpenRouter API key is not configured",
      { operation: "ai_service_init" }
    );
  }
}

/**
 * Validates input messages
 */
function validateMessages(
  messages: ChatMessage[],
  context?: Partial<ServerErrorContext>
): void {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw createServerError(
      ErrorType.VALIDATION_ERROR,
      "Messages array is required and cannot be empty",
      context
    );
  }

  for (const [index, message] of messages.entries()) {
    if (
      !message.role ||
      !["system", "user", "assistant"].includes(message.role)
    ) {
      throw createServerError(
        ErrorType.VALIDATION_ERROR,
        `Invalid role at message index ${index}. Must be 'system', 'user', or 'assistant'`,
        context
      );
    }

    if (!message.content || typeof message.content !== "string") {
      throw createServerError(
        ErrorType.VALIDATION_ERROR,
        `Invalid content at message index ${index}. Content must be a non-empty string`,
        context
      );
    }

    if (message.content.length > 50000) {
      throw createServerError(
        ErrorType.VALIDATION_ERROR,
        `Message content at index ${index} exceeds maximum length of 50,000 characters`,
        context
      );
    }
  }
}

/**
 * Maps OpenAI errors to server errors
 */
function mapOpenAIError(error: any, context?: Partial<ServerErrorContext>) {
  const errorMessage = error?.message || "Unknown AI service error";

  // Rate limit errors
  if (error?.status === 429 || errorMessage.includes("rate limit")) {
    return createServerError(
      ErrorType.RATE_LIMIT_ERROR,
      "AI service rate limit exceeded. Please try again later.",
      context,
      error
    );
  }

  // Authentication errors
  if (error?.status === 401 || errorMessage.includes("authentication")) {
    return createServerError(
      ErrorType.EXTERNAL_SERVICE_ERROR,
      "AI service authentication failed. Please check API configuration.",
      context,
      error
    );
  }

  // Quota/billing errors
  if (
    error?.status === 402 ||
    errorMessage.includes("quota") ||
    errorMessage.includes("billing")
  ) {
    return createServerError(
      ErrorType.EXTERNAL_SERVICE_ERROR,
      "AI service quota exceeded. Please check your billing status.",
      context,
      error
    );
  }

  // Model not found or unavailable
  if (error?.status === 404 || errorMessage.includes("model")) {
    return createServerError(
      ErrorType.EXTERNAL_SERVICE_ERROR,
      "Requested AI model is not available. Using default model.",
      context,
      error
    );
  }

  // Content policy violations
  if (error?.status === 400 && errorMessage.includes("content")) {
    return createServerError(
      ErrorType.VALIDATION_ERROR,
      "Content violates AI service policies. Please modify your request.",
      context,
      error
    );
  }

  // Timeout errors
  if (error?.code === "ECONNABORTED" || errorMessage.includes("timeout")) {
    return createServerError(
      ErrorType.EXTERNAL_SERVICE_ERROR,
      "AI service request timed out. Please try again.",
      context,
      error
    );
  }

  // Server errors
  if (error?.status >= 500) {
    return createServerError(
      ErrorType.EXTERNAL_SERVICE_ERROR,
      "AI service is temporarily unavailable. Please try again later.",
      context,
      error
    );
  }

  // Default error
  return createServerError(
    ErrorType.EXTERNAL_SERVICE_ERROR,
    `AI service error: ${errorMessage}`,
    context,
    error
  );
}

/**
 * Creates a completion with comprehensive error handling
 */
export async function createCompletion(
  messages: ChatMessage[],
  options: CompletionOptions = {}
): Promise<AIServiceResponse> {
  const context: Partial<ServerErrorContext> = {
    operation: "ai_completion",
    userId: options.userId,
    ...options.context,
  };

  try {
    // Validate configuration and input
    validateConfiguration();
    validateMessages(messages, context);

    const startTime = Date.now();

    // Prepare completion parameters
    const completionParams = {
      messages,
      model: options.model || AI_CONFIG.models.default,
      max_tokens: options.maxTokens || AI_CONFIG.maxTokens,
      temperature: options.temperature ?? AI_CONFIG.temperature,
    };

    // Execute with retry logic
    const completion = await retryOperation(async () => {
      return await openai.chat.completions.create(completionParams);
    }, AI_CONFIG.maxRetries);

    const duration = Date.now() - startTime;

    // Validate response
    if (!completion.choices?.[0]?.message?.content) {
      throw createServerError(
        ErrorType.EXTERNAL_SERVICE_ERROR,
        "AI service returned empty response",
        { ...context, duration }
      );
    }

    // Log successful completion
    console.log(`✅ AI Completion successful - ${duration}ms`, {
      model: completionParams.model,
      promptTokens: completion.usage?.prompt_tokens,
      completionTokens: completion.usage?.completion_tokens,
      userId: options.userId,
    });

    return {
      content: completion.choices[0].message.content,
      usage: completion.usage
        ? {
            promptTokens: completion.usage.prompt_tokens,
            completionTokens: completion.usage.completion_tokens,
            totalTokens: completion.usage.total_tokens,
          }
        : undefined,
      model: completionParams.model,
      finishReason: completion.choices[0].finish_reason || undefined,
    };
  } catch (error: any) {
    const serverError = mapOpenAIError(error, context);
    logServerError(serverError);
    throw serverError;
  }
}

/**
 * Creates a streaming completion with comprehensive error handling
 */
export async function createStreamingCompletion(
  messages: ChatMessage[],
  options: StreamingOptions = {}
): Promise<AsyncIterable<string>> {
  const context: Partial<ServerErrorContext> = {
    operation: "ai_streaming_completion",
    userId: options.userId,
    ...options.context,
  };

  try {
    // Validate configuration and input
    validateConfiguration();
    validateMessages(messages, context);

    const startTime = Date.now();
    let fullResponse = "";

    // Prepare completion parameters for streaming
    const completionParams = {
      messages,
      model: options.model || AI_CONFIG.models.default,
      max_tokens: options.maxTokens || AI_CONFIG.maxTokens,
      temperature: options.temperature ?? AI_CONFIG.temperature,
      stream: true as const, // Explicit const assertion for proper typing
    };

    // Create streaming completion
    const stream = await openai.chat.completions.create(completionParams);

    // Return async generator for streaming
    return (async function* () {
      try {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content;

          if (content) {
            fullResponse += content;

            // Call chunk callback if provided
            if (options.onChunk) {
              try {
                options.onChunk(content);
              } catch (callbackError) {
                console.warn("Chunk callback error:", callbackError);
              }
            }

            yield content;
          }
        }

        const duration = Date.now() - startTime;

        // Log successful streaming completion
        console.log(`✅ AI Streaming completion successful - ${duration}ms`, {
          model: completionParams.model,
          responseLength: fullResponse.length,
          userId: options.userId,
        });

        // Call completion callback if provided
        if (options.onComplete) {
          try {
            options.onComplete(fullResponse);
          } catch (callbackError) {
            console.warn("Completion callback error:", callbackError);
          }
        }
      } catch (streamError: any) {
        const serverError = mapOpenAIError(streamError, context);
        logServerError(serverError);

        // Call error callback if provided
        if (options.onError) {
          try {
            // Convert ServerError to Error for callback compatibility
            const error = new Error(serverError.message);
            error.name = serverError.type;
            error.cause = serverError;
            options.onError(error);
          } catch (callbackError) {
            console.warn("Error callback error:", callbackError);
          }
        }

        throw serverError;
      }
    })();
  } catch (error: any) {
    const serverError = mapOpenAIError(error, context);
    logServerError(serverError);

    // Call error callback if provided
    if (options.onError) {
      try {
        // Convert ServerError to Error for callback compatibility
        const error = new Error(serverError.message);
        error.name = serverError.type;
        error.cause = serverError;
        options.onError(error);
      } catch (callbackError) {
        console.warn("Error callback error:", callbackError);
      }
    }

    throw serverError;
  }
}

/**
 * Simple completion helper for basic use cases
 */
export async function simpleCompletion(
  userMessage: string,
  systemPrompt?: string,
  options: Omit<CompletionOptions, "systemPrompt"> = {}
): Promise<string> {
  const messages: ChatMessage[] = [];

  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }

  messages.push({ role: "user", content: userMessage });

  const response = await createCompletion(messages, {
    ...options,
    systemPrompt,
  });
  return response.content;
}

/**
 * Chat completion with conversation history
 */
export async function chatCompletion(
  conversationHistory: ChatMessage[],
  newMessage: string,
  options: CompletionOptions = {}
): Promise<AIServiceResponse> {
  const messages = [
    ...conversationHistory,
    { role: "user" as const, content: newMessage },
  ];

  return createCompletion(messages, options);
}

/**
 * Validates if the AI service is available
 */
export async function validateAIService(): Promise<boolean> {
  try {
    validateConfiguration();

    // Test with a simple completion
    await simpleCompletion(
      "Hello",
      "You are a helpful assistant. Respond with just 'OK'."
    );

    return true;
  } catch (error) {
    console.error("AI service validation failed:", error);
    return false;
  }
}

/**
 * Gets available models (mock implementation - extend based on OpenRouter API)
 */
export function getAvailableModels(): string[] {
  return Object.values(AI_CONFIG.models);
}

/**
 * Estimates token count (rough approximation)
 */
export function estimateTokenCount(text: string): number {
  // Rough approximation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
}

// Export configuration for external use
export { AI_CONFIG };
