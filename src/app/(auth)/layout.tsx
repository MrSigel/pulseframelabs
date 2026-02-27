"use client";

import { LanguageProvider, useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/hooks/useTheme";
import AnimatedBackground3D from "@/components/landing/background/AnimatedBackground3D";
import NoiseOverlay from "@/components/landing/layout/NoiseOverlay";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import Link from "next/link";

/* ── Animated Divider ──────────────────────────────────── */
function AnimatedDivider({ isDark }: { isDark: boolean }) {
  const goldColor = isDark ? "201, 168, 76" : "139, 109, 31";

  return (
    <div
      className="hidden lg:block"
      style={{
        position: "relative",
        width: "1px",
        zIndex: 3,
        alignSelf: "stretch",
      }}
    >
      {/* Static line */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg, transparent 0%, rgba(${goldColor}, 0.2) 20%, rgba(${goldColor}, 0.3) 50%, rgba(${goldColor}, 0.2) 80%, transparent 100%)`,
        }}
      />

      {/* Traveling light - goes down */}
      <motion.div
        animate={{ top: ["-10%", "110%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute",
          left: "-1px",
          width: "3px",
          height: "80px",
          background: `linear-gradient(180deg, transparent, rgba(${goldColor}, 0.6), rgba(${goldColor}, 0.9), rgba(${goldColor}, 0.6), transparent)`,
          borderRadius: "2px",
          filter: `drop-shadow(0 0 6px rgba(${goldColor}, 0.4))`,
        }}
      />

      {/* Traveling light - goes up (offset) */}
      <motion.div
        animate={{ bottom: ["-10%", "110%"] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear", delay: 2 }}
        style={{
          position: "absolute",
          left: "-0.5px",
          width: "2px",
          height: "50px",
          background: `linear-gradient(180deg, transparent, rgba(${goldColor}, 0.4), rgba(${goldColor}, 0.7), rgba(${goldColor}, 0.4), transparent)`,
          borderRadius: "2px",
          filter: `drop-shadow(0 0 4px rgba(${goldColor}, 0.3))`,
        }}
      />

      {/* Gold dots at intervals */}
      {[15, 35, 50, 65, 85].map((pos, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.2, 0.7, 0.2], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
          style={{
            position: "absolute",
            top: `${pos}%`,
            left: "-2px",
            width: "5px",
            height: "5px",
            borderRadius: "50%",
            background: `rgba(${goldColor}, 0.5)`,
            boxShadow: `0 0 8px rgba(${goldColor}, 0.3)`,
          }}
        />
      ))}

      {/* Glow spread */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          bottom: "20%",
          left: "-15px",
          width: "30px",
          background: `radial-gradient(ellipse at center, rgba(${goldColor}, 0.04) 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

/* ── Main Layout ───────────────────────────────────────── */
function AuthLayoutInner({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const theme = useTheme();
  const auth = t.auth || {};
  const isDark = theme.isDark;

  // Theme-adaptive colors for the left panel
  const panelBg = isDark
    ? "linear-gradient(180deg, rgba(9, 9, 11, 0.92) 0%, rgba(15, 14, 18, 0.95) 50%, rgba(9, 9, 11, 0.92) 100%)"
    : "linear-gradient(180deg, rgba(250, 248, 244, 0.92) 0%, rgba(243, 240, 234, 0.95) 50%, rgba(250, 248, 244, 0.92) 100%)";

  const glowColor = isDark ? "201, 168, 76" : "139, 109, 31";

  const videoBg = isDark
    ? "linear-gradient(135deg, rgba(15, 14, 18, 0.8) 0%, rgba(20, 18, 26, 0.6) 50%, rgba(15, 14, 18, 0.8) 100%)"
    : "linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(243, 240, 234, 0.5) 50%, rgba(255, 255, 255, 0.7) 100%)";

  const videoShadow = isDark
    ? "0 24px 80px rgba(0, 0, 0, 0.4), 0 0 80px rgba(201, 168, 76, 0.04), inset 0 1px 0 rgba(255,255,255,0.03)"
    : "0 24px 80px rgba(0, 0, 0, 0.06), 0 0 80px rgba(139, 109, 31, 0.04), inset 0 1px 0 rgba(255,255,255,0.5)";

  const cornerColor = isDark ? "rgba(201,168,76,0.15)" : "rgba(139,109,31,0.2)";

  return (
    <div data-theme={theme.theme} style={{ minHeight: "100vh", display: "flex", position: "relative" }}>
      <AnimatedBackground3D />
      <NoiseOverlay />

      {/* Left Side — Auth Form (30%) */}
      <div
        className="w-full lg:w-[30%] lg:min-w-[420px]"
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          position: "relative",
          zIndex: 2,
          background: panelBg,
          backdropFilter: "blur(40px) saturate(1.2)",
          WebkitBackdropFilter: "blur(40px) saturate(1.2)",
          transition: "background 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Top glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "300px",
            pointerEvents: "none",
            background: `radial-gradient(ellipse at 50% 0%, rgba(${glowColor}, 0.06) 0%, transparent 70%)`,
          }}
        />

        {/* Bottom glow */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "200px",
            pointerEvents: "none",
            background: `radial-gradient(ellipse at 50% 100%, rgba(${glowColor}, 0.03) 0%, transparent 70%)`,
          }}
        />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: "relative", padding: "32px 32px 8px" }}
        >
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-playfair, 'Playfair Display'), Georgia, serif",
              fontWeight: 700,
              fontSize: "1.15rem",
              letterSpacing: "0.02em",
              color: "var(--text-primary)",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Pulseframelabs
          </Link>
        </motion.div>

        {/* Form Content */}
        <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px" }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: "100%", maxWidth: "380px" }}
          >
            {children}
          </motion.div>
        </div>

        {/* Back to home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          style={{ position: "relative", padding: "24px 32px", textAlign: "center" }}
        >
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-inter, 'Inter'), system-ui, sans-serif",
              fontSize: "0.72rem",
              color: "var(--text-tertiary)",
              textDecoration: "none",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              transition: "color 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
          >
            &larr; {auth.backToHome}
          </Link>
        </motion.div>
      </div>

      {/* Animated Divider */}
      <AnimatedDivider isDark={isDark} />

      {/* Right Side — Video (70%) */}
      <div
        className="hidden lg:flex"
        style={{
          flex: 1,
          position: "relative",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          zIndex: 1,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: "720px", padding: "0 48px" }}
        >
          <div
            style={{
              position: "relative",
              borderRadius: "16px",
              overflow: "hidden",
              aspectRatio: "16/9",
              background: videoBg,
              border: "1px solid var(--border-gold)",
              boxShadow: videoShadow,
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              transition: "background 0.8s, box-shadow 0.8s, border-color 0.8s",
            }}
          >
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  position: "relative",
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, rgba(${glowColor}, 0.15), rgba(${glowColor}, 0.04))`,
                  border: `1px solid rgba(${glowColor}, 0.2)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Play
                  style={{ width: 30, height: 30, color: "var(--gold)", marginLeft: 4 }}
                  fill={`rgba(${glowColor}, 0.25)`}
                />
              </motion.div>

              {[0, 0.8, 1.6].map((delay, i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.15, 0, 0.15] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay }}
                  style={{
                    position: "absolute",
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    border: `1px solid rgba(${glowColor}, 0.1)`,
                  }}
                />
              ))}
            </div>

            {/* Scanlines */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                opacity: isDark ? 0.015 : 0.008,
                backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.02) 2px, rgba(0,0,0,0.02) 4px)",
              }}
            />

            {/* Corner accents */}
            {[
              { top: "12px", left: "12px", borderTop: `1px solid ${cornerColor}`, borderLeft: `1px solid ${cornerColor}` },
              { top: "12px", right: "12px", borderTop: `1px solid ${cornerColor}`, borderRight: `1px solid ${cornerColor}` },
              { bottom: "12px", left: "12px", borderBottom: `1px solid ${cornerColor}`, borderLeft: `1px solid ${cornerColor}` },
              { bottom: "12px", right: "12px", borderBottom: `1px solid ${cornerColor}`, borderRight: `1px solid ${cornerColor}` },
            ].map((style, i) => (
              <div key={i} style={{ position: "absolute", width: "20px", height: "20px", ...style } as React.CSSProperties} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            style={{ textAlign: "center", marginTop: "32px" }}
          >
            <h3
              style={{
                fontFamily: "var(--font-playfair, 'Playfair Display'), Georgia, serif",
                fontSize: "1.3rem",
                fontWeight: 600,
                color: "var(--text-primary)",
                marginBottom: "10px",
                letterSpacing: "-0.01em",
              }}
            >
              {auth.videoTitle}
            </h3>
            <p
              style={{
                fontFamily: "var(--font-inter, 'Inter'), system-ui, sans-serif",
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
                lineHeight: 1.7,
                maxWidth: "400px",
                margin: "0 auto",
              }}
            >
              {auth.videoSubtitle}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <AuthLayoutInner>{children}</AuthLayoutInner>
    </LanguageProvider>
  );
}
