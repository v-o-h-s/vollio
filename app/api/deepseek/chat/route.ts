import { 
  chatCompletion,
  type ChatMessage,
  type CompletionOptions 
} from "@/lib/services/AiService";
import { 
  withErrorHandling, 
  extractRequestContext, 
  validateRequired,
  checkRateLimit,
  ServerErrorType,
  createServerError
} from "@/lib/utils/error-handling/server-error-handling";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// Chat request interface
interface ChatRequest {
  conversationHistory: ChatMessage[];
  newMessage: string;
  options?: CompletionOptions;
}

/**
 * POST /api/deepseek/chat - Chat completion with conversation history
 */
export const POST = withErrorHandling(async (req: NextRequest) => {
  const { userId } = await auth();
  const context = extractRequestContext(req, "/api/deepseek/chat", userId || undefined);

  // Rate limiting - 30 chat requests per minute per user
  if (userId) {
    checkRateLimit(`ai_chat_${userId}`, 30, 60 * 1000, context);
  } else {
    // More restrictive for unauthenticated users
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    checkRateLimit(`ai_chat_ip_${ip}`, 5, 60 * 1000, context);
  }

  const body: ChatRequest = await req.json();
  const { conversationHistory, newMessage, options = {} } = body;

  // Validate required fields
  validateRequired(newMessage, "newMessage", context);
  
  if (!Array.isArray(conversationHistory)) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      "conversationHistory must be an array",
      context
    );
  }

  // Validate conversation history length (prevent excessive context)
  if (conversationHistory.length > 50) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      "Conversation history too long. Maximum 50 messages allowed.",
      context
    );
  }

  // Calculate total conversation length to prevent token overflow
  const totalLength = conversationHistory.reduce((acc, msg) => acc + msg.content.length, 0) + newMessage.length;
  if (totalLength > 100000) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      "Conversation too long. Please start a new conversation.",
      context
    );
  }

  // Prepare completion options
  const completionOptions: CompletionOptions = {
    ...options,
    userId: userId || undefined,
    context,
  };

  try {
    const response = await chatCompletion(conversationHistory, newMessage, completionOptions);

    return NextResponse.json({
      success: true,
      data: {
        message: {
          role: "assistant",
          content: response.content,
        },
        usage: response.usage,
        model: response.model,
        finishReason: response.finishReason,
      },
      conversationLength: conversationHistory.length + 2, // +2 for user message and assistant response
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    // Error handling is managed by withErrorHandling wrapper
    throw error;
  }
}, { endpoint: "/api/deepseek/chat", method: "POST" });