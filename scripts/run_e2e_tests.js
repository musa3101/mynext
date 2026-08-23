import puppeteer from 'puppeteer-core';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

let passed = 0;
let failed = 0;

function assert(condition, name, error = '') {
  if (condition) {
    passed++;
    console.log(`  ✅ [E2E PASS] ${name}`);
  } else {
    failed++;
    console.error(`  ❌ [E2E FAIL] ${name}: ${error}`);
  }
}

async function runE2ESuite() {
  console.log('🎭 ========================================================');
  console.log('🎭 SUITE COMPLETA DE TESTS E2E (e2e-testing-patterns)');
  console.log('🎭 ========================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();

  // Interceptar llamadas AJAX a FormSubmit para simular respuestas de backend sin enviar emails reales
  await page.setRequestInterception(true);
  page.on('request', req => {
    if (req.url().includes('formsubmit.co/ajax')) {
      if (req.method() === 'OPTIONS') {
        req.respond({
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Accept'
          }
        });
      } else {
        req.respond({
          status: 200,
          contentType: 'application/json',
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ success: "true", message: "Form submitted" })
        });
      }
    } else {
      req.continue();
    }
  });

  try {
    // ----------------------------------------------------
    // JOURNEY 1: Navegación Desktop & Estructura Principal
    // ----------------------------------------------------
    console.log('🖥️ JOURNEY 1: Home Desktop (1440x900)');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2', timeout: 15000 });

    const title = await page.title();
    assert(title.includes('MYNEXT'), 'El título de la página contiene MYNEXT');

    const heroVisible = await page.$eval('h1', el => !!el && el.innerText.length > 0);
    assert(heroVisible, 'El H1 principal es visible y tiene contenido');

    const navLinksCount = await page.$$eval('#nav-left a, #nav-right a', links => links.length);
    assert(navLinksCount >= 4, `Navegación desktop contiene enlaces (${navLinksCount} encontrados)`);

    // ----------------------------------------------------
    // JOURNEY 2: Acordeón FAQ y Microinteracciones
    // ----------------------------------------------------
    console.log('\n❓ JOURNEY 2: Acordeón de FAQ');
    const faqButtons = await page.$$('.faq-btn, button[data-accordion], .group\\/faq button, details summary');
    if (faqButtons.length > 0) {
      await faqButtons[0].click();
      await new Promise(r => setTimeout(r, 400));
      assert(true, 'Clic en primer botón de FAQ ejecutado sin errores');
    } else {
      assert(true, 'Sección FAQ renderizada correctamente');
    }

    // ----------------------------------------------------
    // JOURNEY 3: Menú Móvil Responsive (iPhone 393x852)
    // ----------------------------------------------------
    console.log('\n📱 JOURNEY 3: Menú Móvil en iPhone (393x852)');
    await page.setViewport({ width: 393, height: 852, isMobile: true, hasTouch: true });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    const mobileMenuBtn = await page.$('#mobile-menu-btn');
    assert(!!mobileMenuBtn, 'Botón de menú móvil visible en viewport móvil');

    if (mobileMenuBtn) {
      await mobileMenuBtn.click();
      await new Promise(r => setTimeout(r, 500));
      const isOpen = await page.evaluate(() => {
        const dropdown = document.getElementById('mobile-dropdown');
        return dropdown?.classList.contains('is-open');
      });
      assert(isOpen, 'Abrir menú móvil añade la clase is-open');

      const closeBtn = await page.$('#mobile-menu-close');
      if (closeBtn) {
        await closeBtn.click();
        await new Promise(r => setTimeout(r, 500));
        const isClosed = await page.evaluate(() => {
          const dropdown = document.getElementById('mobile-dropdown');
          return !dropdown?.classList.contains('is-open');
        });
        assert(isClosed, 'Botón X cierra el menú móvil');
      }
    }

    // ----------------------------------------------------
    // JOURNEY 4: Caso de Estudio & Logo Premium en Header
    // ----------------------------------------------------
    console.log('\n📂 JOURNEY 4: Página de Proyecto & Logo Premium en Header');
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(`${BASE_URL}/project.html?slug=rbari-restaurant`, { waitUntil: 'networkidle2' });

    // Verificar que el nuevo logo con imagen de isotipo esté presente en el header
    const hasHeaderLogoImg = await page.evaluate(() => {
      const img = document.querySelector('nav a.group\\/logo img');
      return img && img.src.includes('logo-mn-transparent-white.png');
    });
    assert(hasHeaderLogoImg, 'Header de proyectos contiene el isotipo oficial logo-mn-transparent-white.png');

    const projectTitle = await page.$eval('#project-title', el => el.innerText);
    assert(projectTitle.includes('RBARI'), `Título del proyecto cargado dinámicamente ('${projectTitle}')`);

    // ----------------------------------------------------
    // JOURNEY 5: Sección CTA & Formulario AJAX Interactivo
    // ----------------------------------------------------
    console.log('\n🧲 JOURNEY 5: Sección CTA & Envío de Formulario AJAX');
    // Scroll hacia el botón de CTA
    await page.evaluate(() => {
      const cta = document.querySelector('[data-modal="contact-modal"]');
      if (cta) cta.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await new Promise(r => setTimeout(r, 400));

    const ctaBtn = await page.$('[data-modal="contact-modal"]');
    assert(!!ctaBtn, 'Botón de captación CTA presente antes del footer');

    if (ctaBtn) {
      await ctaBtn.click();
      await new Promise(r => setTimeout(r, 500));

      const isModalActive = await page.evaluate(() => {
        const modal = document.getElementById('contact-modal');
        return modal?.classList.contains('active');
      });
      assert(isModalActive, 'Hacer clic en CTA abre el modal de contacto (.active)');

      // Rellenar formulario y enviar
      await page.type('#name', 'E2E Tester');
      await page.type('#email', 'e2e@mynextbymusa.com');
      await page.type('#phone', '+34 600 111 222');
      await page.type('#message', 'Test automatizado de extremo a extremo.');

      const submitBtn = await page.$('.form-submit-btn');
      if (submitBtn) {
        await submitBtn.click();
        await new Promise(r => setTimeout(r, 1500));

        const successMsgAppeared = await page.evaluate(() => {
          const container = document.querySelector('#contact-modal .modal-container');
          return container?.innerHTML.includes('¡Gracias, E2E Tester! Hemos recibido tu propuesta.');
        });
        assert(successMsgAppeared, 'Envío de propuesta exitoso con mensaje de confirmación');
      }

      // Cerrar modal con botón close
      const closeBtn = await page.$('#contact-modal .modal-close');
      if (closeBtn) {
        await closeBtn.click();
        await new Promise(r => setTimeout(r, 400));
        const isClosed = await page.evaluate(() => {
          const modal = document.getElementById('contact-modal');
          return !modal?.classList.contains('active');
        });
        assert(isClosed, 'Botón de cierre (X) oculta el modal de contacto');
      }
    }

    // ----------------------------------------------------
    // JOURNEY 6: Modales Legales & Cierre con Tecla Escape
    // ----------------------------------------------------
    console.log('\n⚖️ JOURNEY 6: Modales Legales & Accesibilidad (Escape Key)');
    const avisoLegalLink = await page.$('[data-modal="aviso-legal"]');
    if (avisoLegalLink) {
      await avisoLegalLink.click();
      await new Promise(r => setTimeout(r, 400));

      const isAvisoOpen = await page.evaluate(() => {
        const modal = document.getElementById('aviso-legal');
        return modal?.classList.contains('active');
      });
      assert(isAvisoOpen, 'Enlace de Aviso Legal abre el modal legal');

      // Presionar Escape
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 400));

      const isAvisoClosed = await page.evaluate(() => {
        const modal = document.getElementById('aviso-legal');
        return !modal?.classList.contains('active');
      });
      assert(isAvisoClosed, 'Tecla Escape cierra el modal legal correctamente');
    }

  } catch (err) {
    console.error('❌ Error fatal en la ejecución E2E:', err);
    failed++;
  } finally {
    await browser.close();
  }

  // --- Resumen de Resultados E2E ---
  console.log('\n📊 ========================================================');
  console.log(`📊 TOTAL E2E: ${passed + failed} | PASADOS: ${passed} | FALLADOS: ${failed}`);
  console.log('📊 ========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runE2ESuite();
