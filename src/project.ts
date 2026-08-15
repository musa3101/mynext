import './style.css';
import { supabase } from './lib/supabase';
import { fallbackProjects, fallbackSettings } from './lib/fallbackData';
import { initAnalyticsListeners } from './lib/analytics';

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
  const getTranslation = (value: string | null | undefined, language: 'es' | 'en'): string => {
    if (!value) return '';
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === 'object') {
        if (parsed[language] !== undefined) return parsed[language];
        if (parsed['es'] !== undefined) return parsed['es'];
        return value;
      }
    } catch {
      // not JSON
    }
    return value;
  };

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

document.addEventListener('DOMContentLoaded', async () => {
  // Inicializar seguimiento de conversiones
  initAnalyticsListeners();

  // Inicializar modales legales del footer
  initLegalModals();

  // Determine language from HTML element
  const lang = (document.documentElement.lang === 'en' || window.location.pathname.includes('-en')) ? 'en' : 'es';
  const isEnglish = lang === 'en';

  // Helper to get nested translation or field translation
  const getFieldTranslation = (item: any, fieldBase: string, language: 'es' | 'en'): string => {
    if (!item) return '';
    const langKey = `${fieldBase}_${language}`;
    if (item[langKey] !== undefined && item[langKey] !== null && item[langKey] !== '') {
      return typeof item[langKey] === 'string' ? item[langKey] : JSON.stringify(item[langKey]);
    }
    const fallbackLangKey = language === 'en' ? `${fieldBase}_es` : `${fieldBase}_en`;
    if (item[fallbackLangKey] !== undefined && item[fallbackLangKey] !== null && item[fallbackLangKey] !== '') {
      return typeof item[fallbackLangKey] === 'string' ? item[fallbackLangKey] : JSON.stringify(item[fallbackLangKey]);
    }
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
  };

  // Settings initialization with fallback
  let settings: Record<string, string> = fallbackSettings;

  // Parse URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');

  let project: any = null;

  // 1. Try to fetch from Supabase
  if (supabase) {
    try {
      const [projectRes, settingsRes, contactRes] = await Promise.all([
        slug ? supabase.from('mynext_projects').select('*').eq('slug', slug).eq('active', true).maybeSingle() : Promise.resolve({ data: null, error: null }),
        supabase.from('mynext_settings').select('*'),
        supabase.from('mynext_contact').select('*').maybeSingle()
      ]);

      if (projectRes && (projectRes as any).data) {
        project = (projectRes as any).data;
      }

      if (settingsRes && settingsRes.data && settingsRes.data.length > 0) {
        const dbSettings: Record<string, string> = {};
        settingsRes.data.forEach((s: any) => {
          dbSettings[s.key] = s.value;
        });
        settings = dbSettings;
      }

      if (contactRes && (contactRes as any).data) {
        const c = (contactRes as any).data;
        if (c.phone) settings['contact_phone'] = c.phone;
        if (c.email) settings['contact_email'] = c.email;
        if (c.footer_text_es || c.footer_text_en) {
          settings['footer_desc'] = JSON.stringify({ es: c.footer_text_es, en: c.footer_text_en });
        }
      }

      // Apply dynamic settings to page and modals
      applyDynamicSettings(settings, lang as 'es' | 'en');

    } catch (err) {
      console.warn('Error fetching Supabase data, checking local fallback:', err);
    }
  }

  // 2. Fallback to local data
  if (!project && slug) {
    project = fallbackProjects.find(p => p.slug === slug || String(p.id) === slug);
  }

  // If still not found by slug, handle not found
  if (!project) {
    const titleEl = document.getElementById('project-title');
    if (titleEl) {
      titleEl.textContent = isEnglish ? 'Project Not Found' : 'Proyecto No Encontrado';
    }
    const descEl = document.getElementById('project-description');
    if (descEl) {
      descEl.textContent = isEnglish ? 'The requested project could not be found.' : 'El proyecto solicitado no ha sido encontrado.';
    }
    return;
  }

  // Populate project details
  const titleEl = document.getElementById('project-title');
  const descEl = document.getElementById('project-description');
  const imageEl = document.getElementById('project-image') as HTMLImageElement;
  const linkEl = document.getElementById('project-link') as HTMLAnchorElement;

  const projectTitle = project.title || 'Proyecto MYNEXT';
  if (titleEl) titleEl.textContent = projectTitle;
  document.title = `${projectTitle} | MYNEXT Portfolio`;

  // Merge full_description with description
  const fullDesc = getFieldTranslation(project, 'full_description', lang) || getFieldTranslation(project, 'description', lang);
  if (descEl) {
    descEl.innerHTML = fullDesc;
  }

  if (imageEl && project.image_url) {
    imageEl.src = project.image_url;
    imageEl.alt = projectTitle;
  }

  if (linkEl) {
    if (project.project_url) {
      linkEl.href = project.project_url;
      linkEl.classList.remove('hidden');
    } else {
      linkEl.classList.add('hidden');
    }
  }

  // Populate gallery
  const galleryEl = document.getElementById('project-gallery');
  let galleryItems = project.gallery;
  if (typeof galleryItems === 'string') {
    try {
      galleryItems = JSON.parse(galleryItems);
    } catch {
      galleryItems = [];
    }
  }

  if (galleryEl && Array.isArray(galleryItems) && galleryItems.length > 0) {
    galleryEl.classList.remove('hidden');
    const defaultTitle = isEnglish ? 'PRINT MATERIALS & BRANDING' : 'MATERIALES IMPRESOS & BRANDING';
    const defaultSubtitle = isEnglish ? 'Custom print materials & physical QR integration' : 'Materiales impresos y soportes de marca con código QR';

    const sectionTitle = getFieldTranslation(project, 'gallery_title', lang) || defaultTitle;
    const sectionSubtitle = getFieldTranslation(project, 'gallery_subtitle', lang) || defaultSubtitle;

    const itemsHtml = galleryItems.map((item: any) => {
      const itemTitle = getFieldTranslation(item, 'title', lang);
      const badgeText = isEnglish ? 'Print & Branding' : 'Impresión & Branding';
      return `
        <div class="relative group rounded-[2rem] overflow-hidden bg-[#0c0c16]/70 border border-white/10 p-2 hover:border-[#00f2ff]/40 transition-all duration-500 shadow-xl hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,242,255,0.1)]">
          <div class="w-full aspect-[4/5] rounded-[1.5rem] overflow-hidden bg-black/40 relative">
            <img src="${item.url}" alt="${itemTitle}" loading="lazy" decoding="async" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-85 group-hover:opacity-95 transition-opacity"></div>
            <div class="absolute bottom-5 left-5 right-5 z-10">
              <span class="text-[10px] text-[#00f2ff] font-headline uppercase tracking-widest block mb-1 font-bold">${badgeText}</span>
              <h3 class="text-sm font-headline font-semibold text-white leading-snug">${itemTitle}</h3>
            </div>
          </div>
        </div>
      `;
    }).join('');

    galleryEl.innerHTML = `
      <div class="border-t border-white/10 pt-16">
        <div class="mb-10 text-left">
          <span class="text-[#00f2ff] font-headline text-xs tracking-[0.3em] uppercase mb-2 block font-semibold">${sectionTitle}</span>
          <h2 class="text-2xl md:text-4xl font-headline font-bold text-white tracking-tight">${sectionSubtitle}</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          ${itemsHtml}
        </div>
      </div>
    `;
  }
});
