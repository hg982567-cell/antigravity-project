"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  User,
  RotateCcw,
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  toolsUsed?: any[];
  assumptions?: string[];
  pendingConfirmation?: {
    tool: string;
    prompt: string;
    args: any;
  };
}

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init_1",
      sender: "ai",
      text: "Hello Alex! I am **Drop AI Brain**, your ecommerce intelligence and operations assistant. I operate under a 3-tier permission model: `READ` tools query your database directly, `WRITE` tools stage changes, and `HIGH RISK` actions require your explicit interactive confirmation. How can I assist your store today?",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (customPrompt?: string) => {
    const promptToSend = customPrompt || input;
    if (!promptToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      sender: "user",
      text: promptToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptToSend }),
      });

      const data = await res.json();

      // Check if high-risk action requires confirmation
      let pendingConfirmation: any = undefined;
      const highRiskTool = (data.toolsUsed || []).find((t: any) => t.status === "PENDING_CONFIRMATION");
      if (highRiskTool) {
        pendingConfirmation = {
          tool: highRiskTool.tool,
          prompt: highRiskTool.confirmationPrompt,
          args: highRiskTool.data,
        };
      }

      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: "ai",
        text: data.response,
        toolsUsed: data.toolsUsed,
        assumptions: data.assumptions,
        pendingConfirmation,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_err_${Date.now()}`,
          sender: "ai",
          text: "I encountered a communication error connecting to the AI processing layer. Please retry.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAction = async (msgId: string, tool: string, args: any) => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmedHighRiskAction: { tool, args },
        }),
      });

      const data = await res.json();

      // Update message to remove pending state
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, pendingConfirmation: undefined } : m))
      );

      // Add execution success response
      const aiMsg: Message = {
        id: `ai_conf_${Date.now()}`,
        sender: "ai",
        text: data.response,
        toolsUsed: data.toolsUsed,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    "Show today's sales and net profit",
    "Find profitable products with low competition",
    "Cancel order #ORD-1042",
    "Draft viral TikTok ad copy for Pet Steam Brush",
  ];

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col space-y-4">
      {/* Top Banner */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Drop AI Business Copilot
          </h1>
          <Badge variant="purple" size="sm">
            <ShieldCheck className="w-3 h-3 mr-1" />
            Zero-Trust Tool Execution
          </Badge>
        </div>
      </div>

      {/* Main Chat Box Card */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${
                m.sender === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  m.sender === "user"
                    ? "bg-slate-800 text-white"
                    : "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                }`}
              >
                {m.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-xl rounded-2xl p-4 space-y-2.5 ${
                  m.sender === "user"
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 rounded-tl-none text-slate-900 dark:text-slate-100"
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>

                {/* Tool Badges */}
                {m.toolsUsed && m.toolsUsed.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-wrap gap-1.5">
                    {m.toolsUsed.map((t: any, i: number) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                      >
                        <Terminal className="w-3 h-3 text-blue-500" />
                        tool: {t.tool} ({t.permission})
                      </span>
                    ))}
                  </div>
                )}

                {/* Interactive Confirmation Gate for HIGH-RISK actions */}
                {m.pendingConfirmation && (
                  <div className="mt-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                    <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Action Required: HIGH RISK Gate</span>
                    </div>
                    <p className="text-amber-900 dark:text-amber-200 text-xs">
                      {m.pendingConfirmation.prompt}
                    </p>
                    <div className="pt-1 flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleConfirmAction(
                            m.id,
                            m.pendingConfirmation!.tool,
                            m.pendingConfirmation!.args
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-xs"
                      >
                        Confirm & Execute
                      </button>
                      <button
                        onClick={() =>
                          setMessages((prev) =>
                            prev.map((msg) =>
                              msg.id === m.id ? { ...msg, pendingConfirmation: undefined } : msg
                            )
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/70 text-slate-500 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                <span>Evaluating request and executing permitted tools...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Preset Prompt Suggestions */}
        <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] text-slate-400 uppercase font-bold shrink-0">Quick prompts:</span>
          {samplePrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              className="text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask RAVAN SHIPPING: 'Show today's sales' or 'Cancel order #ORD-1042'..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
}
