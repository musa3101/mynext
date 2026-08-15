import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:5174';
const SCREENSHOT_DIR = path.resolve('docs/audit_screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: 'Desktop-1440p', width: 1440, height: 900, isMobile: false },
  { name: 'Tablet-iPad-768p', width: 768, height: 1024, isMobile: true, hasTouch: true },
  { name: 'Mobile-iPhone-393p', width: 393, height: 852, isMobile: true, hasTouch: true },
  { name: 'Mobile-Small-360p', width: 360, height: 740, isMobile: true, hasTouch: true }
];

const PAGES_TO_TEST = [
  { name: 'Home-ES', url: '/' },
  { name: 'Home-EN', url: '/index-en.html' },
  { name: 'Planes-ES', url: '/planes/index.html' },
  { name: 'Planes-EN', url: '/planes/index-en.html' },
  { name: 'Project-ES', url: '/project.html?id=coche-rent' }
];

async function runAudit() {
  console.log('🚀 Iniciando Auditoría Completa en Google Chrome Nativo...\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900']
  });

  const fullReport = {
    timestamp: new Date().toISOString(),
    pages: []
  };

  for (const pageInfo of PAGES_TO_TEST) {
    console.log(`\n========================================`);
    console.log(`🔍 Auditando: ${pageInfo.name} (${pageInfo.url})`);
    console.log(`========================================`);

    const pageReport = {
      page: pageInfo.name,
      url: pageInfo.url,
      consoleErrors: [],
      consoleWarnings: [],
      failedRequests: [],
      performance: {},
      overflowIssues: [],
      interactionTests: {},
      screenshots: []
    };

    const page = await browser.newPage();

    // Capturar logs y errores de consola
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'error') {
        pageReport.consoleErrors.push(text);
        console.error(`  ❌ Console Error: ${text}`);
      } else if (type === 'warn' && !text.includes('deprecated')) {
        pageReport.consoleWarnings.push(text);
      }
    });

    page.on('pageerror', err => {
      pageReport.consoleErrors.push(err.toString());
      console.error(`  ❌ Uncaught Exception: ${err.message}`);
    });

    page.on('requestfailed', req => {
      const failure = req.failure();
      // Ignorar abortos intencionales
      if (failure && failure.errorText !== 'net::ERR_ABORTED') {
        pageReport.failedRequests.push({
          url: req.url(),
          error: failure.errorText
        });
        console.error(`  ⚠️ Resource Failed: ${req.url()} (${failure.errorText})`);
      }
    });

    // 1. Carga inicial en Desktop
    await page.setViewport(VIEWPORTS[0]);
    const startNav = Date.now();
    await page.goto(`${BASE_URL}${pageInfo.url}`, { waitUntil: 'networkidle2', timeout: 15000 });
    const loadTimeMs = Date.now() - startNav;

    // Métricas de Rendimiento en el Navegador
    const perfMetrics = await page.evaluate(() => {
      const perf = window.performance;
      const timing = perf.timing || {};
      const navEntry = perf.getEntriesByType('navigation')[0] || {};
      const paintEntries = perf.getEntriesByType('paint') || [];

      const fcp = paintEntries.find(e => e.name === 'first-contentful-paint')?.startTime || 0;
      const domComplete = navEntry.domComplete || (timing.domComplete - timing.navigationStart);
      const domInteractive = navEntry.domInteractive || (timing.domInteractive - timing.navigationStart);

      // Calcular número de recursos y peso
      const resources = perf.getEntriesByType('resource') || [];
      let totalTransferSize = 0;
      resources.forEach(r => {
        if (r.transferSize) totalTransferSize += r.transferSize;
      });

      return {
        fcpMs: Math.round(fcp),
        domInteractiveMs: Math.round(domInteractive),
        domCompleteMs: Math.round(domComplete),
        resourceCount: resources.length,
        totalTransferKb: Math.round(totalTransferSize / 1024)
      };
    });

    pageReport.performance = {
      navLoadTimeMs: loadTimeMs,
      ...perfMetrics
    };

    console.log(`  ⏱️  Carga de navegación: ${loadTimeMs}ms`);
    console.log(`  ⚡ FCP (First Contentful Paint): ${perfMetrics.fcpMs}ms`);
    console.log(`  📦 Recursos: ${perfMetrics.resourceCount} | Peso transferido: ${perfMetrics.totalTransferKb} KB`);

    // 2. Comprobación de Responsive y Overflows en todos los viewports
    for (const vp of VIEWPORTS) {
      await page.setViewport(vp);
      await new Promise(r => setTimeout(r, 400)); // Esperar re-layout

      // Detectar elementos desbordados horizontalmente (Horizontal scroll bug)
      const overflowElements = await page.evaluate((vpName, vpWidth) => {
        const bodyWidth = document.documentElement.clientWidth;
        const issues = [];
        const all = document.querySelectorAll('*');
        for (const el of all) {
          const rect = el.getBoundingClientRect();
          if (rect.right > bodyWidth + 2) {
            // Ignorar elementos ocultos deliberadamente
            const style = window.getComputedStyle(el);
            if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
              issues.push({
                tag: el.tagName.toLowerCase(),
                id: el.id || null,
                className: el.className?.toString().slice(0, 50) || null,
                overflowPx: Math.round(rect.right - bodyWidth)
              });
            }
          }
        }
        return issues.slice(0, 5); // Tomar los primeros 5
      }, vp.name, vp.width);

      if (overflowElements.length > 0) {
        console.warn(`  ⚠️ Desbordamiento horizontal en ${vp.name}: ${overflowElements.length} elementos detectados`);
        pageReport.overflowIssues.push({ viewport: vp.name, elements: overflowElements });
      }

      // Captura de pantalla
      const shotFile = `${pageInfo.name}_${vp.name}.webp`;
      const shotPath = path.join(SCREENSHOT_DIR, shotFile);
      await page.screenshot({ path: shotPath, type: 'webp', quality: 80, fullPage: false });
      pageReport.screenshots.push({ viewport: vp.name, file: shotFile });
    }

    // 3. Test de Interacciones Específicas
    if (pageInfo.url === '/' || pageInfo.url === '/index-en.html') {
      // Test de FAQ Accordion
      const faqResult = await page.evaluate(async () => {
        const faqBtn = document.querySelector('.faq-button, [data-faq-toggle], summary, .faq-trigger, details button');
        if (faqBtn) {
          const beforeHeight = document.body.scrollHeight;
          faqBtn.click();
          await new Promise(r => setTimeout(r, 300));
          return { found: true, clicked: true, heightDelta: document.body.scrollHeight - beforeHeight };
        }
        return { found: false };
      });
      pageReport.interactionTests.faqAccordion = faqResult;

      // Test de Menú Móvil
      await page.setViewport(VIEWPORTS[2]); // Mobile iPhone
      const menuResult = await page.evaluate(async () => {
        const menuBtn = document.getElementById('mobile-menu-btn') || document.querySelector('[data-mobile-menu-btn], button[aria-label*="menú"], button[aria-label*="menu"]');
        if (menuBtn) {
          menuBtn.click();
          await new Promise(r => setTimeout(r, 300));
          const mobileMenu = document.getElementById('mobile-menu') || document.querySelector('.mobile-menu, [data-mobile-menu]');
          const isVisible = mobileMenu ? (window.getComputedStyle(mobileMenu).display !== 'none' && !mobileMenu.classList.contains('hidden')) : false;
          return { found: true, opened: isVisible };
        }
        return { found: false };
      });
      pageReport.interactionTests.mobileMenu = menuResult;
    }

    // 4. Test de Fluidez en Scroll y GSAP (Frame Drop / Stutter test)
    await page.setViewport(VIEWPORTS[0]);
    const scrollFpsMetrics = await page.evaluate(async () => {
      return new Promise((resolve) => {
        let frames = 0;
        let jankFrames = 0;
        let lastTime = performance.now();
        let isScrolling = true;

        const checkFrame = (now) => {
          frames++;
          const delta = now - lastTime;
          if (delta > 28) { // Frame mayor a 28ms equivale a caída por debajo de 35fps (Jank)
            jankFrames++;
          }
          lastTime = now;
          if (isScrolling) {
            requestAnimationFrame(checkFrame);
          }
        };

        requestAnimationFrame(checkFrame);

        // Realizar scroll continuo hacia abajo y arriba
        const totalHeight = document.body.scrollHeight;
        let currentScroll = 0;
        const interval = setInterval(() => {
          currentScroll += 200;
          window.scrollTo({ top: currentScroll, behavior: 'auto' });
          if (currentScroll >= totalHeight) {
            clearInterval(interval);
            isScrolling = false;
            window.scrollTo({ top: 0, behavior: 'auto' });
            resolve({
              totalFrames: frames,
              jankFrames: jankFrames,
              smoothnessScore: Math.round(((frames - jankFrames) / Math.max(frames, 1)) * 100)
            });
          }
        }, 30);
      });
    });

    pageReport.performance.scrollSmoothness = scrollFpsMetrics;
    console.log(`  🎯 Fluidez de Scroll: ${scrollFpsMetrics.smoothnessScore}% (Frames totales: ${scrollFpsMetrics.totalFrames}, Tirones: ${scrollFpsMetrics.jankFrames})`);

    fullReport.pages.push(pageReport);
    await page.close();
  }

  await browser.close();

  // Guardar reporte JSON
  fs.writeFileSync('docs/audit_report.json', JSON.stringify(fullReport, null, 2));
  console.log('\n✅ Auditoría finalizada con éxito. Reporte guardado en docs/audit_report.json');
}

runAudit().catch(err => {
  console.error('Error fatal durante la auditoría:', err);
  process.exit(1);
});
