const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOT_DIR = path.join(__dirname, 'overlay-screenshots');
const BASE_URL = 'https://pulseframelabs.com';
const LOGIN_URL = `${BASE_URL}/login`;
const EMAIL = 'gross_enrico@gmx.de';
const PASSWORD = 'qweqwe123!';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function screenshotFull(page, name, description) {
  const filePath = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`[SCREENSHOT] ${name}.png - ${description}`);
  return filePath;
}

async function findAndScreenshotOverlayPanel(page, pageName) {
  // Look for common overlay preview selectors
  const selectors = [
    '[class*="overlay"]',
    '[class*="preview"]',
    '[id*="overlay"]',
    '[id*="preview"]',
    'iframe[src*="overlay"]',
    '[data-testid*="overlay"]',
    '[class*="widget"]',
  ];

  for (const sel of selectors) {
    try {
      const el = page.locator(sel).first();
      const count = await el.count();
      if (count > 0) {
        const box = await el.boundingBox();
        if (box && box.width > 50 && box.height > 50) {
          const filePath = path.join(SCREENSHOT_DIR, `${pageName}-overlay-panel.png`);
          await el.screenshot({ path: filePath });
          console.log(`[OVERLAY PANEL] ${pageName}-overlay-panel.png (selector: ${sel})`);
          return { selector: sel, box };
        }
      }
    } catch (e) {
      // continue
    }
  }
  return null;
}

async function analyzePage(page, pageName) {
  const info = {
    url: page.url(),
    title: await page.title(),
    tabs: [],
    overlayPanelFound: false,
    textContent: '',
  };

  // Get all tab/mode elements
  const tabSelectors = ['[role="tab"]', 'button[class*="tab"]', 'a[class*="tab"]', '[class*="mode"]', 'nav a', 'ul[class*="tab"] li', '[class*="Tab"]'];
  for (const sel of tabSelectors) {
    try {
      const tabs = await page.locator(sel).all();
      for (const tab of tabs) {
        const text = (await tab.textContent()).trim();
        if (text && !info.tabs.includes(text)) info.tabs.push(text);
      }
    } catch(e) {}
  }

  // Get visible text for analysis
  try {
    info.textContent = await page.evaluate(() => document.body.innerText.substring(0, 3000));
  } catch(e) {}

  return info;
}

async function captureTabScreenshots(page, pageName) {
  const tabs = await page.locator('[role="tab"]').all();
  const tabNames = [];
  for (const tab of tabs) {
    const text = (await tab.textContent()).trim();
    if (text) tabNames.push({ el: tab, name: text });
  }

  if (tabNames.length === 0) return;

  for (const tab of tabNames) {
    try {
      await tab.el.click();
      await delay(1500);
      const safeName = tab.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      await screenshotFull(page, `${pageName}-tab-${safeName}`, `Tab: ${tab.name}`);
      await findAndScreenshotOverlayPanel(page, `${pageName}-tab-${safeName}`);
    } catch(e) {
      console.log(`Could not click tab ${tab.name}: ${e.message}`);
    }
  }
}

async function visitPage(page, url, name) {
  console.log(`\n=== Visiting: ${url} ===`);
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await delay(2000);
  } catch(e) {
    console.log(`Navigation warning: ${e.message}`);
    await delay(2000);
  }

  const finalUrl = page.url();
  console.log(`Final URL: ${finalUrl}`);

  if (finalUrl.includes('/login')) {
    console.log(`REDIRECTED TO LOGIN - not authenticated`);
    return null;
  }

  await screenshotFull(page, name, `Full page: ${url}`);
  const panel = await findAndScreenshotOverlayPanel(page, name);
  const info = await analyzePage(page, name);
  info.overlayPanelFound = panel !== null;

  await captureTabScreenshots(page, name);

  return info;
}

async function getSidebarLinks(page) {
  const links = new Set();
  try {
    // Try common sidebar/nav selectors
    const navSelectors = ['nav a', 'aside a', '[class*="sidebar"] a', '[class*="nav"] a', '[class*="menu"] a', 'header a'];
    for (const sel of navSelectors) {
      const els = await page.locator(sel).all();
      for (const el of els) {
        try {
          const href = await el.getAttribute('href');
          const text = (await el.textContent()).trim();
          if (href && !href.startsWith('#') && !href.startsWith('javascript')) {
            links.add(JSON.stringify({ href, text }));
          }
        } catch(e) {}
      }
    }
  } catch(e) {}
  return [...links].map(l => JSON.parse(l));
}

async function main() {
  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // LOGIN
  console.log('\n=== LOGGING IN ===');
  await page.goto(LOGIN_URL, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '00-login-page.png'), fullPage: true });

  // Fill login form
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i], input[placeholder*="Email"]').first();
  await emailInput.fill(EMAIL);

  const passwordInput = page.locator('input[type="password"]').first();
  await passwordInput.fill(PASSWORD);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-login-filled.png'), fullPage: true });

  // Click submit
  const submitBtn = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in"), button:has-text("Log in")').first();
  await submitBtn.click();

  await page.waitForNavigation({ timeout: 15000 }).catch(() => {});
  await delay(3000);

  console.log(`After login URL: ${page.url()}`);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-after-login.png'), fullPage: true });

  // Get sidebar links from dashboard
  console.log('\n=== GETTING SIDEBAR LINKS ===');
  const sidebarLinks = await getSidebarLinks(page);
  console.log('Sidebar/Nav links found:');
  sidebarLinks.forEach(l => console.log(`  [${l.text}] -> ${l.href}`));

  // Also try to discover pages by looking at the DOM
  const allLinks = await page.evaluate(() => {
    return [...document.querySelectorAll('a')].map(a => ({ href: a.href, text: a.innerText.trim() })).filter(l => l.href && l.href.includes('pulseframelabs.com'));
  });
  console.log('\nAll internal links on dashboard:');
  allLinks.forEach(l => console.log(`  [${l.text.substring(0, 40)}] -> ${l.href}`));

  // Save link info
  fs.writeFileSync(path.join(SCREENSHOT_DIR, 'discovered-links.json'), JSON.stringify({ sidebarLinks, allLinks }, null, 2));

  // Pages to visit
  const pagesToVisit = [
    { url: `${BASE_URL}/bonushunt`, name: 'bonushunt' },
    { url: `${BASE_URL}/bonushunts`, name: 'bonushunts' },
    { url: `${BASE_URL}/tournament`, name: 'tournament' },
    { url: `${BASE_URL}/tournaments`, name: 'tournaments' },
    { url: `${BASE_URL}/bossfight`, name: 'bossfight' },
    { url: `${BASE_URL}/chat`, name: 'chat' },
    { url: `${BASE_URL}/hotwords`, name: 'hotwords' },
    { url: `${BASE_URL}/bot`, name: 'bot' },
    { url: `${BASE_URL}/overlays`, name: 'overlays' },
    { url: `${BASE_URL}/overlay`, name: 'overlay' },
    { url: `${BASE_URL}/dashboard`, name: 'dashboard' },
    { url: `${BASE_URL}/widgets`, name: 'widgets' },
    { url: `${BASE_URL}/settings`, name: 'settings' },
    { url: `${BASE_URL}/profile`, name: 'profile' },
  ];

  const results = {};

  for (const p of pagesToVisit) {
    const info = await visitPage(page, p.url, p.name);
    if (info) {
      results[p.name] = info;
    }
  }

  // Try any unique links found in sidebar that we haven't visited
  const visitedUrls = new Set(pagesToVisit.map(p => p.url));
  for (const link of allLinks) {
    const href = link.href;
    if (!visitedUrls.has(href) && href.includes('pulseframelabs.com') && !href.includes('/login')) {
      visitedUrls.add(href);
      const name = href.replace(/https?:\/\/[^/]+\//, '').replace(/\//g, '-') || 'unknown';
      const info = await visitPage(page, href, `extra-${name}`);
      if (info) results[`extra-${name}`] = info;
    }
  }

  // Save analysis
  fs.writeFileSync(path.join(SCREENSHOT_DIR, 'page-analysis.json'), JSON.stringify(results, null, 2));
  console.log('\n=== COMPLETE ===');
  console.log(`Screenshots saved to: ${SCREENSHOT_DIR}`);
  console.log('Pages analyzed:', Object.keys(results));

  await browser.close();
}

main().catch(console.error);
