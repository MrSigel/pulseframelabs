"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, CheckCircle, Loader2 } from "lucide-react";

interface ChatMessage {
  id: number;
  dbId?: string;
  from: "user" | "system";
  text: string;
  time: string;
}

const SESSION_KEY = "pulseframe-chat-session";

const now = () =>
  new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

export default function LiveChatWidget() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"intro" | "chat">("intro");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [pulse, setPulse] = useState(true);
  const [sessionId, setSessionId] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const idRef = useRef(0);
  const lastPollRef = useRef<string | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (open && step === "chat") {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open, step]);

  // Stop pulse after first open
  useEffect(() => {
    if (open) setPulse(false);
  }, [open]);

  // Initialize session_id from localStorage
  useEffect(() => {
    let stored = localStorage.getItem(SESSION_KEY);
    if (!stored) {
      stored = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, stored);
    }
    setSessionId(stored);
  }, []);

  // Poll for support replies
  useEffect(() => {
    if (!open || step !== "chat" || !sessionId) return;

    let active = true;

    const poll = async () => {
      try {
        const params = new URLSearchParams({ sessionId });
        if (lastPollRef.current) params.set("after", lastPollRef.current);

        const res = await fetch(`/api/chat/poll?${params}`);
        if (!res.ok || !active) return;

        const { messages: msgs } = await res.json();
        if (msgs && msgs.length > 0) {
          for (const msg of msgs) {
            setMessages((prev) => {
              if (prev.some((m) => m.dbId === msg.id)) return prev;
              return [
                ...prev,
                {
                  id: ++idRef.current,
                  dbId: msg.id,
                  from: "system" as const,
                  text: msg.message,
                  time: new Date(msg.created_at).toLocaleTimeString("de-DE", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                },
              ];
            });
          }
          lastPollRef.current = msgs[msgs.length - 1].created_at;
        }
      } catch {
        // Silently ignore poll errors
      }
    };

    poll();
    const interval = setInterval(poll, 4000);
    return () => { active = false; clearInterval(interval); };
  }, [open, step, sessionId]);

  const addMessage = useCallback((from: "user" | "system", text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: ++idRef.current, from, text, time: now() },
    ]);
  }, []);

  const handleStartChat = () => {
    setStep("chat");
    addMessage(
      "system",
      `Hey${name ? ` ${name}` : ""}! 👋 How can we help you today? Just type your message and we'll get back to you shortly.`
    );
  };

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || sending) return;

    addMessage("user", trimmed);
    setMessage("");
    setSending(true);

    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message: trimmed, sessionId }),
      });

      if (res.ok) {
        addMessage(
          "system",
          "Message sent! \u2705 We'll reply shortly."
        );
      } else {
        addMessage(
          "system",
          "Sorry, there was an issue sending your message. Please try again or email us at contact@pulseframelabs.com"
        );
      }
    } catch {
      addMessage(
        "system",
        "Connection error. Please check your internet and try again."
      );
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Window */}
      <div
        style={{
          position: "fixed",
          bottom: "90px",
          right: "24px",
          width: "380px",
          maxWidth: "calc(100vw - 48px)",
          maxHeight: "520px",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(201,168,76,0.08)",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          transform: open ? "translateY(0) scale(1)" : "translateY(16px) scale(0.95)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease",
          background: "#0c0b10",
          border: "1px solid rgba(201,168,76,0.15)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            background: "linear-gradient(135deg, rgba(201,168,76,0.12), rgba(201,168,76,0.04))",
            borderBottom: "1px solid rgba(201,168,76,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #c9a84c, #e2cc7e)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MessageCircle size={18} style={{ color: "#09090b" }} />
            </div>
            <div>
              <div
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: "#f5f0e8",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Pulseframe Support
              </div>
              <div
                style={{
                  fontSize: "0.72rem",
                  color: "rgba(245,240,232,0.5)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#10b981",
                    display: "inline-block",
                  }}
                />
                Online
              </div>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "none",
              borderRadius: "8px",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "rgba(245,240,232,0.6)",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        {step === "intro" ? (
          /* Intro Form */
          <div style={{ padding: "24px 20px", flex: 1 }}>
            <p
              style={{
                fontSize: "0.88rem",
                color: "rgba(245,240,232,0.7)",
                marginBottom: "20px",
                lineHeight: "1.6",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Start a conversation with our support team. We typically respond within a few minutes.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(201,168,76,0.12)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  fontSize: "0.85rem",
                  color: "#f5f0e8",
                  outline: "none",
                  fontFamily: "'Inter', sans-serif",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.12)")}
              />
              <input
                type="email"
                placeholder="Email (optional, for replies)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(201,168,76,0.12)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  fontSize: "0.85rem",
                  color: "#f5f0e8",
                  outline: "none",
                  fontFamily: "'Inter', sans-serif",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.12)")}
              />
              <button
                onClick={handleStartChat}
                style={{
                  marginTop: "4px",
                  padding: "12px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #c9a84c, #e2cc7e)",
                  color: "#09090b",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  fontFamily: "'Inter', sans-serif",
                  border: "none",
                  cursor: "pointer",
                  letterSpacing: "0.04em",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Start Chat
              </button>
            </div>
          </div>
        ) : (
          /* Chat Messages */
          <>
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px 16px 8px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                minHeight: "240px",
                maxHeight: "320px",
              }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: msg.from === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "85%",
                      padding: "10px 14px",
                      borderRadius:
                        msg.from === "user"
                          ? "14px 14px 4px 14px"
                          : "14px 14px 14px 4px",
                      background:
                        msg.from === "user"
                          ? "linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.1))"
                          : "rgba(255,255,255,0.05)",
                      border:
                        msg.from === "user"
                          ? "1px solid rgba(201,168,76,0.2)"
                          : "1px solid rgba(255,255,255,0.06)",
                      fontSize: "0.84rem",
                      color: msg.from === "user" ? "#f5f0e8" : "rgba(245,240,232,0.8)",
                      lineHeight: "1.5",
                      fontFamily: "'Inter', sans-serif",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.text}
                  </div>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      color: "rgba(245,240,232,0.3)",
                      marginTop: "4px",
                      display: "flex",
                      alignItems: "center",
                      gap: "3px",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {msg.time}
                    {msg.from === "user" && (
                      <CheckCircle size={10} style={{ color: "rgba(201,168,76,0.5)" }} />
                    )}
                  </span>
                </div>
              ))}
              {sending && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 14px",
                    fontSize: "0.78rem",
                    color: "rgba(245,240,232,0.4)",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                  Sending...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div
              style={{
                padding: "12px 16px",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "flex-end",
                gap: "10px",
                flexShrink: 0,
              }}
            >
              <textarea
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                rows={1}
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(201,168,76,0.1)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  fontSize: "0.84rem",
                  color: "#f5f0e8",
                  outline: "none",
                  resize: "none",
                  fontFamily: "'Inter', sans-serif",
                  maxHeight: "80px",
                  lineHeight: "1.4",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.25)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.1)")}
              />
              <button
                onClick={handleSend}
                disabled={!message.trim() || sending}
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",
                  background:
                    message.trim() && !sending
                      ? "linear-gradient(135deg, #c9a84c, #e2cc7e)"
                      : "rgba(255,255,255,0.04)",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: message.trim() && !sending ? "pointer" : "default",
                  transition: "background 0.2s, opacity 0.2s",
                  flexShrink: 0,
                }}
              >
                <Send
                  size={16}
                  style={{
                    color: message.trim() && !sending ? "#09090b" : "rgba(245,240,232,0.3)",
                  }}
                />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open live chat"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "56px",
          height: "56px",
          borderRadius: "16px",
          background: "linear-gradient(135deg, #c9a84c, #e2cc7e)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 32px rgba(201,168,76,0.25), 0 2px 8px rgba(0,0,0,0.3)",
          zIndex: 9998,
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.08)";
          e.currentTarget.style.boxShadow =
            "0 12px 40px rgba(201,168,76,0.35), 0 4px 12px rgba(0,0,0,0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow =
            "0 8px 32px rgba(201,168,76,0.25), 0 2px 8px rgba(0,0,0,0.3)";
        }}
      >
        {open ? (
          <X size={24} style={{ color: "#09090b" }} />
        ) : (
          <MessageCircle size={24} style={{ color: "#09090b" }} />
        )}

        {/* Pulse animation when not yet opened */}
        {pulse && !open && (
          <span
            style={{
              position: "absolute",
              inset: "-4px",
              borderRadius: "20px",
              border: "2px solid rgba(201,168,76,0.4)",
              animation: "chatPulse 2s ease-in-out infinite",
            }}
          />
        )}
      </button>

      {/* Keyframes */}
      <style jsx global>{`
        @keyframes chatPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
