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
      return parsed[language] || parsed['es'] || value;
    }
  } catch (e) {
    // Return raw string if parsing fails
  }
  return value;
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
  currentPlan = planName;
  currentMethod = '';
  const titleEl = document.getElementById('modalTitle');
  if (titleEl) {
    titleEl.innerText = isEnglish ? `Inquire Plan ${planName}` : `Consultar Plan ${planName}`;
  }
  document.getElementById('planButtons')?.classList.add('hidden');
  document.getElementById('contactButtons')?.classList.remove('hidden');
  showModal();
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

// Initialize Planes DOM safely
async function initPlanes() {
  let services = fallbackServices;
  let settings: Record<string, string> = fallbackSettings;

  // Attempt to fetch from Supabase
  if (supabase) {
    try {
      const [servicesRes, settingsRes] = await Promise.all([
        supabase.from('mynext_services').select('*').eq('active', true).order('sort_order', { ascending: true }),
        supabase.from('mynext_settings').select('*')
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
    } catch (err) {
      console.error('Error fetching services from Supabase, using local fallback:', err);
    }
  }

  // Map settings settings keys
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

    services.forEach((service) => {
      const title = getTranslation(service.title, lang);
      const description = getTranslation(service.description, lang);
      // Aumentamos 10 euros al precio base de la base de datos (Ej: 200 -> 210, 300 -> 310)
      const priceVal = Number(service.price) + 10;
      
      const currencySymbol = isEnglish ? '£' : '€';
      const priceStr = isEnglish ? `${currencySymbol}${priceVal}` : `${priceVal}${currencySymbol}`;

      // Process description list items
      const items = description.split(',').map((item) => {
        let text = item.trim();
        // Replace *number with the styled superscript tag
        text = text.replace(/\*(\d+)/g, (_, num) => {
          return `<span class="text-cyan-400 font-bold ml-0.5">*<sup class="text-[10px]">${num}</sup></span>`;
        });
        return `<li class="flex items-center gap-3"><span class="w-2.5 h-2.5 bg-rose-500 shadow-[0_0_8px_#f43f5e] rounded-full shrink-0"></span> ${text}</li>`;
      }).join('');

      // Build card container div
      const card = document.createElement('div');
      card.onclick = () => (window as any).openContactOptions(title);

      if (service.featured) {
        // Plan ÉLITE / Featured Plan
        card.className = 'group premium-plan-card p-8 md:p-12 flex flex-col mx-auto w-full max-w-[24rem] lg:scale-105 border border-amber-500/30 hover:border-amber-400/60 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(245,158,11,0.3)] hover:scale-[1.07] transition-all duration-400 cursor-pointer relative';
        
        card.innerHTML = `
          <!-- Popular Corner Ribbon -->
          <div class="plan-ribbon-wrapper"></div>
          <div class="text-center h-full flex flex-col pt-4">
            <h3 class="logo-font text-2xl tracking-[0.2em] font-black mb-6 uppercase text-white">
              <span class="relative inline-block pb-2">
                ${title}
                <div class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
              </span>
            </h3>
            <div class="text-4xl md:text-5xl font-extrabold text-amber-400 mb-4 md:mb-6 flex items-center justify-center gap-3">
              <span>${priceStr}</span>
            </div>
            
            <ul class="space-y-4 flex-grow text-[14px] md:text-[15px] text-slate-200 font-semibold text-left mx-auto w-fit mt-4">
              ${items}
            </ul>
            
            <div class="mt-8 md:mt-12 pt-6 border-t border-slate-800">
              <span class="text-lg font-black uppercase tracking-widest text-cyan-300 flex items-center justify-center">
                ${isEnglish ? 'INCLUDED' : 'INCLUIDO'} <span class="text-cyan-400 font-bold ml-1.5">*<sup class="text-[11px]">2</sup></span>
              </span>
            </div>
          </div>
        `;
      } else {
        // Plan ESENCIAL / Non-featured Plan
        card.className = 'premium-plan-card p-8 flex flex-col mx-auto w-full max-w-[22rem] lg:scale-95 border border-cyan-500/20 hover:border-cyan-500/50 hover:-translate-y-2 hover:shadow-[0_20px_45px_rgba(6,182,212,0.25)] hover:scale-[0.97] transition-all duration-400 cursor-pointer';
        
        card.innerHTML = `
          <div class="text-center h-full flex flex-col">
            <h3 class="logo-font text-xl tracking-[0.2em] font-black mb-6 uppercase text-white">
              <span class="relative inline-block pb-2">
                ${title}
                <div class="absolute bottom-0 left-0 w-full h-[2px] bg-slate-700 rounded-full"></div>
              </span>
            </h3>
            <div class="text-4xl md:text-5xl font-extrabold text-cyan-400 mb-6 md:mb-10 flex items-center justify-center gap-3">
              <span>${priceStr}</span>
            </div>
            
            <ul class="space-y-4 flex-grow text-[14px] md:text-[15px] text-slate-300 font-semibold text-left mx-auto w-fit">
              ${items}
            </ul>
            
            <div class="mt-8 md:mt-12 pt-6 border-t border-slate-800">
              <span class="text-lg font-black uppercase tracking-widest text-cyan-400">
                ${isEnglish ? '£50 PER FIX' : '50€ POR MODIFICACIÓN'}
              </span>
            </div>
          </div>
        `;
      }

      servicesContainer.appendChild(card);
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPlanes);
} else {
  initPlanes();
}
