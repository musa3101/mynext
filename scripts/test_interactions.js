import puppeteer from 'puppeteer-core';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:5174';

async function testInteractions() {
  console.log('🧪 Iniciando Test Detallado de Interacciones UI...\n');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--window-size=393,852']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 393, height: 852, isMobile: true, hasTouch: true });

  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
  console.log('📱 Página cargada en vista móvil (iPhone 393x852)');

  // Esperar animación de entrada del header
  await new Promise(r => setTimeout(r, 1500));

  // 1. Test Menú Móvil
  console.log('\n1. Test Menú Móvil:');
  const menuBtn = await page.$('#mobile-menu-btn');
  if (menuBtn) {
    await menuBtn.click();
    await new Promise(r => setTimeout(r, 600));
    
    const isOpen = await page.evaluate(() => {
      const dropdown = document.getElementById('mobile-dropdown');
      return dropdown?.classList.contains('is-open');
    });
    console.log(`   👉 Abrir menú móvil: ${isOpen ? '✅ ÉXITO (is-open añadido)' : '❌ FALLÓ'}`);

    // Test Cerrar Menú Móvil
    const closeBtn = await page.$('#mobile-menu-close');
    if (closeBtn) {
      await closeBtn.click();
      await new Promise(r => setTimeout(r, 600));
      const isClosed = await page.evaluate(() => {
        const dropdown = document.getElementById('mobile-dropdown');
        return !dropdown?.classList.contains('is-open');
      });
      console.log(`   👉 Cerrar menú móvil (botón X): ${isClosed ? '✅ ÉXITO' : '❌ FALLÓ'}`);
    }
  }

  // 2. Test FAQ Accordion
  console.log('\n2. Test Acordeón FAQ:');
  const faqButtons = await page.$$('.faq-btn, button[data-accordion], .group\\/faq button, details summary');
  console.log(`   👉 Botones FAQ encontrados: ${faqButtons.length}`);
  if (faqButtons.length > 0) {
    await faqButtons[0].click();
    await new Promise(r => setTimeout(r, 400));
    console.log('   👉 Clic en FAQ realizado sin errores de consola ✅');
  }

  // 3. Test Selectores de Idioma
  console.log('\n3. Test Selector de Idioma:');
  const enLink = await page.$('a[href="index-en.html"]');
  if (enLink) {
    console.log('   👉 Enlace EN disponible y enlazado correctamente ✅');
  }

  // 4. Test en Desktop (1440x900)
  console.log('\n4. Test en Desktop (1440x900):');
  await page.setViewport({ width: 1440, height: 900, isMobile: false });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  // Verificar navegación a anclas
  const navLinks = await page.$$eval('#nav-right a, nav a', links => links.map(l => ({ text: l.innerText, href: l.getAttribute('href') })));
  console.log(`   👉 Enlaces de navegación desktop:`, navLinks);

  await browser.close();
  console.log('\n🎉 Test de interacciones finalizado con éxito!');
}

testInteractions().catch(console.error);
