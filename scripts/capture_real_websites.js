import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const projects = [
  { slug: 'blessed-barber-studio', url: 'https://blessedstudio.pages.dev/' },
  { slug: 'bar-cafeteria-luna-llena', url: 'https://barlunallena.pages.dev' },
  { slug: 'ecuaplac', url: 'https://ecuapv2.pages.dev/' },
  { slug: 'rbari-restaurant', url: 'https://rbari-v1.pages.dev' },
  { slug: 'next-era', url: 'https://nexterabymusa.pages.dev' },
  { slug: 'mezquita-arrahma', url: 'https://mezquita-arrahma.pages.dev' },
  { slug: 'gran-marrakech', url: 'https://granmarrakech.pages.dev' }
];

async function capture() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const tmpDir = './tmp_screenshots';
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
  }

  for (const proj of projects) {
    console.log(`Capturing ${proj.slug}...`);
    
    try {
      // Capture Desktop
      await page.setViewport({ width: 1280, height: 800 });
      await page.goto(proj.url, { waitUntil: 'networkidle2' });
      // Wait for preloader/loading screens to finish
      await new Promise(resolve => setTimeout(resolve, 3500));
      // Inject CSS to remove outlines and hide cookie consent banners
      await page.addStyleTag({ content: `
        *:focus, *:active, *::selection { outline: none !important; box-shadow: none !important; } 
        *[class*="cookie" i], *[id*="cookie" i], 
        *[class*="consent" i], *[id*="consent" i], 
        *[class*="cookies" i], *[id*="cookies" i],
        *[class*="banner" i], *[id*="banner" i] { 
          display: none !important; 
        }
      ` });
      await page.screenshot({ path: path.join(tmpDir, `${proj.slug}_desktop.png`) });
      
      // Capture Mobile
      await page.setViewport({ width: 375, height: 812, isMobile: true });
      await page.goto(proj.url, { waitUntil: 'networkidle2' });
      // Wait for preloader/loading screens to finish
      await new Promise(resolve => setTimeout(resolve, 3500));
      // Inject CSS to remove outlines and hide cookie consent banners
      await page.addStyleTag({ content: `
        *:focus, *:active, *::selection { outline: none !important; box-shadow: none !important; } 
        *[class*="cookie" i], *[id*="cookie" i], 
        *[class*="consent" i], *[id*="consent" i], 
        *[class*="cookies" i], *[id*="cookies" i],
        *[class*="banner" i], *[id*="banner" i] { 
          display: none !important; 
        }
      ` });
      await page.screenshot({ path: path.join(tmpDir, `${proj.slug}_mobile.png`) });
    } catch (err) {
      console.error(`Error capturing ${proj.slug}:`, err.message);
    }
  }

  await browser.close();
  console.log("All screenshots captured successfully in tmp_screenshots");
}

capture().catch(console.error);
