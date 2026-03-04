/**
 * Record a video walkthrough of the dashboard (logged-in state).
 * Run: npx playwright test record-dashboard --project=chromium
 * Output: test-results/ folder contains the .webm video
 */
import { test } from "@playwright/test";

const EMAIL = "freelancer.enricofullstack@gmail.com";
const PASSWORD = "qweqwe123!";

const PAGES = [
  "/dashboard",
  "/wager",
  "/personal-bests",
  "/hotwords",
  "/slot-requests",
  "/spinner",
  "/bonushunts",
  "/tournaments",
  "/duel",
  "/chat",
  "/theme-settings",
  "/casino-management",
  "/promo-management",
  "/slideshow",
  "/bot",
  "/streamer-page",
  "/store",
  "/loyalty",
  "/points-battle",
  "/settings",
  "/wallet",
];

test.use({
  video: { mode: "on", size: { width: 1440, height: 900 } },
  viewport: { width: 1440, height: 900 },
});

// 5 minutes timeout for full walkthrough
test.setTimeout(300_000);

test("Dashboard video walkthrough", async ({ page }) => {
  // ── Login ──
  await page.goto("/login");
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(1500);

  await page.locator('input[type="email"], input[name="email"]').fill(EMAIL);
  await page.locator('input[type="password"], input[name="password"]').fill(PASSWORD);

  const loginBtn = page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Log In"), button:has-text("Anmelden")');
  await loginBtn.click();

  await page.waitForURL("**/dashboard**", { timeout: 15000 });
  await page.waitForTimeout(2500);

  // ── Navigate through all pages ──
  for (const pg of PAGES) {
    await page.goto(pg);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);

    // Smooth scroll to show full page
    await page.evaluate(async () => {
      const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 50) {
        for (let y = 0; y <= maxScroll; y += 250) {
          window.scrollTo({ top: y, behavior: "smooth" });
          await delay(120);
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
        await delay(400);
      }
    });

    await page.waitForTimeout(500);
  }

  // ── End on dashboard ──
  await page.goto("/dashboard");
  await page.waitForTimeout(2000);
});
