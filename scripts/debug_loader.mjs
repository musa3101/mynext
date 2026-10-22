import { chromium } from 'playwright';
const url = process.argv[2] || 'https://mynextbymusa.com/';
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage();
p.on('console', m => { if (['error', 'warning'].includes(m.type())) console.log('CONSOLE', m.type(), m.text()); });
p.on('pageerror', e => console.log('PAGEERROR', e.message, '\n', (e.stack || '').split('\n').slice(0, 4).join('\n')));
p.on('requestfailed', r => console.log('REQFAIL', r.url(), r.failure()?.errorText));
p.on('response', r => { const ct=r.headers()['content-type']||''; if (r.request().resourceType()==='script' && ct.includes('html')) console.log('BADMIME', r.status(), r.url()); if (r.status() >= 400) console.log('HTTP', r.status(), r.url()); });
await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(e => console.log('GOTO', e.message));
await p.waitForTimeout(6000);
const st = await p.evaluate(() => {
  const o = document.getElementById('page-transition-overlay');
  return { overlayActive: o?.classList.contains('active'), readyState: document.readyState };
});
console.log('STATE', JSON.stringify(st));
await b.close();
