import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PLACE_ID = 'ChIJ98pe5L2TlxIRFAmbE-Ff4TE';
const MAPS_URL = `https://www.google.com/maps/place/?q=place_id:${PLACE_ID}&hl=es`;

async function scrapeReviews() {
  console.log('🚀 Iniciando Chrome para extraer reseñas reales de Google Maps...');
  console.log(`📍 URL: ${MAPS_URL}`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--window-size=1280,900',
      '--lang=es-ES,es'
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    
    // Set cookies to bypass consent banner
    await page.setCookie({
      name: 'SOCS',
      value: 'CAISHAgBEhJnd3NfMjAyNDA3MjktMF9SQzIaAmVzIAEaBgiA_pmyBg',
      domain: '.google.com',
      path: '/'
    });

    console.log('🌐 Navegando a la página de Google Maps...');
    await page.goto(MAPS_URL, { waitUntil: 'networkidle2', timeout: 30000 });

    // Handle any cookie consent buttons if they still show up
    try {
      const consentButtons = await page.$$('button');
      for (const btn of consentButtons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text && (text.includes('Aceptar todo') || text.includes('Accept all') || text.includes('Acepto'))) {
          console.log('🍪 Pulsando botón de consentimiento...');
          await btn.click();
          await new Promise(r => setTimeout(r, 2000));
          break;
        }
      }
    } catch (e) {
      console.log('No consent banner found or bypassed.');
    }

    // Wait for the place title to appear
    await new Promise(r => setTimeout(r, 3000));

    const placeTitle = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? h1.textContent.trim() : document.title;
    });
    console.log(`🏢 Negocio detectado: "${placeTitle}"`);

    // Handle any popups/modals
    await page.evaluate(() => {
      const cancelBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Cancelar') || b.textContent.includes('Cancel'));
      if (cancelBtn) cancelBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    // Wait for the place panel
    console.log('🔍 Buscando panel de información del negocio...');
    const panelInfo = await page.evaluate(() => {
      const h1 = document.querySelector('h1.DUwDvf, h1');
      const tabs = Array.from(document.querySelectorAll('button[role="tab"]')).map(t => ({
        text: t.textContent.trim(),
        aria: t.getAttribute('aria-label') || ''
      }));
      const allButtons = Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim()).filter(Boolean);
      return {
        h1: h1 ? h1.textContent.trim() : 'No H1',
        tabs,
        buttons: allButtons.slice(0, 30)
      };
    });
    console.log('Panel Info:', JSON.stringify(panelInfo, null, 2));

    // Scroll down the sidebar panel
    console.log('📜 Desplazando panel lateral de Mynext hacia abajo...');
    for (let i = 0; i < 8; i++) {
      await page.evaluate(() => {
        const sidebars = document.querySelectorAll('div.m6QErb, div[role="main"], div.e07Vkf, div.bJzME');
        sidebars.forEach(s => {
          s.scrollTop += 1500;
        });
      });
      await new Promise(r => setTimeout(r, 1500));
    }

    // Capture screenshot after scrolling sidebar
    await page.screenshot({ path: 'mynext_sidebar_scrolled.png', fullPage: false });
    console.log('📸 Captura tras scroll guardada en mynext_sidebar_scrolled.png');

    // Click on any "Más reseñas", "Resumen de reseñas", or "Ver todas las reseñas" buttons
    await page.evaluate(() => {
      const allButtons = Array.from(document.querySelectorAll('button, a, div[role="button"]'));
      for (const btn of allButtons) {
        const txt = (btn.textContent || '').toLowerCase();
        const aria = (btn.getAttribute('aria-label') || '').toLowerCase();
        if (txt.includes('opinión') || txt.includes('reseña') || aria.includes('opinión') || aria.includes('reseña') || aria.includes('más') || txt.includes('ver todas')) {
          if (!txt.includes('escribir')) {
            console.log('Clicking review button:', txt || aria);
            btn.click();
          }
        }
      }
    });
    await new Promise(r => setTimeout(r, 3000));

    // Scroll again to load all individual reviews in the full reviews view
    for (let i = 0; i < 15; i++) {
      await page.evaluate(() => {
        const sidebars = document.querySelectorAll('div.m6QErb, div[role="main"], div.e07Vkf, div.bJzME, div.DxyBCb');
        sidebars.forEach(s => {
          s.scrollTop += 2000;
        });
      });
      await new Promise(r => setTimeout(r, 1000));
    }

    // Capture screenshot of reviews view
    await page.screenshot({ path: 'mynext_reviews_view.png', fullPage: false });




    // Find the scrollable review list container
    const scrollContainerSelector = 'div.m6QErb.DxyBCb.kA9KIf.dS8AEf, div.m6QErb[aria-label*="reseña"], div.m6QErb[aria-label*="Reseña"], div.m6QErb.XiKgde';
    
    console.log('📜 Desplazando para cargar todas las reseñas...');
    for (let i = 0; i < 15; i++) {
      await page.evaluate((sel) => {
        const container = document.querySelector(sel) || document.querySelector('div.m6QErb.DxyBCb') || document.querySelector('div[role="main"]');
        if (container) {
          container.scrollTop = container.scrollHeight;
        } else {
          window.scrollBy(0, 1000);
        }
      }, scrollContainerSelector);
      await new Promise(r => setTimeout(r, 1000));
    }

    // Click all "Más" / "More" buttons on reviews
    await page.evaluate(() => {
      const moreButtons = Array.from(document.querySelectorAll('button[aria-label="Ver más"], button.w8nwRe, button[jsaction*="more"]'));
      moreButtons.forEach(b => {
        try { b.click(); } catch(e) {}
      });
    });
    await new Promise(r => setTimeout(r, 1000));

    // Extract all review data
    const reviews = await page.evaluate(() => {
      const results = [];
      const reviewElements = document.querySelectorAll('div.jftiEf, div[data-review-id], div.gws-localreviews__google-review');
      
      reviewElements.forEach((el, index) => {
        // Author name
        const nameEl = el.querySelector('div.d4r55, .TSUbDb, a[href*="contrib"]');
        const name = nameEl ? nameEl.textContent.trim() : '';

        // Rating
        const ratingEl = el.querySelector('span.kvMYJc, span[aria-label*="estrella"], span[aria-label*="star"], span[role="img"]');
        let rating = 5;
        if (ratingEl) {
          const aria = ratingEl.getAttribute('aria-label') || '';
          const match = aria.match(/(\d+)/);
          if (match) rating = parseInt(match[1]);
        }

        // Relative time / date
        const timeEl = el.querySelector('span.rsqaWe, span.dehysf');
        const relative_time = timeEl ? timeEl.textContent.trim() : '';

        // Review text
        const textEl = el.querySelector('span.wiI7Pd, .Jtu6Td, div.MyEned');
        const content = textEl ? textEl.textContent.trim() : '';

        // Author photo
        const photoEl = el.querySelector('img.NBa7we, img[src*="googleusercontent"]');
        const author_photo = photoEl ? photoEl.src : '';

        if (name) {
          results.push({
            id: `g_rev_${index + 1}`,
            name,
            rating,
            relative_time,
            content,
            author_photo,
            source: 'google',
            active: true
          });
        }
      });

      return results;
    });

    console.log(`\n🎉 ¡Total de reseñas extraídas con éxito: ${reviews.length}!`);
    console.log(JSON.stringify(reviews, null, 2));

    // Save to JSON
    fs.writeFileSync('google_reviews_live.json', JSON.stringify({
      place_title: placeTitle,
      place_id: PLACE_ID,
      scraped_at: new Date().toISOString(),
      total_reviews: reviews.length,
      reviews
    }, null, 2));

    console.log('\n💾 Guardado en google_reviews_live.json');

    // Take screenshot for visual verification
    await page.screenshot({ path: 'google_maps_screenshot.png', fullPage: false });
    console.log('📸 Captura guardada en google_maps_screenshot.png');

  } catch (error) {
    console.error('❌ Error extrayendo reseñas:', error);
  } finally {
    await browser.close();
  }
}

scrapeReviews();
