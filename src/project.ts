import './style.css';
import { supabase } from './lib/supabase';
import { fallbackProjects, fallbackSettings } from './lib/fallbackData';
import { initAnalyticsListeners } from './lib/analytics';
import { getTranslation, applyDynamicSettings, sanitizeHtml } from './lib/domUtils';

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



// Utility to handle proposal contact form submissions in project page
function initContactForm(lang: 'es' | 'en') {
  const contactForm = document.getElementById('email-contact-form') as HTMLFormElement | null;
  if (!contactForm) return;

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = contactForm.querySelector('input[name="name"]') as HTMLInputElement | null;
    const emailInput = contactForm.querySelector('input[name="email"]') as HTMLInputElement | null;
    const phoneInput = contactForm.querySelector('input[name="phone"]') as HTMLInputElement | null;
    const projectTypeSelect = contactForm.querySelector('select[name="project_type"]') as HTMLSelectElement | null;
    const budgetSelect = contactForm.querySelector('select[name="budget"]') as HTMLSelectElement | null;
    const messageInput = contactForm.querySelector('textarea[name="message"]') as HTMLTextAreaElement | null;
    const submitBtn = contactForm.querySelector('.form-submit-btn') as HTMLButtonElement | null;

    if (!emailInput || !submitBtn || !emailInput.value) return;

    const btnText = submitBtn.querySelector('.btn-text');
    const originalText = btnText ? btnText.textContent : submitBtn.textContent;

    const allInputs = contactForm.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea');
    allInputs.forEach(input => input.disabled = true);
    submitBtn.disabled = true;

    const isEs = lang === 'es';
    const statusText = isEs ? 'Enviando Propuesta...' : 'Sending Proposal...';
    if (btnText) {
      btnText.textContent = statusText;
    } else {
      submitBtn.textContent = statusText;
    }

    const clientName = nameInput?.value || (isEs ? 'Cliente / Negocio' : 'Client / Business');
    const clientEmail = emailInput.value;
    const clientPhone = phoneInput?.value || (isEs ? 'No especificado' : 'Not specified');
    const projectType = projectTypeSelect?.value || (isEs ? 'General' : 'General');
    const budget = budgetSelect?.value || (isEs ? 'No especificado' : 'Not specified');
    const messageDetails = messageInput?.value || '';

    const subject = isEs
      ? `🚀 Nueva Solicitud de Proyecto Web (Portfolio): ${clientName} (${projectType})`
      : `🚀 New Web Project Request (Portfolio): ${clientName} (${projectType})`;

    const autorespondVal = isEs
      ? `¡Hola ${clientName}!

Muchas gracias por contactar con MYNEXT. Hemos recibido correctamente los detalles de tu consulta para tu proyecto web:

• Tipo de Proyecto: ${projectType}
• Plan de Interés: ${budget}

He revisado tu solicitud y en breve me pondré en contacto contigo directamente por correo o WhatsApp para agendar una breve llamada o enviarte la propuesta personalizada sin compromiso.

Un saludo,
Musa — MYNEXT Arquitectura Digital
https://mynextbymusa.com`
      : `Hello ${clientName}!

Thank you very much for contacting MYNEXT. We have successfully received your inquiry details for your web project:

• Project Type: ${projectType}
• Plan of Interest: ${budget}

I have reviewed your request and will contact you directly via email or WhatsApp shortly to schedule a brief call or send you a custom proposal with no obligation.

Best regards,
Musa — MYNEXT Digital Architecture
https://mynextbymusa.com`;

    fetch(contactForm.action, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        _subject: subject,
        _template: 'table',
        _captcha: 'false',
        _autorespond: autorespondVal,
        "Cliente / Negocio": clientName,
        "Email de Contacto": clientEmail,
        "Teléfono / WhatsApp": clientPhone,
        "Tipo de Proyecto": projectType,
        "Plan de Interés": budget,
        "Detalles / Idea del Proyecto": messageDetails
      })
    })
      .then(response => {
        if (response.ok) {
          const successText = isEs ? '¡Solicitud Enviada! ✓' : 'Proposal Sent! ✓';
          if (btnText) {
            btnText.textContent = successText;
          } else {
            submitBtn.textContent = successText;
          }
          submitBtn.style.backgroundColor = '#00F2FF';
          submitBtn.style.boxShadow = '0 0 25px #00F2FF';

          const formElement = contactForm;
          formElement.style.transition = 'all 0.5s ease';
          formElement.style.opacity = '0';
          formElement.style.transform = 'scale(0.95)';
          setTimeout(() => {
            formElement.style.display = 'none';
            const successMsg = document.createElement('div');
            successMsg.className = 'text-electric-cyan font-headline text-sm md:text-base tracking-wider font-semibold animate-pulse mt-4 text-center px-4 leading-relaxed';
            successMsg.style.textShadow = '0 0 12px rgba(0, 242, 255, 0.5)';
            successMsg.innerHTML = isEs
              ? `¡Gracias, ${clientName}! Hemos recibido tu propuesta.<br><span class="text-xs text-white/70 font-normal">Te hemos enviado un correo de confirmación a <strong>${clientEmail}</strong>. Nos pondremos en contacto contigo muy pronto.</span>`
              : `Thank you, ${clientName}! We received your proposal.<br><span class="text-xs text-white/70 font-normal">We sent a confirmation email to <strong>${clientEmail}</strong>. We will get in touch with you very soon.</span>`;

            const formParent = formElement.parentElement;
            if (formParent) formParent.appendChild(successMsg);
          }, 500);
        } else {
          showErrorState();
        }
      })
      .catch(() => {
        showErrorState();
      });

    function showErrorState() {
      if (btnText) {
        btnText.textContent = isEs ? 'Error al enviar' : 'Error sending';
      } else if (submitBtn) {
        submitBtn.textContent = isEs ? 'Error al enviar' : 'Error sending';
      }
      setTimeout(() => {
        if (btnText) {
          btnText.textContent = originalText;
        } else if (submitBtn) {
          submitBtn.textContent = originalText;
        }
        submitBtn!.disabled = false;
        allInputs.forEach(input => input.disabled = false);
      }, 3000);
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  // Inicializar seguimiento de conversiones
  initAnalyticsListeners();

  // Inicializar modales legales del footer y modal de contacto
  initLegalModals();

  // Determine language from HTML element
  const lang = (document.documentElement.lang === 'en' || window.location.pathname.includes('-en')) ? 'en' : 'es';
  const isEnglish = lang === 'en';

  // Inicializar formulario de propuesta en la página de proyecto
  initContactForm(lang as 'es' | 'en');

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

  // Parse URL parameter (supports both ?slug= and ?id=)
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug') || urlParams.get('id');

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
        const dbData = (projectRes as any).data;
        const localProj = fallbackProjects.find(p => p.slug === slug || String(p.id) === slug);
        project = { ...localProj, ...dbData };
        if (!dbData.full_description && !dbData.full_description_es && localProj?.full_description) {
          project.full_description = localProj.full_description;
        }
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
    let imgUrl = project.image_url;
    if (imgUrl.includes('/portfolio/') && imgUrl.endsWith('.png')) {
      imgUrl = imgUrl.replace('.png', '.webp');
    }
    imageEl.src = imgUrl;
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
