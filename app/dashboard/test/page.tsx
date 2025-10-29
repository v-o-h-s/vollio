"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, MessageSquare, Zap, Bot } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
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

export default function AITestPage() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [streamingResponse, setStreamingResponse] = useState("");
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [streamingLoading, setStreamingLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceInfo, setServiceInfo] = useState<any>(null);

  // Test simple completion
  const testCompletion = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("/api/deepseek", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: message.trim(),
          systemPrompt: "You are a helpful AI assistant. Be concise and friendly.",
        }),
      });

      const result = await res.json();

      if (result.success) {
        setResponse(result.data);
      } else {
        setError(result.error || "Unknown error occurred");
      }
    } catch (e) {
      console.error("Completion error:", e);
      setError("Failed to get completion");
    } finally {
      setLoading(false);
    }
  };

  // Test streaming completion
  const testStreaming = async () => {
    if (!message.trim()) return;

    setStreamingLoading(true);
    setError(null);
    setStreamingResponse("");

    try {
      const res = await fetch("/api/deepseek", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: message.trim(),
          systemPrompt: "You are a helpful AI assistant. Be detailed and informative.",
          stream: true,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
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
                  setStreamingResponse(prev => prev + data.chunk);
                } else if (data.type === 'error') {
                  setError(data.error);
                  break;
                }
              } catch (parseError) {
                console.warn("Failed to parse streaming data:", parseError);
              }
            }
          }
        }
      }
    } catch (e) {
      console.error("Streaming error:", e);
      setError("Failed to get streaming response");
    } finally {
      setStreamingLoading(false);
    }
  };

  // Test chat completion
  const testChat = async () => {
    if (!message.trim()) return;

    setChatLoading(true);
    setError(null);

    const userMessage: ChatMessage = {
      role: "user",
      content: message.trim(),
      timestamp: new Date(),
    };

    try {
      const res = await fetch("/api/deepseek/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationHistory,
          newMessage: message.trim(),
          options: {
            temperature: 0.7,
            maxTokens: 1000,
          },
        }),
      });

      const result = await res.json();

      if (result.success) {
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: result.data.message.content,
          timestamp: new Date(),
        };

        setConversationHistory(prev => [...prev, userMessage, assistantMessage]);
        setMessage("");
      } else {
        setError(result.error || "Chat error occurred");
      }
    } catch (e) {
      console.error("Chat error:", e);
      setError("Failed to send chat message");
    } finally {
      setChatLoading(false);
    }
  };

  // Get service info
  const getServiceInfo = async () => {
    try {
      const res = await fetch("/api/deepseek");
      const result = await res.json();
      setServiceInfo(result);
    } catch (e) {
      console.error("Service info error:", e);
    }
  };

  // Clear conversation
  const clearConversation = () => {
    setConversationHistory([]);
    setError(null);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">AI Service Test Dashboard</h1>
        <Button onClick={getServiceInfo} variant="outline">
          <Bot className="w-4 h-4 mr-2" />
          Service Info
        </Button>
      </div>

      {/* Service Information */}
      {serviceInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Service Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant="default">{serviceInfo.status}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Models</p>
                <p className="font-mono text-sm">{serviceInfo.models?.join(", ")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Features</p>
                <p className="text-sm">{serviceInfo.features?.join(", ")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rate Limit</p>
                <p className="text-sm">{serviceInfo.rateLimit?.authenticated}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Test Input</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && testCompletion()}
              className="flex-1"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={testCompletion} 
              disabled={loading || !message.trim()}
              className="flex-1 sm:flex-none"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Simple Completion
            </Button>
            
            <Button 
              onClick={testStreaming} 
              disabled={streamingLoading || !message.trim()}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              {streamingLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
              Streaming
            </Button>
            
            <Button 
              onClick={testChat} 
              disabled={chatLoading || !message.trim()}
              variant="secondary"
              className="flex-1 sm:flex-none"
            >
              {chatLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MessageSquare className="w-4 h-4 mr-2" />}
              Chat
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="pt-6">
            <p className="text-red-700 dark:text-red-300">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      {/* Simple Completion Response */}
      {response && (
        <Card>
          <CardHeader>
            <CardTitle>Completion Response</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="whitespace-pre-wrap">{response.content}</p>
            </div>
            
            {response.usage && (
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Prompt: {response.usage.promptTokens} tokens</span>
                <span>Completion: {response.usage.completionTokens} tokens</span>
                <span>Total: {response.usage.totalTokens} tokens</span>
                <span>Model: {response.model}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Streaming Response */}
      {(streamingResponse || streamingLoading) && (
        <Card>
          <CardHeader>
            <CardTitle>Streaming Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-lg min-h-[100px]">
              <p className="whitespace-pre-wrap">{streamingResponse}</p>
              {streamingLoading && <span className="animate-pulse">▊</span>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat Conversation */}
      {conversationHistory.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Chat Conversation</CardTitle>
            <Button onClick={clearConversation} variant="outline" size="sm">
              Clear
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {conversationHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    msg.role === "user" 
                      ? "bg-blue-50 dark:bg-blue-950 ml-8" 
                      : "bg-muted mr-8"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={msg.role === "user" ? "default" : "secondary"}>
                      {msg.role}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {msg.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
