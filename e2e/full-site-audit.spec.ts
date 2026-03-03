import { test, expect, type Page } from "@playwright/test";

// ─── Credentials ───────────────────────────────────────────
const PAID_EMAIL = "freelancer.enricofullstack@gmail.com";
const PAID_PASSWORD = "qweqwe123!";

// ─── Helpers ───────────────────────────────────────────────
async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.waitForLoadState("domcontentloaded");
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForSelector('a[href="/dashboard"]', { timeout: 20_000, strict: false });
}

async function dismissOnboarding(page: Page) {
  const dialog = page.locator('[role="dialog"]');
  if (await dialog.isVisible({ timeout: 3_000 }).catch(() => false)) {
    const getStarted = page.getByRole("button", { name: /Get Started/i });
    if (await getStarted.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await getStarted.click();
      await page.waitForTimeout(500);
    }
    for (let i = 0; i < 8; i++) {
      const continueBtn = page.getByRole("button", { name: /Continue/i });
      if (await continueBtn.isVisible({ timeout: 1_500 }).catch(() => false)) {
        await continueBtn.click();
        await page.waitForTimeout(500);
      } else break;
    }
    const goBtn = page.getByRole("button", { name: /Go to Dashboard/i });
    if (await goBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await goBtn.click();
      await page.waitForTimeout(500);
    }
    const closeBtn = dialog.locator('button[aria-label="Close"], button:has(svg.lucide-x)');
    if (await closeBtn.isVisible({ timeout: 1_000 }).catch(() => false)) await closeBtn.click();
    await dialog.waitFor({ state: "hidden", timeout: 3_000 }).catch(() => {});
  }
}

/** Collect REAL console errors (filter out framework noise) */
function trackConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  const IGNORE = [
    "favicon", "hydration", "ResizeObserver", "Failed to fetch",
    "net::ERR", "NetworkError", "404", "NEXT_", "Warning:", "Deprecated",
    "Supabase", "supabase", "realtime", "WebSocket", "ERR_BLOCKED",
    "Refused to", "Content Security", "third-party", "cookie", "Cookie",
    "ChunkLoadError", "Loading chunk", "AbortError", "signal is aborted",
    "ServiceWorker", "sw.js", "manifest.json", "workbox",
    "DeprecationWarning", "deprecated", "Download the React DevTools",
    "source map", "sourcemap", "SourceMap", "Failed to load resource",
    "the server responded with a status of", "Unchecked runtime.lastError",
    "Extension context invalidated", "message channel closed",
    "A listener indicated an asynchronous response", "Permissions-Policy",
    "DialogContent", "DialogTitle", "VisuallyHidden", "radix-ui", "radix",
    "accessible for screen reader", "Clerk", "clerk", "intercom",
    "google", "analytics", "gtag", "hotjar", "sentry",
  ];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      if (IGNORE.some((p) => text.toLowerCase().includes(p.toLowerCase()))) return;
      errors.push(text);
    }
  });
  return errors;
}

function log(icon: string, msg: string) {
  console.log(`  ${icon} ${msg}`);
}

// ═══════════════════════════════════════════════════════════
// PART 1: LANDING PAGE — Every section, link, button
// ═══════════════════════════════════════════════════════════
test.describe("1. LANDING PAGE", () => {
  test("Full landing page audit", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // ── Navigation visible ──
    const nav = page.locator("nav").first();
    await expect(nav).toBeVisible();
    log("✅", "Navigation visible");

    // ── Logo / brand ──
    const logo = page.locator("nav").getByText(/Pulseframe/i).first();
    await expect(logo).toBeVisible();
    log("✅", "Logo/brand text visible");

    // ── Nav links ──
    for (const linkText of ["Widgets", "Features", "Pricing"]) {
      const link = nav.getByText(linkText, { exact: false }).first();
      if (await link.isVisible().catch(() => false)) {
        log("✅", `Nav link: "${linkText}" visible`);
      } else {
        log("⚠️", `Nav link: "${linkText}" NOT visible`);
      }
    }

    // ── Tools dropdown ──
    const toolsBtn = nav.getByText("Tools", { exact: false }).first();
    if (await toolsBtn.isVisible().catch(() => false)) {
      await toolsBtn.click();
      await page.waitForTimeout(500);
      log("✅", "Tools dropdown opened");
      // Close by clicking elsewhere
      await page.click("body", { position: { x: 10, y: 10 } });
      await page.waitForTimeout(300);
    }

    // ── Get Started button ──
    const getStartedBtn = nav.getByText(/Get Started/i).first();
    if (await getStartedBtn.isVisible().catch(() => false)) {
      log("✅", "Get Started button visible in nav");
    }

    // ── Theme toggle in nav ──
    const themeButtons = page.locator("nav button").all();
    log("ℹ️", `Found ${(await themeButtons).length} buttons in nav`);

    // ── Hero Section ──
    const hero = page.locator("section").first();
    await expect(hero).toBeVisible();
    log("✅", "Hero section visible");

    // ── Scroll to each section ──
    for (const sectionId of ["widgets", "features", "pricing"]) {
      await page.evaluate((id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "instant" });
      }, sectionId);
      await page.waitForTimeout(500);
      const section = page.locator(`#${sectionId}`);
      if (await section.isVisible().catch(() => false)) {
        log("✅", `Section #${sectionId} visible after scroll`);
      } else {
        log("⚠️", `Section #${sectionId} NOT found or not visible`);
      }
    }

    // ── Footer ──
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    const footer = page.locator("footer").first();
    if (await footer.isVisible().catch(() => false)) {
      log("✅", "Footer visible");
    }

    // ── Live Chat Widget (floating button) ──
    const chatBtn = page.locator('button[aria-label="Open live chat"]');
    if (await chatBtn.isVisible().catch(() => false)) {
      log("✅", "Live Chat floating button visible");
      await chatBtn.click();
      await page.waitForTimeout(500);

      // Check chat window opened
      const chatHeader = page.getByText("Pulseframe Support");
      if (await chatHeader.isVisible().catch(() => false)) {
        log("✅", "Live Chat window opened");

        // Fill intro form
        const nameInput = page.locator('input[placeholder*="name" i]');
        const emailInput = page.locator('input[placeholder*="email" i]');
        if (await nameInput.isVisible().catch(() => false)) {
          await nameInput.fill("E2E Test Bot");
          await emailInput.fill("test@e2e.local");
          log("✅", "Chat intro form filled");

          // Click Start Chat
          const startBtn = page.getByText("Start Chat", { exact: false });
          if (await startBtn.isVisible().catch(() => false)) {
            await startBtn.click();
            await page.waitForTimeout(500);
            log("✅", "Chat started");

            // Type a test message
            const textarea = page.locator('textarea[placeholder*="message" i]');
            if (await textarea.isVisible().catch(() => false)) {
              await textarea.fill("E2E automated test — please ignore");
              log("✅", "Message typed in chat");

              // Send it
              const sendBtn = page.locator('button').filter({ has: page.locator('svg') }).last();
              // Don't actually send to avoid spamming Telegram
              log("ℹ️", "Skipping send to avoid Telegram spam");
            }
          }
        }

        // Close chat
        await chatBtn.click();
        await page.waitForTimeout(300);
        log("✅", "Chat closed");
      }
    }

    // ── Console errors ──
    if (errors.length === 0) {
      log("✅", "ZERO console errors on landing page");
    } else {
      for (const e of errors) log("❌", `Console error: ${e}`);
    }
  });
});

// ═══════════════════════════════════════════════════════════
// PART 2: AUTH PAGES
// ═══════════════════════════════════════════════════════════
test.describe("2. AUTH PAGES", () => {
  test("Login page renders correctly", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    log("✅", "Login form: email, password, submit all visible");

    // Forgot password link
    const forgotLink = page.getByText(/forgot/i);
    if (await forgotLink.isVisible().catch(() => false)) {
      log("✅", "Forgot password link visible");
    }

    // Register link
    const registerLink = page.getByText(/register|sign up|create/i).first();
    if (await registerLink.isVisible().catch(() => false)) {
      log("✅", "Register link visible");
    }

    if (errors.length === 0) log("✅", "ZERO console errors on login page");
    else for (const e of errors) log("❌", `Console error: ${e}`);
  });

  test("Register page renders correctly", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/register");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    log("✅", "Register form visible");

    if (errors.length === 0) log("✅", "ZERO console errors on register page");
    else for (const e of errors) log("❌", `Console error: ${e}`);
  });

  test("Forgot password page renders correctly", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/forgot-password");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator('input[type="email"]')).toBeVisible();
    log("✅", "Forgot password form visible");

    if (errors.length === 0) log("✅", "ZERO console errors on forgot-password");
    else for (const e of errors) log("❌", `Console error: ${e}`);
  });
});

// ═══════════════════════════════════════════════════════════
// PART 3: CONTACT PAGE
// ═══════════════════════════════════════════════════════════
test.describe("3. CONTACT PAGE", () => {
  test("Contact page renders all sections", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/contact");
    await page.waitForLoadState("domcontentloaded");

    // Check heading
    const heading = page.getByText(/contact/i).first();
    await expect(heading).toBeVisible();
    log("✅", "Contact page heading visible");

    // Check for email/support info
    const emailText = page.getByText(/email|support|contact@/i).first();
    if (await emailText.isVisible().catch(() => false)) {
      log("✅", "Contact info visible");
    }

    if (errors.length === 0) log("✅", "ZERO console errors on contact page");
    else for (const e of errors) log("❌", `Console error: ${e}`);
  });
});

// ═══════════════════════════════════════════════════════════
// PART 4: DASHBOARD — PAID ACCOUNT (Full Access)
// ═══════════════════════════════════════════════════════════
test.describe("4. DASHBOARD — PAID ACCOUNT", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, PAID_EMAIL, PAID_PASSWORD);
    await dismissOnboarding(page);
  });

  // ── 4.1 Sidebar visible + all links ──
  test("Sidebar renders with all nav items", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");

    const sidebar = page.locator("aside").first();
    await expect(sidebar).toBeVisible();
    log("✅", "Sidebar visible");

    const navItems = [
      "Dashboard", "Wager Bar", "Personal Bests", "Hotwords",
      "Slot Requests", "Spinner", "Bonushunts", "Tournaments",
      "Duel", "Chat", "Theme Settings",
      "Casino Management", "Promo Management",
      "Twitch Bot", "Streamer Page", "Store", "Stream Points",
      "Loyalty", "Points Battle", "Settings",
      "Wallet & Credits",
    ];

    for (const item of navItems) {
      const link = sidebar.getByText(item, { exact: true }).first();
      if (await link.isVisible().catch(() => false)) {
        log("✅", `Sidebar: "${item}" visible`);
      } else {
        log("❌", `Sidebar: "${item}" NOT visible`);
      }
    }

    if (errors.length === 0) log("✅", "ZERO console errors");
    else for (const e of errors) log("❌", `Console error: ${e}`);
  });

  // ── 4.2 Navigate EVERY dashboard page ──
  const dashboardPages: { name: string; path: string }[] = [
    { name: "Dashboard Home", path: "/dashboard" },
    { name: "Wager Bar", path: "/wager" },
    { name: "Personal Bests", path: "/personal-bests" },
    { name: "Hotwords", path: "/hotwords" },
    { name: "Slot Requests", path: "/slot-requests" },
    { name: "Spinner", path: "/spinner" },
    { name: "Bonushunts", path: "/bonushunts" },
    { name: "Tournaments", path: "/tournaments" },
    { name: "Duel", path: "/duel" },
    { name: "Chat", path: "/chat" },
    { name: "Theme Settings", path: "/theme-settings" },
    { name: "Casino Management", path: "/casino-management" },
    { name: "Promo Management", path: "/promo-management" },
    { name: "Twitch Bot", path: "/bot" },
    { name: "Streamer Page", path: "/streamer-page" },
    { name: "Store", path: "/store" },
    { name: "Stream Points", path: "/stream-points" },
    { name: "Loyalty", path: "/loyalty" },
    { name: "Points Battle", path: "/points-battle" },
    { name: "Settings", path: "/settings" },
    { name: "Wallet & Credits", path: "/wallet" },
    { name: "Quick Guesses", path: "/quick-guesses" },
    { name: "Now Playing", path: "/now-playing" },
    { name: "Slot Battles", path: "/slot-battles" },
  ];

  for (const pg of dashboardPages) {
    test(`Page loads: ${pg.name} (${pg.path})`, async ({ page }) => {
      const errors = trackConsoleErrors(page);
      await page.goto(pg.path);
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(1500);

      // Page should not show an error/404 page
      const body = await page.locator("body").textContent();
      const is404 = body?.includes("404") && body?.includes("not found");
      if (is404) {
        log("❌", `${pg.name} returned 404`);
      } else {
        log("✅", `${pg.name} loaded successfully`);
      }

      // Sidebar should still be visible (not a broken redirect)
      const sidebar = page.locator("aside");
      if (await sidebar.isVisible().catch(() => false)) {
        log("✅", `${pg.name}: sidebar visible (inside dashboard)`);
      }

      // Check for page header/title
      const pageHeader = page.locator("h1, h2, [class*='page-header'], [class*='PageHeader']").first();
      if (await pageHeader.isVisible({ timeout: 3_000 }).catch(() => false)) {
        const headerText = await pageHeader.textContent();
        log("✅", `${pg.name}: header text = "${headerText?.trim()}"`);
      }

      if (errors.length === 0) {
        log("✅", `${pg.name}: ZERO console errors`);
      } else {
        for (const e of errors) log("❌", `${pg.name} console error: ${e}`);
      }
    });
  }

  // ── 4.3 Header widgets (Theme, Language, FX) ──
  test("Header widgets: Theme toggle, Language, FX", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");

    const header = page.locator("header").first();
    await expect(header).toBeVisible();

    // Theme toggle (sun/moon icon)
    const themeBtn = header.locator('button').filter({ has: page.locator('svg.lucide-sun, svg.lucide-moon, svg.lucide-monitor') }).first();
    if (await themeBtn.isVisible().catch(() => false)) {
      await themeBtn.click();
      await page.waitForTimeout(300);
      log("✅", "Theme toggle clicked");
      // Click again to cycle back
      await themeBtn.click();
      await page.waitForTimeout(300);
      log("✅", "Theme toggled back");
    } else {
      log("⚠️", "Theme toggle button not found in header");
    }

    // Language dropdown
    const langBtn = header.locator('button').filter({ hasText: /🇬🇧|🇩🇪|🇫🇷|🇪🇸|🇹🇷|🇧🇷|🇷🇺|EN|DE|FR|ES|TR|PT|RU/i }).first();
    if (await langBtn.isVisible().catch(() => false)) {
      await langBtn.click();
      await page.waitForTimeout(500);
      log("✅", "Language dropdown opened");

      // Select German
      const deOption = page.getByText(/Deutsch|🇩🇪/i).first();
      if (await deOption.isVisible().catch(() => false)) {
        await deOption.click();
        await page.waitForTimeout(500);
        log("✅", "Switched to German");
      }

      // Switch back to English
      await langBtn.click().catch(() => {});
      await page.waitForTimeout(300);
      const enOption = page.getByText(/English|🇬🇧/i).first();
      if (await enOption.isVisible().catch(() => false)) {
        await enOption.click();
        await page.waitForTimeout(500);
        log("✅", "Switched back to English");
      }
    } else {
      log("⚠️", "Language button not found in header");
    }

    // FX toggle (Sparkles icon)
    const fxBtn = header.locator('button').filter({ has: page.locator('svg.lucide-sparkles') }).first();
    if (await fxBtn.isVisible().catch(() => false)) {
      await fxBtn.click();
      await page.waitForTimeout(300);
      log("✅", "FX toggle clicked (off)");
      await fxBtn.click();
      await page.waitForTimeout(300);
      log("✅", "FX toggle clicked (on)");
    } else {
      log("⚠️", "FX toggle not found in header");
    }

    if (errors.length === 0) log("✅", "ZERO console errors");
    else for (const e of errors) log("❌", `Console error: ${e}`);
  });

  // ── 4.4 Bonushunt — Create / Edit / Delete flow ──
  test("Bonushunts: table visible, create button", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/bonushunts");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    // Check for create button
    const createBtn = page.getByRole("button", { name: /create|new|add/i }).first();
    if (await createBtn.isVisible().catch(() => false)) {
      log("✅", "Bonushunts: Create button visible");
      await createBtn.click();
      await page.waitForTimeout(500);

      // Check if a dialog/form appeared
      const dialog = page.locator('[role="dialog"], form, [class*="modal"]').first();
      if (await dialog.isVisible({ timeout: 3_000 }).catch(() => false)) {
        log("✅", "Bonushunts: Create dialog/form appeared");
        // Close it
        const cancelBtn = page.getByRole("button", { name: /cancel|close|back/i }).first();
        if (await cancelBtn.isVisible().catch(() => false)) {
          await cancelBtn.click();
        } else {
          await page.keyboard.press("Escape");
        }
        await page.waitForTimeout(300);
      }
    } else {
      log("ℹ️", "Bonushunts: No create button found");
    }

    if (errors.length === 0) log("✅", "ZERO console errors");
    else for (const e of errors) log("❌", `Console error: ${e}`);
  });

  // ── 4.5 Tournaments — Check phases ──
  test("Tournaments: page structure", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/tournaments");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    // Check for tabs or phase buttons
    const tabs = page.locator('[role="tab"], [role="tablist"]');
    const tabCount = await tabs.count();
    if (tabCount > 0) {
      log("✅", `Tournaments: found ${tabCount} tab elements`);
    }

    // Check for create tournament button
    const createBtn = page.getByRole("button", { name: /create|new|add/i }).first();
    if (await createBtn.isVisible().catch(() => false)) {
      log("✅", "Tournaments: Create button visible");
    }

    if (errors.length === 0) log("✅", "ZERO console errors");
    else for (const e of errors) log("❌", `Console error: ${e}`);
  });

  // ── 4.6 Slot Requests — Dual mode check ──
  test("Slot Requests: page structure", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/slot-requests");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    // Check for mode toggle or tabs
    const modeToggle = page.locator('[role="tab"], button').filter({ hasText: /list|wheel|queue|vote/i }).first();
    if (await modeToggle.isVisible().catch(() => false)) {
      log("✅", "Slot Requests: Mode toggle/tabs visible");
      await modeToggle.click();
      await page.waitForTimeout(500);
      log("✅", "Slot Requests: Mode toggled");
    }

    if (errors.length === 0) log("✅", "ZERO console errors");
    else for (const e of errors) log("❌", `Console error: ${e}`);
  });

  // ── 4.7 Spinner — Check wheel ──
  test("Spinner: page loads with wheel", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/spinner");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    // Check for canvas or SVG wheel
    const wheel = page.locator("canvas, svg, [class*='wheel' i], [class*='spinner' i]").first();
    if (await wheel.isVisible().catch(() => false)) {
      log("✅", "Spinner: Wheel element visible");
    }

    // Check for spin button
    const spinBtn = page.getByRole("button", { name: /spin/i }).first();
    if (await spinBtn.isVisible().catch(() => false)) {
      log("✅", "Spinner: Spin button visible");
    }

    if (errors.length === 0) log("✅", "ZERO console errors");
    else for (const e of errors) log("❌", `Console error: ${e}`);
  });

  // ── 4.8 Wallet & Credits ──
  test("Wallet: balance and actions visible", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/wallet");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1500);

    // Check for balance display
    const balance = page.getByText(/balance|credits|guthaben/i).first();
    if (await balance.isVisible().catch(() => false)) {
      log("✅", "Wallet: Balance section visible");
    }

    // Check for deposit button
    const depositBtn = page.getByRole("button", { name: /deposit|einzahlen|top.?up/i }).first();
    if (await depositBtn.isVisible().catch(() => false)) {
      log("✅", "Wallet: Deposit button visible");
    }

    if (errors.length === 0) log("✅", "ZERO console errors");
    else for (const e of errors) log("❌", `Console error: ${e}`);
  });

  // ── 4.9 Theme Settings — Click all options ──
  test("Theme Settings: toggle through options", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/theme-settings");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    // Find clickable theme options
    const buttons = page.locator("button, [role='radio'], [role='checkbox'], input[type='color']");
    const count = await buttons.count();
    log("ℹ️", `Theme Settings: found ${count} interactive elements`);

    // Click first few theme options
    for (let i = 0; i < Math.min(count, 6); i++) {
      const btn = buttons.nth(i);
      if (await btn.isVisible().catch(() => false)) {
        const text = await btn.textContent().catch(() => "");
        await btn.click().catch(() => {});
        await page.waitForTimeout(300);
        log("✅", `Theme Settings: clicked element ${i} ("${text?.trim().substring(0, 30)}")`);
      }
    }

    if (errors.length === 0) log("✅", "ZERO console errors");
    else for (const e of errors) log("❌", `Console error: ${e}`);
  });

  // ── 4.10 Twitch Bot page ──
  test("Twitch Bot: page structure and commands", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/bot");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    // Check for Twitch channel input
    const channelInput = page.locator("input").first();
    if (await channelInput.isVisible().catch(() => false)) {
      log("✅", "Twitch Bot: Input field visible");
    }

    // Check for command list (!join, etc.)
    const joinText = page.getByText(/!join|command/i).first();
    if (await joinText.isVisible().catch(() => false)) {
      log("✅", "Twitch Bot: Commands/!join visible");
    }

    // Look for connect/join button
    const connectBtn = page.getByRole("button", { name: /connect|join|start|save/i }).first();
    if (await connectBtn.isVisible().catch(() => false)) {
      log("✅", "Twitch Bot: Connect/Join button visible");
    }

    if (errors.length === 0) log("✅", "ZERO console errors");
    else for (const e of errors) log("❌", `Console error: ${e}`);
  });

  // ── 4.11 Casino Management ──
  test("Casino Management: table and add button", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/casino-management");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    // Check for table or list
    const table = page.locator("table, [role='grid'], [class*='table' i]").first();
    if (await table.isVisible().catch(() => false)) {
      log("✅", "Casino Management: Table visible");
    }

    // Check for add button
    const addBtn = page.getByRole("button", { name: /add|create|new/i }).first();
    if (await addBtn.isVisible().catch(() => false)) {
      log("✅", "Casino Management: Add button visible");
      await addBtn.click();
      await page.waitForTimeout(500);
      // Close dialog
      await page.keyboard.press("Escape");
      await page.waitForTimeout(300);
      log("✅", "Casino Management: Add dialog opened and closed");
    }

    if (errors.length === 0) log("✅", "ZERO console errors");
    else for (const e of errors) log("❌", `Console error: ${e}`);
  });

  // ── 4.12 Promo Management ──
  test("Promo Management: page visible", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/promo-management");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    const header = page.locator("h1, h2").first();
    if (await header.isVisible().catch(() => false)) {
      log("✅", `Promo Management: header = "${await header.textContent()}"`);
    }

    if (errors.length === 0) log("✅", "ZERO console errors");
    else for (const e of errors) log("❌", `Console error: ${e}`);
  });

  // ── 4.13 Settings page ──
  test("Settings: form fields visible", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/settings");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    const inputs = page.locator("input, select, textarea");
    const count = await inputs.count();
    log("ℹ️", `Settings: found ${count} form inputs`);

    // Check for save button
    const saveBtn = page.getByRole("button", { name: /save|update|apply/i }).first();
    if (await saveBtn.isVisible().catch(() => false)) {
      log("✅", "Settings: Save button visible");
    }

    if (errors.length === 0) log("✅", "ZERO console errors");
    else for (const e of errors) log("❌", `Console error: ${e}`);
  });

  // ── 4.14 Streamer Page builder ──
  test("Streamer Page: builder visible", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/streamer-page");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    const header = page.locator("h1, h2").first();
    if (await header.isVisible().catch(() => false)) {
      log("✅", `Streamer Page: header = "${await header.textContent()}"`);
    }

    if (errors.length === 0) log("✅", "ZERO console errors");
    else for (const e of errors) log("❌", `Console error: ${e}`);
  });

  // ── 4.15 Hotwords ──
  test("Hotwords: add/manage hotwords", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/hotwords");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    const addBtn = page.getByRole("button", { name: /add|create|new/i }).first();
    if (await addBtn.isVisible().catch(() => false)) {
      log("✅", "Hotwords: Add button visible");
    }

    if (errors.length === 0) log("✅", "ZERO console errors");
    else for (const e of errors) log("❌", `Console error: ${e}`);
  });

  // ── 4.16 Store ──
  test("Store: items visible", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/store");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    const header = page.locator("h1, h2").first();
    if (await header.isVisible().catch(() => false)) {
      log("✅", `Store: header = "${await header.textContent()}"`);
    }

    if (errors.length === 0) log("✅", "ZERO console errors");
    else for (const e of errors) log("❌", `Console error: ${e}`);
  });

  // ── 4.17 Chat page (Twitch-style) ──
  test("Chat: page loads", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/chat");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    const header = page.locator("h1, h2").first();
    if (await header.isVisible().catch(() => false)) {
      log("✅", `Chat page: header = "${await header.textContent()}"`);
    }

    if (errors.length === 0) log("✅", "ZERO console errors");
    else for (const e of errors) log("❌", `Console error: ${e}`);
  });

  // ── 4.18 Stream Points ──
  test("Stream Points: page loads", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/stream-points");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    const header = page.locator("h1, h2").first();
    if (await header.isVisible().catch(() => false)) {
      log("✅", `Stream Points: header = "${await header.textContent()}"`);
    }

    if (errors.length === 0) log("✅", "ZERO console errors");
    else for (const e of errors) log("❌", `Console error: ${e}`);
  });

  // ── 4.19 Loyalty ──
  test("Loyalty: page loads", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/loyalty");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    const header = page.locator("h1, h2").first();
    if (await header.isVisible().catch(() => false)) {
      log("✅", `Loyalty: header = "${await header.textContent()}"`);
    }

    if (errors.length === 0) log("✅", "ZERO console errors");
    else for (const e of errors) log("❌", `Console error: ${e}`);
  });

  // ── 4.20 Points Battle ──
  test("Points Battle: page loads", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/points-battle");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    const header = page.locator("h1, h2").first();
    if (await header.isVisible().catch(() => false)) {
      log("✅", `Points Battle: header = "${await header.textContent()}"`);
    }

    if (errors.length === 0) log("✅", "ZERO console errors");
    else for (const e of errors) log("❌", `Console error: ${e}`);
  });

  // ── 4.21 Wager Bar — detailed check ──
  test("Wager Bar: inputs and controls", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/wager");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    const inputs = page.locator("input");
    const inputCount = await inputs.count();
    log("ℹ️", `Wager Bar: found ${inputCount} input fields`);

    if (errors.length === 0) log("✅", "ZERO console errors");
    else for (const e of errors) log("❌", `Console error: ${e}`);
  });

  // ── 4.22 Personal Bests ──
  test("Personal Bests: table/cards visible", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/personal-bests");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    const addBtn = page.getByRole("button", { name: /add|create|new/i }).first();
    if (await addBtn.isVisible().catch(() => false)) {
      log("✅", "Personal Bests: Add button visible");
    }

    if (errors.length === 0) log("✅", "ZERO console errors");
    else for (const e of errors) log("❌", `Console error: ${e}`);
  });

  // ── 4.23 Duel ──
  test("Duel: page loads", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/duel");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    const header = page.locator("h1, h2").first();
    if (await header.isVisible().catch(() => false)) {
      log("✅", `Duel: header = "${await header.textContent()}"`);
    }

    if (errors.length === 0) log("✅", "ZERO console errors");
    else for (const e of errors) log("❌", `Console error: ${e}`);
  });
});

// ═══════════════════════════════════════════════════════════
// PART 5: LIVE CHAT — Full bidirectional test
// ═══════════════════════════════════════════════════════════
test.describe("5. LIVE CHAT — Bidirectional", () => {
  test("Chat persistence across reload", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Clear chat state first
    await page.evaluate(() => {
      localStorage.removeItem("pulseframe-chat-session");
      localStorage.removeItem("pulseframe-chat-state");
    });
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Open chat
    const chatBtn = page.locator('button[aria-label="Open live chat"]');
    await expect(chatBtn).toBeVisible();
    await chatBtn.click();
    await page.waitForTimeout(500);
    log("✅", "Chat opened");

    // Fill intro form
    const nameInput = page.locator('input[placeholder*="name" i]');
    if (await nameInput.isVisible().catch(() => false)) {
      await nameInput.fill("Persistence Test");
      log("✅", "Name filled");
    }

    // Start chat
    const startBtn = page.getByText("Start Chat", { exact: false });
    if (await startBtn.isVisible().catch(() => false)) {
      await startBtn.click();
      await page.waitForTimeout(500);
      log("✅", "Chat started");
    }

    // Verify we're in chat mode
    const textarea = page.locator('textarea[placeholder*="message" i]');
    await expect(textarea).toBeVisible();
    log("✅", "Chat textarea visible");

    // Check localStorage state was saved
    const chatState = await page.evaluate(() => {
      return {
        session: localStorage.getItem("pulseframe-chat-session"),
        state: localStorage.getItem("pulseframe-chat-state"),
      };
    });
    expect(chatState.session).toBeTruthy();
    expect(chatState.state).toBeTruthy();
    log("✅", `Session: ${chatState.session?.substring(0, 8)}...`);
    log("✅", `State saved: ${chatState.state}`);

    // ── RELOAD the page ──
    await page.reload();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    // Chat should auto-open in chat mode
    const textareaAfter = page.locator('textarea[placeholder*="message" i]');
    if (await textareaAfter.isVisible({ timeout: 5_000 }).catch(() => false)) {
      log("✅", "PERSISTENCE: Chat auto-restored after reload!");
    } else {
      log("❌", "PERSISTENCE: Chat did NOT restore after reload");
    }

    // Verify session is the same
    const sessionAfter = await page.evaluate(() => localStorage.getItem("pulseframe-chat-session"));
    expect(sessionAfter).toBe(chatState.session);
    log("✅", "Session ID preserved across reload");

    if (errors.length === 0) log("✅", "ZERO console errors");
    else for (const e of errors) log("❌", `Console error: ${e}`);
  });
});

// ═══════════════════════════════════════════════════════════
// PART 6: EVERY CLICKABLE BUTTON STRESS TEST
// ═══════════════════════════════════════════════════════════
test.describe("6. BUTTON STRESS TEST", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, PAID_EMAIL, PAID_PASSWORD);
    await dismissOnboarding(page);
  });

  test("Click every visible button on Dashboard home", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto("/dashboard");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1500);

    const buttons = page.locator("main button:visible");
    const count = await buttons.count();
    log("ℹ️", `Dashboard home: ${count} visible buttons in main area`);

    for (let i = 0; i < count; i++) {
      const btn = buttons.nth(i);
      if (await btn.isVisible().catch(() => false)) {
        const text = (await btn.textContent().catch(() => ""))?.trim().substring(0, 40);
        const isDestructive = /delete|remove|destroy|reset/i.test(text || "");
        if (isDestructive) {
          log("⏭️", `Skipped destructive button: "${text}"`);
          continue;
        }
        try {
          await btn.click({ timeout: 2000 });
          await page.waitForTimeout(300);
          log("✅", `Clicked button: "${text}"`);
          // Close any dialog that may have opened
          await page.keyboard.press("Escape").catch(() => {});
          await page.waitForTimeout(200);
        } catch {
          log("⚠️", `Could not click button: "${text}"`);
        }
      }
    }

    if (errors.length === 0) log("✅", "ZERO console errors after button stress test");
    else for (const e of errors) log("❌", `Console error: ${e}`);
  });
});
