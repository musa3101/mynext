import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5173';
const ARTIFACT_DIR = '/Users/musa/.gemini/antigravity/brain/60e5d3b2-4089-4c21-8ac9-8659819c6910';

if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

const auditResults = {
  timestamp: new Date().toISOString(),
  devices: {},
  consoleErrors: [],
  networkErrors: [],
  performance: {},
  summary: []
};

function log(section, msg, status = 'INFO') {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : status === 'WARN' ? '⚠️' : 'ℹ️';
  console.log(`[${status}] [${section}] ${msg}`);
}

async function runComprehensiveAudit() {
  console.log('======================================================================');
  console.log('🔍 AUDITORÍA INTEGRAL DE RESPONSIVE, FLUJOS DE USUARIO Y RENDIMIENTO');
  console.log(`🎯 URL Objetivo: ${BASE_URL}`);
  console.log(`📁 Directorio de Artefactos: ${ARTIFACT_DIR}`);
  console.log('======================================================================\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-gpu-vsync', '--enable-gpu-rasterization']
  });

  try {
    // -------------------------------------------------------------------------
    // 1. MOBILE AUDIT: iPhone 14 (390x844) & iPhone SE (375x667)
    // -------------------------------------------------------------------------
    const mobileDevices = [
      {
        name: 'iPhone 14',
        viewport: { width: 390, height: 844 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
        isMobile: true,
        hasTouch: true
      },
      {
        name: 'iPhone SE',
        viewport: { width: 375, height: 667 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
        isMobile: true,
        hasTouch: true
      }
    ];

    for (const dev of mobileDevices) {
      console.log(`\n📱 >>> PROBANDO DISPOSITIVO MÓVIL: ${dev.name} (${dev.viewport.width}x${dev.viewport.height}) <<<`);
      const context = await browser.newContext({
        viewport: dev.viewport,
        userAgent: dev.userAgent,
        isMobile: dev.isMobile,
        hasTouch: dev.hasTouch,
        deviceScaleFactor: 2
      });
      const page = await context.newPage();

      // Listen for errors
      page.on('console', msg => {
        if (msg.type() === 'error') {
          const text = msg.text();
          // Filter benign/expected dev messages
          if (!text.includes('favicon') && !text.includes('clarity.ms')) {
            auditResults.consoleErrors.push({ device: dev.name, text });
            log(dev.name, `Console Error: ${text}`, 'FAIL');
          }
        }
      });
      page.on('pageerror', err => {
        auditResults.consoleErrors.push({ device: dev.name, text: err.message, stack: err.stack });
        log(dev.name, `Page Exception: ${err.message}`, 'FAIL');
      });
      page.on('requestfailed', req => {
        if (!req.url().includes('favicon') && !req.url().includes('clarity.ms') && !req.url().includes('google-analytics')) {
          auditResults.networkErrors.push({ device: dev.name, url: req.url(), error: req.failure()?.errorText });
          log(dev.name, `Request Failed: ${req.url()} (${req.failure()?.errorText})`, 'WARN');
        }
      });

      await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      const devResult = {
        name: dev.name,
        overflow: null,
        mobileMenu: null,
        reviewModal: null,
        contactForm: null,
        contactInputsFontSize: null,
        calTabSwitch: null,
        footerAgendarLink: null,
        projectPageCta: null
      };

      // 1.a) Horizontal Overflow Check during full page scroll
      console.log(`   1. Comprobando Desbordamiento Horizontal (Horizontal Overflow)...`);
      const overflowDetails = await page.evaluate(async () => {
        const totalHeight = document.documentElement.scrollHeight;
        let maxScrollWidth = 0;
        let overflowingElements = [];
        const windowWidth = window.innerWidth;

        for (let y = 0; y <= totalHeight; y += 400) {
          window.scrollTo(0, y);
          await new Promise(r => setTimeout(r, 20));
          const docScrollWidth = document.documentElement.scrollWidth;
          const bodyScrollWidth = document.body.scrollWidth;
          const currentMax = Math.max(docScrollWidth, bodyScrollWidth);
          if (currentMax > maxScrollWidth) maxScrollWidth = currentMax;

          if (currentMax > windowWidth) {
            const allElements = document.querySelectorAll('*');
            allElements.forEach(el => {
              const r = el.getBoundingClientRect();
              if (r.right > windowWidth + 1 && el.offsetParent !== null) {
                const tag = el.tagName.toLowerCase();
                const cls = (el.className || '').toString().slice(0, 50);
                const id = el.id ? `#${el.id}` : '';
                const desc = `${tag}${id}.${cls}`;
                if (!overflowingElements.includes(desc) && overflowingElements.length < 5) {
                  overflowingElements.push(desc);
                }
              }
            });
          }
        }
        window.scrollTo(0, 0);

        return {
          windowWidth,
          maxScrollWidth,
          hasOverflow: maxScrollWidth > windowWidth,
          overflowDiff: maxScrollWidth - windowWidth,
          overflowingElements
        };
      });

      devResult.overflow = overflowDetails;
      if (!overflowDetails.hasOverflow) {
        log(dev.name, `Desbordamiento horizontal: PERFECTO (0px overflow, ancho: ${overflowDetails.windowWidth}px)`, 'PASS');
      } else {
        log(dev.name, `Desbordamiento horizontal detectado: +${overflowDetails.overflowDiff}px (Culpables: ${overflowDetails.overflowingElements.join(', ')})`, 'FAIL');
      }

      // Save mobile home screenshot
      if (dev.name === 'iPhone 14') {
        await page.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_sub1_mobile_home.png') });
        log(dev.name, 'Guardada captura: audit_sub1_mobile_home.png', 'INFO');
      }

      // 1.b) Mobile Menu Drawer Open / Close
      console.log(`   2. Probando Apertura y Cierre del Menú Drawer Móvil...`);
      const menuBtn = page.locator('#mobile-menu-btn');
      const isMenuBtnVisible = await menuBtn.isVisible();

      if (!isMenuBtnVisible) {
        log(dev.name, 'Botón de menú móvil #mobile-menu-btn no visible', 'FAIL');
        devResult.mobileMenu = { success: false, error: 'Button not visible' };
      } else {
        await menuBtn.click({ force: true });
        await page.waitForTimeout(500);

        const isDropdownOpen = await page.evaluate(() => {
          const dropdown = document.getElementById('mobile-dropdown');
          return dropdown ? dropdown.classList.contains('is-open') && dropdown.getAttribute('aria-hidden') === 'false' : false;
        });

        if (dev.name === 'iPhone 14') {
          await page.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_sub1_mobile_menu.png') });
          log(dev.name, 'Guardada captura: audit_sub1_mobile_menu.png', 'INFO');
        }

        const menuCloseBtn = page.locator('#mobile-menu-close');
        await menuCloseBtn.click({ force: true });
        await page.waitForTimeout(500);

        const isDropdownClosed = await page.evaluate(() => {
          const dropdown = document.getElementById('mobile-dropdown');
          return dropdown ? !dropdown.classList.contains('is-open') && dropdown.getAttribute('aria-hidden') === 'true' : false;
        });

        const menuSuccess = isDropdownOpen && isDropdownClosed;
        devResult.mobileMenu = { success: menuSuccess, opened: isDropdownOpen, closed: isDropdownClosed };
        log(dev.name, `Menú Drawer Móvil (Apertura y Cierre): ${menuSuccess ? 'CORRECTO' : 'FALLO'}`, menuSuccess ? 'PASS' : 'FAIL');
      }

      // 1.c) Review Cards Touch Drag & Modal Popup
      console.log(`   3. Probando Carrusel / Marquee de Reseñas y Modal Popup (#review-detail-modal)...`);
      await page.evaluate(() => {
        const el = document.getElementById('reviews');
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
      });
      await page.waitForTimeout(600);

      // Verify touch drag simulation
      const touchDragResult = await page.evaluate(() => {
        const container = document.querySelector('.reviews-slider-container');
        if (!container) return { success: false, reason: 'No container' };

        // Test touch gesture simulation
        const startX = 250;
        const endX = 80;
        const y = container.getBoundingClientRect().top + 50;

        try {
          const t1 = new Touch({ identifier: 1, target: container, clientX: startX, clientY: y });
          container.dispatchEvent(new TouchEvent('touchstart', { touches: [t1], bubbles: true, cancelable: true }));

          const t2 = new Touch({ identifier: 1, target: container, clientX: endX, clientY: y });
          container.dispatchEvent(new TouchEvent('touchmove', { touches: [t2], bubbles: true, cancelable: true }));

          const t3 = new Touch({ identifier: 1, target: container, clientX: endX, clientY: y });
          container.dispatchEvent(new TouchEvent('touchend', { touches: [], changedTouches: [t3], bubbles: true, cancelable: true }));

          return { success: true };
        } catch (e) {
          return { success: false, error: e.message };
        }
      });

      // Open review modal (#review-detail-modal)
      const reviewModalOpenResult = await page.evaluate(() => {
        const btn = document.querySelector('.open-review-modal-btn');
        if (!btn) return { hasBtn: false };
        btn.click();
        const modal = document.getElementById('review-detail-modal');
        const name = document.getElementById('modal-review-name')?.textContent || '';
        const text = document.getElementById('modal-review-text')?.textContent || '';
        const isVisible = modal ? modal.classList.contains('opacity-100') && !modal.classList.contains('pointer-events-none') : false;
        return { hasBtn: true, isVisible, name, textLen: text.length };
      });

      if (dev.name === 'iPhone 14' && reviewModalOpenResult.isVisible) {
        await page.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_sub1_mobile_review_modal.png') });
        log(dev.name, 'Guardada captura: audit_sub1_mobile_review_modal.png', 'INFO');
      }

      // Close review modal
      const reviewModalCloseResult = await page.evaluate(() => {
        const closeBtn = document.getElementById('close-review-modal-btn');
        if (closeBtn) closeBtn.click();
        const modal = document.getElementById('review-detail-modal');
        const isClosed = modal ? modal.classList.contains('opacity-0') : false;
        return { isClosed };
      });

      const reviewSuccess = reviewModalOpenResult.hasBtn && reviewModalOpenResult.isVisible && reviewModalCloseResult.isClosed;
      devResult.reviewModal = {
        success: reviewSuccess,
        touchDrag: touchDragResult,
        modalOpened: reviewModalOpenResult.isVisible,
        modalClosed: reviewModalCloseResult.isClosed,
        reviewerName: reviewModalOpenResult.name
      };
      log(dev.name, `Reseñas: Modal Popup Abrir y Cerrar: ${reviewSuccess ? 'CORRECTO' : 'FALLO'} (Revisor: "${reviewModalOpenResult.name}")`, reviewSuccess ? 'PASS' : 'FAIL');

      // 1.d) Contact Section Default Form & Font-Size >= 16px (iOS auto-zoom prevention)
      console.log(`   4. Probando Sección #contacto y Prevención de Zoom iOS (font-size >= 16px)...`);
      await page.evaluate(() => {
        const el = document.getElementById('contacto');
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
      });
      await page.waitForTimeout(600);

      // Verify default state
      const formDefaultState = await page.evaluate(() => {
        const form = document.getElementById('email-contact-form');
        const calPanel = document.getElementById('cal-booking-panel');
        const isFormActive = form ? form.classList.contains('contact-panel-active') : false;
        const isCalHidden = calPanel ? calPanel.classList.contains('contact-panel-hidden') : false;
        return { isFormActive, isCalHidden };
      });

      // Check input font-sizes
      const inputFontSizes = await page.evaluate(() => {
        const form = document.getElementById('email-contact-form');
        if (!form) return [];
        const inputs = form.querySelectorAll('input:not([type="hidden"]), select, textarea');
        const details = [];
        inputs.forEach(input => {
          if (input.name === '_honey') return;
          const style = window.getComputedStyle(input);
          const fs = parseFloat(style.fontSize);
          details.push({
            name: input.getAttribute('name') || input.id,
            fontSize: fs,
            fontSizeStr: style.fontSize,
            tag: input.tagName.toLowerCase(),
            passesIosZoom: fs >= 16
          });
        });
        return details;
      });

      const allInputsPassIos = inputFontSizes.length > 0 && inputFontSizes.every(inp => inp.passesIosZoom);
      devResult.contactInputsFontSize = {
        allPass: allInputsPassIos,
        inputs: inputFontSizes
      };

      log(dev.name, `Formulario activo por defecto: ${formDefaultState.isFormActive && formDefaultState.isCalHidden ? 'SÍ' : 'NO'}`, (formDefaultState.isFormActive && formDefaultState.isCalHidden) ? 'PASS' : 'FAIL');
      log(dev.name, `Font-size >= 16px en todos los inputs (previene zoom iOS): ${allInputsPassIos ? 'SÍ (100% compliant: ' + inputFontSizes.map(i => i.fontSizeStr).join(', ') + ')' : 'NO'}`, allInputsPassIos ? 'PASS' : 'FAIL');

      if (dev.name === 'iPhone 14') {
        await page.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_sub1_mobile_contact_form.png') });
        log(dev.name, 'Guardada captura: audit_sub1_mobile_contact_form.png', 'INFO');
      }

      // 1.e) Contact Tabs Switching: Form -> Cal.com -> Form
      console.log(`   5. Probando Cambio de Pestañas en Contacto (Formulario <-> Cal.com)...`);
      const calTabBtn = page.locator('#tab-btn-cal');
      await calTabBtn.click({ force: true });
      await page.waitForTimeout(600);

      const calState = await page.evaluate(() => {
        const form = document.getElementById('email-contact-form');
        const calPanel = document.getElementById('cal-booking-panel');
        const iframe = document.getElementById('cal-embed-iframe');
        const tabCal = document.getElementById('tab-btn-cal');

        const isFormHidden = form ? form.classList.contains('contact-panel-hidden') : false;
        const isCalActive = calPanel ? calPanel.classList.contains('contact-panel-active') : false;
        const isCalSelected = tabCal ? tabCal.getAttribute('aria-selected') === 'true' : false;
        const currentSrc = (iframe?.src || iframe?.getAttribute('src') || '');
        const hasCalSrc = currentSrc.includes('cal.com');

        const formDisplay = form ? window.getComputedStyle(form).display : 'none';
        const calDisplay = calPanel ? window.getComputedStyle(calPanel).display : 'none';

        return {
          isFormHidden,
          isCalActive,
          isCalSelected,
          hasCalSrc,
          currentSrc,
          formDisplay,
          calDisplay
        };
      });

      const calTabSuccess = calState.isFormHidden && calState.isCalActive && calState.isCalSelected && calState.hasCalSrc;
      devResult.calTabSwitch = { success: calTabSuccess, ...calState };
      log(dev.name, `Pestaña Cal.com activada sin solapamiento (Form display: ${calState.formDisplay}, Cal display: ${calState.calDisplay}): ${calTabSuccess ? 'CORRECTO' : 'FALLO'}`, calTabSuccess ? 'PASS' : 'FAIL');

      if (dev.name === 'iPhone 14') {
        await page.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_sub1_mobile_cal.png') });
        log(dev.name, 'Guardada captura: audit_sub1_mobile_cal.png', 'INFO');
      }

      // Switch back to Form
      const formTabBtn = page.locator('#tab-btn-form');
      await formTabBtn.click({ force: true });
      await page.waitForTimeout(400);

      const switchedBack = await page.evaluate(() => {
        const form = document.getElementById('email-contact-form');
        const calPanel = document.getElementById('cal-booking-panel');
        return form && calPanel && form.classList.contains('contact-panel-active') && calPanel.classList.contains('contact-panel-hidden');
      });
      log(dev.name, `Regreso a Pestaña Propuesta limpio: ${switchedBack ? 'CORRECTO' : 'FALLO'}`, switchedBack ? 'PASS' : 'FAIL');

      // 1.f) Footer Navigation Link: "Agendar Cita" (href="#contacto?tab=cal")
      console.log(`   6. Probando Enlace de Footer "Agendar Cita" (deep-link a pestaña Cal.com)...`);
      const footerCalLink = page.locator('footer nav a[href="#contacto?tab=cal"]');
      await footerCalLink.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);

      const isFooterLinkVisible = await footerCalLink.isVisible();
      let footerNavSuccess = false;
      if (isFooterLinkVisible) {
        await footerCalLink.click({ force: true });
        await page.waitForTimeout(700);

        footerNavSuccess = await page.evaluate(() => {
          const calPanel = document.getElementById('cal-booking-panel');
          const isCalActive = calPanel ? calPanel.classList.contains('contact-panel-active') : false;
          const hashMatches = window.location.hash.includes('tab=cal');
          return isCalActive && hashMatches;
        });
      }

      devResult.footerAgendarLink = { success: footerNavSuccess, visible: isFooterLinkVisible };
      log(dev.name, `Enlace Footer "Agendar Cita" activa pestaña Cal.com: ${footerNavSuccess ? 'CORRECTO' : 'FALLO'}`, footerNavSuccess ? 'PASS' : 'FAIL');

      // 1.g) Individual Project Page: Blessed Barber Studio CTA
      console.log(`   7. Probando Página de Proyecto Individual (/project?slug=blessed-barber-studio)...`);
      await page.goto(`${BASE_URL}/project?slug=blessed-barber-studio`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      const projOverflow = await page.evaluate(() => {
        return {
          windowWidth: window.innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          hasOverflow: document.documentElement.scrollWidth > window.innerWidth
        };
      });

      const projCta = page.locator('main a[href="/#contacto?tab=cal"]');
      await projCta.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      const isProjCtaVisible = await projCta.isVisible();

      if (dev.name === 'iPhone 14') {
        await page.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_sub1_project_cta.png') });
        log(dev.name, 'Guardada captura: audit_sub1_project_cta.png', 'INFO');
      }

      let ctaClickSuccess = false;
      if (isProjCtaVisible) {
        await projCta.click({ force: true });
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        ctaClickSuccess = await page.evaluate(() => {
          const calPanel = document.getElementById('cal-booking-panel');
          const isCalActive = calPanel ? calPanel.classList.contains('contact-panel-active') : false;
          const isUrlCorrect = window.location.href.includes('#contacto?tab=cal');
          return isCalActive && isUrlCorrect;
        });
      }

      devResult.projectPageCta = {
        ctaVisible: isProjCtaVisible,
        ctaClickSuccess,
        overflow: projOverflow
      };
      log(dev.name, `CTA en Página de Proyecto funciona y activa pestaña Cal.com: ${ctaClickSuccess ? 'CORRECTO' : 'FALLO'}`, ctaClickSuccess ? 'PASS' : 'FAIL');

      auditResults.devices[dev.name] = devResult;
      await context.close();
    }

    // -------------------------------------------------------------------------
    // 2. TABLET AUDIT: iPad Air (820x1180)
    // -------------------------------------------------------------------------
    console.log(`\n💻 >>> PROBANDO TABLET: iPad Air (820x1180) <<<`);
    const tabletContext = await browser.newContext({
      viewport: { width: 820, height: 1180 },
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2
    });
    const tabletPage = await tabletContext.newPage();
    await tabletPage.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await tabletPage.waitForTimeout(1000);

    const tabletOverflow = await tabletPage.evaluate(() => {
      return {
        windowWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        hasOverflow: document.documentElement.scrollWidth > window.innerWidth
      };
    });

    log('iPad Air', `Desbordamiento horizontal: ${tabletOverflow.hasOverflow ? 'DETECTADO' : 'PERFECTO (0px)'}`, tabletOverflow.hasOverflow ? 'FAIL' : 'PASS');
    await tabletPage.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_sub1_tablet_home.png') });
    log('iPad Air', 'Guardada captura: audit_sub1_tablet_home.png', 'INFO');

    // Portfolio grid check on Tablet (.fan-card in #portfolio-carousel)
    const tabletPortfolio = await tabletPage.evaluate(() => {
      const cards = document.querySelectorAll('.fan-card');
      const container = document.getElementById('portfolio-carousel');
      return {
        cardsCount: cards.length,
        hasContainer: Boolean(container)
      };
    });
    log('iPad Air', `Grid Portfolio 3D Fan renderizado (${tabletPortfolio.cardsCount} proyectos)`, tabletPortfolio.cardsCount > 0 ? 'PASS' : 'FAIL');

    // Contact tab on Tablet
    await tabletPage.evaluate(() => {
      const c = document.getElementById('contacto');
      if (c) c.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await tabletPage.waitForTimeout(500);
    await tabletPage.locator('#tab-btn-cal').click({ force: true });
    await tabletPage.waitForTimeout(600);
    await tabletPage.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_sub1_tablet_contact.png') });
    log('iPad Air', 'Guardada captura: audit_sub1_tablet_contact.png', 'INFO');

    auditResults.devices['iPad Air'] = {
      overflow: tabletOverflow,
      portfolio: tabletPortfolio
    };
    await tabletContext.close();

    // -------------------------------------------------------------------------
    // 3. DESKTOP AUDIT: 1440x900
    // -------------------------------------------------------------------------
    console.log(`\n🖥️ >>> PROBANDO ESCRITORIO: Desktop (1440x900) <<<`);
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      isMobile: false,
      hasTouch: false
    });
    const desktopPage = await desktopContext.newPage();
    await desktopPage.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await desktopPage.waitForTimeout(1000);

    // Visual screenshot Desktop Hero
    await desktopPage.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_sub1_desktop_hero.png') });
    log('Desktop', 'Guardada captura: audit_sub1_desktop_hero.png', 'INFO');

    // Visual screenshot Portfolio
    await desktopPage.evaluate(() => {
      const p = document.getElementById('portfolio');
      if (p) p.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await desktopPage.waitForTimeout(500);
    await desktopPage.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_sub1_desktop_portfolio.png') });
    log('Desktop', 'Guardada captura: audit_sub1_desktop_portfolio.png', 'INFO');

    // FAQ Accordion interaction test
    console.log(`   Probando Acordeón FAQ en Escritorio...`);
    await desktopPage.evaluate(() => {
      const f = document.getElementById('faq');
      if (f) f.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await desktopPage.waitForTimeout(500);

    const faqTrigger = desktopPage.locator('.faq-trigger').first();
    await faqTrigger.click({ force: true });
    await desktopPage.waitForTimeout(300);

    const faqOpened = await desktopPage.evaluate(() => {
      const firstContent = document.querySelector('.faq-content');
      return firstContent ? parseFloat(firstContent.style.maxHeight) > 0 : false;
    });

    await desktopPage.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_sub1_desktop_faq.png') });
    log('Desktop', 'Guardada captura: audit_sub1_desktop_faq.png', 'INFO');

    await faqTrigger.click({ force: true });
    await desktopPage.waitForTimeout(300);
    const faqClosed = await desktopPage.evaluate(() => {
      const firstContent = document.querySelector('.faq-content');
      return firstContent ? parseFloat(firstContent.style.maxHeight) === 0 : false;
    });

    log('Desktop', `Acordeón FAQ Expandir y Contraer: ${faqOpened && faqClosed ? 'CORRECTO' : 'FALLO'}`, faqOpened && faqClosed ? 'PASS' : 'FAIL');

    auditResults.devices['Desktop'] = {
      faqSuccess: faqOpened && faqClosed
    };

    // -------------------------------------------------------------------------
    // 4. PERFORMANCE & JANK / "TIRONES" PROFILING
    // -------------------------------------------------------------------------
    console.log(`\n⚡ >>> PERFILADO DE RENDIMIENTO Y FLUIDEZ DE SCROLL (JANK / TIRONES) <<<`);

    const perfTargets = [
      { name: 'Mobile iPhone 14 (390x844)', width: 390, height: 844, isMobile: true, hasTouch: true },
      { name: 'Desktop 1080p (1440x900)', width: 1440, height: 900, isMobile: false, hasTouch: false }
    ];

    for (const target of perfTargets) {
      console.log(`\n   --- Perfilando Scroll en: ${target.name} ---`);
      const perfContext = await browser.newContext({
        viewport: { width: target.width, height: target.height },
        isMobile: target.isMobile,
        hasTouch: target.hasTouch
      });
      const pPage = await perfContext.newPage();
      await pPage.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
      await pPage.waitForTimeout(1000);

      // Start frame monitor
      await pPage.evaluate(() => {
        window.__scrollFrames = [];
        let lastTime = performance.now();
        function recordFrame() {
          const now = performance.now();
          const delta = now - lastTime;
          window.__scrollFrames.push(delta);
          lastTime = now;
          requestAnimationFrame(recordFrame);
        }
        requestAnimationFrame(recordFrame);
      });

      // Scroll down and up
      const docHeight = await pPage.evaluate(() => document.documentElement.scrollHeight);
      const scrollStep = 180;
      for (let y = 0; y <= docHeight; y += scrollStep) {
        await pPage.evaluate(top => window.scrollTo(0, top), y);
        await new Promise(r => setTimeout(r, 16));
      }
      for (let y = docHeight; y >= 0; y -= scrollStep) {
        await pPage.evaluate(top => window.scrollTo(0, top), y);
        await new Promise(r => setTimeout(r, 16));
      }

      const frameStats = await pPage.evaluate(() => {
        const frames = window.__scrollFrames || [];
        if (frames.length === 0) return { avgFps: 60, jankFrames: 0, severeJank: 0, maxDeltaMs: 16 };

        let jankFrames = 0;
        let severeJank = 0;
        let totalDuration = 0;
        let maxDelta = 0;

        for (const d of frames) {
          if (d > 33.3) jankFrames++; // < 30 fps drop
          if (d > 50.0) severeJank++; // < 20 fps drop
          if (d > maxDelta) maxDelta = d;
          totalDuration += d;
        }

        const avgDelta = totalDuration / frames.length;
        const avgFps = Math.round(1000 / avgDelta);

        return {
          totalFrames: frames.length,
          avgFps,
          jankFrames,
          severeJank,
          jankRate: ((jankFrames / frames.length) * 100).toFixed(1) + '%',
          severeJankRate: ((severeJank / frames.length) * 100).toFixed(1) + '%',
          maxDeltaMs: maxDelta.toFixed(1)
        };
      });

      auditResults.performance[target.name] = frameStats;
      log(target.name, `FPS Promedio: ${frameStats.avgFps} FPS (Objetivo >= 55)`, frameStats.avgFps >= 55 ? 'PASS' : 'WARN');
      log(target.name, `Tirones (Jank Frames >33ms): ${frameStats.jankFrames} (${frameStats.jankRate})`, frameStats.jankFrames <= 5 ? 'PASS' : 'WARN');
      log(target.name, `Tirones Graves (>50ms): ${frameStats.severeJank} (${frameStats.severeJankRate})`, frameStats.severeJank === 0 ? 'PASS' : 'WARN');
      log(target.name, `Retraso Máximo de Cuadro: ${frameStats.maxDeltaMs} ms`, 'INFO');

      await perfContext.close();
    }

    await desktopContext.close();
    await browser.close();

    console.log('\n======================================================================');
    console.log('🏁 AUDITORÍA COMPLETADA CON ÉXITO');
    console.log('======================================================================');

    // Save full JSON report
    fs.writeFileSync(
      path.join(ARTIFACT_DIR, 'audit_playwright_responsive_report.json'),
      JSON.stringify(auditResults, null, 2)
    );
    console.log(`📄 Reporte JSON guardado en: ${path.join(ARTIFACT_DIR, 'audit_playwright_responsive_report.json')}`);

  } catch (error) {
    console.error('❌ Error fatal durante la auditoría:', error);
    if (browser) await browser.close();
    process.exit(1);
  }
}

runComprehensiveAudit();
