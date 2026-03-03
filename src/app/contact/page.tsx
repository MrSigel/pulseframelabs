"use client";

import dynamic from "next/dynamic";
import { useTheme } from "@/hooks/useTheme";
import { LanguageProvider } from "@/context/LanguageContext";
import { Mail, MessageCircle, Clock, Shield, User } from "lucide-react";

const Navigation = dynamic(() => import("@/components/landing/layout/Navigation"), { ssr: false });
const NoiseOverlay = dynamic(() => import("@/components/landing/layout/NoiseOverlay"), { ssr: false });
const Footer = dynamic(() => import("@/components/landing/layout/Footer"), { ssr: false });

function ContactContent() {
  const theme = useTheme();

  return (
    <LanguageProvider>
      <div data-theme={theme.theme}>
        <NoiseOverlay />
        <Navigation theme={theme} />

        <main style={{ minHeight: "100vh", paddingTop: "140px", paddingBottom: "80px" }}>
          <div className="container" style={{ maxWidth: "900px", margin: "0 auto" }}>
            {/* Page Header */}
            <div style={{ textAlign: "center", marginBottom: "64px" }}>
              <span
                className="text-label"
                style={{
                  display: "inline-block",
                  color: "var(--gold)",
                  marginBottom: "16px",
                  letterSpacing: "0.2em",
                }}
              >
                GET IN TOUCH
              </span>
              <h1
                className="text-display"
                style={{
                  background: "var(--gradient-primary)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  marginBottom: "20px",
                }}
              >
                Contact Us
              </h1>
              <p
                className="text-body"
                style={{
                  color: "var(--text-secondary)",
                  maxWidth: "600px",
                  margin: "0 auto",
                  lineHeight: "1.8",
                }}
              >
                Whether you need help setting up your stream, have questions about our platform,
                or want a personalized consultation — we&apos;re here for you.
              </p>
            </div>

            {/* Contact Cards Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "24px",
                marginBottom: "48px",
              }}
            >
              {/* Live Chat Card */}
              <div
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-gold)",
                  borderRadius: "16px",
                  padding: "32px",
                  position: "relative",
                  overflow: "hidden",
                  transition: "transform 0.3s, box-shadow 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "var(--shadow-glow-accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "3px",
                    background: "var(--gradient-gold)",
                  }}
                />
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "rgba(201, 168, 76, 0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "20px",
                  }}
                >
                  <MessageCircle size={24} style={{ color: "var(--gold)" }} />
                </div>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: "1.25rem",
                    color: "var(--text-primary)",
                    marginBottom: "12px",
                  }}
                >
                  Live Chat
                </h3>
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "var(--text-secondary)",
                    lineHeight: "1.7",
                    marginBottom: "16px",
                  }}
                >
                  Get instant help from our team. Click the chat icon in the bottom-right corner
                  of any page to start a conversation.
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "0.8rem",
                    color: "var(--gold)",
                    fontWeight: 600,
                  }}
                >
                  <Clock size={14} />
                  <span>Usually responds within minutes</span>
                </div>
              </div>

              {/* Email Card */}
              <div
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-gold)",
                  borderRadius: "16px",
                  padding: "32px",
                  position: "relative",
                  overflow: "hidden",
                  transition: "transform 0.3s, box-shadow 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "var(--shadow-glow-accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "3px",
                    background: "var(--gradient-gold)",
                  }}
                />
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "rgba(201, 168, 76, 0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "20px",
                  }}
                >
                  <Mail size={24} style={{ color: "var(--gold)" }} />
                </div>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: "1.25rem",
                    color: "var(--text-primary)",
                    marginBottom: "12px",
                  }}
                >
                  Email
                </h3>
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "var(--text-secondary)",
                    lineHeight: "1.7",
                    marginBottom: "16px",
                  }}
                >
                  For detailed inquiries, consultations, or anything that needs a longer explanation
                  — send us an email.
                </p>
                <a
                  href="mailto:contact@pulseframelabs.com"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "0.9rem",
                    color: "var(--gold)",
                    fontWeight: 600,
                    textDecoration: "none",
                    transition: "opacity 0.3s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  contact@pulseframelabs.com
                </a>
              </div>
            </div>

            {/* Important Info Box */}
            <div
              style={{
                background: "var(--gradient-subtle)",
                border: "1px solid var(--border-gold)",
                borderRadius: "16px",
                padding: "32px",
                marginBottom: "48px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "rgba(201, 168, 76, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                >
                  <User size={20} style={{ color: "var(--gold)" }} />
                </div>
                <div>
                  <h3
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: "1.1rem",
                      color: "var(--text-primary)",
                      marginBottom: "8px",
                    }}
                  >
                    Already have an account?
                  </h3>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--text-secondary)",
                      lineHeight: "1.7",
                    }}
                  >
                    If you already have a Pulseframelabs account and need support, please include your{" "}
                    <strong style={{ color: "var(--gold)" }}>streamer name</strong> in your message so we can
                    assist you faster. This helps us quickly locate your account and provide personalized help.
                  </p>
                </div>
              </div>
            </div>

            {/* What we can help with */}
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <h2
                className="text-heading"
                style={{
                  color: "var(--text-primary)",
                  marginBottom: "12px",
                }}
              >
                How can we help?
              </h2>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "var(--text-secondary)",
                  marginBottom: "32px",
                }}
              >
                Our team is ready to assist you with anything related to your streaming setup.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "16px",
                marginBottom: "48px",
              }}
            >
              {[
                { icon: "🎯", title: "Setup Assistance", desc: "Help configuring overlays, bots, and OBS integration" },
                { icon: "🎨", title: "Customization", desc: "Guidance on themes, branding, and widget styling" },
                { icon: "🔧", title: "Technical Support", desc: "Troubleshooting issues with your dashboard or stream" },
                { icon: "💡", title: "Consultation", desc: "Strategic advice on growing your streaming channel" },
              ].map((item) => (
                <div
                  key={item.title}
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "12px",
                    padding: "24px",
                    textAlign: "center",
                    transition: "border-color 0.3s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-gold)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
                >
                  <span style={{ fontSize: "1.8rem", display: "block", marginBottom: "12px" }}>
                    {item.icon}
                  </span>
                  <h4
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      marginBottom: "8px",
                    }}
                  >
                    {item.title}
                  </h4>
                  <p
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--text-secondary)",
                      lineHeight: "1.6",
                    }}
                  >
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Security note */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontSize: "0.78rem",
                color: "var(--text-tertiary)",
                letterSpacing: "0.05em",
              }}
            >
              <Shield size={14} />
              <span>Your data is encrypted and never shared with third parties.</span>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </LanguageProvider>
  );
}

export default function ContactPage() {
  return <ContactContent />;
}
