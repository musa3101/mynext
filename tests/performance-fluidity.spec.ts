import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

interface PageAuditResult {
  pageName: string;
  url: string;
  viewport: string;
  cwv: {
    ttfbMs: number;
    fcpMs: number;
    lcpMs: number;
    cls: number;
    domInteractiveMs: number;
    domCompleteMs: number;
    loadEventMs: number;
    overlayDismissMs: number;
  };
  lcpBreakdown: {
    element: string | null;
    id: string | null;
    className: string | null;
    url: string | null;
    size: number;
    ttfbMs: number;
    ttfbPct: number;
    resourceLoadDelayMs: number;
    resourceLoadDelayPct: number;
    resourceLoadDurationMs: number;
    resourceLoadDurationPct: number;
    elementRenderDelayMs: number;
    elementRenderDelayPct: number;
  };
  longTasks: {
    count: number;
    totalBlockingTimeMs: number;
    maxTaskDurationMs: number;
    tasks: Array<{ duration: number; startTime: number; name: string }>;
  };
  network: {
    totalRequests: number;
    totalTransferKb: number;
    failedRequests: Array<{ url: string; error: string }>;
    slowestResources: Array<{ url: string; initiatorType: string; durationMs: number; transferKb: number }>;
    renderBlockingInHead: string[];
  };
  domAndAnimations: {
    domNodes: number;
    activeAnimationsTotal: number;
    infiniteAnimationsCount: number;
    infiniteAnimationsSample: string[];
    lcpDomIssues: Array<{ issue: string; element: string; fix: string }>;
  };
  scrollFluidity: {
    totalFrames: number;
    avgFps: number;
    p95FrameMs: number;
    maxFrameMs: number;
    jankFramesOver28ms: number;
    jankFramesOver33ms: number;
    smoothnessScorePct: number;
    cdpLayoutCountDelta: number;
    cdpRecalcStyleCountDelta: number;
    cdpScriptDurationMsDelta: number;
    cdpTaskDurationMsDelta: number;
    jsHeapUsedMb: number;
  };
  consoleErrors: string[];
}

const PAGES = [
  { name: 'Home-ES', url: '/' },
  { name: 'Home-EN', url: '/index-en.html' },
  { name: 'Planes-ES', url: '/planes/index.html' },
  { name: 'Project-Detail-ES', url: '/project.html?slug=blessed-barber-studio' }
];

const auditReport: {
  timestamp: string;
  results: PageAuditResult[];
  throttledMobileHome?: any;
} = {
  timestamp: new Date().toISOString(),
  results: []
};

test.describe('Auditoría Completa de Rendimiento y Fluidez (Playwright + Chrome DevTools CDP + TS-Sprite)', () => {
  for (const pageDef of PAGES) {
    test(`1. Core Web Vitals, LCP Breakdown, Red y Fluidez de Scroll (Desktop) - ${pageDef.name}`, async ({ page, context }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      const cdp = await context.newCDPSession(page);
      await cdp.send('Performance.enable');

      const consoleErrors: string[] = [];
      const failedRequests: Array<{ url: string; error: string }> = [];

      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });
      page.on('pageerror', err => {
        consoleErrors.push(err.message);
      });
      page.on('requestfailed', req => {
        const failure = req.failure();
        if (failure && failure.errorText !== 'net::ERR_ABORTED') {
          failedRequests.push({ url: req.url(), error: failure.errorText });
        }
      });

      // Inject PerformanceObservers BEFORE navigation starts
      await page.addInitScript(() => {
        (window as any).__perfAudit = {
          lcpEntries: [] as any[],
          clsValue: 0,
          longTasks: [] as any[],
          fcpMs: 0,
          navStartWall: performance.now()
        };

        try {
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries() as any[]) {
              (window as any).__perfAudit.lcpEntries.push({
                element: entry.element ? entry.element.tagName : null,
                id: entry.element ? entry.element.id : null,
                className: entry.element && entry.element.className ? String(entry.element.className).slice(0, 120) : null,
                url: entry.url || null,
                startTime: entry.startTime,
                renderTime: entry.renderTime,
                loadTime: entry.loadTime,
                size: entry.size
              });
            }
          }).observe({ type: 'largest-contentful-paint', buffered: true });
        } catch (e) {}

        try {
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries() as any[]) {
              if (!entry.hadRecentInput) {
                (window as any).__perfAudit.clsValue += entry.value;
              }
            }
          }).observe({ type: 'layout-shift', buffered: true });
        } catch (e) {}

        try {
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries() as any[]) {
              (window as any).__perfAudit.longTasks.push({
                duration: Math.round(entry.duration),
                startTime: Math.round(entry.startTime),
                name: entry.name
              });
            }
          }).observe({ type: 'longtask', buffered: true });
        } catch (e) {}
      });

      const navStart = Date.now();
      await page.goto(pageDef.url, { waitUntil: 'load', timeout: 30000 });

      // Measure how long until #page-transition-overlay is dismissed (if present)
      const overlayDismissMs = await page.evaluate(async () => {
        const overlay = document.getElementById('page-transition-overlay');
        if (!overlay) return 0;
        if (!overlay.classList.contains('active')) return Math.round(performance.now());
        return await new Promise<number>((resolve) => {
          const check = () => {
            if (!overlay.classList.contains('active') || overlay.getAttribute('aria-hidden') === 'true') {
              resolve(Math.round(performance.now()));
            } else if (performance.now() > 5000) {
              resolve(Math.round(performance.now()));
            } else {
              requestAnimationFrame(check);
            }
          };
          requestAnimationFrame(check);
        });
      });

      // Wait briefly for buffered observers to flush
      await page.waitForTimeout(400);

      // Collect CWV, LCP Breakdown & Chrome DevTools LCP DOM Audit Snippet
      const metricsData = await page.evaluate(() => {
        const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paints = performance.getEntriesByType('paint');
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        const audit = (window as any).__perfAudit;

        const ttfbMs = Math.round(nav ? nav.responseStart : 0);
        const fcpEntry = paints.find(p => p.name === 'first-contentful-paint');
        const fcpMs = Math.round(fcpEntry ? fcpEntry.startTime : 0);

        const lastLcp = audit.lcpEntries.length > 0 ? audit.lcpEntries[audit.lcpEntries.length - 1] : null;
        const lcpMs = Math.round(lastLcp ? lastLcp.startTime : fcpMs);

        // LCP 4 Subparts calculation (per debug-optimize-lcp skill)
        let resourceLoadDelayMs = 0;
        let resourceLoadDurationMs = 0;
        let elementRenderDelayMs = Math.max(0, lcpMs - ttfbMs);

        if (lastLcp && lastLcp.url) {
          const lcpRes = resources.find(r => r.name === lastLcp.url);
          if (lcpRes) {
            resourceLoadDelayMs = Math.max(0, Math.round(lcpRes.startTime - ttfbMs));
            resourceLoadDurationMs = Math.max(0, Math.round(lcpRes.responseEnd - lcpRes.startTime));
            elementRenderDelayMs = Math.max(0, Math.round(lcpMs - lcpRes.responseEnd));
          }
        }

        const safeLcp = Math.max(lcpMs, 1);

        // Long tasks & TBT
        let tbt = 0;
        let maxTask = 0;
        for (const lt of audit.longTasks) {
          tbt += Math.max(0, lt.duration - 50);
          if (lt.duration > maxTask) maxTask = lt.duration;
        }

        // Network waterfall stats
        let totalTransfer = nav ? (nav.transferSize || 0) : 0;
        const slowest = resources
          .map(r => {
            totalTransfer += r.transferSize || 0;
            return {
              url: r.name.replace(window.location.origin, ''),
              initiatorType: r.initiatorType,
              durationMs: Math.round(r.duration),
              transferKb: Math.round((r.transferSize || r.encodedBodySize || 0) / 1024)
            };
          })
          .sort((a, b) => b.durationMs - a.durationMs)
          .slice(0, 8);

        // Chrome DevTools debug-optimize-lcp Common Issues Audit Snippet
        const lcpDomIssues: Array<{ issue: string; element: string; fix: string }> = [];
        document.querySelectorAll('img[loading="lazy"]').forEach(img => {
          const rect = img.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0 && rect.width > 0) {
            lcpDomIssues.push({
              issue: 'lazy-loaded image in initial viewport',
              element: img.outerHTML.substring(0, 160),
              fix: 'Remove loading="lazy" from initial viewport images'
            });
          }
        });

        document.querySelectorAll('img:not([fetchpriority])').forEach(img => {
          const rect = img.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.width * rect.height > 25000) {
            lcpDomIssues.push({
              issue: 'large viewport image without fetchpriority="high"',
              element: img.outerHTML.substring(0, 160),
              fix: 'Add fetchpriority="high" to this hero/viewport image'
            });
          }
        });

        const renderBlockingInHead: string[] = [];
        document.querySelectorAll('head script:not([async]):not([defer]):not([type="module"])').forEach(s => {
          if ((s as HTMLScriptElement).src) {
            renderBlockingInHead.push((s as HTMLScriptElement).src);
          }
        });
        document.querySelectorAll('body script[src]:not([async]):not([defer]):not([type="module"])').forEach(s => {
          renderBlockingInHead.push('[body-sync] ' + (s as HTMLScriptElement).src);
        });

        // Active CSS/Web Animations inspection
        const anims = document.getAnimations ? document.getAnimations() : [];
        const infiniteAnims: string[] = [];
        anims.forEach((a: any) => {
          const timing = a.effect?.getTiming?.();
          if (timing && timing.iterations === Infinity) {
            const target = a.effect?.target as HTMLElement | null;
            const label = `${a.animationName || 'anim'} on <${target?.tagName.toLowerCase() || '?'}${target?.id ? '#' + target.id : ''}${target?.className ? '.' + String(target.className).split(' ')[0] : ''}>`;
            infiniteAnims.push(label);
          }
        });

        return {
          cwv: {
            ttfbMs,
            fcpMs,
            lcpMs,
            cls: Number(audit.clsValue.toFixed(4)),
            domInteractiveMs: Math.round(nav ? nav.domInteractive : 0),
            domCompleteMs: Math.round(nav ? nav.domComplete : 0),
            loadEventMs: Math.round(nav ? nav.loadEventEnd : 0)
          },
          lcpBreakdown: {
            element: lastLcp?.element || null,
            id: lastLcp?.id || null,
            className: lastLcp?.className || null,
            url: lastLcp?.url || null,
            size: lastLcp?.size || 0,
            ttfbMs,
            ttfbPct: Math.round((ttfbMs / safeLcp) * 100),
            resourceLoadDelayMs,
            resourceLoadDelayPct: Math.round((resourceLoadDelayMs / safeLcp) * 100),
            resourceLoadDurationMs,
            resourceLoadDurationPct: Math.round((resourceLoadDurationMs / safeLcp) * 100),
            elementRenderDelayMs,
            elementRenderDelayPct: Math.round((elementRenderDelayMs / safeLcp) * 100)
          },
          longTasks: {
            count: audit.longTasks.length,
            totalBlockingTimeMs: tbt,
            maxTaskDurationMs: maxTask,
            tasks: audit.longTasks.slice(0, 10)
          },
          network: {
            totalRequests: resources.length + 1,
            totalTransferKb: Math.round(totalTransfer / 1024),
            slowestResources: slowest,
            renderBlockingInHead
          },
          domAndAnimations: {
            domNodes: document.querySelectorAll('*').length,
            activeAnimationsTotal: anims.length,
            infiniteAnimationsCount: infiniteAnims.length,
            infiniteAnimationsSample: Array.from(new Set(infiniteAnims)).slice(0, 15),
            lcpDomIssues
          }
        };
      });

      // Measure Scroll Fluidity + CDP Performance Metrics Delta
      const cdpBefore = await cdp.send('Performance.getMetrics');
      const getMetric = (list: any[], name: string) => list.find((m: any) => m.name === name)?.value || 0;

      await page.evaluate(() => {
        (window as any).__scrollDeltas = [] as number[];
        (window as any).__scrollingActive = true;
        let last = performance.now();
        function rec(now: number) {
          (window as any).__scrollDeltas.push(now - last);
          last = now;
          if ((window as any).__scrollingActive) requestAnimationFrame(rec);
        }
        requestAnimationFrame(rec);
      });

      for (let y = 0; y <= 3600; y += 180) {
        await page.evaluate((top) => window.scrollTo(0, top), y);
        await page.waitForTimeout(16);
      }
      for (let y = 3600; y >= 0; y -= 180) {
        await page.evaluate((top) => window.scrollTo(0, top), y);
        await page.waitForTimeout(16);
      }

      const scrollStats = await page.evaluate(() => {
        (window as any).__scrollingActive = false;
        const clean = ((window as any).__scrollDeltas || []).slice(1) as number[];
        const sorted = [...clean].sort((a, b) => a - b);
        const totalMs = clean.reduce((a, b) => a + b, 0);
        const avgDelta = clean.length ? totalMs / clean.length : 16.6;
        const p95 = sorted.length ? sorted[Math.floor(sorted.length * 0.95)] : 16.6;
        const maxD = sorted.length ? sorted[sorted.length - 1] : 16.6;
        const jank28 = clean.filter(d => d > 28).length;
        const jank33 = clean.filter(d => d > 33.3).length;

        return {
          totalFrames: clean.length,
          avgFps: Math.min(120, Math.round(1000 / Math.max(avgDelta, 8.33))),
          p95FrameMs: Number(p95.toFixed(1)),
          maxFrameMs: Number(maxD.toFixed(1)),
          jankFramesOver28ms: jank28,
          jankFramesOver33ms: jank33,
          smoothnessScorePct: clean.length ? Math.round(((clean.length - jank28) / clean.length) * 100) : 100
        };
      });

      const cdpAfter = await cdp.send('Performance.getMetrics');

      const result: PageAuditResult = {
        pageName: pageDef.name,
        url: pageDef.url,
        viewport: 'Desktop 1440x900',
        cwv: {
          ...metricsData.cwv,
          overlayDismissMs
        },
        lcpBreakdown: metricsData.lcpBreakdown,
        longTasks: metricsData.longTasks,
        network: {
          ...metricsData.network,
          failedRequests
        },
        domAndAnimations: metricsData.domAndAnimations,
        scrollFluidity: {
          ...scrollStats,
          cdpLayoutCountDelta: getMetric(cdpAfter.metrics, 'LayoutCount') - getMetric(cdpBefore.metrics, 'LayoutCount'),
          cdpRecalcStyleCountDelta: getMetric(cdpAfter.metrics, 'RecalcStyleCount') - getMetric(cdpBefore.metrics, 'RecalcStyleCount'),
          cdpScriptDurationMsDelta: Math.round((getMetric(cdpAfter.metrics, 'ScriptDuration') - getMetric(cdpBefore.metrics, 'ScriptDuration')) * 1000),
          cdpTaskDurationMsDelta: Math.round((getMetric(cdpAfter.metrics, 'TaskDuration') - getMetric(cdpBefore.metrics, 'TaskDuration')) * 1000),
          jsHeapUsedMb: Number((getMetric(cdpAfter.metrics, 'JSHeapUsedSize') / (1024 * 1024)).toFixed(2))
        },
        consoleErrors
      };

      auditReport.results.push(result);
      expect(failedRequests.length).toBe(0);
    });
  }

  test('2. Emulación Móvil con Throttling (CPU 4x + Red 4G Lenta) - Home-ES', async ({ page, context }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    const cdp = await context.newCDPSession(page);
    await cdp.send('Performance.enable');
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 150, // 150ms RTT (Fast 3G / Slow 4G)
      downloadThroughput: (1.6 * 1024 * 1024) / 8, // 1.6 Mbps
      uploadThroughput: (750 * 1024) / 8
    });

    await page.addInitScript(() => {
      (window as any).__throttledLcp = null;
      (window as any).__throttledLongTasks = [] as any[];
      try {
        new PerformanceObserver((list) => {
          const entries = list.getEntries() as any[];
          if (entries.length) {
            const last = entries[entries.length - 1];
            (window as any).__throttledLcp = {
              startTime: Math.round(last.startTime),
              element: last.element?.tagName || null,
              url: last.url || null
            };
          }
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (e) {}
      try {
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) {
            (window as any).__throttledLongTasks.push({
              duration: Math.round(e.duration),
              startTime: Math.round(e.startTime)
            });
          }
        }).observe({ type: 'longtask', buffered: true });
      } catch (e) {}
    });

    await page.goto('/', { waitUntil: 'load', timeout: 45000 });
    await page.waitForTimeout(500);

    const mobileMetrics = await page.evaluate(async () => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paints = performance.getEntriesByType('paint');
      const fcp = paints.find(p => p.name === 'first-contentful-paint')?.startTime || 0;
      const lts = (window as any).__throttledLongTasks || [];
      const tbt = lts.reduce((acc: number, t: any) => acc + Math.max(0, t.duration - 50), 0);

      // Mobile scroll test under 4x CPU throttling
      const scrollRes = await new Promise<any>((resolve) => {
        const deltas: number[] = [];
        let last = performance.now();
        let active = true;
        const raf = (now: number) => {
          deltas.push(now - last);
          last = now;
          if (active) requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);

        let y = 0;
        const timer = setInterval(() => {
          y += 150;
          window.scrollTo(0, y);
          if (y >= 3500) {
            clearInterval(timer);
            active = false;
            const clean = deltas.slice(1);
            const total = clean.reduce((a, b) => a + b, 0);
            const avg = clean.length ? total / clean.length : 16.6;
            const jank33 = clean.filter(d => d > 33.3).length;
            resolve({
              avgFps: Math.round(1000 / Math.max(avg, 16.6)),
              jankFramesOver33ms: jank33,
              totalFrames: clean.length,
              maxFrameMs: clean.length ? Math.round(Math.max(...clean)) : 0
            });
          }
        }, 20);
      });

      return {
        ttfbMs: Math.round(nav ? nav.responseStart : 0),
        fcpMs: Math.round(fcp),
        lcp: (window as any).__throttledLcp,
        domCompleteMs: Math.round(nav ? nav.domComplete : 0),
        loadEventMs: Math.round(nav ? nav.loadEventEnd : 0),
        longTasksCount: lts.length,
        totalBlockingTimeMs: tbt,
        scrollUnderThrottling: scrollRes
      };
    });

    auditReport.throttledMobileHome = mobileMetrics;

    const outDir = path.resolve('docs');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'full_perf_fluidity_audit.json'), JSON.stringify(auditReport, null, 2));
  });

  test('3. Verificación TC003 (Home-EN Hero + Cookie Banner) y TC006 (Uso inmediato tras Overlay)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // --- TC003: English Homepage Hero & Cookie Banner ---
    await page.goto('/index-en.html', { waitUntil: 'load' });
    await expect(page.locator('#page-transition-overlay')).not.toHaveClass(/active/, { timeout: 2000 });

    // Closed legal modals and their close buttons must be strictly hidden from accessibility/hit-testing
    const modalCloseBtns = page.locator('.modal-wrapper .modal-close');
    const count = await modalCloseBtns.count();
    for (let i = 0; i < count; i++) {
      await expect(modalCloseBtns.nth(i)).toBeHidden();
    }

    // Cookie banner must be visible and immediately clickable without DOM detachment
    const acceptBtnEn = page.locator('#cookie-accept-all');
    await expect(acceptBtnEn).toBeVisible({ timeout: 2000 });
    await acceptBtnEn.click();
    await expect(page.locator('#cookie-banner')).not.toHaveClass(/active/, { timeout: 1500 });

    // English Hero logo and CTA must be visible and interactive
    await expect(page.locator('img.mnx-svg')).toBeVisible();
    const enHeroDiscover = page.locator('#inicio a[href="#nosotros"]').first();
    await expect(enHeroDiscover).toBeVisible();
    await enHeroDiscover.click();

    // --- TC006: Immediate Hero Use After Initial Loading Overlay on Home-ES ---
    await page.evaluate(() => localStorage.clear());
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Wait for intelligent loader to dismiss (< 800ms)
    await expect(page.locator('#page-transition-overlay')).not.toHaveClass(/active/, { timeout: 1500 });

    // Immediately dismiss cookie banner and use Hero CTA
    const acceptBtnEs = page.locator('#cookie-accept-all');
    await expect(acceptBtnEs).toBeVisible({ timeout: 1500 });
    await acceptBtnEs.click();

    const esHeroDiscover = page.locator('#inicio a[href="#nosotros"]').first();
    await expect(esHeroDiscover).toBeVisible();
    await esHeroDiscover.click();
  });
});
