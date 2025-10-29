# AI Service Implementation Guide

## Overview

The AI Service provides a robust, production-ready integration with DeepSeek AI models through OpenRouter. It includes comprehensive error handling, rate limiting, streaming support, and multiple interaction patterns.

## Architecture

### Core Components

1. **AiService.ts** - Core service with OpenAI client integration
2. **API Routes** - RESTful endpoints for AI interactions
3. **React Hooks** - Frontend integration utilities
4. **Error Handling** - Comprehensive error management system

### Key Features

- ✅ **Multiple Completion Types**: Simple, streaming, and chat completions
- ✅ **Comprehensive Error Handling**: Detailed error mapping and recovery
- ✅ **Rate Limiting**: User-based and IP-based rate limiting
- ✅ **Authentication Integration**: Clerk authentication with user context
- ✅ **Streaming Support**: Real-time response streaming with SSE
- ✅ **Type Safety**: Full TypeScript integration
- ✅ **Request Validation**: Input validation and sanitization
- ✅ **Retry Logic**: Exponential backoff for transient failures
- ✅ **Usage Tracking**: Token usage and performance monitoring

## API Endpoints

### POST /api/deepseek

Main completion endpoint supporting both simple and streaming completions.

#### Request Body

```typescript
interface CompletionRequest {
  message?: string;                    // Simple message for completion
  messages?: ChatMessage[];            // Array of messages for conversation
  systemPrompt?: string;               // System prompt override
  stream?: boolean;                    // Enable streaming response
  options?: {
    model?: string;                    // AI model to use
    maxTokens?: number;                // Maximum tokens in response
    temperature?: number;              // Response creativity (0-1)
  };
}
```

#### Response (Non-streaming)

```typescript
{
  success: true,
  data: {
    content: string,                   // AI response content
    usage?: {
      promptTokens: number,
      completionTokens: number,
      totalTokens: number
    },
    model: string,                     // Model used
    finishReason?: string              // Completion reason
  },
  timestamp: string
}
```

#### Response (Streaming)

Server-Sent Events with the following data types:

```typescript
// Content chunk
{ type: 'content', chunk: string }

// Completion signal
{ type: 'done' }

// Error signal
{ type: 'error', error: string }
```

### POST /api/deepseek/chat

Dedicated chat endpoint with conversation history support.

#### Request Body

```typescript
interface ChatRequest {
  conversationHistory: ChatMessage[];  // Previous messages
  newMessage: string;                  // New user message
  options?: CompletionOptions;         // Completion options
}
```

#### Response

```typescript
{
  success: true,
  data: {
    message: {
      role: "assistant",
      content: string                  // AI response
    },
    usage?: TokenUsage,
    model: string,
    finishReason?: string
  },
  conversationLength: number,          // Total messages in conversation
  timestamp: string
}
```

### GET /api/deepseek

Service health check and information endpoint.

#### Response

```typescript
{
  success: true,
  service: "DeepSeek AI Completion Service",
  status: "operational",
  models: string[],                    // Available models
  features: string[],                  // Supported features
  rateLimit: {
    authenticated: string,             // Rate limit for authenticated users
    unauthenticated: string           // Rate limit for unauthenticated users
  },
  timestamp: string
}
```

## Frontend Integration

### Using React Hooks

#### Simple Completion

```typescript
import { useAICompletion } from "@/hooks/use-ai-service";

function MyComponent() {
  const { complete, loading, error, clearError } = useAICompletion();

  const handleSubmit = async () => {
    try {
      const response = await complete("Hello, how are you?", {
        systemPrompt: "You are a helpful assistant",
        temperature: 0.7
      });
      console.log(response.content);
    } catch (err) {
      console.error("Completion failed:", err);
    }
  };

  return (
    <div>
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Thinking..." : "Ask AI"}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

#### Streaming Completion

```typescript
import { useAIStreaming } from "@/hooks/use-ai-service";

function StreamingComponent() {
  const { stream, loading, error, response } = useAIStreaming();

  const handleStream = async () => {
    try {
      await stream("Tell me a story", {
        maxTokens: 1000
      }, (chunk) => {
        // Handle individual chunks if needed
        console.log("New chunk:", chunk);
      });
    } catch (err) {
      console.error("Streaming failed:", err);
    }
  };

  return (
    <div>
      <button onClick={handleStream} disabled={loading}>
        {loading ? "Streaming..." : "Start Stream"}
      </button>
      <div className="response">
        {response}
        {loading && <span className="cursor">▊</span>}
      </div>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

#### Chat Interface

```typescript
import { useAIChat } from "@/hooks/use-ai-service";

function ChatComponent() {
  const { sendMessage, messages, loading, error, clearChat } = useAIChat();
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;
    
    try {
      await sendMessage(input, {
        temperature: 0.8
      });
      setInput("");
    } catch (err) {
      console.error("Message failed:", err);
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <strong>{msg.role}:</strong> {msg.content}
          </div>
        ))}
      </div>
      
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          disabled={loading}
        />
        <button onClick={handleSend} disabled={loading || !input.trim()}>
          {loading ? "Sending..." : "Send"}
        </button>
        <button onClick={clearChat}>Clear</button>
      </div>
      
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

### Direct API Usage

```typescript
// Simple completion
const response = await fetch("/api/deepseek", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    message: "Hello, world!",
    systemPrompt: "You are a helpful assistant",
    options: {
      temperature: 0.7,
      maxTokens: 1000
    }
  })
});

// Streaming completion
const response = await fetch("/api/deepseek", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    message: "Tell me a story",
    stream: true
  })
});

const reader = response.body?.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  // Process streaming data
}
```

## Error Handling

### Error Types

The service maps various error conditions to standardized error types:

- **VALIDATION_ERROR** - Invalid input or parameters
- **AUTHENTICATION_ERROR** - Authentication required or failed
- **AUTHORIZATION_ERROR** - Insufficient permissions
- **RATE_LIMIT_ERROR** - Rate limit exceeded
- **EXTERNAL_SERVICE_ERROR** - AI service unavailable or error
- **PROCESSING_ERROR** - Request processing failed
- **INTERNAL_ERROR** - Unexpected server error

### Error Response Format

```typescript
{
  success: false,
  error: "User-friendly error message",
  code: "ERROR_TYPE",
  requestId: "req_123456789",
  timestamp: "2025-01-29T10:00:00.000Z",
  details?: {                          // Only in development
    technicalMessage: "Technical details",
    context: { ... }
  }
}
```

### Retry Logic

The service implements exponential backoff retry for transient errors:

- **Max Retries**: 3 attempts
- **Initial Delay**: 1 second
- **Backoff Multiplier**: 2x
- **Max Delay**: 10 seconds
- **Retryable Errors**: Network, timeout, and service errors

## Rate Limiting

### Limits

- **Authenticated Users**: 60 requests/minute for completions, 30 requests/minute for chat
- **Unauthenticated Users**: 10 requests/minute for completions, 5 requests/minute for chat

### Implementation

Rate limiting is implemented using in-memory storage with automatic cleanup:

```typescript
// Check rate limit before processing
checkRateLimit(`ai_completion_${userId}`, 60, 60 * 1000, context);
```

## Configuration

### Environment Variables

```bash
# Required
OPEN_ROUTER_API_KEY=sk-or-v1-your-api-key-here

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Service Configuration

```typescript
const AI_CONFIG = {
  maxTokens: 4000,                     // Default max tokens
  temperature: 0.7,                    // Default temperature
  maxRetries: 3,                       // Retry attempts
  timeoutMs: 30000,                    // Request timeout
  rateLimitPerMinute: 60,              // Rate limit
  models: {
    default: "tngtech/deepseek-r1t2-chimera",
    fast: "tngtech/deepseek-r1t2-chimera",
    creative: "tngtech/deepseek-r1t2-chimera",
  }
};
```

## Best Practices

### 1. Error Handling

Always handle errors gracefully and provide user-friendly messages:

```typescript
try {
  const response = await complete(message);
  // Handle success
} catch (error) {
  if (error.message.includes("rate limit")) {
    // Show rate limit message
  } else if (error.message.includes("authentication")) {
    // Redirect to login
  } else {
    // Show generic error
  }
}
```

### 2. Loading States

Always show loading indicators during AI operations:

```typescript
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await complete(message);
  } finally {
    setLoading(false);
  }
};
```

### 3. Input Validation

Validate user input before sending to AI service:

```typescript
const validateInput = (message: string) => {
  if (!message.trim()) {
    throw new Error("Message cannot be empty");
  }
  if (message.length > 50000) {
    throw new Error("Message too long");
  }
};
```

### 4. Streaming Optimization

For streaming responses, update UI efficiently:

```typescript
const [response, setResponse] = useState("");

await stream(message, {}, (chunk) => {
  setResponse(prev => prev + chunk);
});
```

### 5. Memory Management

Clean up resources and cancel requests when components unmount:

```typescript
useEffect(() => {
  return () => {
    // Cancel ongoing requests
    abortController.abort();
  };
}, []);
```

## Monitoring and Debugging

### Logging

The service provides comprehensive logging:

- **Success Logs**: Request duration, token usage, model used
- **Error Logs**: Detailed error information with context
- **Rate Limit Logs**: Rate limit violations and user patterns

### Debug Mode

In development, additional debugging information is available:

```typescript
// Enable debug logging
process.env.NODE_ENV === 'development' && console.log(debugInfo);
```

### Performance Monitoring

Monitor key metrics:

- **Response Time**: Track completion latency
- **Token Usage**: Monitor token consumption
- **Error Rate**: Track error frequency
- **Rate Limit Hits**: Monitor rate limiting effectiveness

## Security Considerations

### 1. API Key Protection

- Store API keys in environment variables
- Never expose API keys in client-side code
- Rotate API keys regularly

### 2. Input Sanitization

- Validate all user inputs
- Limit message length and conversation history
- Sanitize content for security

### 3. Rate Limiting

- Implement proper rate limiting
- Use user-based and IP-based limits
- Monitor for abuse patterns

### 4. Authentication

- Require authentication for sensitive operations
- Use proper user context in requests
- Implement proper session management

## Troubleshooting

### Common Issues

1. **API Key Errors**
   - Verify OPEN_ROUTER_API_KEY is set
   - Check API key validity and permissions

2. **Rate Limit Errors**
   - Implement proper retry logic
   - Show user-friendly rate limit messages
   - Consider upgrading API plan

3. **Timeout Errors**
   - Increase timeout values for long requests
   - Implement proper error handling
   - Use streaming for long responses

4. **Streaming Issues**
   - Ensure proper SSE handling
   - Implement proper cleanup
   - Handle connection interruptions

### Debug Checklist

- [ ] API key is configured correctly
- [ ] Network connectivity is available
- [ ] Rate limits are not exceeded
- [ ] Input validation passes
- [ ] Error handling is implemented
- [ ] Loading states are shown
- [ ] Cleanup is performed on unmount

## Future Enhancements

### Planned Features

1. **Model Selection** - Dynamic model switching
2. **Conversation Persistence** - Save chat history
3. **Usage Analytics** - Detailed usage tracking
4. **Custom Prompts** - Template system for prompts
5. **Batch Processing** - Multiple completions
6. **Caching** - Response caching for efficiency
7. **A/B Testing** - Model comparison tools
8. **Fine-tuning** - Custom model training

### Integration Opportunities

- **PDF Analysis** - AI-powered document analysis
- **Quiz Generation** - Automated quiz creation
- **Note Enhancement** - AI-assisted note taking
- **Content Summarization** - Automatic summaries
- **Translation** - Multi-language support

This AI service provides a solid foundation for integrating AI capabilities into the Noto application with proper error handling, security, and user experience considerations.