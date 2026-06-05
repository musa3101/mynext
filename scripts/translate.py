import os

# --- INDEX.HTML TRANSLATION ---
with open('index.html', 'r', encoding='utf-8') as f:
    idx = f.read()

# Add language toggle to original index.html (Desktop)
if '<!-- Selector de Idioma Desktop -->' not in idx:
    idx = idx.replace(
        '<a href="#contacto" class="text-xs tracking-[0.3em] text-white/60 hover:text-electric-cyan font-headline uppercase transition-colors">Contacto</a>',
        '<a href="#contacto" class="text-xs tracking-[0.3em] text-white/60 hover:text-electric-cyan font-headline uppercase transition-colors">Contacto</a>\n                <!-- Selector de Idioma Desktop -->\n                <div class="flex items-center space-x-2 text-[10px] tracking-[0.2em] font-headline ml-8">\n                    <span class="text-electric-cyan font-bold cursor-default">ES</span>\n                    <span class="text-white/30">|</span>\n                    <a href="index-en.html" class="text-white/50 hover:text-electric-cyan transition-colors">EN</a>\n                </div>'
    )
# Add language toggle to original index.html (Mobile)
if '<!-- Selector de Idioma Móvil -->' not in idx:
    idx = idx.replace(
        '<a href="#contacto" class="text-xl tracking-[0.3em] text-white/80 hover:text-electric-cyan font-headline uppercase transition-colors">Contacto</a>',
        '<a href="#contacto" class="text-xl tracking-[0.3em] text-white/80 hover:text-electric-cyan font-headline uppercase transition-colors">Contacto</a>\n                <!-- Selector de Idioma Móvil -->\n                <div class="flex items-center justify-center space-x-4 text-base tracking-[0.3em] font-headline mt-8 pt-8 border-t border-white/5 w-1/2">\n                    <span class="text-electric-cyan font-bold cursor-default">ES</span>\n                    <span class="text-white/30">|</span>\n                    <a href="index-en.html" class="text-white/50 hover:text-electric-cyan transition-colors">EN</a>\n                </div>'
    )

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(idx)

# Generate index-en.html
idx_en = idx.replace('lang="es"', 'lang="en"')
idx_en = idx_en.replace('<span class="text-electric-cyan font-bold cursor-default">ES</span>', '<a href="index.html" class="text-white/50 hover:text-electric-cyan transition-colors">ES</a>')
idx_en = idx_en.replace('<a href="index-en.html" class="text-white/50 hover:text-electric-cyan transition-colors">EN</a>', '<span class="text-electric-cyan font-bold cursor-default">EN</span>')
idx_en = idx_en.replace('href="planes/"', 'href="planes/index-en.html"')
idx_en = idx_en.replace('href="./planes/"', 'href="./planes/index-en.html"')

translations_index = {
    'Inicio': 'Home',
    '¿MYNEXT?': 'ABOUT',
    'Portfolio': 'Portfolio',
    'Contacto': 'Contact',
    'EST. 2026': 'EST. 2026',
    '¿QUÉ ES MYNEXT?<br>DESCÚBRELO ABAJO': 'WHAT IS MYNEXT?<br>DISCOVER BELOW',
    'LA ARQUITECTURA DIGITAL QUE TU EMPRESA MERECE': 'THE DIGITAL ARCHITECTURE YOUR BUSINESS DESERVES',
    'En <span class="text-electric-cyan font-medium">MYNEXT</span>, nos dedicamos a transformar tu visión en una plataforma digital única. Ayudamos a tu empresa a destacar en internet con un diseño limpio y moderno, diseñado para atraer a más clientes. Nos encargamos de todo el proceso técnico para que tu web sea rápida, eficiente y funcione para ti sin complicaciones.': 'At <span class="text-electric-cyan font-medium">MYNEXT</span>, we are dedicated to transforming your vision into a unique digital platform. We help your business stand out on the internet with a clean and modern design, crafted to attract more clients. We handle the entire technical process so your website is fast, efficient, and works for you flawlessly.',
    'NUESTRO PROCESO CREATIVO': 'OUR CREATIVE PROCESS',
    'Consultoría': 'Consulting',
    'Definimos el ADN de tu proyecto. Trazamos la estrategia técnica y visual para que tu marca lidere su nicho digital.': 'We define your project\'s DNA. We outline the technical and visual strategy so your brand dominates its digital niche.',
    'Arquitectura': 'Architecture',
    'Construimos con precisión quirúrgica. Código limpio y diseño exclusivo fusionados en una experiencia de alta gama.': 'We build with surgical precision. Clean code and exclusive design merged into a high-end experience.',
    'Despegue': 'Launch',
    'Lanzamiento y optimización continua. Tu plataforma no solo nace, sino que evoluciona para dominar el mercado.': 'Launch and continuous optimization. Your platform doesn\'t just launch; it evolves to dominate the market.',
    'DISEÑOS ESTELARES': 'STELLAR DESIGNS',
    'EXPLORA EL PORTFOLIO DE ALTO RENDIMIENTO': 'EXPLORE THE HIGH-PERFORMANCE PORTFOLIO',
    'ARQUITECTURA WEB': 'WEB ARCHITECTURE',
    'Landing Page Corporativa': 'Corporate Landing Page',
    'ECOMMERCE': 'E-COMMERCE',
    'Tienda Online Premium': 'Premium Online Store',
    'Más proyectos en desarrollo...': 'More projects in development...',
    'INICIA TU TRANSFORMACIÓN DIGITAL': 'START YOUR DIGITAL TRANSFORMATION',
    'Estás a un paso de elevar tu presencia online al máximo nivel. Contacta ahora y empecemos a construir.': 'You are one step away from elevating your online presence to the highest level. Contact us now and let\'s start building.',
    'HABLAR POR WHATSAPP': 'CHAT ON WHATSAPP',
    'ENVIAR EMAIL': 'SEND EMAIL',
    'hola@mynext.es': 'hello@mynext.es',
    'Todos los derechos reservados.': 'All rights reserved.',
    'Políticas de Privacidad': 'Privacy Policy',
    'Términos de Servicio': 'Terms of Service',
    'VER PLANES Y PRECIOS': 'VIEW PLANS AND PRICING',
    'Hola%2C%20estoy%20interesado%20en%20los%20planes%20de%20arquitectura%20digital': 'Hello%2C%20I%20am%20interested%20in%20the%20digital%20architecture%20plans'
}

for es, en in translations_index.items():
    idx_en = idx_en.replace(es, en)

with open('index-en.html', 'w', encoding='utf-8') as f:
    f.write(idx_en)

# --- PLANES INDEX.HTML TRANSLATION ---
planes_path = 'planes/index.html'
planes_en_path = 'planes/index-en.html'

if os.path.exists(planes_path):
    with open(planes_path, 'r', encoding='utf-8') as f:
        pln = f.read()

    # Add toggle to planes/index.html
    if '<!-- Selector de Idioma Desktop -->' not in pln:
        pln = pln.replace(
            '<a href="../index.html#contacto" class="text-xs tracking-[0.3em] text-white/60 hover:text-electric-cyan font-headline uppercase transition-colors">Contacto</a>',
            '<a href="../index.html#contacto" class="text-xs tracking-[0.3em] text-white/60 hover:text-electric-cyan font-headline uppercase transition-colors">Contacto</a>\n                <!-- Selector de Idioma Desktop -->\n                <div class="flex items-center space-x-2 text-[10px] tracking-[0.2em] font-headline ml-8">\n                    <span class="text-electric-cyan font-bold cursor-default">ES</span>\n                    <span class="text-white/30">|</span>\n                    <a href="index-en.html" class="text-white/50 hover:text-electric-cyan transition-colors">EN</a>\n                </div>'
        )
    if '<!-- Selector de Idioma Móvil -->' not in pln:
        pln = pln.replace(
            '<a href="../index.html#contacto" class="text-xl tracking-[0.3em] text-white/80 hover:text-electric-cyan font-headline uppercase transition-colors">Contacto</a>',
            '<a href="../index.html#contacto" class="text-xl tracking-[0.3em] text-white/80 hover:text-electric-cyan font-headline uppercase transition-colors">Contacto</a>\n                <!-- Selector de Idioma Móvil -->\n                <div class="flex items-center justify-center space-x-4 text-base tracking-[0.3em] font-headline mt-8 pt-8 border-t border-white/5 w-1/2">\n                    <span class="text-electric-cyan font-bold cursor-default">ES</span>\n                    <span class="text-white/30">|</span>\n                    <a href="index-en.html" class="text-white/50 hover:text-electric-cyan transition-colors">EN</a>\n                </div>'
        )

    with open(planes_path, 'w', encoding='utf-8') as f:
        f.write(pln)

    pln_en = pln.replace('lang="es"', 'lang="en"')
    pln_en = pln_en.replace('<span class="text-electric-cyan font-bold cursor-default">ES</span>', '<a href="index.html" class="text-white/50 hover:text-electric-cyan transition-colors">ES</a>')
    pln_en = pln_en.replace('<a href="index-en.html" class="text-white/50 hover:text-electric-cyan transition-colors">EN</a>', '<span class="text-electric-cyan font-bold cursor-default">EN</span>')
    pln_en = pln_en.replace('href="../index.html"', 'href="../index-en.html"')
    pln_en = pln_en.replace('href="../"', 'href="../index-en.html"')

    translations_planes = {
        'Volver al Inicio': 'Back to Home',
        'PLANES DE ARQUITECTURA DIGITAL 2026': 'DIGITAL ARCHITECTURE PLANS 2026',
        'Creamos páginas web impactantes, rápidas y optimizadas para que tu negocio destaque en internet y consigas más clientes.': 'We create impactful, fast, and optimized websites so your business stands out on the internet and you get more clients.',
        'OFERTA DE LANZAMIENTO - HASTA EL 30 DE JUNIO': 'LAUNCH OFFER - UNTIL JUNE 30TH',
        'PLAN ESENCIAL': 'ESSENTIAL PLAN',
        'Para marcas que buscan una presencia impecable.': 'For brands seeking an impeccable presence.',
        'Desde': 'From',
        'Pago único': 'One-time payment',
        'INICIAR PROYECTO': 'START PROJECT',
        'Diseño Minimalista a Medida': 'Custom Minimalist Design',
        'Hasta 4 secciones (Ej. Inicio, Servicios, Nosotros, Contacto)': 'Up to 4 sections (e.g., Home, Services, About, Contact)',
        'Optimización Móvil Perfecta': 'Perfect Mobile Optimization',
        'Formulario de Contacto Funcional': 'Functional Contact Form',
        'Botón de WhatsApp Flotante': 'Floating WhatsApp Button',
        'Carga Ultrarrápida': 'Ultra-fast Loading',
        'Revisión y ajustes': 'Review and adjustments',
        'Soporte Técnico de 1 Mes': '1 Month Technical Support',
        'PLAN ÉLITE': 'ELITE PLAN',
        'La solución total para dominar tu sector.': 'The total solution to dominate your industry.',
        'E-Commerce y Funciones Avanzadas': 'E-Commerce and Advanced Features',
        'Diseño Exclusivo y Complejo': 'Exclusive and Complex Design',
        'Secciones Ilimitadas': 'Unlimited Sections',
        'Tienda Online (Hasta 50 productos)*': 'Online Store (Up to 50 products)*',
        'Panel Autogestionable': 'Self-manageable Panel',
        'Pasarela de Pagos (Stripe/PayPal)': 'Payment Gateway (Stripe/PayPal)',
        'SEO Básico Integrado': 'Integrated Basic SEO',
        'Animaciones Premium (Scroll)': 'Premium Animations (Scroll)',
        'Soporte Técnico Prioritario': 'Priority Technical Support',
        'CONSULTAR PRECIO': 'REQUEST QUOTE',
        'Todos los planes incluyen Hosting Básico y Dominio (.com o .es) por el primer año.': 'All plans include Basic Hosting and Domain (.com or .es) for the first year.',
        '*El Plan Élite se cotiza a medida según las necesidades exactas del e-commerce o plataforma.': '*The Elite Plan is custom quoted based on exact e-commerce or platform needs.',
        '¿Tienes dudas o necesitas algo más específico?': 'Have questions or need something more specific?',
        'Contáctanos y prepararemos una propuesta a tu medida.': 'Contact us and we will prepare a custom proposal.',
        'ESCRÍBENOS AHORA': 'MESSAGE US NOW',
        'Hola%2C%20estoy%20interesado%20en%20el%20Plan%20Esencial': 'Hello%2C%20I%20am%20interested%20in%20the%20Essential%20Plan',
        'Hola%2C%20me%20gustar%C3%ADa%20cotizar%20el%20Plan%20%C3%89lite': 'Hello%2C%20I%20would%20like%20to%20quote%20the%20Elite%20Plan',
        'Hola%2C%20necesito%20un%20proyecto%20a%20medida': 'Hello%2C%20I%20need%20a%20custom%20project'
    }

    for es, en in translations_planes.items():
        pln_en = pln_en.replace(es, en)

    with open(planes_en_path, 'w', encoding='utf-8') as f:
        f.write(pln_en)

print("Translation completed.")
