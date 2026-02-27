"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Check, X, Loader2 } from "lucide-react";
import Link from "next/link";

interface AuthFormsProps {
  initialMode: "login" | "register";
}

export function AuthForms({ initialMode }: AuthFormsProps) {
  return (
    <Suspense fallback={null}>
      <AuthFormsInner initialMode={initialMode} />
    </Suspense>
  );
}

function AuthFormsInner({ initialMode }: AuthFormsProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const { t } = useLanguage();
  const auth = t.auth;

  return (
    <div>
      {/* Tabs */}
      <div
        className="flex mb-8 rounded-lg overflow-hidden"
        style={{
          background: "var(--bg-card, rgba(255, 255, 255, 0.03))",
          border: "1px solid var(--border-medium, rgba(255, 255, 255, 0.06))",
        }}
      >
        <button
          onClick={() => setMode("login")}
          style={{
            flex: 1,
            padding: "12px 0",
            fontSize: "0.8rem",
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            borderBottom: mode === "login" ? "2px solid var(--gold)" : "2px solid transparent",
            cursor: "pointer",
            transition: "all 0.3s ease",
            background: mode === "login"
              ? "linear-gradient(135deg, rgba(201, 168, 76, 0.12), rgba(201, 168, 76, 0.06))"
              : "transparent",
            color: mode === "login" ? "var(--gold)" : "var(--text-tertiary)",
          }}
        >
          {auth.loginTab}
        </button>
        <button
          onClick={() => setMode("register")}
          style={{
            flex: 1,
            padding: "12px 0",
            fontSize: "0.8rem",
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            borderBottom: mode === "register" ? "2px solid var(--gold)" : "2px solid transparent",
            cursor: "pointer",
            transition: "all 0.3s ease",
            background: mode === "register"
              ? "linear-gradient(135deg, rgba(201, 168, 76, 0.12), rgba(201, 168, 76, 0.06))"
              : "transparent",
            color: mode === "register" ? "var(--gold)" : "var(--text-tertiary)",
          }}
        >
          {auth.registerTab}
        </button>
      </div>

      {/* Forms */}
      <AnimatePresence mode="wait">
        {mode === "login" ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            <LoginFormContent
              auth={auth}
              onSwitch={() => setMode("register")}
            />
          </motion.div>
        ) : (
          <motion.div
            key="register"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            <RegisterFormContent
              auth={auth}
              onSwitch={() => setMode("login")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Shared styles ─────────────────────────────────────── */

const inputStyle: React.CSSProperties = {
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
};

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

function StyledInput({
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  label,
  showToggle,
}: {
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  label: string;
  showToggle?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const actualType = isPassword && showPassword ? "text" : type;

  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={actualType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            ...inputStyle,
            borderColor: focused ? "var(--border-gold)" : "var(--border-medium)",
            boxShadow: focused ? "0 0 0 3px rgba(201, 168, 76, 0.06)" : "none",
            paddingRight: isPassword && showToggle ? "42px" : "14px",
          }}
        />
        {isPassword && showToggle && (
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
        )}
      </div>
    </div>
  );
}

function SubmitButton({
  loading,
  label,
  loadingLabel,
}: {
  loading: boolean;
  label: string;
  loadingLabel: string;
}) {
  return (
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
      {loading ? loadingLabel : label}
    </motion.button>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
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
      {message}
    </motion.div>
  );
}

/* ── Login Form ────────────────────────────────────────── */

function LoginFormContent({
  auth,
  onSwitch,
}: {
  auth: Record<string, string>;
  onSwitch: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Show error from callback redirect (expired link, etc.)
  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError === "confirmation_expired") {
      setError(auth.confirmationExpired || "Confirmation link expired. Please register again.");
    } else if (urlError === "auth_callback_failed") {
      setError(auth.callbackFailed || "Authentication failed. Please try again.");
    }
  }, [searchParams, auth]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div>
      {/* Header */}
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
          {auth.loginTitle}
        </h2>
        <p style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>
          {auth.loginSubtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <ErrorMessage message={error} />}

        <StyledInput
          type="email"
          value={email}
          onChange={setEmail}
          placeholder={auth.emailPlaceholder}
          required
          label={auth.email}
        />

        <StyledInput
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          required
          label={auth.password}
          showToggle
        />

        {/* Forgot password link */}
        <div style={{ textAlign: "right", marginTop: "-4px", marginBottom: "12px" }}>
          <Link
            href="/forgot-password"
            style={{
              fontSize: "0.75rem",
              color: "var(--text-tertiary)",
              textDecoration: "none",
              transition: "color 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
          >
            {auth.forgotPassword || "Forgot password?"}
          </Link>
        </div>

        <SubmitButton
          loading={loading}
          label={auth.signInButton}
          loadingLabel={auth.signingIn}
        />
      </form>

      <p
        style={{
          textAlign: "center",
          fontSize: "0.8rem",
          color: "var(--text-tertiary)",
          marginTop: "20px",
        }}
      >
        {auth.noAccount}{" "}
        <button
          onClick={onSwitch}
          style={{
            background: "none",
            border: "none",
            color: "var(--gold)",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.8rem",
            padding: 0,
          }}
        >
          {auth.registerTab}
        </button>
      </p>
    </div>
  );
}

/* ── Register Form ─────────────────────────────────────── */

function PasswordRequirement({
  met,
  label,
}: {
  met: boolean;
  label: string;
}) {
  return (
    <div
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
  );
}

function RegisterFormContent({
  auth,
  onSwitch,
}: {
  auth: Record<string, string>;
  onSwitch: () => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (email !== confirmEmail) {
      setError(auth.emailMismatch);
      setLoading(false);
      return;
    }

    if (!hasMinLength) {
      setError(auth.passwordTooShort);
      setLoading(false);
      return;
    }

    if (!hasNumber) {
      setError(auth.passwordNoNumber);
      setLoading(false);
      return;
    }

    if (!hasSpecial) {
      setError(auth.passwordNoSpecial);
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError(auth.passwordMismatch);
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      // If email confirmation is required, user session will be null
      if (data.user && !data.session) {
        setSuccess(true);
        setLoading(false);
        return;
      }

      // If auto-confirmed (email confirmation disabled), redirect
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (success) {
    return (
      <EmailConfirmationView auth={auth} email={email} />
    );
  }

  return (
    <div>
      {/* Header */}
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
          {auth.registerTitle}
        </h2>
        <p style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>
          {auth.registerSubtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <ErrorMessage message={error} />}

        <StyledInput
          value={firstName}
          onChange={setFirstName}
          placeholder={auth.firstNamePlaceholder}
          required
          label={auth.firstName}
        />

        <StyledInput
          type="email"
          value={email}
          onChange={setEmail}
          placeholder={auth.emailPlaceholder}
          required
          label={auth.email}
        />

        <StyledInput
          type="email"
          value={confirmEmail}
          onChange={setConfirmEmail}
          placeholder={auth.confirmEmailPlaceholder}
          required
          label={auth.confirmEmail}
        />

        <StyledInput
          type="password"
          value={password}
          onChange={setPassword}
          placeholder={auth.passwordPlaceholder}
          required
          label={auth.password}
          showToggle
        />

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
            <PasswordRequirement met={hasMinLength} label="8+" />
            <PasswordRequirement met={hasNumber} label="123" />
            <PasswordRequirement met={hasSpecial} label="!@#" />
          </motion.div>
        )}

        <StyledInput
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder={auth.confirmPasswordPlaceholder}
          required
          label={auth.confirmPassword}
          showToggle
        />

        <SubmitButton
          loading={loading}
          label={auth.createAccountButton}
          loadingLabel={auth.creatingAccount}
        />
      </form>

      <p
        style={{
          textAlign: "center",
          fontSize: "0.8rem",
          color: "var(--text-tertiary)",
          marginTop: "20px",
        }}
      >
        {auth.hasAccount}{" "}
        <button
          onClick={onSwitch}
          style={{
            background: "none",
            border: "none",
            color: "var(--gold)",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.8rem",
            padding: 0,
          }}
        >
          {auth.loginTab}
        </button>
      </p>
    </div>
  );
}

/* ── Email Confirmation View ──────────────────────────── */

function EmailConfirmationView({
  auth,
  email,
}: {
  auth: Record<string, string>;
  email: string;
}) {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  async function handleResend() {
    setResending(true);
    setResendError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setResendError(error.message);
      } else {
        setResent(true);
      }
    } catch {
      setResendError("Failed to resend. Please try again.");
    }
    setResending(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ textAlign: "center", padding: "20px 0" }}
    >
      {/* Animated icon */}
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
        {auth.checkEmailTitle || "Check your email"}
      </h3>

      <p style={{ fontSize: "0.85rem", color: "var(--text-tertiary)", lineHeight: 1.7, marginBottom: "8px" }}>
        {auth.checkEmailMessage || "We sent a confirmation link to your email. Please check your inbox and click the link to activate your account."}
      </p>

      {/* Show the email address */}
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

      {/* Resend button */}
      {resent ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            fontSize: "0.8rem",
            color: "rgba(16, 185, 129, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          <Check size={14} />
          {auth.resendSuccess || "Email sent again!"}
        </motion.p>
      ) : (
        <button
          onClick={handleResend}
          disabled={resending}
          style={{
            background: "none",
            border: "1px solid var(--border-medium)",
            borderRadius: "8px",
            padding: "10px 20px",
            fontSize: "0.8rem",
            fontWeight: 600,
            color: "var(--text-secondary)",
            cursor: resending ? "not-allowed" : "pointer",
            transition: "all 0.3s",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            opacity: resending ? 0.5 : 1,
          }}
        >
          {resending && <Loader2 size={14} className="animate-spin" />}
          {resending
            ? (auth.resending || "Sending...")
            : (auth.resendEmail || "Resend email")}
        </button>
      )}

      {resendError && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ fontSize: "0.8rem", color: "#ef4444", marginTop: "12px" }}
        >
          {resendError}
        </motion.p>
      )}
    </motion.div>
  );
}
