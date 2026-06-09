// --- 0. Always start at top on load ---
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

// --- 1. Reveal Animations ---
document.addEventListener('DOMContentLoaded', () => {
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
    
    // --- 2. Header Entrance ---
    setTimeout(() => {
        const nav = document.getElementById('nav-container');
        const left = document.getElementById('nav-left');
        const center = document.getElementById('nav-logo');
        const right = document.getElementById('nav-right');
        const controls = document.getElementById('nav-controls');

        if (nav) nav.classList.remove('opacity-0');
        if (left) left.classList.replace('-translate-x-[150%]', 'translate-x-0');
        if (center) center.classList.replace('-translate-y-[150%]', 'translate-y-0');
        if (right) right.classList.replace('translate-x-[150%]', 'translate-x-0');
        if (controls) controls.classList.replace('translate-x-[150%]', 'translate-x-0');
    }, 800);

    // --- 3. Process Reveal: Bento Horizon ---
    const processTrigger = document.getElementById('process-trigger');
    const pItems = [
        document.getElementById('card-1'),
        document.getElementById('card-2'),
        document.getElementById('card-3')
    ];

    // Reveal cards once they enter the viewport
    const processObserver = new IntersectionObserver((entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
            // Slide in from left, staggered via CSS transition-delay
            pItems.forEach((item) => {
                if (!item) return;
                item.classList.add('in-view');
            });
        } else {
            // Instantly reset (no transition) so replay is smooth
            pItems.forEach((item) => {
                if (!item) return;
                const delay = item.style.transitionDelay;
                item.style.transitionDelay = '0s';
                item.style.transition = 'none';
                item.classList.remove('in-view');
                // Re-enable transitions after the frame has painted
                setTimeout(() => {
                    item.style.transition = '';
                    item.style.transitionDelay = delay;
                }, 50);
            });
        }
    }, { threshold: 0.25 });

    if (processTrigger) processObserver.observe(processTrigger);

    // --- Scroll-driven sequential glow on process cards (looping) ---
    let glowTimeouts = [];
    let lastLitIndex = -1;
    let glowLoopActive = false;

    function clearGlow() {
        glowTimeouts.forEach(t => clearTimeout(t));
        glowTimeouts = [];
        pItems.forEach(c => c && c.classList.remove('card-lit'));
        lastLitIndex = -1;
        glowLoopActive = false;
    }

    function runGlowSequence() {
        if (glowLoopActive) return;
        glowLoopActive = true;
        pItems.forEach(c => c && c.classList.remove('card-lit'));
        lastLitIndex = -1;

        pItems.forEach((card, i) => {
            const t = setTimeout(() => {
                if (!card) return;
                // Remove previous
                if (i > 0 && pItems[i - 1]) pItems[i - 1].classList.remove('card-lit');
                card.classList.add('card-lit');
                lastLitIndex = i;
                // After last card, fade it out
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

    // Trigger glow when process section is in view on scroll
    let glowObserverActive = false;
    const glowObserver = new IntersectionObserver((entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !glowLoopActive) {
            runGlowSequence();
        } else if (!entry.isIntersecting) {
            clearGlow();
        }
    }, { threshold: 0.3 });
    if (processTrigger) glowObserver.observe(processTrigger);
    
    // --- 5. Toggle Expandable Projects ---
    const toggleProjectsBtn = document.getElementById('toggle-more-projects');
    const moreProjectsContainer = document.getElementById('more-projects');
    
    if (toggleProjectsBtn && moreProjectsContainer) {
        toggleProjectsBtn.addEventListener('click', () => {
            const isExpanded = moreProjectsContainer.classList.contains('expanded');
            const textSpan = document.getElementById('toggle-text');
            const iconSpan = document.getElementById('toggle-icon');
            
            if (isExpanded) {
                // Collapse section
                moreProjectsContainer.classList.remove('expanded');
                if (textSpan) textSpan.innerText = toggleProjectsBtn.getAttribute('data-text-more');
                if (iconSpan) {
                    iconSpan.classList.remove('rotate-180');
                }
                
                // Scroll back to portfolio header smoothly
                const portfolioHeader = document.getElementById('portfolio');
                if (portfolioHeader) {
                    portfolioHeader.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                // Expand section
                moreProjectsContainer.classList.add('expanded');
                if (textSpan) textSpan.innerText = toggleProjectsBtn.getAttribute('data-text-less');
                if (iconSpan) {
                    iconSpan.classList.add('rotate-180');
                }
                
                // Trigger reveal active class for the newly shown cards
                setTimeout(() => {
                    const newReveals = moreProjectsContainer.querySelectorAll('.reveal');
                    newReveals.forEach(r => r.classList.add('active'));
                }, 200);
            }
        });
    }

    // --- 6. Legal Modals Logic ---
    const modalWrappers = document.querySelectorAll('.modal-wrapper');
    const modalTriggers = document.querySelectorAll('[data-modal]');
    const closeButtons = document.querySelectorAll('.modal-close');

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = trigger.getAttribute('data-modal');
            const targetModal = document.getElementById(modalId);
            if (targetModal) {
                targetModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    function closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal-wrapper');
            if (modal) closeModal(modal);
        });
    });

    modalWrappers.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                closeModal(modal);
            }
        });
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal-wrapper.active');
            if (activeModal) closeModal(activeModal);
        }
    });

    // --- 7. Cookie Banner Logic ---
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptAllBtn = document.getElementById('cookie-accept-all');
    const rejectBtn = document.getElementById('cookie-reject');
    const configureBtn = document.getElementById('cookie-configure');

    // Show cookie banner if preference not set in localStorage
    if (cookieBanner && !localStorage.getItem('cookie-preference')) {
        setTimeout(() => {
            cookieBanner.classList.add('active');
        }, 2000);
    }

    function saveCookiePreference(pref) {
        localStorage.setItem('cookie-preference', pref);
        if (cookieBanner) {
            cookieBanner.classList.add('slide-down');
            setTimeout(() => {
                cookieBanner.classList.remove('active', 'slide-down');
            }, 500);
        }
    }

    if (acceptAllBtn) {
        acceptAllBtn.addEventListener('click', () => {
            saveCookiePreference('accepted-all');
        });
    }

    if (rejectBtn) {
        rejectBtn.addEventListener('click', () => {
            saveCookiePreference('rejected-non-essential');
        });
    }

    if (configureBtn) {
        configureBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Open cookies configuration modal (reuses the cookies legal modal)
            const cookiesModal = document.getElementById('cookies');
            if (cookiesModal) {
                cookiesModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    }

    // --- 8. Social Icons Action (Instagram Alert) ---
    const instagramBtns = document.querySelectorAll('.instagram-trigger');
    instagramBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            showCustomToast();
        });
    });

    function showCustomToast() {
        // Check if toast already exists
        let toast = document.getElementById('custom-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'custom-toast';
            toast.className = 'fixed bottom-4 left-4 right-4 md:left-auto md:bottom-8 md:right-8 z-50 px-6 py-4 rounded-2xl bg-black/85 border border-[#8A733E]/40 backdrop-blur-xl shadow-[0_10px_50px_rgba(0,0,0,0.5)] text-white flex items-center gap-3 transition-all duration-500 translate-y-20 opacity-0 pointer-events-none';
            document.body.appendChild(toast);
        }
        
        const isEnglish = document.documentElement.lang === 'en' || window.location.pathname.includes('-en');
        const title = isEnglish ? 'Instagram MYNEXT' : 'Instagram MYNEXT';
        const message = isEnglish ? 'We are working on this page, we will launch it very soon.' : 'Estamos trabajando en la página, la lanzaremos muy pronto.';
        
        toast.innerHTML = `
            <span class="material-symbols-outlined text-gradient-gold text-2xl">construction</span>
            <div class="flex flex-col text-left">
                <span class="font-headline font-bold text-xs tracking-wider uppercase text-[#e0c387]">${title}</span>
                <span class="font-body text-white/70 text-xs mt-0.5">${message}</span>
            </div>
        `;

        // Clear any active timeouts on the element
        if (toast.timeoutId) {
            clearTimeout(toast.timeoutId);
        }
        
        // Show animation
        setTimeout(() => {
            toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
            toast.classList.add('translate-y-0', 'opacity-100');
        }, 50);

        // Hide animation after 4 seconds
        toast.timeoutId = setTimeout(() => {
            toast.classList.remove('translate-y-0', 'opacity-100');
            toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
        }, 4000);
    }
});

// --- 4. Scroll Control ---
let lastScrollY = window.scrollY;
const nav = document.getElementById('nav-container');
const navL = document.getElementById('nav-left');
const navC = document.getElementById('nav-logo');
const navR = document.getElementById('nav-right');

function setNavAtTop() {
    nav.classList.remove('opacity-0', 'nav-compact');
    nav.classList.add('nav-at-top');
    // Show all elements fully
    navL.classList.replace('-translate-x-[150%]', 'translate-x-0');
    navC.classList.replace('-translate-y-[150%]', 'translate-y-0');
    navR.classList.replace('translate-x-[150%]', 'translate-x-0');
    navL.style.opacity = '1';
    navR.style.opacity = '1';
}

function setNavCompact() {
    // Show capsule but subtle — don't fly elements in, just fade the capsule
    nav.classList.remove('opacity-0', 'nav-at-top');
    nav.classList.add('nav-compact');
    // Keep menu items visible but slightly dimmed
    navL.classList.replace('-translate-x-[150%]', 'translate-x-0');
    navC.classList.replace('-translate-y-[150%]', 'translate-y-0');
    navR.classList.replace('translate-x-[150%]', 'translate-x-0');
}

function hideNav() {
    nav.classList.add('opacity-0');
    nav.classList.remove('nav-compact', 'nav-at-top');
}

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY < 80) {
        // At the top — full header
        setNavAtTop();
    } else {
        // Scrolling up or down mid-page — show compact, non-intrusive capsule
        setNavCompact();
    }

    lastScrollY = currentScrollY;
}, { passive: true });

// --- 9. Neon Viewport Frame Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const neonFrame = document.getElementById('neon-frame');
    if (neonFrame) {
        // Initial intro fade-in
        setTimeout(() => {
            if (window.scrollY < 50) {
                neonFrame.classList.add('neon-frame-active');
            }
        }, 1000);

        // Scroll listener to toggle frame at top only
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            const threshold = 50;
            const isAtTop = scrollY < threshold;

            if (isAtTop) {
                neonFrame.classList.add('neon-frame-active');
            } else {
                neonFrame.classList.remove('neon-frame-active');
            }
        }, { passive: true });
    }

    // AJAX Email Form Submission
    const contactForm = document.getElementById('email-contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = contactForm.querySelector('input[name="email"]');
            const messageInput = contactForm.querySelector('textarea[name="message"]');
            const submitBtn = contactForm.querySelector('.form-submit-btn');
            const btnText = submitBtn.querySelector('.btn-text');
            
            if (!emailInput.value) return;

            // Save original styles/text
            const originalText = btnText ? btnText.textContent : submitBtn.textContent;
            
            // Disable and show sending state
            submitBtn.disabled = true;
            emailInput.disabled = true;
            if (messageInput) messageInput.disabled = true;
            
            const isEs = document.documentElement.lang === 'es';
            if (btnText) {
                btnText.textContent = isEs ? 'Enviando...' : 'Sending...';
            } else {
                submitBtn.textContent = isEs ? 'Enviando...' : 'Sending...';
            }

            const subject = isEs ? '¡Te damos la bienvenida a MYNEXT!' : 'Welcome to MYNEXT!';
            
            // Compose the message containing the user's inquiry details
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
                    if (btnText) {
                        btnText.textContent = isEs ? '¡Enviado! ✓' : 'Sent ✓';
                    } else {
                        submitBtn.textContent = isEs ? '¡Enviado! ✓' : 'Sent ✓';
                    }
                    submitBtn.style.backgroundColor = '#00F2FF';
                    submitBtn.style.boxShadow = '0 0 20px #00F2FF';
                    
                    emailInput.value = '';
                    if (messageInput) messageInput.value = '';
                    
                    // Hide the form cleanly with transition
                    const formElement = contactForm;
                    if (formElement) {
                        formElement.style.transition = 'all 0.5s ease';
                        formElement.style.opacity = '0';
                        formElement.style.transform = 'scale(0.9)';
                        setTimeout(() => {
                            formElement.style.display = 'none';
                            
                            // Create and display the success message
                            const successMsg = document.createElement('div');
                            successMsg.className = 'text-electric-cyan font-headline text-sm md:text-base tracking-wider font-semibold animate-pulse mt-4 text-center px-4';
                            successMsg.style.textShadow = '0 0 10px rgba(0, 242, 255, 0.4)';
                            successMsg.textContent = isEs 
                                ? 'Gracias por registrarte. Revisa tu Gmail, ¡tienes una grasa esperándote! 😏' 
                                : 'Thanks for registering. Check your Gmail, something fire is waiting for you! 😏';
                            

                            
                            const formParent = formElement.parentElement;
                            if (formParent) {
                                formParent.appendChild(successMsg);
                            }
                        }, 500);
                    }
                } else {
                    if (btnText) {
                        btnText.textContent = 'Error';
                    } else {
                        submitBtn.textContent = 'Error';
                    }
                    setTimeout(() => {
                        if (btnText) {
                            btnText.textContent = originalText;
                        } else {
                            submitBtn.textContent = originalText;
                        }
                        submitBtn.disabled = false;
                        emailInput.disabled = false;
                        if (messageInput) messageInput.disabled = false;
                    }, 2000);
                }
            })
            .catch(error => {
                if (btnText) {
                    btnText.textContent = 'Error';
                } else {
                    submitBtn.textContent = 'Error';
                }
                setTimeout(() => {
                    if (btnText) {
                        btnText.textContent = originalText;
                    } else {
                        submitBtn.textContent = originalText;
                    }
                    submitBtn.disabled = false;
                    emailInput.disabled = false;
                    if (messageInput) messageInput.disabled = false;
                }, 2000);
            });
        });
    }

    // --- 8. Plans Button: Page Transition Overlay ---
    const overlay = document.getElementById('page-transition-overlay');
    if (overlay) {
        // Ensure overlay is hidden on page load / return
        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');

        window.addEventListener('pageshow', function(event) {
            overlay.classList.remove('active');
            overlay.setAttribute('aria-hidden', 'true');
        });

        // Select the plans button(s) - the animated-button that links to the planes page
        const plansBtns = document.querySelectorAll('a.animated-button[href*="planes"]');
        plansBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const destination = this.getAttribute('href');

                // Show the overlay
                overlay.classList.add('active');
                overlay.setAttribute('aria-hidden', 'false');

                // After 2.5s navigate to the destination
                setTimeout(() => {
                    window.location.href = destination;
                }, 2500);
            });
        });
    }

    // --- Mobile Menu Toggle ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileDropdown = document.getElementById('mobile-dropdown');
    const mobileNavShell = document.getElementById('mobile-nav-shell');

    function openMobileMenu() {
        if (!mobileDropdown || !mobileMenuBtn) return;
        mobileDropdown.classList.add('is-open');
        mobileNavShell?.classList.add('menu-open');
        mobileMenuBtn.classList.add('is-active');
        mobileMenuBtn.setAttribute('aria-expanded', 'true');
        mobileDropdown.setAttribute('aria-hidden', 'false');
        document.body.classList.add('mobile-menu-open');
    }

    function closeMobileMenu() {
        if (!mobileDropdown || !mobileMenuBtn) return;
        mobileDropdown.classList.remove('is-open');
        mobileNavShell?.classList.remove('menu-open');
        mobileMenuBtn.classList.remove('is-active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileDropdown.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('mobile-menu-open');
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

        mobileDropdown.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });

        document.addEventListener('click', (e) => {
            if (!mobileDropdown.classList.contains('is-open')) return;
            const target = e.target;
            if (!mobileDropdown.contains(target) && !mobileMenuBtn.contains(target) && !mobileNavShell?.contains(target)) {
                closeMobileMenu();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMobileMenu();
        });
    }

    // --- 10. Shopping Cart Modal Logic ---
    const cartBtn = document.getElementById('cart-btn');
    const cartModal = document.getElementById('cart-modal');
    const cartModalCard = document.getElementById('cart-modal-card');
    const cartCloseBtn = document.getElementById('cart-close-btn');
    const cartConfirmBtn = document.getElementById('cart-confirm-btn');

    if (cartBtn && cartModal && cartModalCard) {
        function openCartModal() {
            cartModal.classList.remove('pointer-events-none', 'opacity-0');
            cartModal.classList.add('opacity-100');
            cartModalCard.classList.remove('scale-95', 'opacity-0');
            cartModalCard.classList.add('scale-100', 'opacity-100');
            document.body.style.overflow = 'hidden';
        }

        function closeCartModal() {
            cartModal.classList.add('pointer-events-none', 'opacity-0');
            cartModal.classList.remove('opacity-100');
            cartModalCard.classList.add('scale-95', 'opacity-0');
            cartModalCard.classList.remove('scale-100', 'opacity-100');
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
});
