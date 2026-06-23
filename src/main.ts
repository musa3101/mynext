import './style.css';
import { supabase } from './lib/supabase';
import {
  fallbackProjects,
  fallbackTestimonials,
  fallbackSettings
} from './lib/fallbackData';

// Determine language based on html lang attribute
const lang = (document.documentElement.lang === 'en' || window.location.pathname.includes('-en')) ? 'en' : 'es';

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

// Utility to parse domain names from project URLs for browser bar
function getDomainFromUrl(url: string): string {
  if (url.includes('blessedstudio')) return 'blessedstudio.com';
  if (url.includes('barlunallena')) return 'barlunallena.com';
  if (url.includes('ecuapv2') || url.includes('ecuaplac')) return 'ecuaplac.com';
  if (url.includes('rbari')) return 'rajbarikitchen.com';
  if (url.includes('nexterabymusa')) return 'nextera.com';
  if (url.includes('mezquita-arrahma')) return 'mezquita-arrahma.com';

  try {
    const parsed = new URL(url);
    let hostname = parsed.hostname;
    if (hostname.startsWith('www.')) {
      hostname = hostname.substring(4);
    }
    return hostname;
  } catch (e) {
    return url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
  }
}

// Global reveal animations trigger
function initRevealAnimations() {
  const reveals = document.querySelectorAll('.reveal');
  const observerOptions = { threshold: 0.15 };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  reveals.forEach(reveal => observer.observe(reveal));
}

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

// 0. Scroll restoration logic
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
const isFromPlanes = sessionStorage.getItem('from-planes');
if (!isFromPlanes && !window.location.hash) {
  window.scrollTo(0, 0);
}

// Initialize all DOM contents safely
async function initMain() {
  // --- A. Dynamic Data Fetch & Render ---
  let projects = fallbackProjects;
  let testimonials = fallbackTestimonials;
  let settings: Record<string, string> = fallbackSettings;

  // Attempt to fetch from Supabase
  if (supabase) {
    try {
      const [projectsRes, testimonialsRes, settingsRes] = await Promise.all([
        supabase.from('mynext_projects').select('*').eq('active', true).order('sort_order', { ascending: true }),
        supabase.from('mynext_testimonials').select('*').eq('active', true),
        supabase.from('mynext_settings').select('*')
      ]);

      if (projectsRes.data && projectsRes.data.length > 0) {
        const dbProjects = projectsRes.data;
        const merged: any[] = [...dbProjects];

        fallbackProjects.forEach(localProj => {
          const match = merged.find(p => p.title.toLowerCase().trim() === localProj.title.toLowerCase().trim() || p.id === localProj.id);
          if (match) {
            // Override with local image paths if the local fallback has updated versions
            if (localProj.image_url.includes('porfolio2-v3') || localProj.image_url.includes('porfolio6')) {
              match.image_url = localProj.image_url;
            }
            // Override Ecuaplac project URL
            if (localProj.title.toLowerCase() === 'ecuaplac') {
              match.project_url = localProj.project_url;
            }
            // Override NEXT ERA description to keep it in sync with local file updates
            if (localProj.title.toLowerCase() === 'next era') {
              match.description = localProj.description;
            }
          } else {
            // Append locally added projects that are missing in the database
            merged.push(localProj);
          }
        });

        merged.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        projects = merged;
      }
      if (testimonialsRes.data && testimonialsRes.data.length > 0) {
        testimonials = testimonialsRes.data;
        // Override NEXT ERA testimonial dynamically
        const nextEraTestimonial = testimonials.find(
          (t) => t.company.toLowerCase().trim() === 'next era'
        );
        if (nextEraTestimonial) {
          const localNextEra = fallbackTestimonials.find(
            (t) => t.company.toLowerCase().trim() === 'next era'
          );
          if (localNextEra) {
            nextEraTestimonial.testimonial = localNextEra.testimonial;
          }
        }
      }
      if (settingsRes.data && settingsRes.data.length > 0) {
        const dbSettings: Record<string, string> = {};
        settingsRes.data.forEach((s: any) => {
          dbSettings[s.key] = s.value;
        });
        settings = dbSettings;
      }
    } catch (err) {
      console.error('Error fetching Supabase data, using local fallback:', err);
    }
  }

  // Map settings settings keys into Map
  const settingsMap = new Map<string, string>();
  Object.entries(settings).forEach(([k, v]) => settingsMap.set(k, v));

  // Render Page Title & Description if configured
  const siteTitle = settingsMap.get('site_title');
  if (siteTitle) {
    document.title = getTranslation(siteTitle, lang);
  }
  const siteDesc = settingsMap.get('site_description');
  if (siteDesc) {
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', getTranslation(siteDesc, lang));
    }
  }

  // Update contact information dynamically (WhatsApp and Email)
  const phone = settingsMap.get('contact_phone') || '34673109486';
  const email = settingsMap.get('contact_email') || 'mynextbymusa@gmail.com';
  const whatsappMsg = getTranslation(settingsMap.get('whatsapp_message_landing'), lang);
  const emailSubject = getTranslation(settingsMap.get('email_subject_landing'), lang);
  const emailBody = getTranslation(settingsMap.get('email_body_landing'), lang);

  document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
    link.setAttribute('href', `https://wa.me/${phone}?text=${encodeURIComponent(whatsappMsg)}`);
  });

  document.querySelectorAll('a[href*="mailto:"]').forEach(link => {
    link.setAttribute('href', `mailto:${email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`);
  });

  // Render Projects Grid
  const featuredGrid = document.getElementById('featured-projects');
  const moreGrid = document.getElementById('more-projects');

  if (featuredGrid && moreGrid) {
    featuredGrid.innerHTML = '';
    moreGrid.innerHTML = '';

    let featuredIndex = 0;
    let nonFeaturedIndex = 0;

    projects.forEach((proj) => {
      // Find matching testimonial where company equals project title
      const matchingTestimonial = testimonials.find(
        (t) => t.company.trim().toLowerCase() === proj.title.trim().toLowerCase()
      );

      const hasTestimonial = !!matchingTestimonial;
      const testimonialText = hasTestimonial ? getTranslation(matchingTestimonial.testimonial, lang) : '';
      const clientName = hasTestimonial ? matchingTestimonial.client_name : '';
      const clientRole = hasTestimonial ? getTranslation(matchingTestimonial.role, lang) : '';

      // Build signature string
      let signature = '';
      if (clientName && clientRole) {
        signature = `${clientName}, ${clientRole}`;
      } else if (clientName) {
        signature = clientName;
      } else if (clientRole) {
        signature = clientRole;
      }

      // Assemble card elements
      const article = document.createElement('article');

      // Compute specific layout classes to match asymmetric design
      let cardClass = 'reveal flex flex-col gap-8 group';
      if (!proj.featured) {
        if (nonFeaturedIndex === 1) {
          cardClass += ' md:mt-32';
        } else if (nonFeaturedIndex === 2) {
          cardClass += ' md:-mt-16';
        }
        nonFeaturedIndex++;
      } else {
        if (featuredIndex === 1) {
          article.style.transitionDelay = '200ms';
        }
        featuredIndex++;
      }
      article.className = cardClass;

      const domain = getDomainFromUrl(proj.project_url);

      article.innerHTML = `
        <div class="relative aspect-[16/10] rounded-2xl overflow-hidden glass-panel border-white/5 transition-all duration-500 group-hover:border-electric-cyan/20 group-hover:shadow-[0_0_30px_rgba(0,242,255,0.1)]">
          <!-- Browser UI Mockup -->
          <div class="absolute top-0 left-0 right-0 h-10 bg-void-black/80 backdrop-blur-md flex items-center px-4 z-30 border-b border-white/5 select-none">
            <div class="flex items-center gap-1.5 w-16"> 
              <div class="w-2 h-2 rounded-full bg-[#FF5F56] shadow-sm"></div>
              <div class="w-2 h-2 rounded-full bg-[#FFBD2E] shadow-sm"></div>
              <div class="w-2 h-2 rounded-full bg-[#27C93F] shadow-sm"></div>
            </div>
            <div class="flex-grow flex items-center justify-between pl-2 md:pl-4">
              <!-- Chevrons -->
              <div class="hidden sm:flex items-center gap-2 mr-4 text-slate-400">
                <svg viewBox="0 0 20 20" height="12" width="12" fill="currentColor">
                  <path transform="translate(6.25 3.75)" d="M0,6.25,6.25,0l.875.875L1.75,6.25l5.375,5.375L6.25,12.5Z"></path>
                </svg>
                <svg viewBox="0 0 20 20" height="12" width="12" fill="currentColor">
                  <path transform="translate(6.625 3.75)" d="M7.125,6.25.875,12.5,0,11.625,5.375,6.25,0,.875.875,0Z"></path>
                </svg>
              </div>
              <!-- Search Bar -->
              <div class="flex-grow max-w-[400px] mx-auto relative border border-white/10 rounded-lg px-3 py-1 h-6 flex items-center justify-center text-[10px] text-slate-400 bg-white/5 font-sans select-all cursor-text tracking-wide shadow-inner">
                <svg class="absolute left-2.5 text-slate-500" xmlns="http://www.w3.org/2000/svg" width="7.5" height="7.5" viewBox="0 0 16.89 16.887" fill="currentColor">
                  <path d="M16.006,16.887h0l-4.743-4.718a6.875,6.875,0,1,1,.906-.906l4.719,4.744-.88.88ZM6.887,1.262a5.625,5.625,0,1,0,5.625,5.625A5.631,5.631,0,0,0,6.887,1.262Z" transform="translate(0.003 0)"></path>
                </svg>
                <span>${domain}</span>
              </div>
            </div>
          </div>
          <div class="absolute top-10 left-0 right-0 bottom-0 bg-[#050505] overflow-hidden flex items-center justify-center p-4 sm:p-6 md:p-8">
            <img src="${proj.image_url}" alt="${lang === 'en' ? `Premium web design in Mallorca - Preview of ${proj.title}` : `Diseño web premium en Mallorca - Vista previa de ${proj.title}`}" loading="lazy"
              class="w-full h-full object-contain transition-transform duration-1000 group-hover:scale-[1.03]">
            <div class="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
            <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center z-20 backdrop-blur-sm">
              <a href="${proj.project_url}" target="_blank" rel="noopener noreferrer"
                class="px-8 py-4 bg-white text-black font-headline font-bold text-[10px] tracking-[0.3em] uppercase rounded-full hover:bg-electric-cyan transition-all duration-500 shadow-xl">
                ${lang === 'en' ? 'View Website →' : 'Ver Web →'}
              </a>
            </div>
          </div>
        </div>
        <div class="space-y-4 px-4">
          <h3 class="text-2xl md:text-3xl font-bold text-gradient-cyan font-headline uppercase tracking-tight">${proj.title}</h3>
          ${hasTestimonial ? `
            <div class="relative pl-6 border-l-2 border-electric-cyan/30">
              <p class="text-lg text-white/70 italic font-body leading-relaxed mb-2">${testimonialText}</p>
            </div>
          ` : `
            <div class="relative pl-6 border-l-2 border-electric-cyan/30">
              <p class="text-lg text-white/70 italic font-body leading-relaxed mb-2">${getTranslation(proj.description, lang)}</p>
            </div>
          `}
        </div>
      `;

      if (proj.featured) {
        featuredGrid.appendChild(article);
      } else {
        moreGrid.appendChild(article);
      }
    });
  }

  // Trigger animations now that elements are rendered in DOM
  initRevealAnimations();

  // --- B. Page entrance effects & observers ---
  // Header Entrance
  setTimeout(() => {
    const navBar = document.getElementById('nav-container');
    const left = document.getElementById('nav-left');
    const center = document.getElementById('nav-logo');
    const right = document.getElementById('nav-right');
    const controls = document.getElementById('nav-controls');

    if (navBar) navBar.classList.remove('opacity-0');
    if (left) left.classList.replace('-translate-x-[150%]', 'translate-x-0');
    if (center) center.classList.replace('-translate-y-[150%]', 'translate-y-0');
    if (right) right.classList.replace('translate-x-[150%]', 'translate-x-0');
    if (controls) controls.classList.replace('translate-x-[150%]', 'translate-x-0');
  }, 800);

  // Process Reveal (Bento Horizon cards)
  const processTrigger = document.getElementById('process-trigger');
  const pItems = [
    document.getElementById('card-1'),
    document.getElementById('card-2'),
    document.getElementById('card-3')
  ];

  const processObserver = new IntersectionObserver((entries) => {
    const entry = entries[0];
    if (entry.isIntersecting) {
      pItems.forEach((item) => {
        if (!item) return;
        item.classList.add('in-view');
      });
    } else {
      pItems.forEach((item) => {
        if (!item) return;
        const delay = item.style.transitionDelay;
        item.style.transitionDelay = '0s';
        item.style.transition = 'none';
        item.classList.remove('in-view');
        setTimeout(() => {
          item.style.transition = '';
          item.style.transitionDelay = delay;
        }, 50);
      });
    }
  }, { threshold: 0.25 });

  if (processTrigger) processObserver.observe(processTrigger);

  // Scroll sequential glow loops
  let glowTimeouts: number[] = [];
  let glowLoopActive = false;

  function clearGlow() {
    glowTimeouts.forEach(t => clearTimeout(t));
    glowTimeouts = [];
    pItems.forEach(c => c && c.classList.remove('card-lit'));
    glowLoopActive = false;
  }

  function runGlowSequence() {
    if (glowLoopActive) return;
    glowLoopActive = true;
    pItems.forEach(c => c && c.classList.remove('card-lit'));

    pItems.forEach((card, i) => {
      const t = setTimeout(() => {
        if (!card) return;
        if (i > 0 && pItems[i - 1]) pItems[i - 1]!.classList.remove('card-lit');
        card.classList.add('card-lit');

        if (i === pItems.length - 1) {
          const endT = setTimeout(() => {
            card.classList.remove('card-lit');
            glowLoopActive = false;
          }, 900);
          glowTimeouts.push(endT);
        }
      }, i * 900);
      glowTimeouts.push(t);
    });
  }

  const glowObserver = new IntersectionObserver((entries) => {
    const entry = entries[0];
    if (entry.isIntersecting && !glowLoopActive) {
      runGlowSequence();
    } else if (!entry.isIntersecting) {
      clearGlow();
    }
  }, { threshold: 0.3 });

  if (processTrigger) glowObserver.observe(processTrigger);

  // --- C. Toggle more projects ---
  const toggleProjectsBtn = document.getElementById('toggle-more-projects');
  const moreProjectsContainer = document.getElementById('more-projects');

  if (toggleProjectsBtn && moreProjectsContainer) {
    toggleProjectsBtn.addEventListener('click', () => {
      const isExpanded = moreProjectsContainer.classList.contains('expanded');
      const textSpan = document.getElementById('toggle-text');
      const iconSpan = document.getElementById('toggle-icon');

      if (isExpanded) {
        moreProjectsContainer.classList.remove('expanded');
        const textAttr = toggleProjectsBtn.getAttribute('data-text-more');
        if (textSpan && textAttr) textSpan.innerText = textAttr;
        if (iconSpan) iconSpan.classList.remove('rotate-180');

        const portfolioHeader = document.getElementById('portfolio');
        if (portfolioHeader) {
          portfolioHeader.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        moreProjectsContainer.classList.add('expanded');
        const textAttr = toggleProjectsBtn.getAttribute('data-text-less');
        if (textSpan && textAttr) textSpan.innerText = textAttr;
        if (iconSpan) iconSpan.classList.add('rotate-180');

        setTimeout(() => {
          const newReveals = moreProjectsContainer.querySelectorAll('.reveal');
          newReveals.forEach(r => r.classList.add('active'));
        }, 200);
      }
    });
  }

  // --- D. Legal Modals Logic ---
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

  // --- E. Cookie Banner Logic ---
  const cookieBanner = document.getElementById('cookie-banner');
  const acceptAllBtn = document.getElementById('cookie-accept-all');
  const rejectBtn = document.getElementById('cookie-reject');
  const configureBtn = document.getElementById('cookie-configure');

  if (cookieBanner && !localStorage.getItem('cookie-preference')) {
    setTimeout(() => {
      cookieBanner.classList.add('active');
    }, 2000);
  }

  function saveCookiePreference(pref: string) {
    localStorage.setItem('cookie-preference', pref);
    if (cookieBanner) {
      cookieBanner.classList.add('slide-down');
      setTimeout(() => {
        cookieBanner.classList.remove('active', 'slide-down');
      }, 500);
    }
  }

  if (acceptAllBtn) {
    acceptAllBtn.addEventListener('click', () => saveCookiePreference('accepted-all'));
  }
  if (rejectBtn) {
    rejectBtn.addEventListener('click', () => saveCookiePreference('rejected-non-essential'));
  }
  if (configureBtn) {
    configureBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const cookiesModal = document.getElementById('cookies');
      if (cookiesModal) {
        cookiesModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  }

  // --- F. Instagram triggers ---
  const instagramBtns = document.querySelectorAll('.instagram-trigger');
  instagramBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showCustomToast();
    });
  });

  function showCustomToast() {
    let toast = document.getElementById('custom-toast') as any;
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'custom-toast';
      toast.className = 'fixed bottom-4 left-4 right-4 md:left-auto md:bottom-8 md:right-8 z-50 px-6 py-4 rounded-2xl bg-black/85 border border-[#8A733E]/40 backdrop-blur-xl shadow-[0_10px_50px_rgba(0,0,0,0.5)] text-white flex items-center gap-3 transition-all duration-500 translate-y-20 opacity-0 pointer-events-none';
      document.body.appendChild(toast);
    }

    const title = 'Instagram MYNEXT';
    const message = lang === 'en'
      ? 'We are working on this page, we will launch it very soon.'
      : 'Estamos trabajando en la página, la lanzaremos muy pronto.';

    toast.innerHTML = `
      <span class="material-symbols-outlined text-gradient-gold text-2xl">construction</span>
      <div class="flex flex-col text-left">
        <span class="font-headline font-bold text-xs tracking-wider uppercase text-[#e0c387]">${title}</span>
        <span class="font-body text-white/70 text-xs mt-0.5">${message}</span>
      </div>
    `;

    if (toast.timeoutId) {
      clearTimeout(toast.timeoutId);
    }

    setTimeout(() => {
      toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
      toast.classList.add('translate-y-0', 'opacity-100');
    }, 50);

    toast.timeoutId = setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
    }, 4000);
  }

  // --- G. AJAX Email Form Submission ---
  const contactForm = document.getElementById('email-contact-form') as HTMLFormElement | null;
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = contactForm.querySelector('input[name="email"]') as HTMLInputElement | null;
      const messageInput = contactForm.querySelector('textarea[name="message"]') as HTMLTextAreaElement | null;
      const submitBtn = contactForm.querySelector('.form-submit-btn') as HTMLButtonElement | null;
      if (!emailInput || !submitBtn || !emailInput.value) return;

      const btnText = submitBtn.querySelector('.btn-text');
      const originalText = btnText ? btnText.textContent : submitBtn.textContent;

      submitBtn.disabled = true;
      emailInput.disabled = true;
      if (messageInput) messageInput.disabled = true;

      const isEs = lang === 'es';
      const statusText = isEs ? 'Enviando...' : 'Sending...';
      if (btnText) {
        btnText.textContent = statusText;
      } else {
        submitBtn.textContent = statusText;
      }

      const subject = isEs ? '¡Te damos la bienvenida a MYNEXT!' : 'Welcome to MYNEXT!';
      const messageDetails = messageInput ? messageInput.value : '';
      const messageVal = isEs
        ? `Se ha registrado una nueva solicitud de contacto.\n\nCorreo del cliente: ${emailInput.value}\nDetalles / Mensaje:\n${messageDetails}`
        : `A new contact request has been registered.\n\nClient Email: ${emailInput.value}\nDetails / Message:\n${messageDetails}`;

      const autorespondVal = isEs
        ? `¡Hola! Gracias por contactar con MYNEXT y unirte a nuestra comunidad. Aquí tienes tu código de descuento del 10% para tu primer proyecto: MYNEXT10. Nos pondremos en contacto contigo lo antes posible para ver los detalles de tu consulta. ¡Disfrútalo!`
        : `Hello! Thank you for contacting MYNEXT and joining our community. Here is your 10% discount code for your first project: MYNEXT10. We will get in touch with you as soon as possible to discuss the details of your inquiry. Enjoy!`;

      fetch(contactForm.action, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: emailInput.value,
          _subject: subject,
          _autorespond: autorespondVal,
          message: messageVal
        })
      })
        .then(response => {
          if (response.ok) {
            const successText = isEs ? '¡Enviado! ✓' : 'Sent ✓';
            if (btnText) {
              btnText.textContent = successText;
            } else {
              submitBtn.textContent = successText;
            }
            submitBtn.style.backgroundColor = '#00F2FF';
            submitBtn.style.boxShadow = '0 0 20px #00F2FF';

            emailInput.value = '';
            if (messageInput) messageInput.value = '';

            const formElement = contactForm;
            formElement.style.transition = 'all 0.5s ease';
            formElement.style.opacity = '0';
            formElement.style.transform = 'scale(0.9)';
            setTimeout(() => {
              formElement.style.display = 'none';
              const successMsg = document.createElement('div');
              successMsg.className = 'text-electric-cyan font-headline text-sm md:text-base tracking-wider font-semibold animate-pulse mt-4 text-center px-4';
              successMsg.style.textShadow = '0 0 10px rgba(0, 242, 255, 0.4)';
              successMsg.textContent = isEs
                ? 'Gracias por registrarte. Revisa tu Gmail, ¡tienes una grasa esperándote! 😏'
                : 'Thanks for registering. Check your Gmail, something fire is waiting for you! 😏';

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
          btnText.textContent = 'Error';
        } else if (submitBtn) {
          submitBtn.textContent = 'Error';
        }
        setTimeout(() => {
          if (btnText) {
            btnText.textContent = originalText;
          } else if (submitBtn) {
            submitBtn.textContent = originalText;
          }
          if (submitBtn) submitBtn.disabled = false;
          if (emailInput) emailInput.disabled = false;
          if (messageInput) messageInput.disabled = false;
        }, 2000);
      }
    });
  }

  // --- H. Plans Button overlay transitions ---
  const transitionOverlay = document.getElementById('page-transition-overlay');
  if (transitionOverlay) {
    // Show overlay by default (and it starts with active class in HTML)
    transitionOverlay.classList.add('active');
    transitionOverlay.setAttribute('aria-hidden', 'false');

    const hideOverlay = () => {
      transitionOverlay.classList.remove('active');
      transitionOverlay.setAttribute('aria-hidden', 'true');
    };

    // Hide exactly after 3.5 seconds (3500ms) on page load
    setTimeout(hideOverlay, 3500);

    window.addEventListener('pageshow', (e) => {
      if (plansTransitionOverlay) {
        plansTransitionOverlay.classList.remove('active');
        plansTransitionOverlay.setAttribute('aria-hidden', 'true');
      }

      if (e.persisted) {
        // If restored from back-forward cache, show it and hide after 3.5s
        transitionOverlay.classList.add('active');
        transitionOverlay.setAttribute('aria-hidden', 'false');
        setTimeout(hideOverlay, 3500);
      }
    });

    const plansBtns = document.querySelectorAll('a.animated-button[href*="planes"], a.cap-btn[href*="planes"]');
    const plansTransitionOverlay = document.getElementById('plans-transition-overlay');

    plansBtns.forEach(btn => {
      btn.addEventListener('click', function (this: HTMLElement, e) {
        e.preventDefault();
        const destination = this.getAttribute('href');
        if (!destination) return;

        if (plansTransitionOverlay) {
          plansTransitionOverlay.classList.add('active');
          plansTransitionOverlay.setAttribute('aria-hidden', 'false');
        } else {
          transitionOverlay.classList.add('active');
          transitionOverlay.setAttribute('aria-hidden', 'false');
        }

        // Delay navigation for about 4 seconds to let the Love, Death & Robots animation play out
        setTimeout(() => {
          window.location.href = destination;
        }, 4000);
      });
    });
  }

  // --- I. Mobile Menu Toggle ---
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileDropdown = document.getElementById('mobile-dropdown');
  const mobileNavShell = document.getElementById('mobile-nav-shell');
  const mobileContactTrigger = document.getElementById('mobile-contact-trigger');
  const mobileContactOptions = document.getElementById('mobile-contact-options');

  function openMobileMenu() {
    if (!mobileDropdown || !mobileMenuBtn) return;
    mobileDropdown.classList.add('is-open');
    mobileNavShell?.classList.add('menu-open');
    mobileMenuBtn.classList.add('is-active');
    mobileMenuBtn.setAttribute('aria-expanded', 'true');
    mobileDropdown.setAttribute('aria-hidden', 'false');
    const currentScrollY = window.scrollY;
    document.body.style.top = `-${currentScrollY}px`;
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.classList.add('mobile-menu-open');
  }

  function closeMobileMenu() {
    if (!mobileDropdown || !mobileMenuBtn) return;
    mobileDropdown.classList.remove('is-open');
    mobileNavShell?.classList.remove('menu-open');
    mobileMenuBtn.classList.remove('is-active');
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    mobileDropdown.setAttribute('aria-hidden', 'true');
    
    const scrollY = document.body.style.top;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.classList.remove('mobile-menu-open');
    window.scrollTo(0, parseInt(scrollY || '0') * -1);

    // Reset contact trigger and options when mobile menu closes
    if (mobileContactOptions) mobileContactOptions.classList.remove('is-active');
    if (mobileContactTrigger) mobileContactTrigger.classList.remove('is-active');
  }

  if (mobileMenuBtn && mobileDropdown) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (mobileDropdown.classList.contains('is-open')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    const mobileMenuClose = document.getElementById('mobile-menu-close');
    if (mobileMenuClose) {
      mobileMenuClose.addEventListener('click', (e) => {
        e.stopPropagation();
        closeMobileMenu();
      });
    }

    mobileDropdown.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });

    if (mobileContactTrigger && mobileContactOptions) {
      mobileContactTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isActive = mobileContactOptions.classList.contains('is-active');
        if (isActive) {
          mobileContactOptions.classList.remove('is-active');
          mobileContactTrigger.classList.remove('is-active');
        } else {
          mobileContactOptions.classList.add('is-active');
          mobileContactTrigger.classList.add('is-active');
        }
      });
    }

    document.addEventListener('click', (e) => {
      if (!mobileDropdown.classList.contains('is-open')) return;
      const target = e.target as HTMLElement;
      if (!mobileDropdown.contains(target) && !mobileMenuBtn.contains(target) && !mobileNavShell?.contains(target)) {
        closeMobileMenu();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobileMenu();
    });
  }

  // --- J. Shopping Cart Modal ---
  const cartBtn = document.getElementById('cart-btn');
  const cartModal = document.getElementById('cart-modal');
  const cartModalCard = document.getElementById('cart-modal-card');
  const cartCloseBtn = document.getElementById('cart-close-btn');
  const cartConfirmBtn = document.getElementById('cart-confirm-btn');

  if (cartBtn && cartModal && cartModalCard) {
    function openCartModal() {
      cartModal!.classList.remove('pointer-events-none', 'opacity-0');
      cartModal!.classList.add('opacity-100');
      cartModalCard!.classList.remove('scale-95', 'opacity-0');
      cartModalCard!.classList.add('scale-100', 'opacity-100');
      document.body.style.overflow = 'hidden';
    }

    function closeCartModal() {
      cartModal!.classList.add('pointer-events-none', 'opacity-0');
      cartModal!.classList.remove('opacity-100');
      cartModalCard!.classList.add('scale-95', 'opacity-0');
      cartModalCard!.classList.remove('scale-100', 'opacity-100');
      document.body.style.overflow = '';
    }

    cartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openCartModal();
    });

    if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCartModal);
    if (cartConfirmBtn) cartConfirmBtn.addEventListener('click', closeCartModal);

    cartModal.addEventListener('click', (e) => {
      if (e.target === cartModal) {
        closeCartModal();
      }
    });
  }

  // Handle auto-scroll when coming back from plans
  const fromPlanes = sessionStorage.getItem('from-planes');
  if (fromPlanes) {
    sessionStorage.removeItem('from-planes');
    const planesSection = document.getElementById('planes-banner');
    if (planesSection) {
      setTimeout(() => {
        planesSection.scrollIntoView({ behavior: 'instant', block: 'start' });
      }, 100);
    }
  } else if (window.location.hash) {
    const targetElement = document.getElementById(window.location.hash.substring(1));
    if (targetElement) {
      setTimeout(() => {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }

  // Initialize FAQ Accordion
  initFaqAccordion();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMain);
} else {
  initMain();
}

// --- Scroll position navigation compact control ---
let lastScrollY = window.scrollY;
const navBar = document.getElementById('nav-container');
const navL = document.getElementById('nav-left');
const navC = document.getElementById('nav-logo');
const navR = document.getElementById('nav-right');

function setNavAtTop() {
  if (!navBar || !navL || !navC || !navR) return;
  navBar.classList.remove('opacity-0', 'nav-compact');
  navBar.classList.add('nav-at-top');
  navL.classList.replace('-translate-x-[150%]', 'translate-x-0');
  navC.classList.replace('-translate-y-[150%]', 'translate-y-0');
  navR.classList.replace('translate-x-[150%]', 'translate-x-0');
  navL.style.opacity = '1';
  navR.style.opacity = '1';
}

function setNavCompact() {
  if (!navBar || !navL || !navC || !navR) return;
  navBar.classList.remove('opacity-0', 'nav-at-top');
  navBar.classList.add('nav-compact');
  navL.classList.replace('-translate-x-[150%]', 'translate-x-0');
  navC.classList.replace('-translate-y-[150%]', 'translate-y-0');
  navR.classList.replace('translate-x-[150%]', 'translate-x-0');
}

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;
  if (currentScrollY < 80) {
    setNavAtTop();
  } else {
    setNavCompact();
  }
  lastScrollY = currentScrollY;
}, { passive: true });

// --- Neon Frame active on top only ---
const neonFrame = document.getElementById('neon-frame');
if (neonFrame) {
  setTimeout(() => {
    if (window.scrollY < 50) {
      neonFrame.classList.add('neon-frame-active');
    }
  }, 1000);

  window.addEventListener('scroll', () => {
    const isAtTop = window.scrollY < 50;
    if (isAtTop) {
      neonFrame.classList.add('neon-frame-active');
    } else {
      neonFrame.classList.remove('neon-frame-active');
    }
  }, { passive: true });
}

// --- K. Liquid Vanilla JS Cursor ---
const liquidCursor = document.getElementById('liquid-cursor');
const cursorDot = document.getElementById('cursor-dot');

if (liquidCursor && cursorDot) {
  const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const mouse = { x: pos.x, y: pos.y };
  const speed = 0.15;

  window.addEventListener("mousemove", (e: MouseEvent) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    cursorDot.style.transform = `translate3d(calc(${mouse.x}px - 50%), calc(${mouse.y}px - 50%), 0)`;
  });

  function renderCursor() {
    pos.x += (mouse.x - pos.x) * speed;
    pos.y += (mouse.y - pos.y) * speed;
    liquidCursor!.style.transform = `translate3d(calc(${pos.x}px - 50%), calc(${pos.y}px - 50%), 0)`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Hover effects on interactable elements
  const interactables = document.querySelectorAll('a, button, input, textarea, [role="button"], [data-modal], .group, .interactive-hover');
  interactables.forEach(el => {
    el.addEventListener('mouseenter', () => liquidCursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => liquidCursor.classList.remove('hover'));
  });
}

// --- L. Vanilla JS Parallax Premium Animations ---
window.addEventListener('load', () => {
  // Parallax using scroll event
  const panels = document.querySelectorAll('article .glass-panel');
  if (panels.length > 0) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;

      panels.forEach((panel: any) => {
        const rect = panel.getBoundingClientRect();
        // check if in viewport
        if (rect.top < windowHeight && rect.bottom > 0) {
          const progress = 1 - (rect.bottom / (windowHeight + rect.height)); // 0 to 1
          const img = panel.querySelector('img');
          if (img) {
            // translate Y by up to 15%
            const yOffset = (progress * 15) - 7.5;
            img.style.transform = `translateY(${yOffset}%) scale(1.05)`;
          }
        }
      });
    }, { passive: true });
  }

  // Smooth reveal for text elements using IntersectionObserver
  const headings = document.querySelectorAll('h1, h2, h3, p.lead');
  if (headings.length > 0) {
    const headingObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          el.style.transition = 'opacity 1s cubic-bezier(0.2, 0.8, 0.2, 1), transform 1s cubic-bezier(0.2, 0.8, 0.2, 1)';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          headingObserver.unobserve(el);
        }
      });
    }, { threshold: 0.1 });

    headings.forEach((heading: any) => {
      heading.style.opacity = '0';
      heading.style.transform = 'translateY(30px)';
      headingObserver.observe(heading);
    });
  }
});
