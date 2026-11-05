import { chromium } from 'playwright';
import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

const ARTIFACT_DIR = '/Users/musa/.gemini/antigravity/brain/60e5d3b2-4089-4c21-8ac9-8659819c6910';

async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
          if (res.statusCode >= 200 && res.statusCode < 400) resolve();
          else reject(new Error(`Status ${res.statusCode}`));
        });
        req.on('error', reject);
        req.setTimeout(1000, () => {
          req.destroy();
          reject(new Error('timeout'));
        });
      });
      return true;
    } catch {
      await new Promise(r => setTimeout(r, 300));
    }
  }
  throw new Error(`Server at ${url} did not start within ${timeoutMs}ms`);
}

async function main() {
  console.log('⚡ Starting local Vite server on port 5173...');
  const server = spawn('npx', ['vite', '--port', '5173'], {
    cwd: process.cwd(),
    stdio: 'ignore'
  });

  try {
    await waitForServer('http://localhost:5173', 15000);
    console.log('✅ Vite server is ready on http://localhost:5173');

    const browser = await chromium.launch({ headless: true });

    // =========================================================================
    // TEST 1: Mobile Cal.com view (iPhone 14 - 390x844)
    // =========================================================================
    console.log('\n--- DIAGNOSING ISSUE 1: Cal.com on Mobile (iPhone 14: 390x844) ---');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
      isMobile: true,
      hasTouch: true
    });

    const mobilePage = await mobileContext.newPage();
    // Pre-populate cookie consent to prevent banner overlay
    await mobilePage.addInitScript(() => {
      localStorage.setItem('cookie_consent', JSON.stringify({
        status: 'accepted-all',
        analytics: true,
        marketing: true,
        timestamp: new Date().toISOString()
      }));
    });

    await mobilePage.goto('http://localhost:5173/#contacto', { waitUntil: 'domcontentloaded' });
    await mobilePage.waitForTimeout(1000);

    // Click "Agendar Llamada"
    const calTabBtn = mobilePage.locator('#tab-btn-cal');
    await calTabBtn.scrollIntoViewIfNeeded();
    await calTabBtn.click();
    console.log('Clicked "Agendar Llamada" tab');

    // Wait for iframe
    await mobilePage.waitForTimeout(3500);

    // Measure bounding box of cal booking panel and iframe
    const calBox = await mobilePage.locator('#cal-booking-panel').boundingBox();
    console.log('Cal booking panel bounding box on mobile:', calBox);

    const iframeBox = await mobilePage.locator('#cal-embed-iframe').boundingBox();
    console.log('Cal iframe bounding box on mobile:', iframeBox);

    // Screenshot of the contact section with Cal.com loaded
    await mobilePage.locator('#contacto').scrollIntoViewIfNeeded();
    await mobilePage.screenshot({
      path: `${ARTIFACT_DIR}/cal_mobile_view.png`,
      fullPage: false
    });
    console.log(`📸 Saved screenshot: ${ARTIFACT_DIR}/cal_mobile_view.png`);

    // Screenshot specifically of the cal booking panel
    await mobilePage.locator('#cal-booking-panel').screenshot({
      path: `${ARTIFACT_DIR}/cal_booking_panel_detail.png`
    });
    console.log(`📸 Saved screenshot: ${ARTIFACT_DIR}/cal_booking_panel_detail.png`);

    // =========================================================================
    // TEST 2: Diagnosis of "Agendar Cita" / "Reservar" buttons navigation
    // =========================================================================
    console.log('\n--- DIAGNOSING ISSUE 2: "Agendar Cita" / "Reservar" Buttons Navigation ---');

    // 2A: Index page footer link
    console.log('\n[2A] Testing Index Page Footer Link "Agendar Cita"...');
    await mobilePage.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await mobilePage.waitForTimeout(1000);

    const footerNavLinks = await mobilePage.$$eval('footer nav a', els =>
      els.map(el => ({ text: el.innerText.trim(), href: el.getAttribute('href') }))
    );
    console.log('Footer nav links found on index:', footerNavLinks);

    const indexFooterCalBtn = mobilePage.locator('footer nav a:has-text("Agendar Cita")');
    await indexFooterCalBtn.scrollIntoViewIfNeeded();
    const initialScrollY = await mobilePage.evaluate(() => window.scrollY);
    console.log('ScrollY before clicking footer link:', initialScrollY);

    await indexFooterCalBtn.click();
    await mobilePage.waitForTimeout(1200);

    const afterClickUrl = mobilePage.url();
    const afterClickScrollY = await mobilePage.evaluate(() => window.scrollY);
    const contactOffsetTop = await mobilePage.evaluate(() => {
      const el = document.getElementById('contacto');
      return el ? el.offsetTop : null;
    });

    console.log('URL after click:', afterClickUrl);
    console.log('ScrollY after click:', afterClickScrollY);
    console.log('Target #contacto offsetTop:', contactOffsetTop);
    const diff = Math.abs(afterClickScrollY - (contactOffsetTop || 0));
    console.log(`Scroll distance from #contacto: ${diff}px (Is near contact: ${diff < 300})`);

    // Check if cal tab is actually active
    const isCalTabActiveAfterFooter = await mobilePage.$eval('#tab-btn-cal', el => el.getAttribute('aria-selected'));
    console.log('Is Cal Tab active after clicking footer link?:', isCalTabActiveAfterFooter);

    // 2B: Project page CTA button "Agendar Cita"
    console.log('\n[2B] Testing Project Page CTA "Agendar Cita"...');
    await mobilePage.goto('http://localhost:5173/project?slug=blessed-barber-studio', { waitUntil: 'domcontentloaded' });
    await mobilePage.waitForTimeout(1000);

    const projectCtaBtn = mobilePage.locator('main a:has-text("Agendar Cita")');
    const projectCtaHref = await projectCtaBtn.getAttribute('href');
    console.log('Project CTA button href:', projectCtaHref);

    await projectCtaBtn.click();
    await mobilePage.waitForLoadState('domcontentloaded');
    await mobilePage.waitForTimeout(1500);

    const projectAfterClickUrl = mobilePage.url();
    const projectAfterClickScrollY = await mobilePage.evaluate(() => window.scrollY);
    const projectContactOffsetTop = await mobilePage.evaluate(() => {
      const el = document.getElementById('contacto');
      return el ? el.offsetTop : null;
    });

    console.log('URL after project CTA click:', projectAfterClickUrl);
    console.log('ScrollY after project CTA click:', projectAfterClickScrollY);
    console.log('Target #contacto offsetTop on destination:', projectContactOffsetTop);
    const projectDiff = Math.abs(projectAfterClickScrollY - (projectContactOffsetTop || 0));
    console.log(`Scroll distance from #contacto on landing: ${projectDiff}px (Is near contact: ${projectDiff < 300})`);

    const projectLandingCalActive = await mobilePage.$eval('#tab-btn-cal', el => el.getAttribute('aria-selected'));
    console.log('Is Cal Tab active on landing?:', projectLandingCalActive);

    // 2C: Project Page Footer link "Agendar Cita"
    console.log('\n[2C] Testing Project Page Footer Link "Agendar Cita"...');
    await mobilePage.goto('http://localhost:5173/project?slug=blessed-barber-studio', { waitUntil: 'domcontentloaded' });
    await mobilePage.waitForTimeout(1000);

    const projectFooterBtn = mobilePage.locator('footer nav a:has-text("Agendar Cita")');
    const projectFooterHref = await projectFooterBtn.getAttribute('href');
    console.log('Project footer link href:', projectFooterHref);

    await projectFooterBtn.click();
    await mobilePage.waitForLoadState('domcontentloaded');
    await mobilePage.waitForTimeout(1500);

    console.log('URL after project footer click:', mobilePage.url());
    console.log('ScrollY after project footer click:', await mobilePage.evaluate(() => window.scrollY));

    // 2D: Planes Page Footer link "Agendar Cita"
    console.log('\n[2D] Testing Planes Page Footer Link "Agendar Cita"...');
    await mobilePage.goto('http://localhost:5173/planes/', { waitUntil: 'domcontentloaded' });
    await mobilePage.waitForTimeout(1000);

    const planesFooterBtn = mobilePage.locator('footer nav a:has-text("Agendar Cita")');
    const planesFooterHref = await planesFooterBtn.getAttribute('href');
    console.log('Planes footer link href:', planesFooterHref);

    await planesFooterBtn.click();
    await mobilePage.waitForLoadState('domcontentloaded');
    await mobilePage.waitForTimeout(1500);

    console.log('URL after planes footer click:', mobilePage.url());
    console.log('ScrollY after planes footer click:', await mobilePage.evaluate(() => window.scrollY));

    await browser.close();
  } finally {
    server.kill();
    console.log('🛑 Local Vite server stopped.');
  }
}

main().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});

