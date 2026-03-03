"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { StoreItem } from "@/lib/supabase/types";

interface PurchaseModalProps {
  item: StoreItem;
  currency: string;
  accent: string;
  streamerUserId: string;
  onClose: () => void;
}

export function PurchaseModal({ item, currency, accent, streamerUserId, onClose }: PurchaseModalProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"input" | "loading" | "success" | "error">("input");
  const [errorMsg, setErrorMsg] = useState("");
  const [remainingPoints, setRemainingPoints] = useState<number | null>(null);

  async function handlePurchase() {
    if (!username.trim()) return;
    if (item.email_required && !email.trim()) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/public/store/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_id: item.id,
          viewer_username: username.trim(),
          streamer_user_id: streamerUserId,
          viewer_email: email.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setRemainingPoints(data.remaining_points);
        setStatus("success");
      } else {
        setErrorMsg(data.error || "Purchase failed");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(8px)",
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          style={{
            background: "#1a1d25",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            width: "100%",
            maxWidth: "420px",
            margin: "0 16px",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "20px 24px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "white", margin: 0 }}>
              Purchase Item
            </h3>
            <button
              onClick={onClose}
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
                color: "rgba(255,255,255,0.4)",
                fontSize: "18px",
              }}
            >
              &times;
            </button>
          </div>

          {/* Item summary */}
          <div
            style={{
              padding: "16px 24px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.name}
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "10px",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "10px",
                  background: `${accent}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  fontWeight: 700,
                  color: `${accent}60`,
                }}
              >
                {item.name.charAt(0)}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "white" }}>
                {item.name}
              </div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: accent }}>
                {item.price_points} {currency}
              </div>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: "20px 24px" }}>
            {status === "input" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.5)",
                      marginBottom: "6px",
                    }}
                  >
                    Your Username *
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your Twitch username"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(255,255,255,0.04)",
                      color: "white",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = accent; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                  />
                </div>

                {item.email_required && (
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "rgba(255,255,255,0.5)",
                        marginBottom: "6px",
                      }}
                    >
                      Your Email *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: "1px solid rgba(255,255,255,0.1)",
                        background: "rgba(255,255,255,0.04)",
                        color: "white",
                        fontSize: "14px",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = accent; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                    />
                  </div>
                )}

                <button
                  onClick={handlePurchase}
                  disabled={!username.trim() || (item.email_required && !email.trim())}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "10px",
                    border: "none",
                    background: accent,
                    color: "#0b0e14",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: !username.trim() ? "not-allowed" : "pointer",
                    opacity: !username.trim() ? 0.5 : 1,
                    transition: "opacity 0.2s",
                    marginTop: "4px",
                  }}
                >
                  Buy for {item.price_points} {currency}
                </button>
              </div>
            )}

            {status === "loading" && (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    border: "3px solid rgba(255,255,255,0.1)",
                    borderTopColor: accent,
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                    margin: "0 auto 12px",
                  }}
                />
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", margin: 0 }}>
                  Processing purchase...
                </p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {status === "success" && (
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: `${accent}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px",
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={accent}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p style={{ color: "white", fontSize: "16px", fontWeight: 700, margin: "0 0 4px" }}>
                  Purchase Successful!
                </p>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", margin: 0 }}>
                  {remainingPoints !== null && `Remaining points: ${remainingPoints}`}
                </p>
                <button
                  onClick={onClose}
                  style={{
                    marginTop: "16px",
                    padding: "10px 24px",
                    borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.04)",
                    color: "white",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
            )}

            {status === "error" && (
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "rgba(239,68,68,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px",
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </div>
                <p style={{ color: "#ef4444", fontSize: "14px", fontWeight: 600, margin: "0 0 4px" }}>
                  {errorMsg}
                </p>
                <button
                  onClick={() => setStatus("input")}
                  style={{
                    marginTop: "12px",
                    padding: "10px 24px",
                    borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.04)",
                    color: "white",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
