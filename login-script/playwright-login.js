const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://pulseframelabs.com');
  await page.waitForLoadState('networkidle');

  const emailSelectors = [
    'input[type="email"]',
    'input[name="email"]',
    'input[placeholder*="mail"]',
    'input[id*="email"]',
  ];
  const passwordSelectors = [
    'input[type="password"]',
    'input[name="password"]',
    'input[id*="password"]',
  ];

  let emailInput = null;
  for (const sel of emailSelectors) {
    emailInput = await page.$(sel);
    if (emailInput) break;
  }

  let passwordInput = null;
  for (const sel of passwordSelectors) {
    passwordInput = await page.$(sel);
    if (passwordInput) break;
  }

  if (!emailInput || !passwordInput) {
    console.error('Login fields not found. Check selectors.');
    await browser.close();
    process.exit(1);
  }

  await emailInput.fill('gross_enrico@gmx.de');
  await passwordInput.fill('qweqwe123!');

  const submitSelectors = [
    'button[type="submit"]',
    'input[type="submit"]',
    'button:has-text("Login")',
    'button:has-text("Sign in")',
    'button:has-text("Anmelden")',
  ];

  let submitted = false;
  for (const sel of submitSelectors) {
    const btn = await page.$(sel);
    if (btn) {
      await btn.click();
      submitted = true;
      break;
    }
  }

  if (!submitted) {
    await page.keyboard.press('Enter');
  }

  await page.waitForLoadState('networkidle');
  console.log('Login successful. Current URL:', page.url());

  // Keep browser open for inspection
  // await browser.close();
})();
