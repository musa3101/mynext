import { chromium } from 'playwright';

const ARTIFACT_DIR = '/Users/musa/.gemini/antigravity/brain/60e5d3b2-4089-4c21-8ac9-8659819c6910';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  const testHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { background: #080810; color: white; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; }
      button { background: #00f2ff; color: #080810; padding: 16px 32px; border-radius: 9999px; font-weight: bold; cursor: pointer; border: none; }
    </style>
  </head>
  <body>
    <button data-cal-link="mynextbymusa/primera-consulta-mynext" data-cal-config='{"layout":"month_view","theme":"dark"}'>
      Agendar Cita
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
  await page.waitForTimeout(1000);
  await page.click('button');
  await page.waitForTimeout(3500);
  await page.screenshot({ path: `${ARTIFACT_DIR}/cal_popup_desktop.png` });
  console.log('Saved cal_popup_desktop.png');
  await browser.close();
}

main().catch(console.error);

