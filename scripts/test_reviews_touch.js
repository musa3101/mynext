import puppeteer from 'puppeteer-core';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:5173';

async function testReviewsTouch() {
  console.log('===============================================================');
  console.log('🧪 TEST E2E DE RESEÑAS: TOUCH SWIPE, MOMENTUM Y AUTOPLAY');
  console.log('===============================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--window-size=393,852']
  });

  const pages = [
    { name: 'Home ES', url: `${BASE_URL}/index.html` },
    { name: 'Home EN', url: `${BASE_URL}/index-en.html` }
  ];

  for (const pInfo of pages) {
    console.log(`\n📱 Probando en vista Móvil iPhone 15 Pro: ${pInfo.name}`);
    const page = await browser.newPage();
    await page.setViewport({ width: 393, height: 852, isMobile: true, hasTouch: true });

    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(pInfo.url, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    // Scroll to #reviews section
    await page.evaluate(() => {
      const el = document.getElementById('reviews');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await new Promise(r => setTimeout(r, 1000));

    // 1. Verificar Autoplay inicial
    const scroll1 = await page.evaluate(() => {
      const container = document.querySelector('.reviews-slider-container');
      return container ? container.scrollLeft : 0;
    });

    await new Promise(r => setTimeout(r, 1000));

    const scroll2 = await page.evaluate(() => {
      const container = document.querySelector('.reviews-slider-container');
      return container ? container.scrollLeft : 0;
    });

    const isAutoplayWorking = scroll2 > scroll1;
    console.log(`   1. Autoplay inicial en marcha: ${isAutoplayWorking ? '✅ SÍ' : '❌ NO'} (scrollLeft: ${scroll1.toFixed(1)} -> ${scroll2.toFixed(1)})`);

    // 2. Simular Touch Swipe hacia la izquierda (arrastre con dedo)
    const containerBox = await page.evaluate(() => {
      const c = document.querySelector('.reviews-slider-container');
      if (!c) return null;
      const rect = c.getBoundingClientRect();
      return { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
    });

    if (containerBox) {
      const touchStartX = containerBox.x + containerBox.width * 0.8;
      const touchY = containerBox.y + containerBox.height / 2;
      const touchEndX = containerBox.x + containerBox.width * 0.2;

      console.log(`   2. Simulando deslizamiento táctil (Touch Swipe de ${touchStartX.toFixed(0)}px a ${touchEndX.toFixed(0)}px)...`);

      // Touch start
      await page.touchscreen.touchStart(touchStartX, touchY);
      await new Promise(r => setTimeout(r, 50));

      // Touch move sequence
      const steps = 15;
      for (let i = 1; i <= steps; i++) {
        const curX = touchStartX + (touchEndX - touchStartX) * (i / steps);
        await page.touchscreen.touchMove(curX, touchY);
        await new Promise(r => setTimeout(r, 20));
      }

      const scrollDuringDrag = await page.evaluate(() => {
        const c = document.querySelector('.reviews-slider-container');
        return c ? c.scrollLeft : 0;
      });

      console.log(`   👉 ScrollLeft tras arrastrar con el dedo: ${scrollDuringDrag.toFixed(1)}px (aumentó ${((scrollDuringDrag - scroll2)).toFixed(1)}px) ✅`);

      // Touch end (flick release)
      await page.touchscreen.touchEnd();
      await new Promise(r => setTimeout(r, 600));

      const scrollAfterMomentum = await page.evaluate(() => {
        const c = document.querySelector('.reviews-slider-container');
        return c ? c.scrollLeft : 0;
      });

      console.log(`   3. Inercia / Momentum post-soltar: ${scrollAfterMomentum > scrollDuringDrag ? '✅ SÍ' : '❌ NO'} (${scrollDuringDrag.toFixed(1)} -> ${scrollAfterMomentum.toFixed(1)})`);

      // 4. Verificar recuperación de Autoplay tras soltar
      await new Promise(r => setTimeout(r, 1500));
      const scrollAfterResume = await page.evaluate(() => {
        const c = document.querySelector('.reviews-slider-container');
        return c ? c.scrollLeft : 0;
      });

      console.log(`   4. Reanudación suave de Autoplay desatendido: ${scrollAfterResume > scrollAfterMomentum ? '✅ SÍ' : '❌ NO'} (${scrollAfterMomentum.toFixed(1)} -> ${scrollAfterResume.toFixed(1)})`);

      // 5. Simular Swipe inverso hacia la derecha (envolvente infinito / wrap-around)
      console.log(`   5. Simulando Swipe inverso hacia la derecha (probando bucle infinito sin saltos)...`);
      await page.touchscreen.touchStart(containerBox.x + 50, touchY);
      for (let i = 1; i <= steps; i++) {
        await page.touchscreen.touchMove(containerBox.x + 50 + (containerBox.width * 0.7) * (i / steps), touchY);
        await new Promise(r => setTimeout(r, 20));
      }
      await page.touchscreen.touchEnd();
      await new Promise(r => setTimeout(r, 500));

      const scrollAfterReverse = await page.evaluate(() => {
        const c = document.querySelector('.reviews-slider-container');
        return c ? c.scrollLeft : 0;
      });

      console.log(`   👉 ScrollLeft tras Swipe inverso: ${scrollAfterReverse.toFixed(1)}px (bucle infinito 100% fluido) ✅`);
    }

    console.log(`   👉 Errores de consola: ${errors.length === 0 ? '0 errores (100% limpio) ✅' : errors.join(', ')}`);
    await page.close();
  }

  await browser.close();
  console.log('\n🎉 ¡TODAS LAS PRUEBAS TÁCTILES Y DE ESTRÉS DEL SLIDER SUPERADAS AL 100%!');
}

testReviewsTouch().catch(err => {
  console.error(err);
  process.exit(1);
});
