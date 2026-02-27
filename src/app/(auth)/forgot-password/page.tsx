"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { Check, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();
  const auth = t.auth;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Store redirect destination in cookie (avoids query params in redirect_to
      // which can cause Supabase redirect URL matching to fail)
      document.cookie = "sb-auth-next=/reset-password; path=/; max-age=3600; SameSite=Lax";

      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setSent(true);
      setLoading(false);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ textAlign: "center", padding: "20px 0" }}
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--gold), var(--gold-light, #e2cc7e))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            boxShadow: "0 8px 32px rgba(201, 168, 76, 0.2)",
          }}
        >
          <Check size={30} style={{ color: "var(--bg-primary, #09090b)" }} />
        </motion.div>

        <h3
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "1.3rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "12px",
          }}
        >
          {auth.resetEmailSentTitle || "Check your email"}
        </h3>

        <p style={{ fontSize: "0.85rem", color: "var(--text-tertiary)", lineHeight: 1.7, marginBottom: "8px" }}>
          {auth.resetEmailSentMessage || "If an account exists with this email, we sent a password reset link."}
        </p>

        <p
          style={{
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "var(--gold)",
            marginBottom: "24px",
          }}
        >
          {email}
        </p>

        <Link
          href="/login"
          style={{
            fontSize: "0.8rem",
            color: "var(--text-tertiary)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            transition: "color 0.3s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
        >
          <ArrowLeft size={14} />
          {auth.backToLogin || "Back to login"}
        </Link>
      </motion.div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h2
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "6px",
          }}
        >
          {auth.forgotPasswordTitle || "Forgot password?"}
        </h2>
        <p style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>
          {auth.forgotPasswordSubtitle || "Enter your email and we'll send you a reset link."}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              fontSize: "0.8rem",
              color: "#ef4444",
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.15)",
              borderRadius: "8px",
              padding: "10px 14px",
              marginBottom: "16px",
            }}
          >
            {error}
          </motion.div>
        )}

        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.75rem",
              fontWeight: 600,
              fontFamily: "var(--font-inter, 'Inter'), system-ui, sans-serif",
              color: "var(--text-secondary)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: "6px",
            }}
          >
            {auth.email || "Email"}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={auth.emailPlaceholder || "your@email.com"}
            required
            style={{
              width: "100%",
              padding: "11px 14px",
              fontSize: "0.85rem",
              fontFamily: "var(--font-inter, 'Inter'), system-ui, sans-serif",
              color: "var(--text-primary)",
              background: "var(--bg-card)",
              border: "1px solid var(--border-medium)",
              borderRadius: "8px",
              outline: "none",
              transition: "border-color 0.3s, box-shadow 0.3s",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--border-gold)";
              e.target.style.boxShadow = "0 0 0 3px rgba(201, 168, 76, 0.06)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--border-medium)";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={loading ? {} : { scale: 1.01 }}
          whileTap={loading ? {} : { scale: 0.98 }}
          style={{
            width: "100%",
            padding: "13px 0",
            fontSize: "0.8rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            border: "none",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
            background: loading
              ? "rgba(201, 168, 76, 0.15)"
              : "linear-gradient(135deg, var(--gold), var(--gold-light, #e2cc7e))",
            color: loading ? "var(--gold)" : "var(--bg-primary, #09090b)",
            transition: "all 0.3s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            marginTop: "8px",
          }}
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading
            ? (auth.sendingResetLink || "Sending...")
            : (auth.sendResetLink || "Send reset link")}
        </motion.button>
      </form>

      <p
        style={{
          textAlign: "center",
          fontSize: "0.8rem",
          color: "var(--text-tertiary)",
          marginTop: "20px",
        }}
      >
        <Link
          href="/login"
          style={{
            color: "var(--gold)",
            textDecoration: "none",
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <ArrowLeft size={14} />
          {auth.backToLogin || "Back to login"}
        </Link>
      </p>
    </div>
  );
}
