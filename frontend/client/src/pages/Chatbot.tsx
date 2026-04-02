import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { ChatMessage } from "@shared/schema";
import { Send, RotateCcw, Bot, User, Loader2, Heart, Brain, AlertTriangle } from "lucide-react";

interface AnalysisResult {
  label: string | null;
  source: "python_rag" | "rules";
}

const SESSION_ID = "default-session";

const QUICK_PROMPTS = [
  "I'm feeling very stressed today",
  "My stress is 8/10",
  "I can't sleep due to anxiety",
  "Work is overwhelming me",
  "I need help calming down",
  "I'm feeling okay, just checking in",
];

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex items-end gap-3 chat-message-animate ${isUser ? "flex-row-reverse" : "flex-row"}`}
      data-testid={`message-${message.id}`}
    >
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser
          ? "bg-primary text-primary-foreground"
          : "bg-muted border border-border"
      }`}>
        {isUser
          ? <User className="w-4 h-4" />
          : <Bot className="w-4 h-4 text-primary" />
        }
      </div>

      <div className={`max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
        isUser
          ? "bg-primary text-primary-foreground rounded-br-sm"
          : "bg-card border border-card-border text-card-foreground rounded-bl-sm"
      }`}>
        {message.content.split("\n\n").map((paragraph, i) => (
          <p key={i} className={i > 0 ? "mt-2" : ""}>{paragraph}</p>
        ))}
        <p className={`text-xs mt-1.5 ${isUser ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
          {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
        </p>
      </div>
    </div>
  );
}

export default function Chatbot() {
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [lastAnalysis, setLastAnalysis] = useState<AnalysisResult | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat", SESSION_ID],
    queryFn: () => fetch(`/api/chat/${SESSION_ID}`).then(r => r.json()),
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) => apiRequest("POST", `/api/chat/${SESSION_ID}`, { content }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat", SESSION_ID] });
      if (data?.analysis) {
        setLastAnalysis(data.analysis);
      }
    },
    onError: () => toast({ title: "Error", description: "Failed to send message.", variant: "destructive" }),
  });

  const clearMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/chat/${SESSION_ID}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat", SESSION_ID] });
      toast({ title: "Conversation cleared", description: "Starting a fresh session." });
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    const content = input.trim();
    if (!content || sendMutation.isPending) return;
    setInput("");
    sendMutation.mutate(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    if (sendMutation.isPending) return;
    sendMutation.mutate(prompt);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Serene Mind</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              <p className="text-xs text-muted-foreground">Empathetic Companion</p>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { clearMutation.mutate(); setLastAnalysis(null); }}
          disabled={clearMutation.isPending || messages.length === 0}
          data-testid="button-clear-chat"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          New Session
        </Button>
      </div>

      {/* ML Analysis Banner */}
      {lastAnalysis && lastAnalysis.label && (
        <div
          data-testid="ml-analysis-banner"
          className={`px-6 py-2 flex items-center gap-3 text-xs border-b border-border flex-wrap ${
            lastAnalysis.label === "suicidal"
              ? "bg-red-50 dark:bg-red-950"
              : lastAnalysis.label === "depression" || lastAnalysis.label === "bipolar"
              ? "bg-orange-50 dark:bg-orange-950"
              : "bg-muted/50"
          }`}
        >
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Brain className="w-3 h-3" />
            <span className="font-medium">ML Analysis</span>
            <Badge variant="secondary" className="text-xs py-0">
              {lastAnalysis.source === "python_rag" ? "RAG + Ollama" : "Rule-based"}
            </Badge>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Detected:</span>
            <span className={`font-semibold capitalize ${
              lastAnalysis.label === "suicidal" ? "text-red-600 dark:text-red-400" :
              lastAnalysis.label === "depression" || lastAnalysis.label === "bipolar" ? "text-orange-600 dark:text-orange-400" :
              lastAnalysis.label === "anxiety" || lastAnalysis.label === "stress" ? "text-yellow-600 dark:text-yellow-400" :
              "text-emerald-600 dark:text-emerald-400"
            }`}>
              {lastAnalysis.label}
            </span>
          </div>

          {lastAnalysis.label === "suicidal" && (
            <div className="flex items-center gap-1 font-semibold text-red-600 dark:text-red-400">
              <AlertTriangle className="w-3 h-3" />
              Crisis alert triggered
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollRef as any}>
          <div className="px-6 py-4 space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Welcome to Serene Mind</h3>
                <p className="text-muted-foreground text-sm max-w-sm mb-6">
                  I'm your empathetic AI companion. This is a safe, judgment-free space. Share how you're feeling and I'll guide you toward calm.
                </p>

                <div className="w-full max-w-sm">
                  <p className="text-xs text-muted-foreground mb-3 font-medium">Quick prompts to get started:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {QUICK_PROMPTS.map(prompt => (
                      <button
                        key={prompt}
                        data-testid={`quick-prompt-${prompt.slice(0, 20)}`}
                        onClick={() => handleQuickPrompt(prompt)}
                        disabled={sendMutation.isPending}
                        className="text-left px-3 py-2 rounded-md bg-muted/60 border border-border text-sm text-foreground hover-elevate cursor-pointer transition-colors disabled:opacity-50"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map(msg => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
                {sendMutation.isPending && (
                  <div className="flex items-end gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                    <div className="bg-card border border-card-border rounded-xl rounded-bl-sm px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"></div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Quick prompts (when chat is active) */}
      {messages.length > 0 && (
        <div className="px-6 py-2 border-t border-border flex-shrink-0">
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.slice(0, 3).map(prompt => (
              <button
                key={prompt}
                onClick={() => handleQuickPrompt(prompt)}
                disabled={sendMutation.isPending}
                data-testid={`chip-${prompt.slice(0, 15)}`}
                className="text-xs px-3 py-1 rounded-full bg-muted border border-border text-muted-foreground hover-elevate cursor-pointer disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-6 py-4 border-t border-border flex-shrink-0">
        <div className="flex items-end gap-3">
          <Textarea
            ref={textareaRef}
            data-testid="input-chat-message"
            placeholder="Share how you're feeling... (Enter to send, Shift+Enter for new line)"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            className="resize-none flex-1 min-h-[44px] max-h-32"
          />
          <Button
            data-testid="button-send-message"
            onClick={handleSend}
            disabled={!input.trim() || sendMutation.isPending}
            size="icon"
          >
            {sendMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          This AI companion provides support and coping strategies, not medical advice.
        </p>
      </div>
    </div>
  );
}
