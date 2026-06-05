import os

# 1. INDEX-EN.HTML
fpath_idx = 'index-en.html'
with open(fpath_idx, 'r', encoding='utf-8') as f:
    idx = f.read()

trans_idx = {
    'TRANSPARENCIA & RESULTADOS': 'TRANSPARENCY & RESULTS',
    'DISEÑOS EXCLUSIVOS CON TARIFAS A TU MEDIDA': 'EXCLUSIVE DESIGNS WITH CUSTOM PRICING',
    'Descubre nuestros planes de arquitectura digital y elige la opción que mejor se adapte a los objetivos de tu negocio.': 'Discover our digital architecture plans and choose the perfect fit for your business goals.',
    'PLANES 2026 &rarr;': '2026 PLANS &rarr;',
    'PLANES 2026 ->': '2026 PLANS &rarr;',
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
    'Todos los derechos reservados.': 'All rights reserved.',
    'Políticas de Privacidad': 'Privacy Policy',
    'Términos de Servicio': 'Terms of Service',
    'VER PLANES Y PRECIOS': 'VIEW PLANS AND PRICING',
    'Volver arriba': 'Back to top',
    '¿QUÉ ES MYNEXT?<br>DESCÚBRELO ABAJO': 'WHAT IS MYNEXT?<br>DISCOVER BELOW',
    'NUESTRO PROCESO CREATIVO': 'OUR CREATIVE PROCESS',
    'Definimos el ADN de tu proyecto. Trazamos la estrategia técnica y visual para que tu marca lidere su nicho digital.': 'We define your project\'s DNA. We outline the technical and visual strategy so your brand dominates its digital niche.',
    'Construimos con precisión quirúrgica. Código limpio y diseño exclusivo fusionados en una experiencia de alta gama.': 'We build with surgical precision. Clean code and exclusive design merged into a high-end experience.',
    'Lanzamiento y optimización continua. Tu plataforma no solo nace, sino que evoluciona para dominar el mercado.': 'Launch and continuous optimization. Your platform doesn\'t just launch; it evolves to dominate the market.'
}

for es, en in trans_idx.items():
    idx = idx.replace(es, en)

with open(fpath_idx, 'w', encoding='utf-8') as f:
    f.write(idx)


# 2. PLANES/INDEX-EN.HTML
fpath_pln = 'planes/index-en.html'
if os.path.exists(fpath_pln):
    with open(fpath_pln, 'r', encoding='utf-8') as f:
        pln = f.read()

    trans_pln = {
        'Volver al Inicio': 'Back to Home',
        'PLANES DE ARQUITECTURA DIGITAL 2026': 'DIGITAL ARCHITECTURE PLANS 2026',
        'Creamos páginas web impactantes, rápidas y optimizadas para que tu negocio destaque en internet y consigas más clientes.': 'We create impactful, fast, and optimized websites so your business stands out on the internet and you get more clients.',
        'OFERTA DE LANZAMIENTO - HASTA EL 30 DE JUNIO': 'LAUNCH OFFER - UNTIL JUNE 30TH',
        
        # Correcciones específicas de la página de planes nuevas
        'PLANES DE DISEÑO WEB PROFESIONAL Y A MEDIDA': 'PROFESSIONAL & CUSTOM WEB DESIGN PLANS',
        'ESENCIAL': 'ESSENTIAL',
        'ÉLITE': 'ELITE',
        'MÁS SOLICITADO': 'MOST POPULAR',
        
        # Características Esencial
        'Diseño web profesional (2-3 secciones)': 'Professional web design (2-3 sections)',
        'Vinculación con Google Maps': 'Google Maps Integration',
        'Dominio y Hosting básico incluido': 'Domain & Basic Hosting Included',
        'Gestión integral de Dominio': 'Comprehensive Domain Management',
        'Estrategia de Perfil Profesional': 'Professional Profile Strategy',
        
        # Características adicionales que puedan estar
        'Optimización Móvil Perfecta': 'Perfect Mobile Optimization',
        'Formulario de Contacto Funcional': 'Functional Contact Form',
        'Botón de WhatsApp Flotante': 'Floating WhatsApp Button',
        'Carga Ultrarrápida': 'Ultra-fast Loading',
        'Revisión y ajustes': 'Review and adjustments',
        'Soporte Técnico de 1 Mes': '1 Month Technical Support',
        
        # Elite
        'E-Commerce y Funciones Avanzadas': 'E-Commerce and Advanced Features',
        'Diseño Exclusivo y Complejo': 'Exclusive and Complex Design',
        'Secciones Ilimitadas': 'Unlimited Sections',
        'Tienda Online (Hasta 50 productos)*': 'Online Store (Up to 50 products)*',
        'Panel Autogestionable': 'Self-manageable Panel',
        'Pasarela de Pagos (Stripe/PayPal)': 'Payment Gateway (Stripe/PayPal)',
        'SEO Básico Integrado': 'Integrated Basic SEO',
        'Animaciones Premium (Scroll)': 'Premium Animations (Scroll)',
        'Soporte Técnico Prioritario': 'Priority Technical Support',
        
        # General y Textos
        'Para marcas que buscan una presencia impecable.': 'For brands seeking an impeccable presence.',
        'Desde': 'From',
        'Pago único': 'One-time payment',
        'INICIAR PROYECTO': 'START PROJECT',
        'La solución total para dominar tu sector.': 'The total solution to dominate your industry.',
        'CONSULTAR PRECIO': 'REQUEST QUOTE',
        'Todos los planes incluyen Hosting Básico y Dominio (.com o .es) por el primer año.': 'All plans include Basic Hosting and Domain (.com or .es) for the first year.',
        '*El Plan Élite se cotiza a medida según las necesidades exactas del e-commerce o plataforma.': '*The Elite Plan is custom quoted based on exact e-commerce or platform needs.',
        '¿Tienes dudas o necesitas algo más específico?': 'Have questions or need something more specific?',
        'Contáctanos y prepararemos una propuesta a tu medida.': 'Contact us and we will prepare a custom proposal.',
        'ESCRÍBENOS AHORA': 'MESSAGE US NOW',
        'Diseño web profesional adaptado a tu marca (Landing Page + Servicios + Contacto)': 'Professional web design adapted to your brand (Landing Page + Services + Contact)',
        'Adaptación perfecta a dispositivos móviles y tablets': 'Perfect adaptation to mobile devices and tablets',
        'Optimización de velocidad y SEO Básico': 'Speed optimization and Basic SEO',
        'Inclusión de mapa de Google My Business para SEO local': 'Google My Business map integration for local SEO',
        'Dominio .com o .es + Hosting profesional (Primer año)': 'Domain .com or .es + Professional Hosting (First year)',
        'Nos encargamos de las DNS, correos corporativos y certificados SSL': 'We handle DNS, corporate emails, and SSL certificates',
        'Soporte y ajustes menores post-lanzamiento (1 Mes)': 'Support and minor post-launch adjustments (1 Month)'
    }

    for es, en in trans_pln.items():
        pln = pln.replace(es, en)

    with open(fpath_pln, 'w', encoding='utf-8') as f:
        f.write(pln)

print("Deep translation completed.")
