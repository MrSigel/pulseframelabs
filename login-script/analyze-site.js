const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = {};

  // ── 1. Load homepage ──────────────────────────────────────────────────────
  await page.goto('https://pulseframelabs.com', { waitUntil: 'networkidle' });
  results.homeUrl = page.url();
  results.homeHTML = await page.content();

  // ── 2. Find & fill login form ──────────────────────────────────────────────
  const emailSels = ['input[type="email"]','input[name="email"]','input[placeholder*="mail" i]','input[id*="email" i]'];
  const passSels  = ['input[type="password"]','input[name="password"]','input[id*="password" i]'];

  let emailEl = null, passEl = null;
  for (const s of emailSels) { emailEl = await page.$(s); if (emailEl) break; }
  for (const s of passSels)  { passEl  = await page.$(s); if (passEl)  break; }

  if (!emailEl || !passEl) {
    results.loginError = 'Login fields not found on homepage. Trying /login…';
    await page.goto('https://pulseframelabs.com/login', { waitUntil: 'networkidle' });
    for (const s of emailSels) { emailEl = await page.$(s); if (emailEl) break; }
    for (const s of passSels)  { passEl  = await page.$(s); if (passEl)  break; }
  }

  if (!emailEl || !passEl) {
    results.loginError = 'Login fields not found at /login either.';
    results.loginPageHTML = await page.content();
    fs.writeFileSync('site-analysis.json', JSON.stringify(results, null, 2));
    await browser.close();
    return;
  }

  await emailEl.fill('gross_enrico@gmx.de');
  await passEl.fill('qweqwe123!');

  const submitSels = ['button[type="submit"]','input[type="submit"]','button:has-text("Login")','button:has-text("Sign in")','button:has-text("Anmelden")'];
  let submitted = false;
  for (const s of submitSels) {
    const btn = await page.$(s);
    if (btn) { await btn.click(); submitted = true; break; }
  }
  if (!submitted) await page.keyboard.press('Enter');

  await page.waitForLoadState('networkidle');
  results.afterLoginUrl = page.url();
  results.afterLoginHTML = await page.content();

  // ── 3. Discover nav links ──────────────────────────────────────────────────
  const navLinks = await page.$$eval('a', els =>
    els.map(a => ({ text: a.innerText.trim(), href: a.href }))
       .filter(l => l.href && !l.href.startsWith('javascript') && l.text)
  );
  results.navLinks = navLinks;

  // ── 4. Visit each interesting page ────────────────────────────────────────
  const keywords = ['bonus','hunt','tournament','boss','fight','chat','hotword','twitch','bot','dashboard','game','slot'];
  const interestingLinks = navLinks.filter(l =>
    keywords.some(k => l.text.toLowerCase().includes(k) || l.href.toLowerCase().includes(k))
  );
  results.interestingLinks = interestingLinks;

  const visited = new Set();
  results.pages = {};

  for (const link of interestingLinks) {
    if (visited.has(link.href)) continue;
    visited.add(link.href);

    try {
      await page.goto(link.href, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1000);

      const pageData = {
        url: page.url(),
        title: await page.title(),
        html: await page.content(),
        inputs: await page.$$eval('input,select,textarea', els => els.map(e => ({
          tag: e.tagName, type: e.type, name: e.name, id: e.id,
          placeholder: e.placeholder, value: e.value, label: ''
        }))),
        buttons: await page.$$eval('button', els => els.map(b => ({ text: b.innerText.trim(), id: b.id, cls: b.className }))),
        tables: await page.$$eval('table', els => els.map(t => ({
          headers: [...t.querySelectorAll('th')].map(th => th.innerText.trim()),
          rowCount: t.querySelectorAll('tr').length
        }))),
        headings: await page.$$eval('h1,h2,h3,h4', els => els.map(h => ({ tag: h.tagName, text: h.innerText.trim() }))),
        apiCalls: [],
      };

      results.pages[link.href] = pageData;
    } catch (e) {
      results.pages[link.href] = { error: e.message };
    }
  }

  // ── 5. Also capture dashboard/home after login ────────────────────────────
  await page.goto(results.afterLoginUrl, { waitUntil: 'networkidle' });
  results.dashboardAfterLogin = {
    url: page.url(),
    html: await page.content(),
    inputs: await page.$$eval('input,select,textarea', els => els.map(e => ({
      tag: e.tagName, type: e.type, name: e.name, id: e.id, placeholder: e.placeholder
    }))),
    buttons: await page.$$eval('button', els => els.map(b => ({ text: b.innerText.trim() }))),
    headings: await page.$$eval('h1,h2,h3,h4', els => els.map(h => ({ tag: h.tagName, text: h.innerText.trim() }))),
  };

  // ── 6. Capture network requests on dashboard ──────────────────────────────
  const apiRequests = [];
  page.on('request', req => {
    if (req.resourceType() === 'fetch' || req.resourceType() === 'xhr') {
      apiRequests.push({ method: req.method(), url: req.url() });
    }
  });
  await page.reload({ waitUntil: 'networkidle' });
  results.apiRequests = apiRequests;

  fs.writeFileSync('site-analysis.json', JSON.stringify(results, null, 2));
  console.log('Analysis saved to site-analysis.json');
  console.log('afterLoginUrl:', results.afterLoginUrl);
  console.log('Interesting pages found:', Object.keys(results.pages).length);

  await browser.close();
})();
