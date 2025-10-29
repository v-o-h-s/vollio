import { 
  createCompletion, 
  createStreamingCompletion, 
  simpleCompletion,
  chatCompletion,
  type ChatMessage,
  type CompletionOptions,
  type StreamingOptions 
} from "@/lib/services/AiService";
import { 
  withErrorHandling, 
  extractRequestContext, 
  validateRequired,
  checkRateLimit,
  createErrorResponse,
  createServerError
} from "@/lib/utils/error-handling/server-error-handling";

import { ErrorType } from "@/lib/types/errors";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// Request interfaces for type safety
interface CompletionRequest {
  message?: string;
  messages?: ChatMessage[];
  systemPrompt?: string;
  options?: CompletionOptions;
  stream?: boolean;
}

interface ChatRequest {
  conversationHistory: ChatMessage[];
  newMessage: string;
  options?: CompletionOptions;
}

/**
 * POST /api/deepseek - AI completion endpoint
 * Supports both simple completions and streaming
 */
export const POST = withErrorHandling(async (req: NextRequest) => {
  const { userId } = await auth();
  const context = extractRequestContext(req, "/api/deepseek", userId || undefined);

  // Rate limiting - 60 requests per minute per user
  if (userId) {
    checkRateLimit(`ai_completion_${userId}`, 60, 60 * 1000, context);
  } else {
    // More restrictive rate limiting for unauthenticated users
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    checkRateLimit(`ai_completion_ip_${ip}`, 10, 60 * 1000, context);
  }

  const body: CompletionRequest = await req.json();
  const { message, messages, systemPrompt, options = {}, stream = false } = body;

  // Validate input - either message or messages array is required
  if (!message && (!messages || !Array.isArray(messages) || messages.length === 0)) {
    throw createServerError(
      ErrorType.VALIDATION_ERROR,
      "Either 'message' or 'messages' array is required",
      context
    );
  }

  // Prepare completion options with user context
  const completionOptions: CompletionOptions = {
    ...options,
    userId: userId || undefined,
    context,
  };

  try {
    if (stream) {
      // Handle streaming completion
      if (message) {
        // Simple streaming completion
        const streamGenerator = await createStreamingCompletion(
          [
            ...(systemPrompt ? [{ role: "system" as const, content: systemPrompt }] : []),
            { role: "user", content: message }
          ],
          completionOptions as StreamingOptions
        );

        // Convert async generator to ReadableStream for HTTP streaming
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of streamGenerator) {
                const data = `data: ${JSON.stringify({ chunk, type: 'content' })}\n\n`;
                controller.enqueue(encoder.encode(data));
              }
              
              // Send completion signal
              const endData = `data: ${JSON.stringify({ type: 'done' })}\n\n`;
              controller.enqueue(encoder.encode(endData));
              controller.close();
            } catch (error) {
              const errorData = `data: ${JSON.stringify({ 
                type: 'error', 
                error: error instanceof Error ? error.message : 'Stream error' 
              })}\n\n`;
              controller.enqueue(encoder.encode(errorData));
              controller.close();
            }
          }
        });

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
      } else if (messages) {
        // Streaming completion with message history
        const streamGenerator = await createStreamingCompletion(messages, completionOptions as StreamingOptions);
        
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of streamGenerator) {
                const data = `data: ${JSON.stringify({ chunk, type: 'content' })}\n\n`;
                controller.enqueue(encoder.encode(data));
              }
              
              const endData = `data: ${JSON.stringify({ type: 'done' })}\n\n`;
              controller.enqueue(encoder.encode(endData));
              controller.close();
            } catch (error) {
              const errorData = `data: ${JSON.stringify({ 
                type: 'error', 
                error: error instanceof Error ? error.message : 'Stream error' 
              })}\n\n`;
              controller.enqueue(encoder.encode(errorData));
              controller.close();
            }
          }
        });

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
      }
    } else {
      // Handle regular completion
      let response;
      
      if (message) {
        // Simple completion
        if (systemPrompt) {
          response = await createCompletion([
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ], completionOptions);
        } else {
          const content = await simpleCompletion(message, undefined, completionOptions);
          response = { content, model: "tngtech/deepseek-r1t2-chimera" };
        }
      } else if (messages) {
        // Completion with message history
        response = await createCompletion(messages, completionOptions);
      }

      return NextResponse.json({
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    // Error handling is managed by withErrorHandling wrapper
    throw error;
  }
}, { endpoint: "/api/deepseek", method: "POST" });

/**
 * GET /api/deepseek - Health check and service info
 */
export const GET = withErrorHandling(async (req: NextRequest) => {
  const context = extractRequestContext(req, "/api/deepseek");

  return NextResponse.json({
    success: true,
    service: "DeepSeek AI Completion Service",
    status: "operational",
    models: ["tngtech/deepseek-r1t2-chimera"],
    features: ["completion", "streaming", "chat"],
    rateLimit: {
      authenticated: "60 requests/minute",
      unauthenticated: "10 requests/minute"
    },
    timestamp: new Date().toISOString(),
  });
}, { endpoint: "/api/deepseek", method: "GET" });
