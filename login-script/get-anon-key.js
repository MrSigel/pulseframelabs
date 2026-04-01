const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // intercept requests to capture headers
  page.on('request', req => {
    if (req.url().includes('supabase') && req.headers()['apikey']) {
      console.log('ANON KEY:', req.headers()['apikey']);
      console.log('AUTH HEADER:', req.headers()['authorization'] || '');
    }
  });

  await page.goto('https://pulseframelabs.com/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'gross_enrico@gmx.de');
  await page.fill('input[type="password"]', 'qweqwe123!');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(() => {}),
    page.locator('button[type="submit"]').first().click(),
  ]);
  await page.waitForTimeout(5000);
  console.log('URL:', page.url());
  await browser.close();
})();
