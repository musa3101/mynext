import { chromium } from 'playwright';
import fs from 'fs';

const ARTIFACT_DIR = '/Users/musa/.gemini/antigravity/brain/60e5d3b2-4089-4c21-8ac9-8659819c6910';

async function main() {
  console.log('Testing Cal.com popup embed on mobile...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
    isMobile: true,
    hasTouch: true
  });

  const page = await context.newPage();

  // Test HTML with Cal.com embed snippet
  const testHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { background: #080810; color: white; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
      button { background: #00f2ff; color: #080810; border: none; padding: 14px 28px; border-radius: 9999px; font-weight: bold; font-size: 14px; cursor: pointer; }
    </style>
  </head>
  <body>
    <h1>Prueba Cal.com Popup</h1>
    <button data-cal-link="mynextbymusa/primera-consulta-mynext" data-cal-config='{"layout":"month_view","theme":"dark"}'>
      📅 Agendar Cita con Musa
    </button>

    <script type="text/javascript">
      (function (C, A, L) {
        let p = function (a, ar) { a.q.push(ar); };
        let d = C.document;
        C.Cal = C.Cal || function () {
          let cal = C.Cal;
          let ar = arguments;
          if (!cal.loaded) {
            cal.ns = {};
            cal.q = cal.q || [];
            d.head.appendChild(d.createElement("script")).src = A;
            cal.loaded = true;
          }
          if (ar[0] === L) {
            const api = function () { p(api, arguments); };
            const namespace = ar[1];
            api.q = api.q || [];
            if(typeof namespace === "string"){cal.ns[namespace] = cal.ns[namespace] || api;p(cal.ns[namespace], ar);p(cal, ["initNamespace", namespace]);}
            else p(cal, ar);
            return;
          }
          p(cal, ar);
        };
      })(window, "https://app.cal.com/embed/embed.js", "init");

      Cal("init", {origin:"https://cal.com"});
      Cal("ui", {
        "styles": {"branding": {"brandColor": "#00f2ff"}},
        "hideEventTypeDetails": false,
        "layout": "month_view"
      });
    </script>
  </body>
  </html>
  `;

  await page.setContent(testHtml);
  await page.waitForTimeout(1500);

  // Click the button to open popup
  await page.click('button[data-cal-link]');
  console.log('Clicked Cal button, waiting for modal to open...');
  await page.waitForTimeout(4000);

  await page.screenshot({ path: `${ARTIFACT_DIR}/cal_popup_mobile.png` });
  console.log(`📸 Saved screenshot: ${ARTIFACT_DIR}/cal_popup_mobile.png`);

  await browser.close();
}

main().catch(console.error);

