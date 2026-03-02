"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { userProfiles } from "@/lib/supabase/db";
import { useDbQuery } from "@/hooks/useDbQuery";
import { Loader2, ArrowRight, Check, User, DollarSign, Sparkles } from "lucide-react";
import type { UserProfile } from "@/lib/supabase/types";

const STEPS = ["welcome", "profile", "currency", "done"] as const;
type Step = (typeof STEPS)[number];

export function OnboardingWizard() {
  const { data: profile, loading } = useDbQuery<UserProfile | null>(
    () => userProfiles.get(),
    [],
  );

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("welcome");
  const [displayName, setDisplayName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [saving, setSaving] = useState(false);

  // Show wizard when profile is loaded and onboarding not completed
  useEffect(() => {
    if (!loading && profile && !profile.onboarding_completed) {
      setOpen(true);
      if (profile.display_name) setDisplayName(profile.display_name);
      if (profile.currency) setCurrency(profile.currency);
    }
  }, [loading, profile]);

  const stepIndex = STEPS.indexOf(step);

  async function handleNext() {
    if (step === "welcome") {
      setStep("profile");
    } else if (step === "profile") {
      setSaving(true);
      try {
        await userProfiles.update({ display_name: displayName || null });
      } catch (err) {
        console.error("Failed to save display name:", err);
      } finally {
        setSaving(false);
      }
      setStep("currency");
    } else if (step === "currency") {
      setSaving(true);
      try {
        await userProfiles.update({ currency });
      } catch (err) {
        console.error("Failed to save currency:", err);
      } finally {
        setSaving(false);
      }
      setStep("done");
    } else if (step === "done") {
      setSaving(true);
      try {
        await userProfiles.update({ onboarding_completed: true });
      } catch (err) {
        console.error("Failed to complete onboarding:", err);
      } finally {
        setSaving(false);
      }
      setOpen(false);
    }
  }

  // Don't render anything while loading or if onboarding is already done
  if (loading || !profile || profile.onboarding_completed) return null;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md border-primary/20 overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/5">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500 ease-out"
            style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        <div className="pt-2">
          {/* Step: Welcome */}
          {step === "welcome" && (
            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
                <Sparkles className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Welcome to Pulseframelabs</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Let&apos;s set up your dashboard in a few quick steps. You can always change these later in Settings.
                </p>
              </div>
              <Button className="w-full gap-2 py-5" onClick={handleNext}>
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Step: Profile */}
          {step === "profile" && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Your Display Name</h2>
                  <p className="text-xs text-muted-foreground">This is how you&apos;ll appear in the dashboard.</p>
                </div>
              </div>

              <div>
                <Label className="text-foreground font-semibold mb-2 block text-sm">Display Name</Label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your name"
                  autoFocus
                />
              </div>

              <Button
                className="w-full gap-2 py-5"
                onClick={handleNext}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Step: Currency */}
          {step === "currency" && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Your Currency</h2>
                  <p className="text-xs text-muted-foreground">Used in all overlays (Balance, Wager Bar, etc.)</p>
                </div>
              </div>

              <div>
                <Label className="text-foreground font-semibold mb-2 block text-sm">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">$ USD — US Dollar</SelectItem>
                    <SelectItem value="EUR">&euro; EUR — Euro</SelectItem>
                    <SelectItem value="GBP">&pound; GBP — British Pound</SelectItem>
                    <SelectItem value="CAD">$ CAD — Canadian Dollar</SelectItem>
                    <SelectItem value="AUD">$ AUD — Australian Dollar</SelectItem>
                    <SelectItem value="JPY">&yen; JPY — Japanese Yen</SelectItem>
                    <SelectItem value="CHF">Fr CHF — Swiss Franc</SelectItem>
                    <SelectItem value="SEK">kr SEK — Swedish Krona</SelectItem>
                    <SelectItem value="NOK">kr NOK — Norwegian Krone</SelectItem>
                    <SelectItem value="BRL">R$ BRL — Brazilian Real</SelectItem>
                    <SelectItem value="TRY">&lira; TRY — Turkish Lira</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full gap-2 py-5"
                onClick={handleNext}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Step: Done */}
          {step === "done" && (
            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                <Check className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">You&apos;re All Set!</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Your dashboard is ready. Connect your Twitch account on the Bot page to enable chat features.
                </p>
              </div>
              <Button
                variant="success"
                className="w-full gap-2 py-5"
                onClick={handleNext}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-1.5 mt-5">
            {STEPS.map((s, i) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i <= stepIndex
                    ? "bg-primary w-6"
                    : "bg-white/10 w-1.5"
                }`}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
