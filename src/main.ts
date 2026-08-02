import './style.css';
import { supabase } from './lib/supabase';
import {
  fallbackProjects,
  fallbackTestimonials,
  fallbackSettings
} from './lib/fallbackData';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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

// --- Render Dynamic Google Reviews ---
function renderDynamicGoogleReviews(reviewsList: any[]) {
  if (!reviewsList || reviewsList.length === 0) return;
  const marqueeTracks = document.querySelectorAll('.reviews-slider-container .animate-marquee');
  if (!marqueeTracks || marqueeTracks.length === 0) return;

  const buildCardHtml = (r: any) => {
    const name = r.name || r.client_name || 'Cliente Verificado';
    const rawContent = (lang === 'en' ? (r.content_en || r.content_es || r.content || r.testimonial) : (r.content_es || r.content || r.testimonial)) || '';
    const content = getTranslation(rawContent, lang as 'es' | 'en');
    const rawCompany = r.company || r.position || r.relative_time || 'Cliente MYNEXT';
    const company = getTranslation(rawCompany, lang as 'es' | 'en');
    const ratingStars = '★'.repeat(r.rating || 5);
    const photo = r.author_photo || r.image_url;

    const avatarHtml = (photo && photo.startsWith('http'))
      ? `<img src="${photo}" alt="${name}" class="w-full h-full object-cover rounded-full" />`
      : (name ? name.charAt(0).toUpperCase() : 'G');

    return `
      <div class="relative w-[360px] md:w-[450px] shrink-0 p-8 md:p-10 rounded-[2.5rem] bg-[#0c0c16]/50 border border-white/10 backdrop-blur-2xl overflow-hidden group hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,242,255,0.08)] hover:border-electric-cyan/30 transition-all duration-500">
          <div class="absolute inset-0 bg-gradient-to-br from-electric-cyan/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <svg class="absolute top-6 right-6 w-12 h-12 text-white/3 group-hover:text-electric-cyan/10 transition-colors duration-500" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
              <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
          </svg>
          <div class="relative z-10">
              <div class="flex items-center justify-between mb-6">
                  <div class="flex flex-col gap-1">
                      <div class="flex text-yellow-400 text-lg drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]">${ratingStars}</div>
                      <span class="text-[9px] text-emerald-400 font-headline uppercase tracking-widest font-bold flex items-center gap-1">
                          <svg class="w-3.5 h-3.5 fill-emerald-400" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                          </svg>
                          Reseña Verificada
                      </span>
                  </div>
                  <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                      <svg width="12" height="12" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      <span class="text-white/60 text-[9px] uppercase tracking-widest font-semibold font-headline">Google</span>
                  </div>
              </div>
              <p class="text-[15px] md:text-[16px] text-slate-200 font-light mb-8 leading-relaxed italic">
                  "${content}"
              </p>
              <div class="flex items-center gap-4 border-t border-white/5 pt-6">
                  <div class="w-11 h-11 rounded-full bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-electric-cyan/30 flex items-center justify-center text-electric-cyan font-bold font-headline text-sm overflow-hidden shrink-0">
                      ${avatarHtml}
                  </div>
                  <div>
                      <h4 class="text-white font-headline font-bold text-sm tracking-wide">${name}</h4>
                      <p class="text-xs text-slate-400 font-headline uppercase tracking-wider">${company}</p>
                  </div>
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
}

// --- Draggable Marquee ---
function initDraggableMarquee() {
  const containers = document.querySelectorAll('.reviews-slider-container');
  containers.forEach((container: any) => {
    const slider = container.querySelector('.animate-marquee');
    if (!slider) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let scrollSpeed = 0.5; // pixels per frame
    let animationId = 0;
    let isPaused = false;

    let isVisible = true;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
      });
    }, { threshold: 0.05 });
    observer.observe(container);

    // Reset loop when reaching the end (duplicate content creates seamless loop)
    function autoScroll() {
      if (!isPaused && !isDown && isVisible) {
        container.scrollLeft += scrollSpeed;
        if (container.scrollLeft >= slider.scrollWidth / 2) {
          container.scrollLeft = 0;
        }
      }
      animationId = requestAnimationFrame(autoScroll);
    }

    // Start auto-scroll
    animationId = requestAnimationFrame(autoScroll);

    // Mouse events for drag
    container.addEventListener('mousedown', (e: MouseEvent) => {
      isDown = true;
      isPaused = true;
      container.classList.add('active-dragging');
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
      container.style.scrollBehavior = 'auto'; // Disable smooth scroll while dragging
    });

    container.addEventListener('mouseleave', () => {
      if (isDown) {
        isDown = false;
        isPaused = false;
        container.classList.remove('active-dragging');
      }
    });

    container.addEventListener('mouseup', () => {
      if (isDown) {
        isDown = false;
        isPaused = false;
        container.classList.remove('active-dragging');
      }
    });

    container.addEventListener('mousemove', (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 1.5; // Scroll speed multiplier
      container.scrollLeft = scrollLeft - walk;
      
      // Wrap around scrolling
      if (container.scrollLeft >= slider.scrollWidth / 2) {
        container.scrollLeft = 0;
        startX = e.pageX - container.offsetLeft;
        scrollLeft = 0;
      } else if (container.scrollLeft <= 0) {
        container.scrollLeft = slider.scrollWidth / 2;
        startX = e.pageX - container.offsetLeft;
        scrollLeft = slider.scrollWidth / 2;
      }
    });

    // Touch events for mobile swipe (direction-lock for iOS Safari)
    let touchStartY = 0;
    let directionLocked: 'horizontal' | 'vertical' | null = null;

    container.addEventListener('touchstart', (e: TouchEvent) => {
      isDown = true;
      isPaused = true;
      startX = e.touches[0].pageX - container.offsetLeft;
      touchStartY = e.touches[0].pageY;
      scrollLeft = container.scrollLeft;
      directionLocked = null;
      container.style.scrollBehavior = 'auto';
    }, { passive: true });

    container.addEventListener('touchend', () => {
      isDown = false;
      isPaused = false;
      directionLocked = null;
    });

    container.addEventListener('touchmove', (e: TouchEvent) => {
      if (!isDown) return;

      const currentX = e.touches[0].pageX;
      const currentY = e.touches[0].pageY;

      // Direction lock: decide once whether the gesture is horizontal or vertical
      if (!directionLocked) {
        const dx = Math.abs(currentX - (startX + container.offsetLeft));
        const dy = Math.abs(currentY - touchStartY);
        if (dx + dy > 10) { // threshold to decide
          directionLocked = dx > dy ? 'horizontal' : 'vertical';
        }
      }

      // If vertical, let the page scroll naturally
      if (directionLocked === 'vertical') return;

      // Horizontal: prevent page scroll and move the carousel
      if (directionLocked === 'horizontal') {
        e.preventDefault();
      }

      const x = currentX - container.offsetLeft;
      const walk = (x - startX) * 1.5;
      container.scrollLeft = scrollLeft - walk;
      
      if (container.scrollLeft >= slider.scrollWidth / 2) {
        container.scrollLeft = 0;
        startX = e.touches[0].pageX - container.offsetLeft;
        scrollLeft = 0;
      } else if (container.scrollLeft <= 0) {
        container.scrollLeft = slider.scrollWidth / 2;
        startX = e.touches[0].pageX - container.offsetLeft;
        scrollLeft = slider.scrollWidth / 2;
      }
    }, { passive: false });

    // Hover events to pause auto scroll
    container.addEventListener('mouseenter', () => {
      isPaused = true;
    });

    container.addEventListener('mouseleave', () => {
      if (!isDown) {
        isPaused = false;
      }
    });
  });
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

      // Apply any dynamic HTML content automatically
      applyDynamicSettings(settings, lang as 'es' | 'en');

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

  // Render Portfolio Carousel
  const portfolioCarousel = document.getElementById('portfolio-carousel');

  if (portfolioCarousel) {
    portfolioCarousel.innerHTML = '';

    // Render projects 4 times to create a dense, filled, infinite portfolio showcase
    const infiniteProjects = [...projects, ...projects, ...projects, ...projects];
    infiniteProjects.forEach((proj) => {
      // Assemble card elements
      const article = document.createElement('article');
      article.className = 'flex-none w-[80vw] md:w-[45vw] lg:w-[35vw] xl:w-[30vw] snap-center flex flex-col gap-6 transition-transform duration-500';

      const projectSlug = proj.slug || proj.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const projectUrl = `project.html?slug=${projectSlug}`;
      const btnText = lang === 'en' ? 'More Info →' : 'Más Info →';

      // Determine category label for the project
      const getCategoryLabel = (p: any, l: string) => {
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
        <div class="group relative aspect-[16/10] rounded-3xl overflow-hidden glass-panel border border-white/10 transition-all duration-500 hover:border-electric-cyan/40 hover:shadow-[0_0_50px_rgba(0,242,255,0.2)]">
          <div class="absolute inset-0 bg-[#06060c] overflow-hidden flex items-center justify-center cursor-pointer" onclick="window.location.href='${projectUrl}'">
            <img src="${proj.image_url}" alt="${lang === 'en' ? `Premium web design in Mallorca - Preview of ${proj.title}` : `Diseño web premium en Mallorca - Vista previa de ${proj.title}`}" loading="lazy"
              class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.05]">
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-20 transition-opacity duration-500"></div>
            <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center z-20 backdrop-blur-sm">
              <a href="${projectUrl}"
                class="px-8 py-4 bg-white text-black font-headline font-bold text-xs tracking-[0.3em] uppercase rounded-full hover:bg-electric-cyan transition-all duration-500 shadow-2xl scale-90 group-hover:scale-100">
                ${btnText}
              </a>
            </div>
          </div>
        </div>
        <div class="space-y-2 px-2 mt-4 text-center md:text-left">
          <h3 class="text-3xl md:text-4xl font-bold text-white font-headline tracking-tight">${proj.title}</h3>
          <p class="text-sm font-headline font-semibold uppercase tracking-[0.25em] text-[#00f2ff] opacity-90">${categoryText}</p>
        </div>
      `;

      portfolioCarousel.appendChild(article);
    });

    // Auto-scroll logic (4-second autoplay + silent wrapping)
    let autoScrollInterval: any;
    let isUserInteracting = false;

    const checkAndWrapScroll = () => {
      if (!portfolioCarousel || isUserInteracting) return;
      const card = portfolioCarousel.firstElementChild;
      if (!card) return;
      const scrollAmount = card.clientWidth + 32;
      const setWidth = scrollAmount * projects.length;
      
      // If we've scrolled into set 3, jump back to set 2 silently
      if (portfolioCarousel.scrollLeft >= setWidth * 2.5) {
        portfolioCarousel.scrollLeft -= setWidth;
      }
      // If we've scrolled before set 2, jump forward to set 2 silently
      else if (portfolioCarousel.scrollLeft <= setWidth * 0.5) {
        portfolioCarousel.scrollLeft += setWidth;
      }
    };

    const startScroll = () => {
      stopScroll();
      autoScrollInterval = setInterval(() => {
        if (!portfolioCarousel || isUserInteracting) return;
        const card = portfolioCarousel.firstElementChild;
        const scrollAmount = card ? card.clientWidth + 32 : 600; 
        
        checkAndWrapScroll();
        portfolioCarousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }, 4000); // 4 seconds autoplay
    };

    const stopScroll = () => {
      if (autoScrollInterval) clearInterval(autoScrollInterval);
    };

    // Pause on hover or touch
    portfolioCarousel.addEventListener('mouseenter', () => { isUserInteracting = true; stopScroll(); });
    portfolioCarousel.addEventListener('mouseleave', () => { isUserInteracting = false; startScroll(); });
    portfolioCarousel.addEventListener('touchstart', () => { isUserInteracting = true; stopScroll(); });
    portfolioCarousel.addEventListener('touchend', () => { 
      isUserInteracting = false; 
      setTimeout(checkAndWrapScroll, 400);
      startScroll(); 
    });

    // Silently wrap scroll when smooth scrolling ends
    portfolioCarousel.addEventListener('scrollend', checkAndWrapScroll);

    // Arrow controls
    const btnPrev = document.getElementById('carousel-prev');
    const btnNext = document.getElementById('carousel-next');

    if (btnPrev && btnNext) {
      btnPrev.addEventListener('click', () => {
        stopScroll();
        checkAndWrapScroll();
        const card = portfolioCarousel.firstElementChild;
        const scrollAmount = card ? card.clientWidth + 32 : 600;
        portfolioCarousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        startScroll();
      });

      btnNext.addEventListener('click', () => {
        stopScroll();
        checkAndWrapScroll();
        const card = portfolioCarousel.firstElementChild;
        const scrollAmount = card ? card.clientWidth + 32 : 600;
        portfolioCarousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        startScroll();
      });

      btnPrev.addEventListener('mouseenter', stopScroll);
      btnPrev.addEventListener('mouseleave', startScroll);
      btnNext.addEventListener('mouseenter', stopScroll);
      btnNext.addEventListener('mouseleave', startScroll);
    }

    // Center Set 2 on load so the carousel starts 100% FULL on both sides
    setTimeout(() => {
      if (portfolioCarousel && portfolioCarousel.children.length > projects.length) {
        const card = portfolioCarousel.children[projects.length] as HTMLElement;
        if (card) {
          const containerCenter = portfolioCarousel.clientWidth / 2;
          const cardCenter = card.offsetLeft + (card.clientWidth / 2);
          portfolioCarousel.scrollTo({ left: cardCenter - containerCenter, behavior: 'auto' });
        }
      }
      startScroll();
    }, 150);
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
• Presupuesto Estimado: ${budget}

He revisado tu solicitud y en breve me pondré en contacto contigo directamente por correo o WhatsApp para agendar una breve llamada o enviarte la propuesta personalizada sin compromiso.

Un saludo,
Musa — MYNEXT Arquitectura Digital
https://mynextbymusa.com`
        : `Hello ${clientName}!

Thank you very much for contacting MYNEXT. We have successfully received your inquiry details for your web project:

• Project Type: ${projectType}
• Estimated Budget: ${budget}

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
          "Presupuesto Estimado": budget,
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
