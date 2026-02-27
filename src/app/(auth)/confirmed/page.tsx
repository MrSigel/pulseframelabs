"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

export default function ConfirmedPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const auth = t.auth;
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ textAlign: "center", padding: "20px 0" }}
    >
      {/* Success icon with ring animation */}
      <div style={{ position: "relative", display: "inline-block", marginBottom: "28px" }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--gold), var(--gold-light, #e2cc7e))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 40px rgba(201, 168, 76, 0.25)",
          }}
        >
          <Check size={36} style={{ color: "var(--bg-primary, #09090b)" }} />
        </motion.div>

        {/* Expanding ring */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0.6 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            border: "2px solid var(--gold)",
          }}
        />
      </div>

      <h3
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "1.4rem",
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: "12px",
        }}
      >
        {auth.emailConfirmedTitle || "Email Confirmed"}
      </h3>

      <p style={{ fontSize: "0.85rem", color: "var(--text-tertiary)", lineHeight: 1.7, marginBottom: "24px" }}>
        {auth.emailConfirmedMessage || "Your account has been activated. You will be redirected to the dashboard."}
      </p>

      {/* Countdown redirect indicator */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "0.8rem",
          color: "var(--text-secondary)",
        }}
      >
        <Loader2 size={14} className="animate-spin" />
        {countdown > 0 ? `${countdown}...` : "Redirecting..."}
      </div>
    </motion.div>
  );
}
