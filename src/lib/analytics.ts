// ==========================================
// MYNEXT - ANALYTICS & CONVERSION TRACKING
// ==========================================

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

export type ConversionEvent =
  | 'click_whatsapp'
  | 'click_phone'
  | 'submit_contact_form'
  | 'select_plan'
  | 'view_live_project'
  | 'faq_expand';

export interface EventParams {
  category?: string;
  label?: string;
  value?: number;
  [key: string]: any;
}

/**
 * Registra un evento de analítica/conversión compatible con GA4 / GTM / Local log
 */
export function trackEvent(eventName: ConversionEvent, params: EventParams = {}): void {
  const payload = {
    event: eventName,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    ...params
  };

  // Google Analytics (GA4) / Google Tag Manager
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, payload);
  } else if (window.dataLayer && Array.isArray(window.dataLayer)) {
    window.dataLayer.push(payload);
  }

  // Development / Debug logging
  if (import.meta.env.DEV) {
    console.log(`📊 [Analytics] ${eventName}:`, payload);
  }
}

/**
 * Inicializa los listeners automáticos de conversión en la página
 */
export function initAnalyticsListeners(): void {
  // 1. Clics en WhatsApp (flotante, menú, botones CTA)
  document.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement)?.closest('a');
    if (!target) return;

    const href = target.getAttribute('href') || '';

    // WhatsApp
    if (href.includes('wa.me') || href.includes('whatsapp.com')) {
      const label = target.getAttribute('aria-label') || target.innerText.trim() || 'WhatsApp CTA';
      trackEvent('click_whatsapp', { category: 'lead', label });
    }

    // Teléfono directo
    if (href.startsWith('tel:')) {
      trackEvent('click_phone', { category: 'lead', label: href.replace('tel:', '') });
    }

    // Visita a proyectos reales / portfolio
    if (target.id === 'project-link' || target.getAttribute('data-project-link') !== null) {
      const projectName = target.getAttribute('data-project-name') || target.innerText.trim();
      trackEvent('view_live_project', { category: 'portfolio', label: projectName, target_url: href });
    }

    // Clics a planes de precios
    if (href.includes('#contacto') || href.includes('#contact') || href.includes('planes')) {
      const planName = target.getAttribute('data-plan') || target.innerText.trim();
      if (planName) {
        trackEvent('select_plan', { category: 'pricing', label: planName });
      }
    }
  });

  // 2. Formulario de contacto
  const contactForm = document.getElementById('contact-form') as HTMLFormElement | null;
  if (contactForm) {
    contactForm.addEventListener('submit', () => {
      const projectTypeInput = contactForm.querySelector<HTMLSelectElement | HTMLInputElement>('[name="project_type"], select');
      const projectType = projectTypeInput ? projectTypeInput.value : 'General';
      trackEvent('submit_contact_form', { category: 'lead', label: projectType });
    });
  }

  // 3. Seguimiento de FAQs desplegadas (Interés de usuario)
  const faqItems = document.querySelectorAll('details, .faq-item, [data-faq]');
  faqItems.forEach((faq) => {
    faq.addEventListener('toggle', () => {
      const summary = faq.querySelector('summary, .faq-question')?.textContent?.trim() || 'FAQ item';
      trackEvent('faq_expand', { category: 'engagement', label: summary });
    });
  });
}
