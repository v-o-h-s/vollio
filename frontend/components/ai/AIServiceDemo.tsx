"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAIService } from "@/hooks/use-ai-service";
import { Loader2, Send, MessageSquare, Zap, Trash2 } from "lucide-react";

/**
 * Demo component showcasing AI service capabilities
 */
export function AIServiceDemo() {
  const [message, setMessage] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("You are a helpful AI assistant.");
  
  const {
    // Simple completion
    completion,
    completionLoading,
    completionError,
    
    // Streaming
    streamCompletion,
    streamingLoading,
    streamingError,
    streamingResponse,
    
    // Chat
    sendChatMessage,
    chatHistory,
    chatLoading,
    chatError,
    clearChat,
    
    // Utilities
    clearErrors,
    isAuthenticated,
  } = useAIService();

  const [lastCompletion, setLastCompletion] = useState<string>("");

  // Handle simple completion
  const handleCompletion = async () => {
    if (!message.trim()) return;
    
    try {
      const response = await completion([
        { role: "system", content: systemPrompt },
        { role: "user", content: message.trim() }
      ]);
      setLastCompletion(response.content);
    } catch (error) {
      console.error("Completion failed:", error);
    }
  };

  // Handle streaming completion
  const handleStreaming = async () => {
    if (!message.trim()) return;
    
    try {
      await streamCompletion([
        { role: "system", content: systemPrompt },
        { role: "user", content: message.trim() }
      ]);
    } catch (error) {
      console.error("Streaming failed:", error);
    }
  };

  // Handle chat message
  const handleChat = async () => {
    if (!message.trim()) return;
    
    try {
      await sendChatMessage(message.trim(), {
        temperature: 0.7,
        maxTokens: 1000,
      });
      setMessage("");
    } catch (error) {
      console.error("Chat failed:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">AI Service Demo</h2>
        <Badge variant={isAuthenticated ? "default" : "secondary"}>
          {isAuthenticated ? "Authenticated" : "Guest"}
        </Badge>
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">System Prompt</label>
            <Textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Enter system prompt..."
              className="mt-1"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Message</label>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message..."
              onKeyPress={(e) => e.key === "Enter" && handleCompletion()}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button 
          onClick={handleCompletion} 
          disabled={completionLoading || !message.trim()}
          className="flex-1 sm:flex-none"
        >
          {completionLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Send className="w-4 h-4 mr-2" />
          )}
          Simple Completion
        </Button>
        
        <Button 
          onClick={handleStreaming} 
          disabled={streamingLoading || !message.trim()}
          variant="outline"
          className="flex-1 sm:flex-none"
        >
          {streamingLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Zap className="w-4 h-4 mr-2" />
          )}
          Streaming
        </Button>
        
        <Button 
          onClick={handleChat} 
          disabled={chatLoading || !message.trim()}
          variant="secondary"
          className="flex-1 sm:flex-none"
        >
          {chatLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <MessageSquare className="w-4 h-4 mr-2" />
          )}
          Add to Chat
        </Button>

        <Button onClick={clearErrors} variant="ghost" size="sm">
          Clear Errors
        </Button>
      </div>

      {/* Error Display */}
      {(completionError || streamingError || chatError) && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="pt-6">
            <p className="text-red-700 dark:text-red-300">
              Error: {completionError || streamingError || chatError}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Simple Completion Result */}
      {lastCompletion && (
        <Card>
          <CardHeader>
            <CardTitle>Completion Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-lg">
              <p className="whitespace-pre-wrap">{lastCompletion}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Streaming Result */}
      {(streamingResponse || streamingLoading) && (
        <Card>
          <CardHeader>
            <CardTitle>Streaming Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-lg min-h-[100px]">
              <p className="whitespace-pre-wrap">{streamingResponse}</p>
              {streamingLoading && <span className="animate-pulse">▊</span>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat History */}
      {chatHistory.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Chat History</CardTitle>
            <Button onClick={clearChat} variant="outline" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Chat
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {chatHistory.map((msg, index) => (
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
                    {msg.timestamp && (
                      <span className="text-xs text-muted-foreground">
                        {msg.timestamp.toLocaleTimeString()}
                      </span>
                    )}
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

export default AIServiceDemo;