import { useState, useCallback, useRef } from "react";
import { useAuth } from "@clerk/nextjs";

// Types for the AI service hook
interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
}

interface CompletionOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason?: string;
}

interface UseAIServiceReturn {
  // Simple completion
  completion: (message: string, options?: CompletionOptions) => Promise<AIResponse>;
  completionLoading: boolean;
  completionError: string | null;
  
  // Streaming completion
  streamCompletion: (
    message: string, 
    options?: CompletionOptions,
    onChunk?: (chunk: string) => void
  ) => Promise<void>;
  streamingLoading: boolean;
  streamingError: string | null;
  streamingResponse: string;
  
  // Chat functionality
  sendChatMessage: (message: string, options?: CompletionOptions) => Promise<void>;
  chatHistory: ChatMessage[];
  chatLoading: boolean;
  chatError: string | null;
  clearChat: () => void;
  
  // Service info
  getServiceInfo: () => Promise<any>;
  serviceInfo: any;
  
  // Utility functions
  clearErrors: () => void;
  isAuthenticated: boolean;
}

/**
 * Custom hook for AI service integration with comprehensive error handling
 */
export function useAIService(): UseAIServiceReturn {
  const { isSignedIn, userId } = useAuth();
  
  // State management
  const [completionLoading, setCompletionLoading] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);
  
  const [streamingLoading, setStreamingLoading] = useState(false);
  const [streamingError, setStreamingError] = useState<string | null>(null);
  const [streamingResponse, setStreamingResponse] = useState("");
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  
  const [serviceInfo, setServiceInfo] = useState<any>(null);
  
  // Refs for cleanup
  const abortControllerRef = useRef<AbortController | null>(null);
  const streamReaderRef = useRef<ReadableStreamDefaultReader | null>(null);

  /**
   * Simple completion function
   */
  const completion = useCallback(async (
    message: string, 
    options: CompletionOptions = {}
  ): Promise<AIResponse> => {
    if (!message.trim()) {
      throw new Error("Message cannot be empty");
    }

    setCompletionLoading(true);
    setCompletionError(null);

    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/deepseek", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          systemPrompt: options.systemPrompt,
          options: {
            model: options.model,
            maxTokens: options.maxTokens,
            temperature: options.temperature,
          },
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Completion failed");
      }

      return result.data;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error("Request was cancelled");
      }
      
      const errorMessage = error.message || "Failed to get completion";
      setCompletionError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setCompletionLoading(false);
      abortControllerRef.current = null;
    }
  }, []);

  /**
   * Streaming completion function
   */
  const streamCompletion = useCallback(async (
    message: string,
    options: CompletionOptions = {},
    onChunk?: (chunk: string) => void
  ): Promise<void> => {
    if (!message.trim()) {
      throw new Error("Message cannot be empty");
    }

    setStreamingLoading(true);
    setStreamingError(null);
    setStreamingResponse("");

    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (streamReaderRef.current) {
      streamReaderRef.current.cancel();
    }

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/deepseek", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          systemPrompt: options.systemPrompt,
          stream: true,
          options: {
            model: options.model,
            maxTokens: options.maxTokens,
            temperature: options.temperature,
          },
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body reader available");
      }

      streamReaderRef.current = reader;
      const decoder = new TextDecoder();
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'content' && data.chunk) {
                fullResponse += data.chunk;
                setStreamingResponse(fullResponse);
                
                // Call chunk callback if provided
                if (onChunk) {
                  onChunk(data.chunk);
                }
              } else if (data.type === 'error') {
                throw new Error(data.error);
              } else if (data.type === 'done') {
                break;
              }
            } catch (parseError) {
              console.warn("Failed to parse streaming data:", parseError);
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setStreamingError("Request was cancelled");
        return;
      }
      
      const errorMessage = error.message || "Failed to get streaming response";
      setStreamingError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setStreamingLoading(false);
      abortControllerRef.current = null;
      streamReaderRef.current = null;
    }
  }, []);

  /**
   * Send chat message function
   */
  const sendChatMessage = useCallback(async (
    message: string,
    options: CompletionOptions = {}
  ): Promise<void> => {
    if (!message.trim()) {
      throw new Error("Message cannot be empty");
    }

    setChatLoading(true);
    setChatError(null);

    const userMessage: ChatMessage = {
      role: "user",
      content: message.trim(),
      timestamp: new Date(),
    };

    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/deepseek/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationHistory: chatHistory,
          newMessage: message.trim(),
          options: {
            model: options.model,
            maxTokens: options.maxTokens,
            temperature: options.temperature,
          },
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Chat message failed");
      }

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: result.data.message.content,
        timestamp: new Date(),
      };

      setChatHistory(prev => [...prev, userMessage, assistantMessage]);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setChatError("Request was cancelled");
        return;
      }
      
      const errorMessage = error.message || "Failed to send chat message";
      setChatError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setChatLoading(false);
      abortControllerRef.current = null;
    }
  }, [chatHistory]);

  /**
   * Get service information
   */
  const getServiceInfo = useCallback(async () => {
    try {
      const response = await fetch("/api/deepseek");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setServiceInfo(result);
      return result;
    } catch (error: any) {
      console.error("Failed to get service info:", error);
      throw new Error(error.message || "Failed to get service information");
    }
  }, []);

  /**
   * Clear chat history
   */
  const clearChat = useCallback(() => {
    setChatHistory([]);
    setChatError(null);
  }, []);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setCompletionError(null);
    setStreamingError(null);
    setChatError(null);
  }, []);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (streamReaderRef.current) {
      streamReaderRef.current.cancel();
    }
  }, []);

  // Auto-cleanup effect would go here in a real implementation
  // useEffect(() => cleanup, [cleanup]);

  return {
    // Simple completion
    completion,
    completionLoading,
    completionError,
    
    // Streaming completion
    streamCompletion,
    streamingLoading,
    streamingError,
    streamingResponse,
    
    // Chat functionality
    sendChatMessage,
    chatHistory,
    chatLoading,
    chatError,
    clearChat,
    
    // Service info
    getServiceInfo,
    serviceInfo,
    
    // Utility functions
    clearErrors,
    isAuthenticated: !!isSignedIn,
  };
}

/**
 * Hook for simple AI completions (convenience wrapper)
 */
export function useAICompletion() {
  const { completion, completionLoading, completionError, clearErrors } = useAIService();
  
  return {
    complete: completion,
    loading: completionLoading,
    error: completionError,
    clearError: clearErrors,
  };
}

/**
 * Hook for AI streaming (convenience wrapper)
 */
export function useAIStreaming() {
  const { 
    streamCompletion, 
    streamingLoading, 
    streamingError, 
    streamingResponse,
    clearErrors 
  } = useAIService();
  
  return {
    stream: streamCompletion,
    loading: streamingLoading,
    error: streamingError,
    response: streamingResponse,
    clearError: clearErrors,
  };
}

/**
 * Hook for AI chat (convenience wrapper)
 */
export function useAIChat() {
  const { 
    sendChatMessage, 
    chatHistory, 
    chatLoading, 
    chatError, 
    clearChat,
    clearErrors 
  } = useAIService();
  
  return {
    sendMessage: sendChatMessage,
    messages: chatHistory,
    loading: chatLoading,
    error: chatError,
    clearChat,
    clearError: clearErrors,
  };
}