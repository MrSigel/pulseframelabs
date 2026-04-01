const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Login
  await page.goto('https://pulseframelabs.com/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'gross_enrico@gmx.de');
  await page.fill('input[type="password"]', 'qweqwe123!');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(() => {}),
    page.locator('button[type="submit"]').first().click(),
  ]);
  await page.waitForTimeout(2000);
  console.log('Logged in:', page.url());

  const overlayPages = [
    '/bonushunts',
    '/tournaments',
    '/bossfight',
    '/chat',
    '/hotwords',
    '/bot',
  ];

  const results = {};

  for (const path of overlayPages) {
    await page.goto(`https://pulseframelabs.com${path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const name = path.replace('/', '');
    await page.screenshot({ path: `screenshot-${name}.png`, fullPage: true });

    // Get overlay-related buttons and links
    const overlayLinks = await page.$$eval('a[href*="overlay"], button', els =>
      els.map(el => ({
        tag: el.tagName,
        text: el.innerText.trim().substring(0, 80),
        href: el.href || '',
        class: el.className.substring(0, 100),
      })).filter(el => el.text && (
        el.text.toLowerCase().includes('overlay') ||
        el.text.toLowerCase().includes('preview') ||
        el.text.toLowerCase().includes('open') ||
        el.href.includes('overlay')
      ))
    );

    // Get the main content HTML (look for overlay sections)
    const html = await page.content();
    // Find overlay section
    const overlayIdx = html.toLowerCase().indexOf('overlay');
    const previewSection = overlayIdx > 0 ? html.substring(Math.max(0, overlayIdx - 200), overlayIdx + 5000) : '';

    results[name] = {
      url: page.url(),
      overlayLinks,
      previewHTML: previewSection.substring(0, 4000),
    };

    console.log(`\n=== ${name.toUpperCase()} ===`);
    console.log('Overlay links:', JSON.stringify(overlayLinks, null, 2));

    // Try clicking "Open Live Preview" or overlay button
    const previewBtn = await page.$('button:has-text("Open Live Preview"), button:has-text("Preview"), a:has-text("Overlay Normal"), a:has-text("Overlay Small")');
    if (previewBtn) {
      const [newPage] = await Promise.all([
        context.waitForEvent('page').catch(() => null),
        previewBtn.click(),
      ]);
      if (newPage) {
        await newPage.waitForLoadState('networkidle');
        console.log('Preview URL:', newPage.url());
        results[name].previewUrl = newPage.url();
        results[name].previewPageHTML = (await newPage.content()).substring(0, 8000);
        await newPage.screenshot({ path: `preview-${name}.png`, fullPage: true });
        await newPage.close();
      }
    }
  }

  // Also visit overlay URLs directly
  const overlayUrls = [
    '/overlay/bonushunt',
    '/overlay/tournament',
    '/overlay/bossfight',
    '/overlay/chat',
    '/overlay/hotwords',
  ];

  for (const path of overlayUrls) {
    try {
      await page.goto(`https://pulseframelabs.com${path}`, { waitUntil: 'networkidle', timeout: 10000 });
      await page.waitForTimeout(1500);
      const name = path.replace('/overlay/', 'ov-');
      await page.screenshot({ path: `screenshot-${name}.png`, fullPage: false });
      results[name] = {
        url: page.url(),
        html: (await page.content()).substring(0, 8000),
      };
      console.log(`Overlay page ${path}: OK`);
    } catch (e) {
      console.log(`Overlay page ${path}: ${e.message}`);
    }
  }

  fs.writeFileSync('overlay-analysis.json', JSON.stringify(results, null, 2));
  console.log('\nDone. Screenshots saved.');
  await browser.close();
})();
