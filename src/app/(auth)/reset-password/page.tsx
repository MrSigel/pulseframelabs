"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { Check, X, Loader2, Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useLanguage();
  const auth = t.auth;

  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!hasMinLength) {
      setError(auth.passwordTooShort || "Password must be at least 8 characters.");
      setLoading(false);
      return;
    }
    if (!hasNumber) {
      setError(auth.passwordNoNumber || "Password must contain at least one number.");
      setLoading(false);
      return;
    }
    if (!hasSpecial) {
      setError(auth.passwordNoSpecial || "Password must contain at least one special character.");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError(auth.passwordMismatch || "Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 3000);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ textAlign: "center", padding: "20px 0" }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
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
          {auth.passwordResetSuccess || "Password updated"}
        </h3>

        <p style={{ fontSize: "0.85rem", color: "var(--text-tertiary)", lineHeight: 1.7 }}>
          {auth.passwordResetSuccessMessage || "Your password has been changed. Redirecting to dashboard..."}
        </p>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "0.8rem",
            color: "var(--text-secondary)",
            marginTop: "16px",
          }}
        >
          <Loader2 size={14} className="animate-spin" />
        </div>
      </motion.div>
    );
  }

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.75rem",
    fontWeight: 600,
    fontFamily: "var(--font-inter, 'Inter'), system-ui, sans-serif",
    color: "var(--text-secondary)",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: "6px",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "11px 42px 11px 14px",
    fontSize: "0.85rem",
    fontFamily: "var(--font-inter, 'Inter'), system-ui, sans-serif",
    color: "var(--text-primary)",
    background: "var(--bg-card)",
    border: "1px solid var(--border-medium)",
    borderRadius: "8px",
    outline: "none",
    transition: "border-color 0.3s, box-shadow 0.3s",
  };

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
          {auth.resetPasswordTitle || "Set new password"}
        </h2>
        <p style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>
          {auth.resetPasswordSubtitle || "Choose a strong new password for your account."}
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

        {/* New password */}
        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>{auth.newPassword || "New password"}</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--border-gold)";
                e.target.style.boxShadow = "0 0 0 3px rgba(201, 168, 76, 0.06)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--border-medium)";
                e.target.style.boxShadow = "none";
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-tertiary)",
                display: "flex",
                padding: 0,
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Password requirements */}
        {password.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "-8px",
              marginBottom: "16px",
              flexWrap: "wrap",
            }}
          >
            {[
              { met: hasMinLength, label: "8+" },
              { met: hasNumber, label: "123" },
              { met: hasSpecial, label: "!@#" },
            ].map(({ met, label }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.7rem",
                  color: met ? "rgba(16, 185, 129, 0.8)" : "var(--text-tertiary)",
                  transition: "color 0.3s",
                }}
              >
                {met ? <Check size={12} /> : <X size={12} />}
                {label}
              </div>
            ))}
          </motion.div>
        )}

        {/* Confirm password */}
        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>{auth.confirmPassword || "Confirm password"}</label>
          <div style={{ position: "relative" }}>
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--border-gold)";
                e.target.style.boxShadow = "0 0 0 3px rgba(201, 168, 76, 0.06)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--border-medium)";
                e.target.style.boxShadow = "none";
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-tertiary)",
                display: "flex",
                padding: 0,
              }}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
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
            ? (auth.updatingPassword || "Updating...")
            : (auth.updatePassword || "Update password")}
        </motion.button>
      </form>
    </div>
  );
}
