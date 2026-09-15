import './style.css';
import { supabase } from './lib/supabase';
import {
  fallbackProjects,
  fallbackTestimonials,
  fallbackSettings
} from './lib/fallbackData';
import { initAnalyticsListeners } from './lib/analytics';
import { getTranslation, applyDynamicSettings, sanitizeHtml } from './lib/domUtils';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Inicializar seguimiento de conversiones y métricas
initAnalyticsListeners();

const lang = (document.documentElement.lang === 'en' || window.location.pathname.includes('-en')) ? 'en' : 'es';

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

// Global reveal animations trigger — GSAP-powered blur-reveal + stagger
function initRevealAnimations() {
  // Classic reveals (keep class toggle for CSS-only fallback)
  const reveals = document.querySelectorAll('.reveal');
  reveals.forEach(reveal => {
    gsap.fromTo(reveal, 
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0,
        duration: 0.8,
        ease: 'power3.out',
        force3D: true,
        scrollTrigger: {
          trigger: reveal,
          start: 'top 92%',
          once: true,
          onEnter: () => (reveal as HTMLElement).classList.add('active'),
        },
      }
    );
  });

  // Stagger groups — any parent with [data-stagger] will animate children in sequence
  const staggerGroups = document.querySelectorAll('[data-stagger]');
  staggerGroups.forEach(group => {
    const items = group.querySelectorAll('.stagger-item');
    if (items.length === 0) return;
    gsap.fromTo(items,
      { opacity: 0, y: 24 },
      {
        opacity: 1, y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
        force3D: true,
        scrollTrigger: {
          trigger: group,
          start: 'top 92%',
          once: true,
        },
      }
    );
  });

  // Blur-reveal for section headings (optimized: no actual blur to save GPU)
  const blurHeadings = document.querySelectorAll('.blur-reveal');
  blurHeadings.forEach(heading => {
    gsap.fromTo(heading,
      { opacity: 0, y: 16 },
      {
        opacity: 1, y: 0,
        duration: 0.8,
        ease: 'power3.out',
        force3D: true,
        scrollTrigger: {
          trigger: heading,
          start: 'top 92%',
          once: true,
        },
      }
    );
  });

  // Dynamic Spotlight Mouse Tracker (uipro-max & gpt-taste)
  initCardSpotlight();
}

// Dynamic Interactive Spotlight Mouse Tracker (uipro-max & gpt-taste)
function initCardSpotlight() {
  const cards = document.querySelectorAll<HTMLElement>(
    '.spotlight-card, .process-card, .service-card, .review-card, [data-spotlight], .group\\/bento, .card-lit, #reviews [class*="rounded-[2.5rem]"], article'
  );

  cards.forEach(card => {
    if ((card as any).__spotlightInit) return;
    (card as any).__spotlightInit = true;

    card.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    }, { passive: true });

    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--mouse-x', `-999px`);
      card.style.setProperty('--mouse-y', `-999px`);
    }, { passive: true });
  });
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

// --- Render Dynamic Google Reviews (21st.dev Inspired Architecture) ---
function renderDynamicGoogleReviews(reviewsList: any[]) {
  if (!reviewsList || reviewsList.length === 0) return;
  const marqueeTracks = document.querySelectorAll('.reviews-slider-container .animate-marquee');
  if (!marqueeTracks || marqueeTracks.length === 0) return;

  const buildCardHtml = (r: any) => {
    const name = r.name || r.client_name || 'Cliente Verificado';
    const rawContent = (lang === 'en' ? (r.content_en || r.content_es || r.content || r.testimonial) : (r.content_es || r.content || r.testimonial)) || '';
    const hasText = Boolean(rawContent && rawContent.trim().length > 0);
    const content = hasText ? getTranslation(rawContent, lang as 'es' | 'en') : '';
    const rawCompany = r.company || r.position || r.relative_time || (lang === 'en' ? 'Verified Client' : 'Cliente Verificado');
    const company = getTranslation(rawCompany, lang as 'es' | 'en');
    const ratingStars = '★'.repeat(r.rating || 5);
    const photo = r.author_photo || r.image_url;

    const avatarHtml = (photo && photo.startsWith('http'))
      ? `<img src="${photo}" alt="${name}" class="w-full h-full object-cover rounded-full" />`
      : `<span class="text-electric-cyan font-bold font-headline text-sm">${name ? name.charAt(0).toUpperCase() : 'G'}</span>`;

    const bodyHtml = hasText
      ? `<p class="relative z-10 text-[14px] md:text-[15px] text-white/85 font-light leading-relaxed italic my-auto line-clamp-4">
            "${content}"
         </p>`
      : `<div class="relative z-10 my-auto flex flex-col items-center justify-center py-6 text-center">
            <div class="flex text-amber-400 text-2xl drop-shadow-[0_0_12px_rgba(251,191,36,0.7)] tracking-widest">${ratingStars}</div>
         </div>`;

    return `
      <div class="spotlight-card review-card relative w-[340px] sm:w-[380px] md:w-[420px] shrink-0 p-7 md:p-8 flex flex-col justify-between rounded-[2rem] bg-[#0c0c16]/75 border border-white/10 backdrop-blur-2xl overflow-hidden group hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(0,242,255,0.12)] hover:border-electric-cyan/40 transition-all duration-500 min-h-[290px]">
          <div class="absolute inset-0 bg-gradient-to-br from-electric-cyan/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          
          <!-- Watermark Quote Icon -->
          <svg class="absolute top-5 right-5 w-10 h-10 text-white/[0.03] group-hover:text-electric-cyan/10 transition-colors duration-500 pointer-events-none" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
              <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
          </svg>

          <!-- Top Meta Row -->
          <div class="relative z-10 flex items-center justify-between gap-2 mb-4">
              <div class="flex items-center gap-2">
                  <div class="flex text-amber-400 text-sm tracking-wider drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">${ratingStars}</div>
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] text-emerald-400 font-headline uppercase tracking-widest font-semibold">
                      <svg class="w-3 h-3 fill-emerald-400 shrink-0" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                      ${lang === 'en' ? 'Verified' : 'Verificada'}
                  </span>
              </div>
              <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-sm shadow-sm shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" class="shrink-0">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span class="text-white/60 text-[9px] uppercase tracking-widest font-semibold font-headline">Google</span>
              </div>
          </div>

          <!-- Review Body (or Star-only clean display) -->
          ${bodyHtml}

          <!-- Author Bottom Row -->
          <div class="relative z-10 flex items-center gap-3.5 border-t border-white/5 pt-4 mt-4">
              <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-electric-cyan/30 flex items-center justify-center overflow-hidden shrink-0 shadow-[0_0_12px_rgba(0,242,255,0.15)]">
                  ${avatarHtml}
              </div>
              <div class="min-w-0 flex-1">
                  <h4 class="text-white font-headline font-bold text-[14px] tracking-wide truncate">${name}</h4>
                  <p class="text-[11px] text-slate-400 font-headline uppercase tracking-wider truncate">${company}</p>
              </div>
          </div>
      </div>
    `;
  };

  const cardsHtml = reviewsList.map(buildCardHtml).join('');
  const fullHtml = cardsHtml + cardsHtml;

  marqueeTracks.forEach(track => {
    track.innerHTML = fullHtml;
  });

  // Attach spotlight listeners to freshly rendered review cards
  initCardSpotlight();
}

// --- Draggable & Touch Smooth Marquee ---
function initDraggableMarquee() {
  const containers = document.querySelectorAll('.reviews-slider-container');
  containers.forEach((container: any) => {
    if (container.dataset.marqueeInit === 'true') return;
    container.dataset.marqueeInit = 'true';

    const slider = container.querySelector('.animate-marquee');
    if (!slider) return;

    let isDragging = false;
    let isInteracting = false;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastTime = 0;
    let velocityX = 0;
    let totalDrag = 0;
    let directionLocked: 'horizontal' | 'vertical' | null = null;
    let momentumId = 0;
    let animationId = 0;
    let resumeTimer: any = null;

    const baseAutoSpeed = 0.5; // Smooth ambient scroll

    let isVisible = true;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
      });
    }, { threshold: 0.05 });
    observer.observe(container);

    // Infinite wrap helper without any jump
    const wrapScroll = () => {
      const halfWidth = slider.scrollWidth / 2;
      if (halfWidth <= 0) return;
      if (container.scrollLeft >= halfWidth) {
        container.scrollLeft -= halfWidth;
      } else if (container.scrollLeft < 0) {
        container.scrollLeft += halfWidth;
      }
    };

    // Auto-scroll loop
    const autoScroll = () => {
      if (!isInteracting && !isDragging && isVisible && document.visibilityState === 'visible') {
        container.scrollLeft += baseAutoSpeed;
        wrapScroll();
      }
      animationId = requestAnimationFrame(autoScroll);
    };

    animationId = requestAnimationFrame(autoScroll);

    // Smooth momentum glide after swipe release
    const startMomentum = (initV: number) => {
      cancelAnimationFrame(momentumId);
      let v = initV;
      const friction = 0.94;

      const stepMomentum = () => {
        if (Math.abs(v) > 0.05 && !isDragging) {
          container.scrollLeft -= v;
          wrapScroll();
          v *= friction;
          momentumId = requestAnimationFrame(stepMomentum);
        } else {
          scheduleAutoplayResume(800);
        }
      };

      momentumId = requestAnimationFrame(stepMomentum);
    };

    const scheduleAutoplayResume = (delay = 1200) => {
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        if (!isDragging) {
          isInteracting = false;
        }
      }, delay);
    };

    // Gesture Handlers
    const handleStart = (clientX: number, clientY: number) => {
      cancelAnimationFrame(momentumId);
      clearTimeout(resumeTimer);
      isDragging = true;
      isInteracting = true;
      startX = clientX;
      startY = clientY;
      lastX = clientX;
      lastTime = performance.now();
      velocityX = 0;
      totalDrag = 0;
      directionLocked = null;
      container.classList.add('active-dragging');
      container.style.scrollBehavior = 'auto';
    };

    const handleMove = (clientX: number, clientY: number, e?: Event) => {
      if (!isDragging) return;

      const now = performance.now();
      const dt = Math.max(1, now - lastTime);
      const deltaX = clientX - lastX;
      const totalDx = Math.abs(clientX - startX);
      const totalDy = Math.abs(clientY - startY);

      // Lock direction on touch gesture
      if (!directionLocked && (totalDx > 6 || totalDy > 6)) {
        if (totalDy > totalDx * 1.1) {
          directionLocked = 'vertical';
          isDragging = false;
          container.classList.remove('active-dragging');
          scheduleAutoplayResume(400);
          return;
        } else {
          directionLocked = 'horizontal';
        }
      }

      if (directionLocked === 'vertical') return;

      if (directionLocked === 'horizontal' && e && e.cancelable) {
        e.preventDefault();
      }

      totalDrag += Math.abs(deltaX);
      velocityX = (deltaX / dt) * 14;

      container.scrollLeft -= deltaX;
      wrapScroll();

      lastX = clientX;
      lastTime = now;
    };

    const handleEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      container.classList.remove('active-dragging');

      if (Math.abs(velocityX) > 0.4) {
        startMomentum(velocityX);
      } else {
        scheduleAutoplayResume(1000);
      }
    };

    const handleCancel = () => {
      isDragging = false;
      container.classList.remove('active-dragging');
      scheduleAutoplayResume(400);
    };

    // Mobile Touch Events
    container.addEventListener('touchstart', (e: TouchEvent) => {
      if (e.touches.length === 1) {
        handleStart(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    container.addEventListener('touchmove', (e: TouchEvent) => {
      if (e.touches.length === 1) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY, e);
      }
    }, { passive: false });

    container.addEventListener('touchend', handleEnd, { passive: true });
    container.addEventListener('touchcancel', handleCancel, { passive: true });

    // Desktop Mouse Drag Events
    container.addEventListener('mousedown', (e: MouseEvent) => {
      if (e.button !== 0) return;
      handleStart(e.clientX, e.clientY);
    });

    window.addEventListener('mousemove', (e: MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX, e.clientY, e);
      }
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        handleEnd();
      }
    });

    // Hover pauses auto-scroll on desktop
    container.addEventListener('mouseenter', () => {
      if (!isDragging) isInteracting = true;
    });

    container.addEventListener('mouseleave', () => {
      if (!isDragging) scheduleAutoplayResume(400);
    });

    // Prevent clicking link during drag gesture
    container.addEventListener('click', (e: MouseEvent) => {
      if (totalDrag > 8) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);
  });
}

// Initialize all DOM contents safely
async function initMain() {
  // --- A. Dynamic Data Fetch & Render with Session Caching ---
  const CACHE_KEY = 'mynext_cms_cache_v3';
  const CACHE_TTL = 10 * 60 * 1000; // 10 minutes TTL

  let cachedData: any = null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.timestamp < CACHE_TTL) {
        cachedData = parsed.data;
      }
    }
  } catch (e) {
    // sessionStorage disabled or unavailable
  }

  let projects = cachedData?.projects || fallbackProjects;
  let testimonials = cachedData?.testimonials || fallbackTestimonials;
  let settings: Record<string, string> = cachedData?.settings || fallbackSettings;

  // Render initial reviews immediately by default (cached or fallback)
  const initialGoogleReviews = testimonials.filter((t: any) => t.source === 'google' || t.google_review_id);
  renderDynamicGoogleReviews(initialGoogleReviews);

  // Attempt to fetch fresh data from Supabase
  if (supabase) {
    try {
      const [projectsRes, testimonialsRes, settingsRes, contactRes, heroRes, aboutRes, faqRes] = await Promise.all([
        supabase.from('mynext_projects').select('*').eq('active', true).order('sort_order', { ascending: true }),
        supabase.from('mynext_testimonials').select('*').eq('active', true),
        supabase.from('mynext_settings').select('*'),
        supabase.from('mynext_contact').select('*').maybeSingle(),
        supabase.from('mynext_hero').select('*').maybeSingle(),
        supabase.from('mynext_about').select('*').maybeSingle(),
        supabase.from('mynext_faq').select('*').eq('active', true).order('sort_order', { ascending: true })
      ]);

      if (projectsRes.data && projectsRes.data.length > 0) {
        const dbProjects = projectsRes.data;
        const merged: any[] = [...dbProjects];

        fallbackProjects.forEach(localProj => {
          const match = merged.find(p => (p.slug && localProj.slug && p.slug === localProj.slug) || p.title.toLowerCase().trim() === localProj.title.toLowerCase().trim() || p.id === localProj.id);
          if (!match) {
            // Append locally added projects that are missing in the database
            merged.push(localProj);
          }
        });

        merged.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        projects = merged;
      }

      if (testimonialsRes.data && testimonialsRes.data.length > 0) {
        testimonials = testimonialsRes.data;
        // Render only verified Google Maps reviews
        const googleReviews = testimonials.filter((t: any) => t.source === 'google' || t.google_review_id);
        if (googleReviews.length > 0) {
          renderDynamicGoogleReviews(googleReviews);
        }
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

      // Merge about table if present
      if (aboutRes && (aboutRes as any).data) {
        const a = (aboutRes as any).data;
        if (a.bio_p1_es || a.bio_p1_en) settings['about_bio1'] = JSON.stringify({ es: a.bio_p1_es, en: a.bio_p1_en });
        if (a.bio_p2_es || a.bio_p2_en) settings['about_bio2'] = JSON.stringify({ es: a.bio_p2_es, en: a.bio_p2_en });
        if (a.stat_experience) settings['stat_experience'] = a.stat_experience;
        if (a.stat_projects) settings['stat_projects'] = a.stat_projects;
      }

      // Merge faq table if present
      if (faqRes && (faqRes as any).data && (faqRes as any).data.length > 0) {
        (faqRes as any).data.forEach((f: any, idx: number) => {
          const num = f.sort_order || (idx + 1);
          settings[`faq_q${num}`] = JSON.stringify({ es: f.question_es, en: f.question_en });
          settings[`faq_a${num}`] = JSON.stringify({ es: f.answer_es, en: f.answer_en });
        });
      }

      // Apply any dynamic HTML content automatically
      applyDynamicSettings(settings, lang as 'es' | 'en');

      // Cache successful response in sessionStorage for instant subsequent loads
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
          timestamp: Date.now(),
          data: { projects, testimonials, settings }
        }));
      } catch (e) {
        // quota exceeded or private browsing mode
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

  // --- Render Portfolio Card Fan Carousel (21st.dev #14896) ---
  const portfolioCarousel = document.getElementById('portfolio-carousel');
  const portfolioPagination = document.getElementById('portfolio-pagination');
  const btnPrev = document.getElementById('carousel-prev');
  const btnNext = document.getElementById('carousel-next');

  if (portfolioCarousel && projects && projects.length > 0) {
    portfolioCarousel.innerHTML = '';

    const totalProjects = projects.length;

    // Render articles inside .fan-layout
    projects.forEach((proj: any, idx: number) => {
      const article = document.createElement('article');
      article.className = 'fan-card group spotlight-card relative overflow-hidden glass-panel';
      
      const projectSlug = proj.slug || proj.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const projectUrl = lang === 'en' ? `project-en.html?slug=${projectSlug}` : `project.html?slug=${projectSlug}`;
      const btnText = lang === 'en' ? 'More Info →' : 'Más Info →';

      let projImageUrl = proj.image_url || '';
      if (projImageUrl.includes('/portfolio/') && projImageUrl.endsWith('.png')) {
        projImageUrl = projImageUrl.replace('.png', '.webp');
      }

      const getCategoryLabel = (p: any, l: string) => {
        const langCategory = l === 'en' ? (p.category_en || p.category_es || p.category) : (p.category_es || p.category_en || p.category);
        if (langCategory) return getTranslation(langCategory, l as 'es' | 'en');

        const t = (p.title || '').toLowerCase().trim();
        const s = (p.slug || '').toLowerCase().trim();
        if (t.includes('blessed') || s.includes('blessed')) return l === 'en' ? 'High-End Barbershop' : 'Barbería de Alta Gama';
        if (t.includes('luna') || s.includes('luna')) return l === 'en' ? 'Specialty Coffee & Bar' : 'Bar & Cafetería de Especialidad';
        if (t.includes('ecua') || s.includes('ecua')) return l === 'en' ? 'Luxury Renovations' : 'Reformas & Tabiquería';
        if (t.includes('rbari') || s.includes('rbari')) return l === 'en' ? 'Gastronomic Restaurant' : 'Restaurante Gastronómico';
        if (t.includes('next era') || s.includes('next-era')) return l === 'en' ? 'E-Commerce Store' : 'Tienda Online / E-Commerce';
        if (t.includes('mezquita') || s.includes('mezquita') || t.includes('arrahma')) return l === 'en' ? 'Islamic Center' : 'Centro Islámico';
        if (t.includes('marrakech') || s.includes('marrakech')) return l === 'en' ? 'Moroccan Restaurant' : 'Restaurante Marroquí';
        return l === 'en' ? 'Web Design' : 'Diseño Web';
      };

      const categoryText = getCategoryLabel(proj, lang);

      article.innerHTML = `
        <div class="relative w-full h-full overflow-hidden flex items-center justify-center cursor-pointer" onclick="window.location.href='${projectUrl}'">
          <img src="${projImageUrl}" alt="${lang === 'en' ? `Premium web design in Mallorca - Preview of ${proj.title}` : `Diseño web premium en Mallorca - Vista previa de ${proj.title}`}" loading="${idx < 2 ? 'eager' : 'lazy'}" decoding="async" fetchpriority="${idx < 2 ? 'high' : 'low'}"
            class="w-full h-full object-cover object-center scale-[1.12] group-hover:scale-[1.20] transition-transform duration-700">
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
          <div class="absolute bottom-0 inset-x-0 p-5 sm:p-6 md:p-8 flex flex-col justify-end text-left z-20">
            <span class="text-xs md:text-sm font-headline font-semibold uppercase tracking-[0.2em] text-[#00f2ff]">${categoryText}</span>
            <h3 class="text-xl sm:text-2xl md:text-3xl font-bold text-white font-headline tracking-tight mt-1">${proj.title}</h3>
            <a href="${projectUrl}" class="mt-2.5 inline-flex items-center gap-2 text-xs md:text-sm font-bold text-white uppercase tracking-widest group-hover:text-[#00f2ff] transition-colors">
              ${btnText} <span class="material-symbols-outlined text-sm md:text-base">arrow_forward</span>
            </a>
          </div>
        </div>
      `;

      portfolioCarousel.appendChild(article);
    });

    const MAX_VISIBLE = 7;
    const HALF = 3;

    function getResponsiveMultiplier(w: number) {
      if (w < 480) return 0.35;
      if (w < 640) return 0.48;
      if (w < 768) return 0.65;
      if (w < 1024) return 0.95;
      return 1.25;
    }

    function getHeightMultiplier(w: number) {
      let idealPx: number;
      if (w < 480) idealPx = 380;
      else if (w < 640) idealPx = 450;
      else if (w < 768) idealPx = 520;
      else if (w < 1024) idealPx = 640;
      else idealPx = 720;
      const available = window.innerHeight * 0.75;
      if (available >= idealPx) return 1;
      return available / idealPx;
    }

    // Carousel State Variables
    let centerIndex = Math.min(3, Math.floor(totalProjects / 2));
    let isAnimating = false;
    let autoPlayTimer: any = null;
    let isDragging = false;
    let startX = 0;
    let currentDragDelta = 0;

    const cardElements = Array.from(portfolioCarousel.querySelectorAll<HTMLElement>('.fan-card'));

    const getSlotConfig = (slot: number) => {
      const center = HALF;
      const distance = slot - center;
      const absDistance = Math.abs(distance);
      return {
        rot: distance * 7,
        scale: 1.0 - 0.08 * absDistance,
        x: distance * 11,
        y: absDistance * absDistance * 1.3,
        zIndex: 10 - absDistance,
      };
    };

    const getVisibleMap = (center: number) => {
      const map = new Map<number, number>();
      for (let slot = 0; slot < MAX_VISIBLE; slot++) {
        const cardIdx = ((center + slot - HALF) % totalProjects + totalProjects) % totalProjects;
        map.set(cardIdx, slot);
      }
      return map;
    };

    const updateCardPositions = (animated = true, dragOffset = 0) => {
      if (!cardElements.length) return;
      const visibleMap = getVisibleMap(centerIndex);
      const mult = getResponsiveMultiplier(window.innerWidth);
      const hMult = getHeightMultiplier(window.innerWidth);
      const dragShiftRem = dragOffset / 16;

      cardElements.forEach((card, cardIndex) => {
        const slot = visibleMap.get(cardIndex);

        if (slot !== undefined) {
          const config = getSlotConfig(slot);
          const target = {
            x: `${config.x * mult + dragShiftRem}rem`,
            y: `${config.y * hMult}rem`,
            rotation: config.rot + dragShiftRem * 1.5,
            scale: config.scale,
            opacity: 1,
            zIndex: config.zIndex,
            pointerEvents: 'auto' as const,
          };

          if (animated) {
            gsap.to(card, {
              ...target,
              duration: 0.6,
              ease: 'power2.out',
              overwrite: 'auto',
              onComplete: () => { isAnimating = false; },
            });
          } else {
            gsap.set(card, target);
          }
        } else {
          gsap.to(card, {
            opacity: 0,
            scale: 0.3,
            duration: 0.4,
            ease: 'power2.in',
            pointerEvents: 'none',
            zIndex: 0,
          });
        }
      });

      updatePaginationDots();
    };

    // Render Pagination Dots
    if (portfolioPagination) {
      portfolioPagination.innerHTML = '';
      for (let i = 0; i < totalProjects; i++) {
        const dot = document.createElement('button');
        dot.ariaLabel = `Project ${i + 1}`;
        dot.className = `h-2.5 rounded-full transition-all duration-300 cursor-pointer ${i === centerIndex ? 'w-8 bg-[#00f2ff] shadow-[0_0_12px_rgba(0,242,255,0.6)]' : 'w-2.5 bg-white/20 hover:bg-white/40'}`;
        dot.addEventListener('click', () => {
          if (isAnimating) return;
          isAnimating = true;
          centerIndex = i;
          updateCardPositions(true);
          resetAutoPlay();
        });
        portfolioPagination.appendChild(dot);
      }
    }

    const updatePaginationDots = () => {
      if (!portfolioPagination) return;
      const dots = portfolioPagination.querySelectorAll('button');
      dots.forEach((dot, idx) => {
        if (idx === centerIndex) {
          dot.className = 'h-2.5 w-8 rounded-full bg-[#00f2ff] shadow-[0_0_12px_rgba(0,242,255,0.6)] transition-all duration-300';
        } else {
          dot.className = 'h-2.5 w-2.5 rounded-full bg-white/20 hover:bg-white/40 transition-all duration-300';
        }
      });
    };

    const cycle = (direction: 'left' | 'right') => {
      if (isAnimating) return;
      isAnimating = true;
      centerIndex = direction === 'right'
        ? (centerIndex + 1) % totalProjects
        : (centerIndex - 1 + totalProjects) % totalProjects;
      updateCardPositions(true);
    };

    // Control buttons
    if (btnPrev && btnNext) {
      btnPrev.onclick = () => { cycle('left'); resetAutoPlay(); };
      btnNext.onclick = () => { cycle('right'); resetAutoPlay(); };
    }

    // Touch & Mouse Real-Time Drag/Swipe Handlers
    const handleDragStart = (clientX: number) => {
      isDragging = true;
      startX = clientX;
      currentDragDelta = 0;
      stopAutoPlay();
    };

    const handleDragMove = (clientX: number) => {
      if (!isDragging) return;
      currentDragDelta = clientX - startX;
      updateCardPositions(false, currentDragDelta);
    };

    const handleDragEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      if (Math.abs(currentDragDelta) > 35) {
        if (currentDragDelta < 0) {
          cycle('right');
        } else {
          cycle('left');
        }
      } else {
        updateCardPositions(true, 0);
      }
      currentDragDelta = 0;
      resetAutoPlay();
    };

    // Touch events for Mobile / Tablet
    portfolioCarousel.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        handleDragStart(e.touches[0].clientX);
      }
    }, { passive: true });

    portfolioCarousel.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) {
        handleDragMove(e.touches[0].clientX);
      }
    }, { passive: true });

    portfolioCarousel.addEventListener('touchend', handleDragEnd, { passive: true });
    portfolioCarousel.addEventListener('touchcancel', handleDragEnd, { passive: true });

    // Mouse drag events for Desktop
    portfolioCarousel.addEventListener('mousedown', (e) => {
      handleDragStart(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (isDragging) handleDragMove(e.clientX);
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) handleDragEnd();
    });

    // Hover Expansion Effect
    let activeHoverSlot: number | null = null;
    let leaveTimer: any = null;

    cardElements.forEach((card, index) => {
      card.addEventListener('mouseenter', () => {
        if (isAnimating) return;
        if (leaveTimer) clearTimeout(leaveTimer);
        const visibleMap = getVisibleMap(centerIndex);
        const slot = visibleMap.get(index);
        if (slot !== undefined) {
          activeHoverSlot = slot;
          const mult = getResponsiveMultiplier(window.innerWidth);
          const hM = getHeightMultiplier(window.innerWidth);

          cardElements.forEach((el, cardIdx) => {
            const cardSlot = visibleMap.get(cardIdx);
            if (cardSlot === undefined) return;
            const base = getSlotConfig(cardSlot);
            let targetX = base.x * mult;
            let targetY = base.y * hM;
            let targetRot = base.rot;
            let targetScale = base.scale;

            if (cardSlot === slot) {
              targetY -= 2.2 * hM;
              targetScale *= 1.08;
            } else if (cardSlot < slot) {
              targetX -= 4 * mult;
              targetRot -= 3;
            } else {
              targetX += 4 * mult;
              targetRot += 3;
            }

            gsap.to(el, {
              x: `${targetX}rem`,
              y: `${targetY}rem`,
              rotation: targetRot,
              scale: targetScale,
              duration: 0.4,
              ease: 'elastic.out(1, 0.75)',
              overwrite: 'auto',
            });
          });
        }
      });
    });

    portfolioCarousel.addEventListener('mouseleave', () => {
      if (leaveTimer) clearTimeout(leaveTimer);
      leaveTimer = setTimeout(() => {
        updateCardPositions(true);
      }, 80);
    });

    const startAutoPlay = () => {
      stopAutoPlay();
      autoPlayTimer = setInterval(() => { cycle('right'); }, 4000);
    };

    const stopAutoPlay = () => {
      if (autoPlayTimer) clearInterval(autoPlayTimer);
    };

    const resetAutoPlay = () => {
      stopAutoPlay();
      startAutoPlay();
    };

    // Responsive resize handler
    window.addEventListener('resize', () => {
      updateCardPositions(false);
    });

    // Initial render
    updateCardPositions(false);
    startAutoPlay();
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
        ? `🚀 Nueva Solicitud de Proyecto Web: ${clientName} (${projectType})`
        : `🚀 New Web Project Request: ${clientName} (${projectType})`;

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

  // --- H. Plans Button overlay transitions (Intelligent Loader) ---
  const transitionOverlay = document.getElementById('page-transition-overlay');
  if (transitionOverlay) {
    transitionOverlay.classList.add('active');
    transitionOverlay.setAttribute('aria-hidden', 'false');

    const hideOverlay = () => {
      transitionOverlay.classList.remove('active');
      transitionOverlay.setAttribute('aria-hidden', 'true');
    };

    // Intelligent loader: min 1.2s (so the 3D cubes are seen), max 2.5s
    const LOADER_MIN_MS = 1200;
    const LOADER_MAX_MS = 2500;
    const loaderStart = Date.now();
    let pageLoaded = document.readyState === 'complete';

    const tryHideOverlay = () => {
      const elapsed = Date.now() - loaderStart;
      if (elapsed >= LOADER_MIN_MS && pageLoaded) {
        hideOverlay();
      }
    };

    // If page already loaded, just wait the minimum
    if (pageLoaded) {
      setTimeout(tryHideOverlay, LOADER_MIN_MS);
    } else {
      window.addEventListener('load', () => {
        pageLoaded = true;
        const elapsed = Date.now() - loaderStart;
        const remaining = Math.max(0, LOADER_MIN_MS - elapsed);
        setTimeout(tryHideOverlay, remaining);
      }, { once: true });
    }
    // Hard cap: never show loader longer than max
    setTimeout(hideOverlay, LOADER_MAX_MS);

    window.addEventListener('pageshow', (e) => {
      if (plansTransitionOverlay) {
        plansTransitionOverlay.classList.remove('active');
        plansTransitionOverlay.setAttribute('aria-hidden', 'true');
      }

      if (e.persisted) {
        transitionOverlay.classList.add('active');
        transitionOverlay.setAttribute('aria-hidden', 'false');
        setTimeout(hideOverlay, LOADER_MIN_MS);
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

        // Reduced from 4s to 1.5s — snappier transition
        setTimeout(() => {
          window.location.href = destination;
        }, 1500);
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

  // Initialize Draggable Marquee Reviews
  initDraggableMarquee();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMain);
} else {
  initMain();
}

// --- Scroll position navigation compact control (Throttled with state checks) ---
const navBar = document.getElementById('nav-container');
const navL = document.getElementById('nav-left');
const navC = document.getElementById('nav-logo');
const navR = document.getElementById('nav-right');
let isNavCompact = false;

function setNavAtTop() {
  if (!navBar || !navL || !navC || !navR || !isNavCompact) return;
  isNavCompact = false;
  navBar.classList.remove('opacity-0', 'nav-compact');
  navBar.classList.add('nav-at-top');
  navL.classList.replace('-translate-x-[150%]', 'translate-x-0');
  navC.classList.replace('-translate-y-[150%]', 'translate-y-0');
  navR.classList.replace('translate-x-[150%]', 'translate-x-0');
  navL.style.opacity = '1';
  navR.style.opacity = '1';
}

function setNavCompact() {
  if (!navBar || !navL || !navC || !navR || isNavCompact) return;
  isNavCompact = true;
  navBar.classList.remove('opacity-0', 'nav-at-top');
  navBar.classList.add('nav-compact');
  navL.classList.replace('-translate-x-[150%]', 'translate-x-0');
  navC.classList.replace('-translate-y-[150%]', 'translate-y-0');
  navR.classList.replace('translate-x-[150%]', 'translate-x-0');
}

// Initial state check
if (window.scrollY >= 80) {
  isNavCompact = false; // force transition
  setNavCompact();
}

let scrollTicking = false;
const neonFrame = document.getElementById('neon-frame');
let isNeonActive = false;

if (neonFrame && window.scrollY < 50) {
  isNeonActive = true;
  neonFrame.classList.add('neon-frame-active');
}

window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    window.requestAnimationFrame(() => {
      const scrollY = window.scrollY;

      // Nav bar compact toggle (only when crossing 80px boundary)
      if (scrollY < 80) {
        setNavAtTop();
      } else {
        setNavCompact();
      }

      // Neon frame toggle (only when crossing 50px boundary)
      if (neonFrame) {
        const shouldBeActive = scrollY < 50;
        if (shouldBeActive !== isNeonActive) {
          isNeonActive = shouldBeActive;
          if (shouldBeActive) {
            neonFrame.classList.add('neon-frame-active');
          } else {
            neonFrame.classList.remove('neon-frame-active');
          }
        }
      }

      scrollTicking = false;
    });
    scrollTicking = true;
  }
}, { passive: true });

// --- K. Liquid Vanilla JS Cursor (desktop only — skip on touch devices) ---
const liquidCursor = document.getElementById('liquid-cursor');
const cursorDot = document.getElementById('cursor-dot');

if (liquidCursor && cursorDot && window.matchMedia('(pointer: fine)').matches) {
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
} else if (liquidCursor) {
  // Hide cursor elements on touch devices to avoid invisible DOM overhead
  liquidCursor.style.display = 'none';
  if (cursorDot) cursorDot.style.display = 'none';
}

// --- L. GSAP Parallax Premium Animations ---
window.addEventListener('load', () => {
  // Parallax removed due to backdrop-filter rendering lag on scroll

  // Process cards stagger reveal
  const processCards = document.querySelectorAll('.process-card');
  if (processCards.length > 0) {
    gsap.fromTo(processCards,
      { opacity: 0, x: -40 },
      {
        opacity: 1, x: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
        force3D: true,
        scrollTrigger: {
          trigger: processCards[0].parentElement,
          start: 'top 85%',
          once: true,
          onEnter: () => processCards.forEach(c => c.classList.add('in-view')),
        },
      }
    );
  }
});
