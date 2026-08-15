import './style.css';
import { supabase } from './lib/supabase';
import { fallbackServices, fallbackSettings } from './lib/fallbackData';

// Determine language
const lang = (document.documentElement.lang === 'en' || window.location.pathname.includes('-en')) ? 'en' : 'es';
const isEnglish = lang === 'en';

// Helper to resolve bilingual strings (JSON or raw string)
function getTranslation(value: string | null | undefined, language: 'es' | 'en'): string {
  if (!value) return '';
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object') {
      return parsed[language] || parsed['es'] || parsed['en'] || value;
    }
  } catch (e) {
    // Return raw string if parsing fails
  }
  return value;
}

// Resilient helper to resolve fields that can be named field_es, field_en, or JSON string field
function getFieldTranslation(item: any, fieldBase: string, language: 'es' | 'en'): string {
  if (!item) return '';
  // 1. Direct language key (e.g. title_es / title_en)
  const langKey = `${fieldBase}_${language}`;
  if (item[langKey] !== undefined && item[langKey] !== null && item[langKey] !== '') {
    return typeof item[langKey] === 'string' ? item[langKey] : JSON.stringify(item[langKey]);
  }
  // 2. Alternate language key fallback
  const fallbackLangKey = language === 'en' ? `${fieldBase}_es` : `${fieldBase}_en`;
  if (item[fallbackLangKey] !== undefined && item[fallbackLangKey] !== null && item[fallbackLangKey] !== '') {
    return typeof item[fallbackLangKey] === 'string' ? item[fallbackLangKey] : JSON.stringify(item[fallbackLangKey]);
  }
  // 3. Base field (e.g. title) which might be JSON or plain string
  const val = item[fieldBase];
  if (val === undefined || val === null) return '';
  if (typeof val === 'object') {
    return val[language] || val['es'] || val['en'] || '';
  }
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (parsed && typeof parsed === 'object') {
        return parsed[language] || parsed['es'] || parsed['en'] || val;
      }
    } catch {
      // not json
    }
    return val;
  }
  return String(val);
}

// Resilient helper to get features list from service
function getServiceFeatures(service: any, language: 'es' | 'en'): string[] {
  // 1. Check features_es / features_en
  const langFeatures = language === 'en'
    ? (service.features_en || service.features_es || service.features)
    : (service.features_es || service.features_en || service.features);

  if (Array.isArray(langFeatures) && langFeatures.length > 0) {
    return langFeatures.map((f: any) => String(f).trim()).filter(Boolean);
  }

  if (typeof langFeatures === 'string') {
    try {
      const parsed = JSON.parse(langFeatures);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((f: any) => String(f).trim()).filter(Boolean);
      }
      if (parsed && typeof parsed === 'object') {
        const langArr = parsed[language] || parsed['es'] || parsed['en'];
        if (Array.isArray(langArr)) return langArr.map((f: any) => String(f).trim()).filter(Boolean);
        if (typeof langArr === 'string') return langArr.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    } catch {
      return langFeatures.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
  }

  // 2. Fallback to description
  const desc = getFieldTranslation(service, 'description', language);
  if (desc) {
    return desc.split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  return [];
}

// Global modal state variables
let currentMethod = '';
let currentPlan = '';

// Expose modal control functions on window so index inline/attributes can invoke them
(window as any).openSelector = function (method: string) {
  currentMethod = method;
  currentPlan = '';
  const titleEl = document.getElementById('modalTitle');
  if (titleEl) {
    titleEl.innerText = isEnglish ? 'Select your Plan' : 'Selecciona tu Plan';
  }
  document.getElementById('planButtons')?.classList.remove('hidden');
  document.getElementById('contactButtons')?.classList.add('hidden');
  showModal();
};

(window as any).openContactOptions = function (planName: string) {
  const isEnglishLocal = window.location.pathname.includes('-en') || lang === 'en';
  
  const nameLabel = isEnglishLocal ? "Please enter your name:" : "Por favor, ingresa tu nombre:";
  const businessLabel = isEnglishLocal ? "Please enter your business/project name:" : "Por favor, ingresa el nombre de tu negocio/proyecto:";
  
  const userName = window.prompt(nameLabel);
  if (!userName) return; // User cancelled or entered empty
  
  const businessName = window.prompt(businessLabel);
  if (!businessName) return; // User cancelled or entered empty
  
  let msg = '';
  if (isEnglishLocal) {
     msg = `Hi, I would like to request information about the ${planName} plan for my business [${businessName}]. My name is [${userName}].`;
  } else {
     msg = `Hola, me gustaría solicitar información sobre el plan ${planName} para mi negocio [${businessName}]. Soy [${userName}].`;
  }
  
  const phone = (window as any).contactPhone || '34673109486';
  const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  window.open(waUrl, '_blank');
};

function showModal() {
  const selector = document.getElementById('planSelector');
  if (selector) {
    selector.classList.remove('hidden');
    selector.classList.add('flex');
  }
  document.body.style.overflow = 'hidden';
}

(window as any).closeSelector = function () {
  const selector = document.getElementById('planSelector');
  if (selector) {
    selector.classList.add('hidden');
    selector.classList.remove('flex');
  }
  document.body.style.overflow = 'auto';
};

(window as any).selectPlan = function (planName: string) {
  currentPlan = planName;
  executeContact(currentMethod);
};

function executeContact(method: string) {
  // Retrieve settings values or use defaults
  const phone = (window as any).contactPhone || '34673109486';
  const email = (window as any).contactEmail || 'mynextbymusa@gmail.com';

  const plan = currentPlan || (isEnglish ? 'CUSTOM' : 'PERSONALIZADO');

  if (method === 'whatsapp') {
    const message = isEnglish
      ? `Hello, I am interested in the ${plan} plan`
      : `Hola, estoy interesado en el plan ${plan}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  } else {
    const subject = isEnglish
      ? `Inquiry about ${plan} plan`
      : `Consulta sobre el plan ${plan}`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
  }
  (window as any).closeSelector();
}

(window as any).executeContact = executeContact;

window.onclick = function (e) {
  const selector = document.getElementById('planSelector');
  if (e.target === selector) {
    (window as any).closeSelector();
  }
};

// FAQ Accordion Logic
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content') as HTMLElement;
    const icon = item.querySelector('.faq-icon');

    if (!trigger || !content) return;

    // Set initial heights based on data-open attribute
    const isOpen = item.getAttribute('data-open') === 'true';
    if (isOpen) {
      content.style.maxHeight = content.scrollHeight + 'px';
      content.style.opacity = '1';
      if (icon) icon.classList.add('rotate-180');
      trigger.setAttribute('aria-expanded', 'true');
    } else {
      content.style.maxHeight = '0px';
      content.style.opacity = '0';
      if (icon) icon.classList.remove('rotate-180');
      trigger.setAttribute('aria-expanded', 'false');
    }

    trigger.addEventListener('click', () => {
      const currentlyOpen = item.getAttribute('data-open') === 'true';
      if (currentlyOpen) {
        // Close it
        content.style.maxHeight = '0px';
        content.style.opacity = '0';
        if (icon) icon.classList.remove('rotate-180');
        trigger.setAttribute('aria-expanded', 'false');
        item.setAttribute('data-open', 'false');
      } else {
        // Open it
        content.style.maxHeight = content.scrollHeight + 'px';
        content.style.opacity = '1';
        if (icon) icon.classList.add('rotate-180');
        trigger.setAttribute('aria-expanded', 'true');
        item.setAttribute('data-open', 'true');
      }
    });
  });

  // Handle window resize to recalculate heights of open items
  window.addEventListener('resize', () => {
    faqItems.forEach(item => {
      const content = item.querySelector('.faq-content') as HTMLElement;
      if (content && item.getAttribute('data-open') === 'true') {
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });
}

// Legal Modals handler
function initLegalModals() {
  const modalWrappers = document.querySelectorAll('.modal-wrapper');
  const modalTriggers = document.querySelectorAll('[data-modal]');
  const closeButtons = document.querySelectorAll('.modal-close');

  function closeModal(modal: Element) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = trigger.getAttribute('data-modal');
      if (modalId) {
        const targetModal = document.getElementById(modalId);
        if (targetModal) {
          targetModal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      }
    });
  });

  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-wrapper');
      if (modal) closeModal(modal);
    });
  });

  modalWrappers.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).classList.contains('modal-overlay')) {
        closeModal(modal);
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.modal-wrapper.active');
      if (activeModal) closeModal(activeModal);
    }
  });
}

// Utility to apply dynamic settings from Supabase to HTML elements
function applyDynamicSettings(settingsMap: Record<string, string>, currentLang: 'es' | 'en') {
  const elements = document.querySelectorAll<HTMLElement>('[data-sb-content]');
  elements.forEach(el => {
    const key = el.getAttribute('data-sb-content');
    if (key && settingsMap[key]) {
      const translation = getTranslation(settingsMap[key], currentLang);
      if (translation) {
        el.innerHTML = translation;
      }
    }
  });
}

// Initialize Planes DOM safely
async function initPlanes() {
  sessionStorage.setItem('from-planes', 'true');
  initLegalModals();
  let services = fallbackServices;
  let settings: Record<string, string> = fallbackSettings;

  // Attempt to fetch from Supabase
  if (supabase) {
    try {
      const [servicesRes, settingsRes, contactRes, heroRes, faqRes] = await Promise.all([
        supabase.from('mynext_services').select('*').eq('active', true).order('sort_order', { ascending: true }),
        supabase.from('mynext_settings').select('*'),
        supabase.from('mynext_contact').select('*').maybeSingle(),
        supabase.from('mynext_hero').select('*').maybeSingle(),
        supabase.from('mynext_faq').select('*').eq('active', true).order('sort_order', { ascending: true })
      ]);

      if (servicesRes.data && servicesRes.data.length > 0) {
        services = servicesRes.data;
      }
      if (settingsRes.data && settingsRes.data.length > 0) {
        const dbSettings: Record<string, string> = {};
        settingsRes.data.forEach((s: any) => {
          dbSettings[s.key] = s.value;
        });
        settings = dbSettings;
      }

      // Merge contact table if present
      if (contactRes && (contactRes as any).data) {
        const c = (contactRes as any).data;
        if (c.phone) settings['contact_phone'] = c.phone;
        if (c.email) settings['contact_email'] = c.email;
        if (c.whatsapp_message_es || c.whatsapp_message_en) {
          settings['whatsapp_message_landing'] = JSON.stringify({ es: c.whatsapp_message_es, en: c.whatsapp_message_en });
        }
        if (c.site_title_es || c.site_title_en) {
          settings['site_title'] = JSON.stringify({ es: c.site_title_es, en: c.site_title_en });
        }
        if (c.meta_description_es || c.meta_description_en) {
          settings['site_description'] = JSON.stringify({ es: c.meta_description_es, en: c.meta_description_en });
        }
        if (c.footer_text_es || c.footer_text_en) {
          settings['footer_desc'] = JSON.stringify({ es: c.footer_text_es, en: c.footer_text_en });
        }
      }

      // Merge hero table if present
      if (heroRes && (heroRes as any).data) {
        const h = (heroRes as any).data;
        if (h.banner_offer_es || h.banner_offer_en) {
          settings['launch_banner_text'] = JSON.stringify({ es: h.banner_offer_es, en: h.banner_offer_en });
        }
      }

      // Merge faq table if present
      if (faqRes && (faqRes as any).data && (faqRes as any).data.length > 0) {
        (faqRes as any).data.forEach((f: any, idx: number) => {
          const num = f.sort_order || (idx + 1);
          settings[`faq_q${num}`] = JSON.stringify({ es: f.question_es, en: f.question_en });
          settings[`faq_a${num}`] = JSON.stringify({ es: f.answer_es, en: f.answer_en });
        });
      }

      // Apply any dynamic HTML content automatically to data-sb-content elements
      applyDynamicSettings(settings, lang as 'es' | 'en');

    } catch (err) {
      console.error('Error fetching services from Supabase, using local fallback:', err);
    }
  }

  // Map settings keys
  const settingsMap = new Map<string, string>();
  Object.entries(settings).forEach(([k, v]) => settingsMap.set(k, v));

  // Store phone and email globally so executeContact can read them
  const phoneVal = settingsMap.get('contact_phone') || '34673109486';
  const emailVal = settingsMap.get('contact_email') || 'mynextbymusa@gmail.com';
  (window as any).contactPhone = phoneVal;
  (window as any).contactEmail = emailVal;

  // Update banner text
  const launchBannerText = settingsMap.get('launch_banner_text');
  const bannerEl = document.getElementById('launch-banner-text');
  if (bannerEl && launchBannerText) {
    bannerEl.innerText = getTranslation(launchBannerText, lang);
  }

  // Update contact links on the plans page (if any exist in the markup)
  const whatsappMsg = getTranslation(settingsMap.get('whatsapp_message_landing'), lang);
  const emailSubject = getTranslation(settingsMap.get('email_subject_landing'), lang);
  const emailBody = getTranslation(settingsMap.get('email_body_landing'), lang);

  document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
    link.setAttribute('href', `https://wa.me/${phoneVal}?text=${encodeURIComponent(whatsappMsg)}`);
  });

  document.querySelectorAll('a[href*="mailto:"]').forEach(link => {
    link.setAttribute('href', `mailto:${emailVal}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`);
  });

  // Render Services Cards
  const servicesContainer = document.getElementById('services-container');
  if (servicesContainer) {
    servicesContainer.innerHTML = '';

    services.forEach((service: any) => {
      const isFeatured = Boolean(service.featured || service.popular);
      const defaultTitle = isFeatured ? 'BUSINESS' : (isEnglish ? 'BASIC' : 'BÁSICO');
      const title = getFieldTranslation(service, 'title', lang) || defaultTitle;
      const featuresList = getServiceFeatures(service, lang);
      const currencySymbol = isEnglish ? '£' : '€';

      // Parse price cleanly
      let priceNum = 0;
      if (typeof service.price === 'number') {
        priceNum = service.price;
      } else if (typeof service.price === 'string') {
        const parsed = parseFloat(service.price.replace(/[^0-9.]/g, ''));
        priceNum = isNaN(parsed) ? 0 : parsed;
      }

      const formattedPrice = priceNum > 0
        ? (isEnglish ? `${currencySymbol}${priceNum}` : `${priceNum}${currencySymbol}`)
        : (service.price ? String(service.price).trim() : 'Consultar');

      // Check for discount badge / offer
      const badge = getFieldTranslation(service, 'badge', lang);
      let priceHTML = '';

      if (badge && (badge.toLowerCase().includes('ahorra') || badge.toLowerCase().includes('save') || badge.toLowerCase().includes('oferta') || badge.toLowerCase().includes('offer'))) {
        const discountMatch = badge.match(/\d+/);
        const discountAmount = discountMatch ? parseInt(discountMatch[0], 10) : 20;
        const originalPriceNum = priceNum > 0 ? priceNum + discountAmount : 0;
        const origPriceStr = originalPriceNum > 0
          ? (isEnglish ? `${currencySymbol}${originalPriceNum}` : `${originalPriceNum}${currencySymbol}`)
          : '';

        priceHTML = `
          ${origPriceStr ? `<del class="text-slate-500 text-2xl md:text-3xl font-medium mr-2">${origPriceStr}</del>` : ''}
          <span class="${isFeatured ? 'text-amber-400' : 'text-cyan-400'}">${formattedPrice}</span>
        `;
      } else {
        priceHTML = `<span class="${isFeatured ? 'text-amber-400' : 'text-cyan-400'}">${formattedPrice}</span>`;
      }

      // Process description list items
      const items = featuresList.map((itemText: string) => {
        let text = itemText.trim();
        // Replace *number with the styled superscript tag
        text = text.replace(/\*(\d+)/g, (_, num) => {
          return `<span class="text-cyan-400 font-bold ml-0.5">*<sup class="text-[10px]">${num}</sup></span>`;
        });
        return `<li class="flex items-center gap-3"><span class="w-2.5 h-2.5 bg-rose-500 shadow-[0_0_8px_#f43f5e] rounded-full shrink-0"></span> ${text}</li>`;
      }).join('');

      // Build card container div with flip logic
      const card = document.createElement('div');
      card.className = isFeatured
        ? 'flip-container group mx-auto w-full max-w-[24rem] lg:scale-105 hover:-translate-y-2 transition-all duration-400 hover:shadow-[0_20px_50px_rgba(245,158,11,0.3)]'
        : 'flip-container mx-auto w-full max-w-[22rem] lg:scale-95 hover:-translate-y-2 transition-all duration-400 hover:shadow-[0_20px_45px_rgba(6,182,212,0.25)]';

      card.onclick = (e) => {
        const target = e.target as HTMLElement;
        if (target.closest('.no-flip')) return;
        card.classList.toggle('flipped');
      };

      if (isFeatured) {
        // Plan BUSINESS / Featured Plan
        card.innerHTML = `
          <div class="flip-card-inner">
            <!-- FRONT -->
            <div class="flip-card-front premium-plan-card p-8 md:p-12 flex flex-col border border-amber-500/30">
              <!-- Popular Corner Ribbon -->
              <div class="plan-ribbon-wrapper"></div>
              <div class="text-center h-full flex flex-col pt-4">
                <h3 class="logo-font text-2xl tracking-[0.2em] font-black mb-6 uppercase text-white">
                  <span class="relative inline-block pb-2">
                    ${title}
                    <div class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
                  </span>
                </h3>
                <div class="text-4xl md:text-5xl font-extrabold text-white mb-4 md:mb-6 flex items-center justify-center gap-3">
                  ${priceHTML}
                </div>
                
                <ul class="space-y-4 flex-grow text-[14px] md:text-[15px] text-slate-200 font-semibold text-left mx-auto w-fit mt-4">
                  ${items}
                </ul>
                
                <div class="mt-8 pt-4 border-t border-slate-800/80">
                  <span class="text-[10px] uppercase tracking-[0.2em] text-amber-400 font-black animate-pulse">
                    ${isEnglish ? '➔ CLICK TO READ MORE' : '➔ CLICK PARA SABER MÁS'}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- BACK -->
            <div class="flip-card-back premium-plan-card p-8 md:p-12 flex flex-col border border-amber-500/40 text-center">
              <div class="h-full flex flex-col justify-between pt-4">
                <div>
                  <h4 class="logo-font text-lg tracking-[0.15em] font-black text-amber-400 mb-6 uppercase">
                    ${isEnglish ? 'EXCLUSIVE BENEFITS' : 'VENTAJAS EXCLUSIVAS'}
                  </h4>
                  <ul class="space-y-4 text-left text-xs text-slate-200 font-medium leading-relaxed">
                    <li class="flex items-start gap-2">
                      <span class="text-amber-400 mt-0.5">✦</span>
                      <span><strong>${isEnglish ? 'Modern design:' : 'Diseño moderno:'}</strong> ${isEnglish ? 'Inspires trust from the very first moment.' : 'que transmite confianza desde el primer momento.'}</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-amber-400 mt-0.5">✦</span>
                      <span><strong>${isEnglish ? 'Full Setup:' : 'Puesta a punto total:'}</strong> ${isEnglish ? 'Domain and server configuration ready to go.' : 'Configuración de dominio y hosting listas para arrancar.'}</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-amber-400 mt-0.5">✦</span>
                      <span><strong>${isEnglish ? 'Maintenance Included:' : 'Mantenimiento incluido:'}</strong> ${isEnglish ? 'Minor adjustments covered at no extra cost' : 'Pequeños ajustes cubiertos sin coste extra'} <span class="text-cyan-400 font-bold ml-0.5">*<sup class="text-[10px]">2</sup></span>.</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-amber-400 mt-0.5">✦</span>
                      <span><strong>${isEnglish ? 'Mobile-optimized:' : 'Web optimizada:'}</strong> ${isEnglish ? 'Fully responsive and ready to welcome new clients.' : 'para móviles y preparada para recibir nuevos clientes.'}</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-amber-400 mt-0.5">✦</span>
                      <span><strong>${isEnglish ? 'Direct, close support:' : 'Soporte directo:'}</strong> ${isEnglish ? 'Personalized assistance whenever you need it.' : 'y cercano siempre que lo necesites.'}</span>
                    </li>
                  </ul>
                </div>
                
                <div class="mt-6 pt-4 border-t border-slate-800/80 flex flex-col items-center">
                  <button onclick="event.stopPropagation(); window.openContactOptions('${title}');" class="no-flip w-full py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider text-xs transition-colors shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                    ${isEnglish ? 'INQUIRE NOW' : 'SOLICITAR PLAN'}
                  </button>
                  <span class="text-[9px] uppercase tracking-widest text-slate-500 mt-3 hover:text-white transition-colors cursor-pointer">
                    ${isEnglish ? '➔ Tap to flip back' : '➔ Toca para volver'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        `;
      } else {
        // Plan BÁSICO / Non-featured Plan
        card.innerHTML = `
          <div class="flip-card-inner">
            <!-- FRONT -->
            <div class="flip-card-front premium-plan-card p-8 flex flex-col border border-cyan-500/20">
              <div class="text-center h-full flex flex-col">
                <h3 class="logo-font text-xl tracking-[0.2em] font-black mb-6 uppercase text-white">
                  <span class="relative inline-block pb-2">
                    ${title}
                    <div class="absolute bottom-0 left-0 w-full h-[2px] bg-slate-700 rounded-full"></div>
                  </span>
                </h3>
                <div class="text-4xl md:text-5xl font-extrabold text-white mb-6 md:mb-10 flex items-center justify-center gap-3">
                  ${priceHTML}
                </div>
                
                <ul class="space-y-4 flex-grow text-[14px] md:text-[15px] text-slate-300 font-semibold text-left mx-auto w-fit">
                  ${items}
                </ul>
                
                <div class="mt-8 pt-4 border-t border-slate-800/80">
                  <span class="text-[10px] uppercase tracking-[0.2em] text-cyan-400 font-black animate-pulse">
                    ${isEnglish ? '➔ CLICK TO READ MORE' : '➔ CLICK PARA SABER MÁS'}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- BACK -->
            <div class="flip-card-back premium-plan-card p-8 flex flex-col border border-cyan-500/30 text-center">
              <div class="h-full flex flex-col justify-between">
                <div>
                  <h4 class="logo-font text-base tracking-[0.15em] font-black text-cyan-400 mb-6 uppercase">
                    ${isEnglish ? 'PLAN DETAILS' : 'DETALLES DEL PLAN'}
                  </h4>
                  <ul class="space-y-4 text-left text-xs text-slate-300 font-medium leading-relaxed">
                    <li class="flex items-start gap-2">
                      <span class="text-cyan-400 mt-0.5">✓</span>
                      <span><strong>${isEnglish ? 'Smart Structure:' : 'Estructura inteligente:'}</strong> ${isEnglish ? 'Designed for fast conversions and visual clarity. Ideal for startups and local services.' : 'Pensada para conversión rápida y claridad de marca. Ideal para autónomos y negocios locales.'}</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-cyan-400 mt-0.5">✓</span>
                      <span><strong>${isEnglish ? 'Zero Hassle:' : 'Cero complicaciones:'}</strong> ${isEnglish ? 'We handle hosting setup, DNS pointing, and server configurations from scratch.' : 'Nos encargamos de todo el registro, hosting y puesta a punto inicial sin dolores de cabeza.'}</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-cyan-400 mt-0.5">✓</span>
                      <span><strong>${isEnglish ? 'SEO Launch:' : 'Lanzamiento SEO:'}</strong> ${isEnglish ? 'Full Google Profile and Maps optimization to attract nearby clients immediately.' : 'Optimización en Google Profile y Maps para captar clientes locales desde el primer día.'}</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-cyan-400 mt-0.5">✓</span>
                      <span><strong>${isEnglish ? 'Maintenance & Updates:' : 'Mantenimiento y Ajustes:'}</strong> ${isEnglish ? 'Modifications are billed separately at 50€ per fix.' : 'Las modificaciones puntuales se facturan a 50€ por ajuste.'}</span>
                    </li>
                  </ul>
                </div>
                
                <div class="mt-6 pt-4 border-t border-slate-800/80 flex flex-col items-center">
                  <button onclick="event.stopPropagation(); window.openContactOptions('${title}');" class="no-flip w-full py-3 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold uppercase tracking-wider text-xs transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                    ${isEnglish ? 'INQUIRE NOW' : 'SOLICITAR PLAN'}
                  </button>
                  <span class="text-[9px] uppercase tracking-widest text-slate-500 mt-3 hover:text-white transition-colors cursor-pointer">
                    ${isEnglish ? '➔ Tap to flip back' : '➔ Toca para volver'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        `;
      }

      servicesContainer.appendChild(card);
    });
  }

  // Initialize local FAQ accordion
  initFaqAccordion();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPlanes);
} else {
  initPlanes();
}
