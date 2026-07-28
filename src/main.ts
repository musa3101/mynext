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
          start: 'top 90%',
          end: 'bottom 10%',
          toggleActions: 'play reverse play reverse',
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
          start: 'top 90%',
          end: 'bottom 10%',
          toggleActions: 'play reverse play reverse',
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
          start: 'top 90%',
          end: 'bottom 10%',
          toggleActions: 'play reverse play reverse',
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

    // Reset loop when reaching the end (duplicate content creates seamless loop)
    function autoScroll() {
      if (!isPaused && !isDown) {
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

    // Touch events for mobile swipe
    container.addEventListener('touchstart', (e: TouchEvent) => {
      isDown = true;
      isPaused = true;
      startX = e.touches[0].pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
      container.style.scrollBehavior = 'auto';
    }, { passive: true });

    container.addEventListener('touchend', () => {
      isDown = false;
      isPaused = false;
    });

    container.addEventListener('touchmove', (e: TouchEvent) => {
      if (!isDown) return;
      const x = e.touches[0].pageX - container.offsetLeft;
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
    });

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

    const infiniteProjects = [...projects, ...projects, ...projects, ...projects];
    infiniteProjects.forEach((proj) => {
      // Find matching testimonial where company equals project title
      const matchingTestimonial = testimonials.find(
        (t) => t.company.trim().toLowerCase() === proj.title.trim().toLowerCase()
      );

      const hasTestimonial = !!matchingTestimonial;
      const testimonialText = hasTestimonial ? getTranslation(matchingTestimonial.testimonial, lang) : '';

      // Assemble card elements
      const article = document.createElement('article');
      article.className = 'flex-none w-[80vw] md:w-[45vw] lg:w-[35vw] xl:w-[30vw] snap-center flex flex-col gap-6 transition-transform duration-500';

      const domain = getDomainFromUrl(proj.project_url) || 'View Case Study';
      const projectUrl = `project.html?slug=${proj.slug || ''}`;
      const btnText = lang === 'en' ? 'More Info →' : 'Más Info →';

      article.innerHTML = `
        <div class="group relative aspect-[16/10] rounded-3xl overflow-hidden glass-panel border-white/5 transition-all duration-500 hover:border-electric-cyan/30 hover:shadow-[0_0_40px_rgba(0,242,255,0.15)]">
          <!-- Browser UI Mockup -->
          <div class="absolute top-0 left-0 right-0 h-10 bg-void-black/80 backdrop-blur-md flex items-center px-4 z-30 border-b border-white/5 select-none">
            <div class="flex items-center gap-1.5 w-16"> 
              <div class="w-3 h-3 rounded-full bg-[#FF5F56] shadow-sm"></div>
              <div class="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-sm"></div>
              <div class="w-3 h-3 rounded-full bg-[#27C93F] shadow-sm"></div>
            </div>
            <div class="flex-grow flex items-center justify-between pl-2 md:pl-4">
              <div class="hidden sm:flex items-center gap-2 mr-4 text-slate-400">
                <svg viewBox="0 0 20 20" height="12" width="12" fill="currentColor">
                  <path transform="translate(6.25 3.75)" d="M0,6.25,6.25,0l.875.875L1.75,6.25l5.375,5.375L6.25,12.5Z"></path>
                </svg>
                <svg viewBox="0 0 20 20" height="12" width="12" fill="currentColor">
                  <path transform="translate(6.625 3.75)" d="M7.125,6.25.875,12.5,0,11.625,5.375,6.25,0,.875.875,0Z"></path>
                </svg>
              </div>
              <div class="flex-grow max-w-[400px] mx-auto relative border border-white/10 rounded-lg px-3 py-1 h-7 flex items-center justify-center text-xs text-slate-300 bg-white/5 font-sans cursor-pointer tracking-wide shadow-inner" onclick="window.location.href='${projectUrl}'">
                ${domain}
              </div>
            </div>
          </div>
          <div class="absolute top-10 left-0 right-0 bottom-0 bg-[#050505] overflow-hidden flex items-center justify-center p-0 cursor-pointer" onclick="window.location.href='${projectUrl}'">
            <img src="${proj.image_url}" alt="${lang === 'en' ? `Premium web design in Mallorca - Preview of ${proj.title}` : `Diseño web premium en Mallorca - Vista previa de ${proj.title}`}" loading="lazy"
              class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.05]">
            <div class="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
            <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center z-20 backdrop-blur-sm">
              <a href="${projectUrl}"
                class="px-8 py-4 bg-white text-black font-headline font-bold text-xs tracking-[0.3em] uppercase rounded-full hover:bg-electric-cyan transition-all duration-500 shadow-2xl scale-90 group-hover:scale-100">
                ${btnText}
              </a>
            </div>
          </div>
        </div>
        <div class="space-y-4 px-2 mt-4 text-center md:text-left">
          <h3 class="text-3xl md:text-4xl font-bold text-white font-headline tracking-tight">${proj.title}</h3>
          ${hasTestimonial ? `
            <p class="text-lg text-white/60 font-body leading-relaxed max-w-2xl line-clamp-2">${testimonialText}</p>
          ` : `
            <p class="text-lg text-white/60 font-body leading-relaxed max-w-2xl line-clamp-2">${getTranslation(proj.description, lang)}</p>
          `}
        </div>
      `;

      portfolioCarousel.appendChild(article);
    });

    // Auto-scroll logic
    let autoScrollInterval: any;
    const startScroll = () => {
      autoScrollInterval = setInterval(() => {
        if (!portfolioCarousel) return;
        const card = portfolioCarousel.firstElementChild;
        const scrollAmount = card ? card.clientWidth + 32 : 600; 
        
        // If we've scrolled past the 3rd set, silently jump back to the 2nd set to maintain the loop
        if (portfolioCarousel.scrollLeft > scrollAmount * (projects.length * 2.5)) {
            portfolioCarousel.scrollBy({ left: -(scrollAmount * projects.length), behavior: 'auto' });
        }
        
        portfolioCarousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }, 15000); // 15 seconds as user requested
    };

    const stopScroll = () => {
      clearInterval(autoScrollInterval);
    };

    // Pause on hover or touch
    portfolioCarousel.addEventListener('mouseenter', stopScroll);
    portfolioCarousel.addEventListener('mouseleave', startScroll);
    portfolioCarousel.addEventListener('touchstart', stopScroll);
    portfolioCarousel.addEventListener('touchend', startScroll);

    // Arrow controls
    const btnPrev = document.getElementById('carousel-prev');
    const btnNext = document.getElementById('carousel-next');

    if (btnPrev && btnNext) {
      btnPrev.addEventListener('click', () => {
        stopScroll();
        const card = portfolioCarousel.firstElementChild;
        const scrollAmount = card ? card.clientWidth + 32 : 600;
        
        // If we scroll too far left, jump forward silently
        if (portfolioCarousel.scrollLeft < scrollAmount) {
            portfolioCarousel.scrollBy({ left: scrollAmount * projects.length, behavior: 'auto' });
        }
        
        portfolioCarousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        startScroll();
      });

      btnNext.addEventListener('click', () => {
        stopScroll();
        const card = portfolioCarousel.firstElementChild;
        const scrollAmount = card ? card.clientWidth + 32 : 600;
        
        // If we scroll too far right, jump back silently
        if (portfolioCarousel.scrollLeft > scrollAmount * (projects.length * 2.5)) {
            portfolioCarousel.scrollBy({ left: -(scrollAmount * projects.length), behavior: 'auto' });
        }
        
        portfolioCarousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        startScroll();
      });
      
      // Pause when hovering arrows
      btnPrev.addEventListener('mouseenter', stopScroll);
      btnPrev.addEventListener('mouseleave', startScroll);
      btnNext.addEventListener('mouseenter', stopScroll);
      btnNext.addEventListener('mouseleave', startScroll);
    }

    // Center the first item of the second set on load
    setTimeout(() => {
        if (portfolioCarousel.children.length > 0) {
            const card = portfolioCarousel.children[projects.length] as HTMLElement;
            if (card) {
                const containerCenter = portfolioCarousel.clientWidth / 2;
                const cardCenter = card.offsetLeft + (card.clientWidth / 2);
                portfolioCarousel.scrollTo({ left: cardCenter - containerCenter, behavior: 'auto' });
            }
        }
        startScroll(); // Initialize after centering
    }, 100);
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
          end: 'bottom 15%',
          toggleActions: 'play reverse play reverse',
          onEnter: () => processCards.forEach(c => c.classList.add('in-view')),
          onLeaveBack: () => processCards.forEach(c => c.classList.remove('in-view')),
        },
      }
    );
  }
});
