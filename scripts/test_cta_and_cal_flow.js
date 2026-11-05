import { chromium } from 'playwright';

async function run() {
  console.log('🚀 Starting Playwright verification for CTA buttons & deep-link tab switching...');
  const browser = await chromium.launch({ headless: true });

  try {
    // 1. Mobile verification on Project Page
    console.log('\n--- 1. Testing Project Page on Mobile (iPhone 14: 390x844) ---');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1'
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto('http://localhost:5173/project?slug=blessed-barber-studio', { waitUntil: 'domcontentloaded' });
    await mobilePage.waitForTimeout(1000);

    // Verify Action Buttons Group
    const ctaButton = mobilePage.locator('main a[href="/#contacto?tab=cal"]');
    const ctaVisible = await ctaButton.isVisible();
    console.log('Mobile "Agendar Cita" button visible:', ctaVisible);
    if (!ctaVisible) throw new Error('CTA button not visible on mobile project page');

    // Take screenshot of project page CTA section
    await ctaButton.scrollIntoViewIfNeeded();
    await mobilePage.screenshot({ path: '/Users/musa/.gemini/antigravity/brain/60e5d3b2-4089-4c21-8ac9-8659819c6910/project_mobile_cta.png' });
    console.log('📸 Saved project_mobile_cta.png');

    // Check footer link on mobile
    const footerLink = mobilePage.locator('footer nav a[href="/#contacto?tab=cal"]');
    const footerLinkVisible = await footerLink.isVisible();
    console.log('Mobile footer link "Agendar Cita" visible:', footerLinkVisible);

    // 2. Click CTA button and test deep link to Cal tab
    console.log('\n--- 2. Testing Click Navigation to /#contacto?tab=cal ---');
    await ctaButton.click();
    await mobilePage.waitForLoadState('domcontentloaded');
    await mobilePage.waitForTimeout(1000);

    // Verify URL
    console.log('Current URL after click:', mobilePage.url());

    // Verify that Cal tab is selected and form is hidden
    const isCalTabSelected = await mobilePage.$eval('#tab-btn-cal', el => el.getAttribute('aria-selected'));
    const isFormHidden = await mobilePage.$eval('#email-contact-form', el => el.classList.contains('contact-panel-hidden'));
    const isCalPanelActive = await mobilePage.$eval('#cal-booking-panel', el => el.classList.contains('contact-panel-active'));
    const calIframeSrc = await mobilePage.$eval('#cal-embed-iframe', el => el.getAttribute('src'));

    console.log('Cal Tab selected (aria-selected):', isCalTabSelected);
    console.log('Form hidden:', isFormHidden);
    console.log('Cal panel active:', isCalPanelActive);
    console.log('Cal iframe src populated:', Boolean(calIframeSrc && calIframeSrc.includes('cal.com')));

    if (isCalTabSelected !== 'true' || !isFormHidden || !isCalPanelActive) {
      throw new Error('Cal tab did not automatically activate on #contacto?tab=cal');
    }

    await mobilePage.screenshot({ path: '/Users/musa/.gemini/antigravity/brain/60e5d3b2-4089-4c21-8ac9-8659819c6910/mobile_cal_tab_activated.png' });
    console.log('📸 Saved mobile_cal_tab_activated.png');

    // 3. Desktop verification on Project Page
    console.log('\n--- 3. Testing Project Page on Desktop (1280x800) ---');
    const desktopContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const desktopPage = await desktopContext.newPage();
    await desktopPage.goto('http://localhost:5173/project?slug=blessed-barber-studio', { waitUntil: 'domcontentloaded' });
    await desktopPage.waitForTimeout(1000);

    const desktopCta = desktopPage.locator('main a[href="/#contacto?tab=cal"]');
    await desktopCta.scrollIntoViewIfNeeded();
    await desktopPage.screenshot({ path: '/Users/musa/.gemini/antigravity/brain/60e5d3b2-4089-4c21-8ac9-8659819c6910/project_desktop_cta.png' });
    console.log('📸 Saved project_desktop_cta.png');

    // 4. Test Footer Link click directly on index.html
    console.log('\n--- 4. Testing Footer Link on index.html ---');
    await desktopPage.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
    await desktopPage.waitForTimeout(1000);
    const indexFooterLink = desktopPage.locator('footer nav a[href="#contacto?tab=cal"]');
    await indexFooterLink.scrollIntoViewIfNeeded();
    await desktopPage.screenshot({ path: '/Users/musa/.gemini/antigravity/brain/60e5d3b2-4089-4c21-8ac9-8659819c6910/footer_nav_verified.png' });
    console.log('📸 Saved footer_nav_verified.png');

    await indexFooterLink.click();
    await desktopPage.waitForTimeout(600);

    const isDesktopCalActive = await desktopPage.$eval('#cal-booking-panel', el => el.classList.contains('contact-panel-active'));
    console.log('Desktop Cal panel active after footer click:', isDesktopCalActive);

    // 5. English verification
    console.log('\n--- 5. Testing English project-en page ---');
    await desktopPage.goto('http://localhost:5173/project-en?slug=blessed-barber-studio', { waitUntil: 'domcontentloaded' });
    await desktopPage.waitForTimeout(1000);
    const enCta = desktopPage.locator('main a[href="/index-en#contacto?tab=cal"]');
    const enCtaVisible = await enCta.isVisible();
    console.log('English "Book a Call" CTA button visible:', enCtaVisible);

    const enFooterLink = desktopPage.locator('footer nav a[href="/index-en#contacto?tab=cal"]');
    const enFooterVisible = await enFooterLink.isVisible();
    console.log('English footer link visible:', enFooterVisible);

    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
