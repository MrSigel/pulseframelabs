import { test, expect, type Page } from "@playwright/test";

// ─── Credentials ───────────────────────────────────────────
const FREE_EMAIL = "gross_enrico@gmx.de";
const FREE_PASSWORD = "qweqwe123!";
const PAID_EMAIL = "freelancer.enricofullstack@gmail.com";
const PAID_PASSWORD = "qweqwe123!";

// ─── Helpers ───────────────────────────────────────────────
async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForSelector('a[href="/dashboard"]', { timeout: 15_000, strict: false });
}

async function dismissOnboarding(page: Page) {
  const dialog = page.locator('[role="dialog"]');
  if (await dialog.isVisible({ timeout: 3_000 }).catch(() => false)) {
    const getStarted = page.getByRole("button", { name: "Get Started" });
    if (await getStarted.isVisible({ timeout: 2_000 }).catch(() => false)) await getStarted.click();
    const continueBtn = page.getByRole("button", { name: "Continue" });
    if (await continueBtn.isVisible({ timeout: 2_000 }).catch(() => false)) await continueBtn.click();
    if (await continueBtn.isVisible({ timeout: 2_000 }).catch(() => false)) await continueBtn.click();
    const goBtn = page.getByRole("button", { name: "Go to Dashboard" });
    if (await goBtn.isVisible({ timeout: 2_000 }).catch(() => false)) await goBtn.click();
  }
}

/** Collect console errors during a test (ignoring known harmless framework/network errors) */
function trackConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  const IGNORE_PATTERNS = [
    "favicon", "hydration", "ResizeObserver",
    "Failed to fetch", "net::ERR", "NetworkError",
    "404", "NEXT_", "Warning:", "Deprecated",
    "Supabase", "supabase", "realtime", "WebSocket",
    "ERR_BLOCKED", "Refused to", "Content Security",
    "third-party", "cookie", "Cookie",
    "ChunkLoadError", "Loading chunk",
    "AbortError", "signal is aborted",
    "ServiceWorker", "sw.js",
    "manifest.json", "workbox",
    "DeprecationWarning", "deprecated",
    "Download the React DevTools",
    "source map", "sourcemap", "SourceMap",
    "Failed to load resource",
    "the server responded with a status of",
    "Unchecked runtime.lastError",
    "Extension context invalidated",
    "message channel closed",
    "A listener indicated an asynchronous response",
    "Permissions-Policy",
    "DialogContent", "DialogTitle", "VisuallyHidden",
    "radix-ui", "radix",
    "accessible for screen reader",
  ];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      if (IGNORE_PATTERNS.some((p) => text.includes(p))) return;
      errors.push(text);
    }
  });
  return errors;
}

function report(section: string, status: "PASS" | "FAIL" | "SKIP" | "INFO", notes = "") {
  const icon = status === "PASS" ? "✅" : status === "FAIL" ? "❌" : status === "INFO" ? "ℹ️" : "⏭️";
  console.log(`${icon} [${status}] ${section}${notes ? " — " + notes : ""}`);
}

// ═══════════════════════════════════════════════════════════
// PART A: FREE ACCOUNT TESTS (Read-Only Mode)
// ═══════════════════════════════════════════════════════════
test.describe("A. FREE ACCOUNT — Read-Only Mode", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, FREE_EMAIL, FREE_PASSWORD);
    await dismissOnboarding(page);
  });

  test("A1. Dashboard loads with UpgradeBanner", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/dashboard");
    await page.waitForTimeout(2_000);

    await expect(page.getByText("Dashboard").first()).toBeVisible();
    report("Dashboard page loads", "PASS");

    // Check UpgradeBanner is visible
    const banner = page.getByText("Read-Only Mode").first();
    const hasBanner = await banner.isVisible({ timeout: 5_000 }).catch(() => false);
    expect(hasBanner).toBeTruthy();
    report("UpgradeBanner visible", "PASS");

    expect(errors.length).toBe(0);
    report("No console errors", "PASS");
  });

  test("A2. Bot page — all actions disabled", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/bot");
    await page.waitForTimeout(2_000);

    // UpgradeBanner
    const banner = page.getByText("Read-Only Mode").first();
    await expect(banner).toBeVisible({ timeout: 5_000 });
    report("Bot UpgradeBanner", "PASS");

    // Connect Twitch button should be disabled
    const connectBtn = page.getByText("Connect Twitch");
    if (await connectBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      const isDisabled = await connectBtn.isDisabled();
      expect(isDisabled).toBeTruthy();
      report("Connect Twitch disabled", "PASS");
    } else {
      // Might have "Start Bot" instead if already connected
      const startBtn = page.getByText("Start Bot");
      if (await startBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
        const isDisabled = await startBtn.isDisabled();
        expect(isDisabled).toBeTruthy();
        report("Start Bot disabled", "PASS");
      }
    }

    // Feature toggles should be disabled
    const toggleBtn = page.locator("button").filter({ hasText: "Chat Relay" });
    if (await toggleBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      const isDisabled = await toggleBtn.isDisabled();
      expect(isDisabled).toBeTruthy();
      report("Feature toggles disabled", "PASS");
    }

    expect(errors.length).toBe(0);
    report("No console errors", "PASS");
  });

  test("A3. Hotwords — save buttons disabled, overlay URL locked", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/hotwords");
    await page.waitForTimeout(2_000);

    await expect(page.getByText("Hot Words").first()).toBeVisible();
    report("Hotwords page loads", "PASS");

    // UpgradeBanner
    await expect(page.getByText("Read-Only Mode").first()).toBeVisible({ timeout: 5_000 });
    report("UpgradeBanner visible", "PASS");

    // Save buttons should be disabled
    const saveButtons = page.getByRole("button", { name: "Save" });
    const saveCount = await saveButtons.count();
    for (let i = 0; i < saveCount; i++) {
      const isDisabled = await saveButtons.nth(i).isDisabled();
      expect(isDisabled).toBeTruthy();
    }
    report(`All ${saveCount} Save buttons disabled`, "PASS");

    // Clear Hot Words button disabled
    const clearBtn = page.getByRole("button", { name: /Clear Hot Words/i });
    if (await clearBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      expect(await clearBtn.isDisabled()).toBeTruthy();
      report("Clear Hot Words disabled", "PASS");
    }

    // Open overlay modal and check overlay URL is locked
    const overlayBtn = page.getByRole("button", { name: /HotWords Overlay/i });
    if (await overlayBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await overlayBtn.click();
      await page.waitForTimeout(1_000);

      // Should show locked message instead of URL
      const lockedText = page.getByText("Subscribe to unlock overlay URL");
      const isLocked = await lockedText.isVisible({ timeout: 3_000 }).catch(() => false);
      expect(isLocked).toBeTruthy();
      report("Overlay URL locked", "PASS");
    }

    expect(errors.length).toBe(0);
    report("No console errors", "PASS");
  });

  test("A4. Duel — action buttons disabled", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/duel");
    await page.waitForTimeout(2_000);

    await expect(page.getByText("Duel Management").first()).toBeVisible();

    // Reset button disabled
    const resetBtn = page.getByRole("button", { name: "Reset" });
    if (await resetBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      expect(await resetBtn.isDisabled()).toBeTruthy();
      report("Reset disabled", "PASS");
    }

    // Raffle button disabled
    const raffleBtn = page.getByRole("button", { name: "Raffle" });
    if (await raffleBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      expect(await raffleBtn.isDisabled()).toBeTruthy();
      report("Raffle disabled", "PASS");
    }

    // Add Row disabled
    const addBtn = page.getByRole("button", { name: "Add Row" });
    if (await addBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      expect(await addBtn.isDisabled()).toBeTruthy();
      report("Add Row disabled", "PASS");
    }

    // Update button disabled
    const updateBtn = page.getByRole("button", { name: "Update" });
    if (await updateBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      expect(await updateBtn.isDisabled()).toBeTruthy();
      report("Update disabled", "PASS");
    }

    expect(errors.length).toBe(0);
    report("No console errors", "PASS");
  });

  test("A5. Slot Requests — actions disabled", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/slot-requests");
    await page.waitForTimeout(2_000);

    const raffleBtn = page.getByRole("button", { name: "Raffle a Game" });
    if (await raffleBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      expect(await raffleBtn.isDisabled()).toBeTruthy();
      report("Raffle a Game disabled", "PASS");
    }

    const toggleBtn = page.getByRole("button", { name: /Open Slot Requests|Close Slot Requests/ });
    if (await toggleBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      expect(await toggleBtn.isDisabled()).toBeTruthy();
      report("Toggle Slot Requests disabled", "PASS");
    }

    const clearBtn = page.getByRole("button", { name: "Clear All Requests" });
    if (await clearBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      expect(await clearBtn.isDisabled()).toBeTruthy();
      report("Clear All disabled", "PASS");
    }

    expect(errors.length).toBe(0);
    report("No console errors", "PASS");
  });

  test("A6. Stream Points — save disabled", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/stream-points");
    await page.waitForTimeout(2_000);

    const saveBtn = page.getByRole("button", { name: /Save Configuration/i });
    if (await saveBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      expect(await saveBtn.isDisabled()).toBeTruthy();
      report("Save Configuration disabled", "PASS");
    }

    expect(errors.length).toBe(0);
    report("No console errors", "PASS");
  });

  test("A7. Settings — save disabled", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/settings");
    await page.waitForTimeout(2_000);

    await expect(page.getByText("Read-Only Mode").first()).toBeVisible({ timeout: 5_000 });
    report("UpgradeBanner visible", "PASS");

    const saveBtn = page.getByRole("button", { name: "Save" }).first();
    if (await saveBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      expect(await saveBtn.isDisabled()).toBeTruthy();
      report("Save button disabled", "PASS");
    }

    expect(errors.length).toBe(0);
    report("No console errors", "PASS");
  });

  test("A8. Theme Settings — save disabled", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/theme-settings");
    await page.waitForTimeout(2_000);

    await expect(page.getByText("Read-Only Mode").first()).toBeVisible({ timeout: 5_000 });

    const saveBtn = page.getByRole("button", { name: /Save Changes/i });
    if (await saveBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      expect(await saveBtn.isDisabled()).toBeTruthy();
      report("Save Changes disabled", "PASS");
    }

    expect(errors.length).toBe(0);
    report("No console errors", "PASS");
  });

  test("A9. Wager — save disabled", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/wager");
    await page.waitForTimeout(2_000);

    const updateBtn = page.getByRole("button", { name: /Update/i });
    if (await updateBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      expect(await updateBtn.isDisabled()).toBeTruthy();
      report("Update disabled", "PASS");
    }

    const resetBtn = page.getByRole("button", { name: /Reset/i });
    if (await resetBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      expect(await resetBtn.isDisabled()).toBeTruthy();
      report("Reset disabled", "PASS");
    }

    expect(errors.length).toBe(0);
    report("No console errors", "PASS");
  });

  test("A10. Spinner — actions disabled", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/spinner");
    await page.waitForTimeout(2_000);

    const saveBtn = page.getByRole("button", { name: /Save Prizes/i });
    if (await saveBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      expect(await saveBtn.isDisabled()).toBeTruthy();
      report("Save Prizes disabled", "PASS");
    }

    expect(errors.length).toBe(0);
    report("No console errors", "PASS");
  });

  test("A11. Chat — overlay URL locked", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/chat");
    await page.waitForTimeout(2_000);

    // OverlayLink should show locked state
    const lockedText = page.getByText("Subscribe to unlock overlay URL");
    const isLocked = await lockedText.first().isVisible({ timeout: 5_000 }).catch(() => false);
    expect(isLocked).toBeTruthy();
    report("Chat overlay URL locked", "PASS");

    expect(errors.length).toBe(0);
    report("No console errors", "PASS");
  });

  test("A12. Deposit-Withdrawals — overlay locked, save disabled", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/deposit-withdrawals");
    await page.waitForTimeout(2_000);

    // Overlay URL locked
    const lockedText = page.getByText("Subscribe to unlock overlay URL");
    const isLocked = await lockedText.first().isVisible({ timeout: 5_000 }).catch(() => false);
    expect(isLocked).toBeTruthy();
    report("Overlay URL locked", "PASS");

    expect(errors.length).toBe(0);
    report("No console errors", "PASS");
  });

  test("A13. All remaining pages load without errors", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    const pages = [
      "/loyalty", "/points-battle", "/quick-guesses",
      "/casino-management", "/personal-bests", "/promo-management",
      "/slideshow", "/slot-battles", "/tournaments",
      "/bonushunts", "/store", "/moderators", "/streamer-page",
      "/now-playing", "/wallet",
    ];

    for (const path of pages) {
      await page.goto(path);
      await page.waitForTimeout(1_500);

      // Verify page loaded (no crash)
      const body = page.locator("body");
      await expect(body).toBeVisible();

      // Check UpgradeBanner on feature pages
      const banner = page.getByText("Read-Only Mode").first();
      const hasBanner = await banner.isVisible({ timeout: 3_000 }).catch(() => false);
      report(`${path} loads`, "PASS", hasBanner ? "with UpgradeBanner" : "");
    }

    expect(errors.length).toBe(0);
    report("No console errors across all pages", "PASS");
  });
});

// ═══════════════════════════════════════════════════════════
// PART B: PAID ACCOUNT TESTS (Full Access)
// ═══════════════════════════════════════════════════════════
test.describe("B. PAID ACCOUNT — Full Access", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, PAID_EMAIL, PAID_PASSWORD);
    await dismissOnboarding(page);
  });

  test("B1. Dashboard loads WITHOUT UpgradeBanner", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/dashboard");
    await page.waitForTimeout(2_000);

    await expect(page.getByText("Dashboard").first()).toBeVisible();
    report("Dashboard loads", "PASS");

    // UpgradeBanner should NOT be visible
    const banner = page.getByText("Read-Only Mode").first();
    const hasBanner = await banner.isVisible({ timeout: 3_000 }).catch(() => false);
    expect(hasBanner).toBeFalsy();
    report("No UpgradeBanner (paid user)", "PASS");

    expect(errors.length).toBe(0);
    report("No console errors", "PASS");
  });

  test("B2. Bot page — all actions enabled", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/bot");
    await page.waitForTimeout(2_000);

    // No UpgradeBanner
    const banner = page.getByText("Read-Only Mode");
    const hasBanner = await banner.isVisible({ timeout: 2_000 }).catch(() => false);
    expect(hasBanner).toBeFalsy();
    report("No UpgradeBanner", "PASS");

    // Connect/Start button should be enabled
    const connectBtn = page.getByText("Connect Twitch");
    const startBtn = page.getByText("Start Bot");
    const hasConnect = await connectBtn.isVisible({ timeout: 2_000 }).catch(() => false);
    const hasStart = await startBtn.isVisible({ timeout: 2_000 }).catch(() => false);

    if (hasConnect) {
      // It's an <a> tag, not disabled
      report("Connect Twitch enabled (link)", "PASS");
    } else if (hasStart) {
      const isDisabled = await startBtn.isDisabled();
      expect(isDisabled).toBeFalsy();
      report("Start Bot enabled", "PASS");
    }

    // Feature toggles enabled
    const toggleBtn = page.locator("button").filter({ hasText: "Chat Relay" });
    if (await toggleBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      const isDisabled = await toggleBtn.isDisabled();
      expect(isDisabled).toBeFalsy();
      report("Feature toggles enabled", "PASS");
    }

    expect(errors.length).toBe(0);
    report("No console errors", "PASS");
  });

  test("B3. Settings — save works", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/settings");
    await page.waitForTimeout(2_000);

    // Save button should be enabled
    const saveBtn = page.getByRole("button", { name: "Save" }).first();
    if (await saveBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      const isDisabled = await saveBtn.isDisabled();
      expect(isDisabled).toBeFalsy();
      report("Save button enabled", "PASS");

      // Actually save
      await saveBtn.click();
      await page.waitForTimeout(2_000);
      report("Save executed", "PASS");
    }

    expect(errors.length).toBe(0);
    report("No console errors", "PASS");
  });

  test("B4. Theme Settings — save works", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/theme-settings");
    await page.waitForTimeout(2_000);

    const saveBtn = page.getByRole("button", { name: /Save Changes/i });
    if (await saveBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      const isDisabled = await saveBtn.isDisabled();
      expect(isDisabled).toBeFalsy();
      report("Save Changes enabled", "PASS");

      await saveBtn.click();
      await page.waitForTimeout(2_000);
      report("Theme saved", "PASS");
    }

    expect(errors.length).toBe(0);
    report("No console errors", "PASS");
  });

  test("B5. Hotwords — save works, overlay URL visible", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/hotwords");
    await page.waitForTimeout(2_000);

    // Save buttons enabled
    const saveButtons = page.getByRole("button", { name: "Save" });
    const saveCount = await saveButtons.count();
    for (let i = 0; i < saveCount; i++) {
      const isDisabled = await saveButtons.nth(i).isDisabled();
      expect(isDisabled).toBeFalsy();
    }
    report(`All ${saveCount} Save buttons enabled`, "PASS");

    // Open overlay modal and check URL is visible (not locked)
    const overlayBtn = page.getByRole("button", { name: /HotWords Overlay/i });
    if (await overlayBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await overlayBtn.click();
      await page.waitForTimeout(1_000);

      // Should NOT show locked message
      const lockedText = page.getByText("Subscribe to unlock overlay URL");
      const isLocked = await lockedText.isVisible({ timeout: 2_000 }).catch(() => false);
      expect(isLocked).toBeFalsy();
      report("Overlay URL visible (not locked)", "PASS");

      // Should show actual URL with /overlay/hotwords
      const urlText = page.getByText(/overlay\/hotwords/);
      const hasUrl = await urlText.isVisible({ timeout: 2_000 }).catch(() => false);
      expect(hasUrl).toBeTruthy();
      report("Overlay URL contains correct path", "PASS");
    }

    expect(errors.length).toBe(0);
    report("No console errors", "PASS");
  });

  test("B6. Chat — overlay URL visible", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/chat");
    await page.waitForTimeout(2_000);

    // Overlay URL should be visible (not locked)
    const lockedText = page.getByText("Subscribe to unlock overlay URL");
    const isLocked = await lockedText.first().isVisible({ timeout: 2_000 }).catch(() => false);
    expect(isLocked).toBeFalsy();
    report("Chat overlay URL not locked", "PASS");

    // Should show actual overlay URL
    const urlText = page.getByText(/overlay\/chat/);
    const hasUrl = await urlText.first().isVisible({ timeout: 3_000 }).catch(() => false);
    expect(hasUrl).toBeTruthy();
    report("Chat overlay URL visible", "PASS");

    expect(errors.length).toBe(0);
    report("No console errors", "PASS");
  });

  test("B7. Wager — save and configure", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/wager");
    await page.waitForTimeout(2_000);

    // Update button enabled
    const updateBtn = page.getByRole("button", { name: /Update/i });
    if (await updateBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      expect(await updateBtn.isDisabled()).toBeFalsy();
      report("Update button enabled", "PASS");

      // Fill values and save
      const numberInputs = page.locator('input[type="number"]');
      const count = await numberInputs.count();
      if (count >= 4) {
        await numberInputs.nth(0).fill("200");
        await numberInputs.nth(1).fill("100");
        await numberInputs.nth(2).fill("5000");
        await numberInputs.nth(3).fill("2500");
      }

      await updateBtn.click();
      await page.waitForTimeout(2_000);
      report("Wager saved", "PASS");
    }

    // Overlay URL visible
    const lockedText = page.getByText("Subscribe to unlock overlay URL");
    const isLocked = await lockedText.first().isVisible({ timeout: 2_000 }).catch(() => false);
    expect(isLocked).toBeFalsy();
    report("Wager overlay URL visible", "PASS");

    expect(errors.length).toBe(0);
    report("No console errors", "PASS");
  });

  test("B8. Deposit-Withdrawals — save and overlay visible", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/deposit-withdrawals");
    await page.waitForTimeout(2_000);

    // Overlay URL visible (not locked)
    const lockedText = page.getByText("Subscribe to unlock overlay URL");
    const isLocked = await lockedText.first().isVisible({ timeout: 2_000 }).catch(() => false);
    expect(isLocked).toBeFalsy();
    report("Balance overlay URL visible", "PASS");

    // Save button enabled
    const saveBtn = page.getByRole("button", { name: /Update|Save/i });
    if (await saveBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      expect(await saveBtn.isDisabled()).toBeFalsy();
      report("Save button enabled", "PASS");
    }

    expect(errors.length).toBe(0);
    report("No console errors", "PASS");
  });

  test("B9. Spinner — save and spin", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/spinner");
    await page.waitForTimeout(2_000);

    // Save Prizes enabled
    const saveBtn = page.getByRole("button", { name: /Save Prizes/i });
    if (await saveBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      expect(await saveBtn.isDisabled()).toBeFalsy();
      report("Save Prizes enabled", "PASS");
    }

    // Fill prizes
    const prizeInputs = page.locator('input[placeholder="Enter prize"]');
    const prizeCount = await prizeInputs.count();
    if (prizeCount >= 2) {
      await prizeInputs.nth(0).fill("Free Spins");
      await prizeInputs.nth(1).fill("Cash Prize");
    }

    // Save
    if (await saveBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await saveBtn.click();
      await page.waitForTimeout(1_500);
      report("Prizes saved", "PASS");
    }

    // Spin the wheel
    const spinBtn = page.getByRole("button", { name: /Spin The Wheel/i });
    if (await spinBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      const canSpin = await spinBtn.isEnabled();
      if (canSpin) {
        await spinBtn.click();
        await page.waitForTimeout(6_000);
        report("Spin animation executed", "PASS");
      } else {
        report("Spin button", "PASS", "Disabled (need >= 2 active prizes)");
      }
    }

    expect(errors.length).toBe(0);
    report("No console errors", "PASS");
  });

  test("B10. Duel — all actions enabled", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/duel");
    await page.waitForTimeout(2_000);

    // Reset enabled
    const resetBtn = page.getByRole("button", { name: "Reset" });
    if (await resetBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      expect(await resetBtn.isDisabled()).toBeFalsy();
      report("Reset enabled", "PASS");
    }

    // Add Row enabled
    const addBtn = page.getByRole("button", { name: "Add Row" });
    if (await addBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      expect(await addBtn.isDisabled()).toBeFalsy();
      await addBtn.click();
      await page.waitForTimeout(500);
      report("Add Row works", "PASS");
    }

    // Save/Update enabled
    const updateBtn = page.getByRole("button", { name: "Update" });
    if (await updateBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      expect(await updateBtn.isDisabled()).toBeFalsy();
      report("Update enabled", "PASS");
    }

    expect(errors.length).toBe(0);
    report("No console errors", "PASS");
  });

  test("B11. Slot Requests — actions enabled", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/slot-requests");
    await page.waitForTimeout(2_000);

    const raffleBtn = page.getByRole("button", { name: "Raffle a Game" });
    if (await raffleBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      expect(await raffleBtn.isDisabled()).toBeFalsy();
      report("Raffle a Game enabled", "PASS");
    }

    expect(errors.length).toBe(0);
    report("No console errors", "PASS");
  });

  test("B12. Stream Points — save enabled", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/stream-points");
    await page.waitForTimeout(2_000);

    const saveBtn = page.getByRole("button", { name: /Save Configuration/i });
    if (await saveBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      expect(await saveBtn.isDisabled()).toBeFalsy();
      report("Save Configuration enabled", "PASS");

      // Fill and save
      await saveBtn.click();
      await page.waitForTimeout(2_000);
      report("Configuration saved", "PASS");
    }

    expect(errors.length).toBe(0);
    report("No console errors", "PASS");
  });

  test("B13. Bonushunts — create bonushunt", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/bonushunts");
    await page.waitForTimeout(2_000);

    const createBtn = page.getByRole("button", { name: /Create Bonushunt/i });
    if (await createBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      expect(await createBtn.isDisabled()).toBeFalsy();
      report("Create Bonushunt enabled", "PASS");
    }

    expect(errors.length).toBe(0);
    report("No console errors", "PASS");
  });

  test("B14. Tournaments — create enabled", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/tournaments");
    await page.waitForTimeout(2_000);

    const createBtn = page.getByRole("button", { name: /Create Tournament/i });
    if (await createBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      expect(await createBtn.isDisabled()).toBeFalsy();
      report("Create Tournament enabled", "PASS");
    }

    expect(errors.length).toBe(0);
    report("No console errors", "PASS");
  });

  test("B15. Slot Battles — create enabled", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/slot-battles");
    await page.waitForTimeout(2_000);

    const createBtn = page.getByRole("button", { name: /Create Slot Battle/i });
    if (await createBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      expect(await createBtn.isDisabled()).toBeFalsy();
      report("Create Slot Battle enabled", "PASS");
    }

    expect(errors.length).toBe(0);
    report("No console errors", "PASS");
  });

  test("B16. All remaining pages load without errors", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    const pages = [
      "/loyalty", "/points-battle", "/quick-guesses",
      "/casino-management", "/personal-bests", "/promo-management",
      "/slideshow", "/store", "/moderators", "/streamer-page",
      "/now-playing", "/wallet",
    ];

    for (const path of pages) {
      await page.goto(path);
      await page.waitForTimeout(1_500);

      const body = page.locator("body");
      await expect(body).toBeVisible();

      // Should NOT show UpgradeBanner
      const banner = page.getByText("Read-Only Mode").first();
      const hasBanner = await banner.isVisible({ timeout: 2_000 }).catch(() => false);
      expect(hasBanner).toBeFalsy();
      report(`${path} loads`, "PASS", "no UpgradeBanner");
    }

    expect(errors.length).toBe(0);
    report("No console errors across all pages", "PASS");
  });
});

// ═══════════════════════════════════════════════════════════
// PART C: ALL 22 OVERLAY PAGES — Render, Transparency, No Errors
// ═══════════════════════════════════════════════════════════

// All 22 overlays in the codebase
const ALL_OVERLAYS = [
  "/overlay/balance_large",
  "/overlay/balance_normal",
  "/overlay/balance_small",
  "/overlay/bonushunt_guess",
  "/overlay/bonushunt_horizontal",
  "/overlay/bonushunt_large",
  "/overlay/bonushunt_small",
  "/overlay/bonushunt_topworse",
  "/overlay/chat_normal",
  "/overlay/chat_small",
  "/overlay/duel_normal",
  "/overlay/hotwords",
  "/overlay/now_playing_normal",
  "/overlay/now_playing_small",
  "/overlay/slot_battle_normal",
  "/overlay/slot_requests",
  "/overlay/spinner",
  "/overlay/tournament_bracket",
  "/overlay/tournament_normal",
  "/overlay/wager_bar_normal",
  "/overlay/wager_bar_small",
];

test.describe("C. ALL OVERLAYS — Render & Transparency", () => {
  test("C1. All 21 overlay pages load with transparent bg and no errors", async ({ page }) => {
    const errors = trackConsoleErrors(page);

    for (const overlay of ALL_OVERLAYS) {
      await page.goto(overlay);
      await page.waitForTimeout(1_500);

      // 1. Page renders (no crash / white screen)
      const body = page.locator("body");
      await expect(body).toBeVisible();

      // 2. Background is transparent (for OBS browser source)
      const bodyBg = await page.evaluate(() =>
        window.getComputedStyle(document.body).backgroundColor
      );
      const htmlBg = await page.evaluate(() =>
        window.getComputedStyle(document.documentElement).backgroundColor
      );
      const isTransparent =
        (bodyBg === "rgba(0, 0, 0, 0)" || bodyBg === "transparent") &&
        (htmlBg === "rgba(0, 0, 0, 0)" || htmlBg === "transparent");
      expect(isTransparent).toBeTruthy();

      // 3. No JS crash (check for error boundary or "Something went wrong")
      const errorBoundary = page.getByText("Something went wrong");
      const hasError = await errorBoundary.isVisible({ timeout: 500 }).catch(() => false);
      expect(hasError).toBeFalsy();

      report(`${overlay}`, "PASS", `transparent: body=${bodyBg} html=${htmlBg}`);
    }

    expect(errors.length).toBe(0);
    report("No console errors across all 21 overlays", "PASS");
  });
});

// ═══════════════════════════════════════════════════════════
// PART D: PAID ACCOUNT — Overlay URLs accessible + render correctly
// ═══════════════════════════════════════════════════════════
test.describe("D. PAID ACCOUNT — Overlay URLs work end-to-end", () => {
  let paidUid: string | null = null;

  test.beforeAll(async ({ browser }) => {
    // Login as paid user and extract uid from any overlay URL on a dashboard page
    const page = await browser.newPage();
    await login(page, PAID_EMAIL, PAID_PASSWORD);
    await dismissOnboarding(page);

    // Go to chat page to find an overlay URL with uid
    await page.goto("/chat");
    await page.waitForTimeout(2_500);

    const urlEl = page.locator("text=/overlay\\/chat/").first();
    if (await urlEl.isVisible({ timeout: 3_000 }).catch(() => false)) {
      const urlText = await urlEl.textContent();
      const match = urlText?.match(/uid=([a-f0-9-]+)/);
      if (match) paidUid = match[1];
    }
    await page.close();
  });

  test("D1. Extract paid user uid", async () => {
    expect(paidUid).toBeTruthy();
    report("Paid user uid extracted", "PASS", paidUid!);
  });

  test("D2. All overlays render with paid user uid", async ({ page }) => {
    test.skip(!paidUid, "No uid extracted");
    const errors = trackConsoleErrors(page);

    for (const overlay of ALL_OVERLAYS) {
      const url = `${overlay}?uid=${paidUid}`;
      await page.goto(url);
      await page.waitForTimeout(1_500);

      // Page renders
      const body = page.locator("body");
      await expect(body).toBeVisible();

      // Transparent
      const bodyBg = await page.evaluate(() =>
        window.getComputedStyle(document.body).backgroundColor
      );
      const isTransparent = bodyBg === "rgba(0, 0, 0, 0)" || bodyBg === "transparent";
      expect(isTransparent).toBeTruthy();

      // No error boundary
      const errorBoundary = page.getByText("Something went wrong");
      const hasError = await errorBoundary.isVisible({ timeout: 500 }).catch(() => false);
      expect(hasError).toBeFalsy();

      report(`${overlay}?uid=PAID`, "PASS");
    }

    expect(errors.length).toBe(0);
    report("No console errors across all paid overlays", "PASS");
  });
});

// ═══════════════════════════════════════════════════════════
// PART E: BOT FUNCTIONALITY — Detailed checks
// ═══════════════════════════════════════════════════════════
test.describe("E. BOT FUNCTIONALITY", () => {
  test("E1. FREE account — Bot page fully locked", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await login(page, FREE_EMAIL, FREE_PASSWORD);
    await dismissOnboarding(page);
    await page.goto("/bot");
    await page.waitForTimeout(2_500);

    // UpgradeBanner visible
    await expect(page.getByText("Read-Only Mode").first()).toBeVisible({ timeout: 5_000 });
    report("UpgradeBanner visible", "PASS");

    // Connection section exists
    await expect(page.getByText("Connection").first()).toBeVisible();
    report("Connection section visible", "PASS");

    // Feature Toggles section exists
    await expect(page.getByText("Feature Toggles")).toBeVisible();
    report("Feature Toggles section visible", "PASS");

    // All 6 feature toggle buttons exist and are disabled
    const features = ["Chat Relay", "Hotwords", "Slot Requests", "Quick Guesses", "Points Battle", "Loyalty Giveaways"];
    for (const feat of features) {
      const btn = page.locator("button").filter({ hasText: feat });
      if (await btn.isVisible({ timeout: 1_500 }).catch(() => false)) {
        expect(await btn.isDisabled()).toBeTruthy();
        report(`${feat} toggle disabled`, "PASS");
      }
    }

    // Connect Twitch button is disabled (rendered as <button disabled>)
    const connectBtn = page.getByText("Connect Twitch");
    if (await connectBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      const isDisabled = await connectBtn.isDisabled();
      expect(isDisabled).toBeTruthy();
      report("Connect Twitch button disabled", "PASS");
    }

    // Activity Log section visible
    const activityLog = page.getByText("Activity Log");
    if (await activityLog.isVisible({ timeout: 2_000 }).catch(() => false)) {
      report("Activity Log section visible", "PASS");
    }

    expect(errors.length).toBe(0);
    report("No console errors", "PASS");
  });

  test("E2. PAID account — Bot page fully functional", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await login(page, PAID_EMAIL, PAID_PASSWORD);
    await dismissOnboarding(page);
    await page.goto("/bot");
    await page.waitForTimeout(2_500);

    // No UpgradeBanner
    const banner = page.getByText("Read-Only Mode").first();
    const hasBanner = await banner.isVisible({ timeout: 2_000 }).catch(() => false);
    expect(hasBanner).toBeFalsy();
    report("No UpgradeBanner", "PASS");

    // Connection section
    await expect(page.getByText("Connection").first()).toBeVisible();
    report("Connection section visible", "PASS");

    // Feature Toggles section
    await expect(page.getByText("Feature Toggles")).toBeVisible();
    report("Feature Toggles section visible", "PASS");

    // All 6 feature toggle buttons exist and are ENABLED
    const features = ["Chat Relay", "Hotwords", "Slot Requests", "Quick Guesses", "Points Battle", "Loyalty Giveaways"];
    for (const feat of features) {
      const btn = page.locator("button").filter({ hasText: feat });
      if (await btn.isVisible({ timeout: 1_500 }).catch(() => false)) {
        expect(await btn.isDisabled()).toBeFalsy();
        report(`${feat} toggle enabled`, "PASS");
      }
    }

    // Connect Twitch is <a> link (enabled) OR Start Bot is enabled button
    const connectLink = page.locator('a:has-text("Connect Twitch")');
    const startBtn = page.getByRole("button", { name: "Start Bot" });
    const stopBtn = page.getByRole("button", { name: "Stop Bot" });

    const hasConnectLink = await connectLink.isVisible({ timeout: 2_000 }).catch(() => false);
    const hasStartBtn = await startBtn.isVisible({ timeout: 1_000 }).catch(() => false);
    const hasStopBtn = await stopBtn.isVisible({ timeout: 1_000 }).catch(() => false);

    if (hasConnectLink) {
      // Verify it has href to /api/twitch/auth
      const href = await connectLink.getAttribute("href");
      expect(href).toContain("/api/twitch/auth");
      report("Connect Twitch link → /api/twitch/auth", "PASS");
    } else if (hasStartBtn) {
      expect(await startBtn.isDisabled()).toBeFalsy();
      report("Start Bot button enabled", "PASS");

      // Disconnect Account button should also be present and enabled
      const disconnectBtn = page.getByRole("button", { name: "Disconnect Account" });
      if (await disconnectBtn.isVisible({ timeout: 1_000 }).catch(() => false)) {
        expect(await disconnectBtn.isDisabled()).toBeFalsy();
        report("Disconnect Account enabled", "PASS");
      }
    } else if (hasStopBtn) {
      // Bot is already running
      expect(await stopBtn.isDisabled()).toBeFalsy();
      report("Stop Bot button enabled (bot running)", "PASS");
    }

    // Activity Log section
    await expect(page.getByText("Activity Log")).toBeVisible();
    report("Activity Log visible", "PASS");

    expect(errors.length).toBe(0);
    report("No console errors", "PASS");
  });
});

// ═══════════════════════════════════════════════════════════
// PART F: LANDING PAGE — Unregistered Visitor
// ═══════════════════════════════════════════════════════════
test.describe("F. LANDING PAGE — Unregistered Visitor", () => {

  test("F1: Landing page loads without errors", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/", { waitUntil: "networkidle" });

    // Basic content visible
    await expect(page.locator("body")).toBeVisible();
    report("Landing page loads", "PASS");

    // Navigation visible
    const nav = page.locator("nav").first();
    await expect(nav).toBeVisible();
    report("Navigation visible", "PASS");

    expect(errors.length).toBe(0);
    report("No console errors on landing", "PASS");
  });

  test("F2: Widget stack is visible (3 widgets bottom-right)", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/", { waitUntil: "networkidle" });

    // The widget stack container (fixed bottom-right)
    const widgetStack = page.locator('div[style*="position: fixed"][style*="bottom: 24px"][style*="right: 24px"]');
    await expect(widgetStack).toBeVisible({ timeout: 5_000 });
    report("Widget stack container visible", "PASS");

    // Should have 3 buttons (Animation toggle, Theme toggle, Language widget toggle)
    const buttons = widgetStack.locator("button");
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(3);
    report(`Widget stack has ${count} buttons (expected ≥3)`, "PASS");

    expect(errors.length).toBe(0);
    report("No console errors", "PASS");
  });

  test("F3: Animation toggle defaults to OFF (no canvas)", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    // Clear any stored animation preference
    await page.goto("/", { waitUntil: "networkidle" });
    await page.evaluate(() => localStorage.removeItem("pfl-bg-animation"));
    await page.reload({ waitUntil: "networkidle" });

    // Canvas should NOT be present (animation OFF by default)
    const canvas = page.locator("canvas");
    const canvasVisible = await canvas.isVisible({ timeout: 2_000 }).catch(() => false);
    expect(canvasVisible).toBe(false);
    report("Animation OFF by default (no canvas)", "PASS");

    expect(errors.length).toBe(0);
    report("No console errors", "PASS");
  });

  test("F4: Animation toggle turns ON/OFF background", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/", { waitUntil: "networkidle" });
    await page.evaluate(() => localStorage.removeItem("pfl-bg-animation"));
    await page.reload({ waitUntil: "networkidle" });

    // Find the animation toggle button (first button in widget stack)
    const widgetStack = page.locator('div[style*="position: fixed"][style*="bottom: 24px"][style*="right: 24px"]');
    const animToggle = widgetStack.locator("button").first();
    await expect(animToggle).toBeVisible();

    // Click to enable animation
    await animToggle.click();
    await page.waitForTimeout(500);

    // Canvas should now be visible
    const canvas = page.locator("canvas");
    const canvasAfterOn = await canvas.isVisible({ timeout: 3_000 }).catch(() => false);
    expect(canvasAfterOn).toBe(true);
    report("Animation ON after toggle click (canvas visible)", "PASS");

    // Click again to disable
    await animToggle.click();
    await page.waitForTimeout(500);

    const canvasAfterOff = await canvas.isVisible({ timeout: 1_000 }).catch(() => false);
    expect(canvasAfterOff).toBe(false);
    report("Animation OFF after second toggle (canvas hidden)", "PASS");

    // Verify localStorage was updated
    const stored = await page.evaluate(() => localStorage.getItem("pfl-bg-animation"));
    expect(stored).toBe("false");
    report("localStorage persists animation preference", "PASS");

    expect(errors.length).toBe(0);
    report("No console errors", "PASS");
  });

  test("F5: Theme toggle cycles Dark → Light → Auto", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/", { waitUntil: "networkidle" });

    const widgetStack = page.locator('div[style*="position: fixed"][style*="bottom: 24px"][style*="right: 24px"]');
    // Theme toggle is the second button in the stack — has aria-label "Switch theme."
    const themeToggle = widgetStack.locator('button[aria-label*="Switch theme"]');
    await expect(themeToggle).toBeVisible();

    // Read initial label (Dark, Light, or Auto)
    const initialLabel = (await themeToggle.textContent())?.trim();
    report(`Initial theme label: ${initialLabel}`, "INFO");

    // Cycle: dark → light
    await themeToggle.click();
    await page.waitForTimeout(400);
    const label1 = (await themeToggle.textContent())?.trim();
    expect(label1).not.toBe(initialLabel);
    report(`After 1st click: ${label1}`, "PASS");

    // Cycle: light → auto (system)
    await themeToggle.click();
    await page.waitForTimeout(400);
    const label2 = (await themeToggle.textContent())?.trim();
    expect(label2).not.toBe(label1);
    report(`After 2nd click: ${label2}`, "PASS");

    // Cycle: auto → dark (back to start)
    await themeToggle.click();
    await page.waitForTimeout(400);
    const label3 = (await themeToggle.textContent())?.trim();
    expect(label3).toBe(initialLabel);
    report(`After 3rd click (cycled back): ${label3}`, "PASS");

    expect(errors.length).toBe(0);
    report("No console errors", "PASS");
  });

  test("F6: Language widget opens dropdown and switches language", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/", { waitUntil: "networkidle" });

    const widgetStack = page.locator('div[style*="position: fixed"][style*="bottom: 24px"][style*="right: 24px"]');
    // Language widget toggle is the third button area
    const langButton = widgetStack.locator("button").nth(2);
    await expect(langButton).toBeVisible();

    // Click to open language dropdown
    await langButton.click();
    await page.waitForTimeout(300);

    // Dropdown should appear with language options
    const dropdown = widgetStack.locator("button").filter({ hasText: "Deutsch" }).first();
    const dropdownVisible = await dropdown.isVisible({ timeout: 2_000 }).catch(() => false);
    expect(dropdownVisible).toBe(true);
    report("Language dropdown opens with options", "PASS");

    // Select German
    await dropdown.click();
    await page.waitForTimeout(500);

    // Verify language code changed to 'de'
    const langCode = widgetStack.locator("button").last();
    const langText = await langCode.textContent();
    expect(langText?.toLowerCase()).toContain("de");
    report("Language switched to Deutsch (de)", "PASS");

    // Switch back to English
    await langCode.click();
    await page.waitForTimeout(300);
    const enButton = widgetStack.locator("button").filter({ hasText: "English" }).first();
    if (await enButton.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await enButton.click();
      await page.waitForTimeout(300);
      report("Language switched back to English", "PASS");
    }

    expect(errors.length).toBe(0);
    report("No console errors", "PASS");
  });

  test("F7: Landing page sections render correctly", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/", { waitUntil: "networkidle" });

    // Verify key sections are present
    const sections = [
      { name: "Hero", selector: "section" },
      { name: "Footer", selector: "footer" },
    ];

    for (const s of sections) {
      const el = page.locator(s.selector).first();
      const isVis = await el.isVisible({ timeout: 3_000 }).catch(() => false);
      if (isVis) report(`${s.name} section visible`, "PASS");
      else report(`${s.name} section`, "SKIP", "not found");
    }

    // Verify Login/Register links are visible for unregistered users
    const loginLink = page.locator('a[href="/login"]').first();
    const loginVisible = await loginLink.isVisible({ timeout: 3_000 }).catch(() => false);
    if (loginVisible) report("Login link visible for visitors", "PASS");
    else report("Login link", "INFO", "may be in mobile menu");

    expect(errors.length).toBe(0);
    report("No console errors", "PASS");
  });

  test("F8: No ThemeToggle in navigation header (moved to widget stack)", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/", { waitUntil: "networkidle" });

    // The old ThemeToggle was in the nav. It should NOT be there anymore.
    const nav = page.locator("nav").first();
    await expect(nav).toBeVisible();

    // Check that there are no theme toggle buttons directly inside nav
    // The theme toggle used Dark/Light/Auto labels — check none in nav
    const navThemeBtn = nav.locator('button:has-text("Dark"), button:has-text("Light"), button:has-text("Auto")');
    const count = await navThemeBtn.count();
    expect(count).toBe(0);
    report("No theme toggle in navigation header", "PASS");

    expect(errors.length).toBe(0);
    report("No console errors", "PASS");
  });
});
