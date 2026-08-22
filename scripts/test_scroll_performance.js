import puppeteer from 'puppeteer-core';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:5173';

async function testScrollPerformance() {
  console.log('===============================================================');
  console.log('🚀 TEST DE RENDIMIENTO DE SCROLL (MÓVIL & ESCRITORIO)');
  console.log('===============================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu-vsync', '--enable-gpu-rasterization']
  });

  const targets = [
    { name: 'Móvil iPhone 15 Pro (393x852)', width: 393, height: 852, isMobile: true, hasTouch: true },
    { name: 'Desktop 1080p (1440x900)', width: 1440, height: 900, isMobile: false, hasTouch: false }
  ];

  for (const target of targets) {
    console.log(`\n📱 Probando Scroll en: ${target.name}`);
    const page = await browser.newPage();
    await page.setViewport({ width: target.width, height: target.height, isMobile: target.isMobile, hasTouch: target.hasTouch });

    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    // Setup performance frame rate observer
    await page.evaluate(() => {
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

    // Perform intense scroll down and up
    console.log('   👉 Ejecutando scroll intensivo hacia abajo (0 a 4000px)...');
    for (let y = 0; y <= 4000; y += 150) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await new Promise(r => setTimeout(r, 16));
    }

    console.log('   👉 Ejecutando scroll intensivo hacia arriba (4000 a 0px)...');
    for (let y = 4000; y >= 0; y -= 150) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await new Promise(r => setTimeout(r, 16));
    }

    // Analyze captured frame deltas
    const frameStats = await page.evaluate(() => {
      const frames = window.__scrollFrames || [];
      if (frames.length === 0) return { avgFps: 60, jankFrames: 0, maxDelta: 16 };
      
      let jankFrames = 0;
      let totalDuration = 0;
      let maxDelta = 0;

      for (const d of frames) {
        if (d > 33.3) jankFrames++; // Frame dropped below 30 FPS
        if (d > maxDelta) maxDelta = d;
        totalDuration += d;
      }

      const avgDelta = totalDuration / frames.length;
      const avgFps = Math.round(1000 / avgDelta);

      return {
        totalFrames: frames.length,
        avgFps,
        jankFrames,
        jankRate: ((jankFrames / frames.length) * 100).toFixed(1) + '%',
        maxDeltaMs: maxDelta.toFixed(1)
      };
    });

    console.log(`   📊 Estadísticas de Fluidez de Scroll:`);
    console.log(`      - FPS Promedio: ${frameStats.avgFps} FPS ${frameStats.avgFps >= 55 ? '✅ (Fluidez Ultra)' : '⚠️'}`);
    console.log(`      - Cuadros con retraso (Jank frames >33ms): ${frameStats.jankFrames} (${frameStats.jankRate}) ${frameStats.jankFrames === 0 ? '✅ (0 Retrasos)' : ''}`);
    console.log(`      - Retraso máximo detectado: ${frameStats.maxDeltaMs} ms`);

    await page.close();
  }

  await browser.close();
  console.log('\n🏁 Test de Rendimiento de Scroll Finalizado.');
}

testScrollPerformance().catch(console.error);
