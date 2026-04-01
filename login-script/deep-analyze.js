const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const results = { pages: {}, apiCalls: [] };

  // capture all API calls
  page.on('request', req => {
    if (['fetch','xhr'].includes(req.resourceType())) {
      results.apiCalls.push({ method: req.method(), url: req.url(), postData: req.postData() });
    }
  });

  // ── Login ──────────────────────────────────────────────────────────────────
  await page.goto('https://pulseframelabs.com/login', { waitUntil: 'networkidle' });

  await page.fill('input[type="email"]', 'gross_enrico@gmx.de');
  await page.fill('input[type="password"]', 'qweqwe123!');

  // click the Login button (the submit button inside the form)
  const submitBtn = page.locator('button[type="submit"]').first();
  const hasSubmit = await submitBtn.count() > 0;
  if (hasSubmit) {
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(() => {}),
      submitBtn.click(),
    ]);
  } else {
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(() => {}),
      page.keyboard.press('Enter'),
    ]);
  }

  await page.waitForTimeout(2000);
  results.afterLoginUrl = page.url();
  console.log('After login URL:', results.afterLoginUrl);

  if (results.afterLoginUrl.includes('/login')) {
    // Try clicking the visible Login tab button first, then submit
    await page.click('button:has-text("Login")').catch(() => {});
    await page.waitForTimeout(500);
    await page.fill('input[type="email"]', 'gross_enrico@gmx.de');
    await page.fill('input[type="password"]', 'qweqwe123!');
    await page.keyboard.press('Enter');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    results.afterLoginUrl = page.url();
    console.log('After retry URL:', results.afterLoginUrl);
  }

  // ── Capture initial dashboard ──────────────────────────────────────────────
  const snapshot = async (label) => ({
    url: page.url(),
    title: await page.title(),
    headings: await page.$$eval('h1,h2,h3,h4,h5', els => els.map(h => ({ tag: h.tagName, text: h.innerText.trim().substring(0, 120) }))),
    inputs: await page.$$eval('input,select,textarea', els => els.map(e => ({
      type: e.type, name: e.name, id: e.id, placeholder: e.placeholder,
    }))),
    buttons: await page.$$eval('button', els => els.map(b => b.innerText.trim().substring(0, 80)).filter(Boolean)),
    links: await page.$$eval('a[href]', els => els.map(a => ({ text: a.innerText.trim().substring(0, 60), href: a.href })).filter(l => l.text)),
    tables: await page.$$eval('table', ts => ts.map(t => ({
      headers: [...t.querySelectorAll('th')].map(th => th.innerText.trim()),
      rows: [...t.querySelectorAll('tbody tr')].slice(0, 3).map(r => [...r.querySelectorAll('td')].map(td => td.innerText.trim())),
    }))),
    html: (await page.content()).substring(0, 30000),
  });

  results.pages['after-login'] = await snapshot('after-login');

  // ── Collect all sidebar/nav links ──────────────────────────────────────────
  const allLinks = await page.$$eval('a[href]', els =>
    els.map(a => ({ text: a.innerText.trim(), href: a.href })).filter(l => l.text && l.href && !l.href.includes('#'))
  );
  results.allLinks = allLinks;

  // ── Visit each internal page ───────────────────────────────────────────────
  const base = 'https://pulseframelabs.com';
  const internalLinks = allLinks.filter(l => l.href.startsWith(base) && !l.href.includes('login') && !l.href.includes('forgot'));
  const visited = new Set([results.afterLoginUrl]);

  for (const link of internalLinks) {
    if (visited.has(link.href)) continue;
    visited.add(link.href);
    try {
      console.log('Visiting:', link.href);
      await page.goto(link.href, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1500);
      results.pages[link.href] = await snapshot(link.text);
      console.log('  headings:', (results.pages[link.href].headings || []).map(h => h.text).join(' | '));
    } catch (e) {
      results.pages[link.href] = { error: e.message };
    }
  }

  fs.writeFileSync('site-analysis.json', JSON.stringify(results, null, 2));
  console.log('\nDone. Pages visited:', Object.keys(results.pages).length);
  console.log('API calls captured:', results.apiCalls.length);
  await browser.close();
})();
