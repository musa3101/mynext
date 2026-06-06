import os
import re

def replace_fuzzy(content, en_text, es_text):
    # Normalize the search text to find matches ignoring whitespace differences
    words = en_text.split()
    if not words:
        return content
    
    # Escape words for regex and join with \s+
    pattern_parts = []
    for w in words:
        escaped = re.escape(w)
        pattern_parts.append(escaped)
    
    pattern = r'\s+'.join(pattern_parts)
    
    try:
        matches = list(re.finditer(pattern, content))
        if not matches:
            if en_text in content:
                return content.replace(en_text, es_text)
            return content
            
        for match in reversed(matches):
            start, end = match.span()
            content = content[:start] + es_text + content[end:]
    except re.error:
        if en_text in content:
            return content.replace(en_text, es_text)
    return content

# 1. TRANSLATE index-en.html -> index.html
with open('index-en.html', 'r', encoding='utf-8') as f:
    en_content = f.read()

# Replace language tags and toggle
es_content = en_content.replace('lang="en"', 'lang="es"')

# Translate Language Flag Selection Widget
en_flag_widget = """    <!-- LANGUAGE_SELECTOR_START -->
    <div class="fixed top-6 right-6 z-50 flex items-center gap-2 bg-[#050505]/60 backdrop-blur-md border border-white/10 p-1.5 rounded-full shadow-lg pointer-events-auto">
        <a href="index.html" class="opacity-60 hover:opacity-100 transition-opacity flex" title="Español">
            <svg class="w-5 h-5 rounded-full overflow-hidden border border-white/10 hover:scale-110 transition-transform shadow-sm cursor-pointer" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                <rect width="30" height="7.5" fill="#c60b1e"/>
                <rect y="7.5" width="30" height="15" fill="#ffc400"/>
                <rect y="22.5" width="30" height="7.5" fill="#c60b1e"/>
            </svg>
        </a>
        <span class="w-[1px] h-3 bg-white/20"></span>
        <a href="index-en.html" class="opacity-100 flex" title="English">
            <svg class="w-5 h-5 rounded-full overflow-hidden border border-electric-cyan/40 hover:scale-110 transition-transform shadow-sm cursor-pointer" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                <rect width="30" height="30" fill="#012169"/>
                <path d="M0,0 L30,30 M30,0 L0,30" stroke="#fff" stroke-width="4"/>
                <path d="M0,0 L30,30 M30,0 L0,30" stroke="#c8102e" stroke-width="1.5"/>
                <path d="M15,0 V30 M0,15 H30" stroke="#fff" stroke-width="6"/>
                <path d="M15,0 V30 M0,15 H30" stroke="#c8102e" stroke-width="4"/>
            </svg>
        </a>
    </div>
    <!-- LANGUAGE_SELECTOR_END -->"""

es_flag_widget = """    <!-- LANGUAGE_SELECTOR_START -->
    <div class="fixed top-6 right-6 z-50 flex items-center gap-2 bg-[#050505]/60 backdrop-blur-md border border-white/10 p-1.5 rounded-full shadow-lg pointer-events-auto">
        <a href="index.html" class="opacity-100 flex" title="Español">
            <svg class="w-5 h-5 rounded-full overflow-hidden border border-electric-cyan/40 hover:scale-110 transition-transform shadow-sm cursor-pointer" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                <rect width="30" height="7.5" fill="#c60b1e"/>
                <rect y="7.5" width="30" height="15" fill="#ffc400"/>
                <rect y="22.5" width="30" height="7.5" fill="#c60b1e"/>
            </svg>
        </a>
        <span class="w-[1px] h-3 bg-white/20"></span>
        <a href="index-en.html" class="opacity-60 hover:opacity-100 transition-opacity flex" title="English">
            <svg class="w-5 h-5 rounded-full overflow-hidden border border-white/10 hover:scale-110 transition-transform shadow-sm cursor-pointer" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                <rect width="30" height="30" fill="#012169"/>
                <path d="M0,0 L30,30 M30,0 L0,30" stroke="#fff" stroke-width="4"/>
                <path d="M0,0 L30,30 M30,0 L0,30" stroke="#c8102e" stroke-width="1.5"/>
                <path d="M15,0 V30 M0,15 H30" stroke="#fff" stroke-width="6"/>
                <path d="M15,0 V30 M0,15 H30" stroke="#c8102e" stroke-width="4"/>
            </svg>
        </a>
    </div>
    <!-- LANGUAGE_SELECTOR_END -->"""

es_content = es_content.replace(en_flag_widget, es_flag_widget)

# Translations dictionary for index page
translations_index = {
    # SEO & Header
    'MYNEXT - Architecture Digital Premium | Musa': 'MYNEXT - Arquitectura Digital Premium | Musa',
    'Transformamos tu visión en una identidad digital líquida y sofisticada.': 'Transformamos tu visión en una identidad digital líquida y sofisticada.',
    'Diseño y desarrollo de experiencias digitales exclusivas. Elevamos tu marca con arquitectura digital premium y diseño de alta fidelidad.': 'Diseño y desarrollo de experiencias digitales exclusivas. Elevamos tu marca con arquitectura digital premium y diseño de alta fidelidad.',
    'Home': 'Inicio',
    'ABOUT': 'Nosotros',
    'Portfolio': 'Portfolio',
    'Contact': 'Contacto',

    # Hero
    'WHAT IS MYNEXT?<br>DISCOVER BELOW': '¿QUÉ ES MYNEXT?<br>DESCÚBRELO ABAJO',

    # Nosotros Section
    'PROFESSIONAL WEBSITES. CREATED BY MUSA, DESIGNED BY MYNEXT': 'PÁGINAS WEB PROFESIONALES. CREADAS POR MUSA, DISEÑADAS POR MYNEXT',
    'Hello! I am Musa, the mind behind <span class="text-electric-cyan font-medium">MYNEXT</span>. More than an agency, I am your ally in the digital world. I specialize in designing and developing custom websites, focusing on a clean and professional style that turns your visitors into clients. You provide the vision; I handle the entire technical architecture so your business stands out, hassle-free and with maximum efficiency.': '¡Hola! Soy Musa, la mente detrás de <span class="text-electric-cyan font-medium">MYNEXT</span>. Más que una agencia, soy tu aliado en el mundo digital. Me dedico a diseñar y desarrollar páginas web a medida, enfocándome en un estilo limpio y profesional que convierta a tus visitantes en clientes. Tú pones la visión; yo me encargo de toda la arquitectura técnica para que tu negocio destaque, sin complicaciones y con la máxima eficiencia.',
    
    # Process
    'OUR CREATIVE PROCESS': 'NUESTRO PROCESO CREATIVO',
    'Consulting': 'Consultoría',
    'We define your project\'s DNA. We outline the technical and visual strategy so your brand dominates its digital niche.': 'Definimos el ADN de tu proyecto. Trazamos la estrategia técnica y visual para que tu marca lidere su nicho digital.',
    'Architecture': 'Arquitectura',
    'We build with surgical precision. Clean code and exclusive design merged into a high-end experience.': 'Construimos con precisión quirúrgica. Código limpio y diseño exclusivo fusionados en una experiencia de alta gama.',
    'Launch': 'Despegue',
    'Launch and continuous optimization. Your platform doesn\'t just launch; it evolves to dominate the market.': 'Lanzamiento y optimización continua. Tu plataforma no solo nace, sino que evoluciona para dominar el mercado.',
    'Your digital presence is not just an option, it is your greatest asset.': 'Tu presencia digital no es solo una opción, es tu mayor activo.',

    # Navigation guides
    'WANT TO SEE MY WORK?<br>DISCOVER IT BELOW': '¿QUIERES VER MI TRABAJO?<br>DESCÚBRELO ABAJO',
    'SHALL WE CONNECT YOUR NEXT STEP?<br>DISCOVER BELOW': '¿CONECTAMOS TU SIGUIENTE PASO?<br>DESCÚBRELO ABAJO',

    # Portfolio title and view links
    'My Work': 'Mi Trabajo',
    'View Website →': 'Ver Web →',
    'View Web →': 'Ver Web →',
    
    # Project 1: Blessed Barber Studio
    '"Musa perfectly understood the essence of our studio. He not only created a visually stunning website, but managed to translate the luxury and precision of each of our cuts into the digital world. He has elevated our brand to another level."': '"Musa entendió a la perfección la esencia de nuestro estudio. No solo creó una web visualmente imponente, sino que logró trasladar el lujo y la precisión de cada uno de nuestros cortes al mundo digital. Ha elevado nuestra marca a otro nivel."',
    '— Gustavo, Dueño': '— Gustavo, Dueño',
    '— Gustavo, Owner': '— Gustavo, Dueño',

    # Project 2: Cafetería Luna Llena
    '"Translating the essence and warmth of our venue to the digital environment seemed like a challenge, but Musa made it look easy. He designed an impeccable and sophisticated digital menu that is eye-catching and faithfully reflects who we are."': '"Llevar la esencia y la calidez de nuestro local al entorno digital parecía un reto, pero Musa lo hizo parecer fácil. Diseñó una carta digital impecable y sofisticada que entra por los ojos y refleja fielmente lo que somos."',
    '— Shamira, Propietaria': '— Shamira, Propietaria',
    '— Shamira, Owner': '— Shamira, Propietaria',

    # Project 3: Ecuaplac
    '"Ecuaplac redefines the concept of luxury renovations and drywalls for architecture in Mallorca. A fusion of Nordic minimalism and ultra-fluid interactive transitions."': '"Ecuaplac redefine el concepto de reformas de lujo y tabiquería seca para la arquitectura en Mallorca. Una fusión de minimalismo nórdico y transiciones interactivas ultra-fluidas."',
    '— Renovations & Construction': '— Reformas & Construcción',

    # Project 4: RBARI Restaurant
    '"Immersive digital experience for an authentic Bangladeshi restaurant. A visually rich design that conveys culture and flavors through a clean, high-contrast interface and high-quality photography."': '"Experiencia digital inmersiva para un auténtico restaurante de Bangladesh. Un diseño visualmente rico que transmite cultura y sabores a través de una interfaz limpia y de alto contraste y fotografía de alta calidad."',
    '— GASTRONOMIC WEB DESIGN': '— DISEÑO WEB GASTRONÓMICO',

    # Project 5: NEXT ERA
    '"Luxury caps and premium streetwear e-commerce. A high-contrast minimalist design and interactive animations focused on conversion and brand exclusivity."': '"Tienda online de gorras de lujo y streetwear premium. Un diseño minimalista de alto contraste y animaciones interactivas enfocadas en la conversión y la exclusividad de la marca."',
    '— E-Commerce Prototype': '— Prototipo E-Commerce',

    # Toggler
    'data-text-more="View More Projects"': 'data-text-more="Ver Más Proyectos"',
    'data-text-less="View Less Projects"': 'data-text-less="Ver Menos Proyectos"',
    'View More Projects': 'Ver Más Proyectos',

    # Contact Card
    'Exclusive Launch Edition': 'Edición Exclusiva Lanzamiento',
    'TRANSFORM YOUR WEB TODAY AND LEAD YOUR SECTOR': 'TRANSFORMA TU WEB HOY Y LIDERA TU SECTOR',
    'Contact me now to discuss your vision and request a custom quote. Let\'s talk about your next step.': 'Contáctame ahora para hablar de tu visión y solicitar un presupuesto a medida. Hablemos de tu siguiente paso.',
    'Direct Line': 'Línea Directa',
    'OPEN WHATSAPP →': 'ABRIR WHATSAPP →',
    'HQ Inquiries': 'Consultas HQ',
    'Send Email →': 'Enviar Email →',
    'Hello!%20I%20am%20coming%20from%20the%20MYNEXT%20website.%20I%20would%20like%20to%20receive%20information%20about%20your%20digital%20architecture%20and%20design%20services%20for%20my%20business.%20Thank%20you!': '%C2%A1Hola!%20Vengo%20desde%20la%20web%20de%20MYNEXT.%20Me%20gustar%C3%ADa%20recibir%20informaci%C3%B3n%20sobre%20vuestros%20servicios%20de%20dise%C3%B1o%20y%20arquitectura%20digital%20para%20mi%20negocio.%20%C2%A1Gracias!',
    'New%20Digital%20Project%20%7C%20MYNEXT&body=Hello%20Musa,%0A%0AI%20have%20been%20reviewing%20your%20portfolio%20on%20MYNEXT%20and%20I%20am%20interested%20in%20the%20Digital%20Architecture%20approach%20for%20my%20business.%20I%20would%20like%20to%20receive%20more%20information%20about%20your%20services%20and%20rates.%0A%0ABest%20regards.': 'Nuevo%20Proyecto%20Digital%20%7C%20MYNEXT&body=Hola%2C%20Musa.%0A%0AHe%20estado%20revisando%20tu%20porfolio%20en%20MYNEXT%20y%20me%20interesa%20el%20enfoque%20de%20Arquitectura%20Digital%20para%20mi%20negocio.%20Me%20gustar%C3%ADa%20recibir%20m%C3%A1s%20informaci%C3%B3n%20sobre%20tus%20servicios%20y%20tarifas.%0A%0AUn%20saludo.',
    'Quick Message': 'Contacto Rápido',
    'Leave your email to contact you': 'Deja tu correo para contactarte',
    'placeholder="your@email.com"': 'placeholder="tu@correo.com"',
    'Submit': 'Enviar',
    'Newsletter': 'Boletín de Novedades',
    'Subscribe to receive updates & digital insights': 'Suscríbete para recibir novedades e ideas digitales',

    # Planes Banner
    'Transparency & Results': 'Transparencia & Resultados',
    'Exclusive Designs with <span class="text-gradient-cyan">Custom Pricing</span>': 'Diseños Exclusivos con <span class="text-gradient-cyan">Tarifas a Tu Medida</span>',
    'Discover our digital architecture plans and choose the perfect fit for your business goals.': 'Descubre nuestros planes de arquitectura digital y elige la opción que mejor se adapte a los objetivos de tu negocio.',
    '2026 Plans': 'Planes 2026',
    'href="./planes/index-en.html"': 'href="./planes/index.html"',

    # Footer
    'Architecture Digital': 'Arquitectura Digital',
    'Legal Notice': 'Aviso Legal',
    'Privacy Policy': 'Política de Privacidad',
    'Cookies Policy': 'Política de Cookies',
    'Terms & Conditions': 'Términos y Condiciones',
    '© 2026 MYNEXT. All rights reserved.': '© 2026 MYNEXT. Todos los derechos reservados.',


    # Cookies Banner
    'Your privacy is important to us': 'Tu privacidad es importante para nosotros',
    'We process your personal information to measure and improve our sites and services, to assist our campaigns and to provide personalised content.': 'Procesamos tu información personal para medir y mejorar nuestros sitios y servicios, para ayudar en nuestras campañas y para proporcionar contenido personalizado.',
    'For more information see our': 'Para más información, consulta nuestra',
    'Reject': 'Rechazar',
    'More Options': 'Más Opciones',
    'Accept All': 'Aceptar Todo',

    # Legal Modals - General & Paragraphs
    'In compliance with the information duties established in the current legislation, the general information details of this website are listed below:': 'En cumplimiento del deber de información establecido en la legislación vigente, a continuación se detallan los datos de información general de este sitio web:',
    'All intellectual property rights of the content of this website, its graphic design, source code, and logos are the exclusive property of MYNEXT. Any reproduction, distribution, or public communication without express authorization is prohibited.': 'Todos los derechos de propiedad intelectual del contenido de este sitio web, su diseño gráfico, código fuente y logotipos son propiedad exclusiva de MYNEXT. Queda prohibida cualquier reproducción, distribución o comunicación pública sin autorización expresa.',
    'The owner is not responsible for damages of any nature that could be caused by errors or omissions in the content, or the lack of availability of the web portal.': 'El titular no se hace responsable de los daños y perjuicios de cualquier naturaleza que pudieran ocasionar errores u omisiones en los contenidos, o la falta de disponibilidad del portal web.',
    'The controller for the processing of personal data collected on this website is MYNEXT, with contact email': 'El responsable del tratamiento de los datos personales recogidos en este sitio web es MYNEXT, con correo de contacto',
    'The personal data provided (mainly email address and name through direct inquiries or forms) will be used exclusively to reply to inquiries and requests sent by users.': 'Los datos personales facilitados (principalmente correo electrónico y nombre a través de consultas directas) serán utilizados exclusivamente para dar respuesta a las consultas y solicitudes enviadas por los usuarios.',
    'Personal data will be kept for the strictly necessary time to fulfill the purpose for which they were collected, or until the user requests their erasure.': 'Los datos personales se conservarán durante el tiempo estrictamente necesario para cumplir con la finalidad para la que fueron recabados, o hasta que el usuario solicite su supresión.',
    'Users can exercise their rights to access, rectification, erasure, and limitation of processing by sending an email to': 'Los usuarios pueden ejercer sus derechos de acceso, rectificación, supresión y limitación del tratamiento enviando un correo electrónico a',
    'A cookie is a small text file stored in your browser when visiting almost any web page. Its utility is to allow the web to remember your visit when you navigate that page again.': 'Una cookie es un pequeño archivo de texto que se almacena en su navegador al visitar casi cualquier página web. Su utilidad es permitir que la web recuerde su visita cuando vuelva a navegar por esa página.',
    'Necessary for the proper functioning of the site, such as the cookie remembering your privacy preferences.': 'Necesarias para el correcto funcionamiento del sitio, como la cookie que recuerda sus preferencias de privacidad.',
    'At any time, you can exercise your right to disable or delete cookies from this website through the settings of your web browser.': 'En cualquier momento puede ejercer su derecho a desactivar o eliminar las cookies de este sitio web a través de la configuración de su navegador web.',
    'The access and/or use of this portal attributes the condition of user, who accepts the general terms of use reflected here. These conditions will apply regardless of the general terms of contracting that may be mandatory.': 'El acceso y/o uso de este portal atribuye la condición de usuario, que acepta las condiciones generales de uso aquí reflejadas. Estas condiciones serán de aplicación independientemente de las condiciones generales de contratación que en su caso resulten de obligado cumplimiento.',
    'The website provides access to information, services, programs, or data on the Internet belonging to MYNEXT. The user assumes responsibility for the use of the portal.': 'El sitio web proporciona el acceso a informaciones, servicios, programas o datos en Internet pertenecientes a MYNEXT. El usuario asume la responsabilidad del uso del portal.',
    'MYNEXT reserves the right to carry out modifications it deems appropriate in its portal without prior notice, being able to change, delete, or add both contents and services provided through it and the way they are presented.': 'MYNEXT se reserva el derecho de efectuar sin previo aviso las modificaciones que considere oportunas en su portal, pudiendo cambiar, suprimir o añadir tanto los contenidos y servicios que se presten a través de la misma como la forma en la que éstos aparezcan presentados.',

    # Legal Modals - Headings & List Items
    '1. General Information': '1. Información General',
    '2. Intellectual Property': '2. Propiedad Intelectual',
    '3. Limitation of Liability': '3. Limitación de Responsabilidad',
    '1. Data Controller': '1. Responsable del Tratamiento',
    '2. Purpose of Data Processing': '2. Finalidad del Tratamiento',
    '3. Data Retention': '3. Conservación de los Datos',
    '4. User Rights': '4. Derechos del Usuario',
    '1. What are cookies?': '1. ¿Qué son las cookies?',
    '2. Cookies used on this website': '2. Cookies utilizadas en este sitio web',
    '3. How to disable cookies': '3. Cómo desactivar las cookies',
    '1. Conditions of Use': '1. Condiciones de Uso',
    '2. Use of the Portal': '2. Uso del Portal',
    '3. Modifications': '3. Modificaciones',
    '<li><strong>Owner:</strong> MYNEXT</li>': '<li><strong>Titular:</strong> MYNEXT</li>',
    '<li><strong>Contact:</strong>': '<li><strong>Contacto:</strong>',
    '<li><strong>Activity:</strong> Premium design and digital architecture services.</li>': '<li><strong>Actividad:</strong> Servicios de diseño y arquitectura digital premium.</li>',
    '<strong>Technical Cookies:</strong>': '<strong>Cookies Técnicas:</strong>',
    '<strong>Personalization Cookies:</strong>': '<strong>Cookies de Personalización:</strong>',
    'Allow remembering the user\'s preferred language.': 'Permiten recordar el idioma preferido del usuario.',
    
    # New Premium Legal Terms
    'All content, source code, digital architecture structure, creative processes, and visual assets are the exclusive property of MYNEXT. Delivery to the client grants a perpetual and exclusive license of use over the final product, but does not transfer intellectual property over the tools, methodology, codebase, or design templates developed by MYNEXT.': 'Todo el contenido, código fuente, estructura de arquitectura digital, procesos creativos y activos visuales son propiedad exclusiva de MYNEXT. La entrega al cliente otorga una licencia de uso perpetua y exclusiva sobre el producto final, pero no transfiere la propiedad intelectual sobre las herramientas, metodología, código base o plantillas de diseño desarrolladas por MYNEXT.',
    'Reverse engineering, code extraction, or replication of navigation systems is strictly prohibited. Our premium methods, animations, and workflows are protected by copyright. Any unauthorized use constitutes an infringement of our intellectual property.': 'Queda estrictamente prohibida la ingeniería inversa, extracción de código o replicación de sistemas de navegación. Nuestros métodos, animaciones y flujos de trabajo premium están protegidos por derechos de autor. Cualquier uso no autorizado constituye una infracción a nuestra propiedad intelectual.',
    'Technical infrastructure, hosting, and configuration are managed under the supervision of MYNEXT to ensure excellence and security. Operational integrity is the exclusive responsibility of MYNEXT.': 'La infraestructura técnica, hosting y configuración son gestionados bajo la supervisión de MYNEXT para garantizar la excelencia y seguridad. La integridad operativa es responsabilidad exclusiva de MYNEXT.',
    '1. Intellectual Property': '1. Propiedad Intelectual',
    '2. Asset Protection': '2. Protección de Activos',
    '3. Technical Management': '3. Gestión Técnica',
    
    # Technical Management Modal & Uiverse Cards
    'Technical Management': 'Gestión Técnica',
    'Inspect Technical Management': 'Inspeccionar Gestión Técnica',
    'Technical infrastructure, hosting, and configuration are managed under the supervision of MYNEXT to ensure excellence and security. Hover over each asset to inspect operational metrics:': 'La infraestructura técnica, hosting y configuración son gestionados bajo la supervisión de MYNEXT para garantizar la excelencia y seguridad. Pasa el cursor sobre cada elemento para inspeccionar las métricas operativas:',
    'High-performance cloud servers, globally distributed CDN networks, and advanced edge caching optimized for ultra-fast load times.': 'Servidores cloud de alto rendimiento, redes CDN distribuidas globalmente y almacenamiento en caché perimetral optimizado para tiempos de carga ultra rápidos.',
    'Continuous threat monitoring, automatic SSL certificate renewal, secure firewalls, and data encryption protocols protecting your digital assets.': 'Monitoreo continuo de amenazas, renovación automática de certificados SSL, firewalls seguros y protocolos de encriptación de datos para proteger tus activos digitales.',
    'Constant operational supervision, regular database backups, uptime monitoring, and seamless framework security patches managed by MYNEXT.': 'Supervisión operativa constante, copias de seguridad periódicas de bases de datos, monitoreo de tiempo de actividad y parches de seguridad del sistema gestionados por MYNEXT.',
    'Infrastructure': 'Infraestructura',
    'Security & SSL': 'Seguridad & SSL',
    'Maintenance': 'Mantenimiento',
}

# Sort keys by length descending to make sure longer sentences are replaced first
sorted_keys = sorted(translations_index.keys(), key=len, reverse=True)

# Apply fuzzy replacements in order
for en_txt in sorted_keys:
    es_txt = translations_index[en_txt]
    es_content = replace_fuzzy(es_content, en_txt, es_txt)

# Extra fix for link to english version
es_content = es_content.replace('mailto:hello@mynext.es', 'mailto:mynextbymusa@gmail.com')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(es_content)

print("index.html translated successfully.")


# 2. TRANSLATE planes/index-en.html -> planes/index.html
if os.path.exists('planes/index-en.html'):
    with open('planes/index-en.html', 'r', encoding='utf-8') as f:
        en_pln = f.read()

    es_pln = en_pln.replace('lang="en"', 'lang="es"')
    es_pln = es_pln.replace('window.location.href=\'../index-en.html\'', 'window.location.href=\'../index.html\'')
    
    # Translate Planes Language Flag Selection Widget
    en_pln_flag_widget = """        <!-- Selector de Idioma -->
        <!-- LANGUAGE_SELECTOR_START -->
        <div class="absolute top-6 right-6 md:right-12 z-50 flex items-center gap-2 bg-[#050505]/60 backdrop-blur-md border border-white/10 p-1.5 rounded-full shadow-lg pointer-events-auto no-print">
            <a href="index.html" class="opacity-60 hover:opacity-100 transition-opacity flex" title="Español">
                <svg class="w-5 h-5 rounded-full overflow-hidden border border-white/10 hover:scale-110 transition-transform shadow-sm cursor-pointer" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                    <rect width="30" height="7.5" fill="#c60b1e"/>
                    <rect y="7.5" width="30" height="15" fill="#ffc400"/>
                    <rect y="22.5" width="30" height="7.5" fill="#c60b1e"/>
                </svg>
            </a>
            <span class="w-[1px] h-3 bg-white/20"></span>
            <a href="index-en.html" class="opacity-100 flex" title="English">
                <svg class="w-5 h-5 rounded-full overflow-hidden border border-cyan-400/40 hover:scale-110 transition-transform shadow-sm cursor-pointer" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                    <rect width="30" height="30" fill="#012169"/>
                    <path d="M0,0 L30,30 M30,0 L0,30" stroke="#fff" stroke-width="4"/>
                    <path d="M0,0 L30,30 M30,0 L0,30" stroke="#c8102e" stroke-width="1.5"/>
                    <path d="M15,0 V30 M0,15 H30" stroke="#fff" stroke-width="6"/>
                    <path d="M15,0 V30 M0,15 H30" stroke="#c8102e" stroke-width="4"/>
                </svg>
            </a>
        </div>
        <!-- LANGUAGE_SELECTOR_END -->"""

    es_pln_flag_widget = """        <!-- Selector de Idioma -->
        <!-- LANGUAGE_SELECTOR_START -->
        <div class="absolute top-6 right-6 md:right-12 z-50 flex items-center gap-2 bg-[#050505]/60 backdrop-blur-md border border-white/10 p-1.5 rounded-full shadow-lg pointer-events-auto no-print">
            <a href="index.html" class="opacity-100 flex" title="Español">
                <svg class="w-5 h-5 rounded-full overflow-hidden border border-cyan-400/40 hover:scale-110 transition-transform shadow-sm cursor-pointer" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                    <rect width="30" height="7.5" fill="#c60b1e"/>
                    <rect y="7.5" width="30" height="15" fill="#ffc400"/>
                    <rect y="22.5" width="30" height="7.5" fill="#c60b1e"/>
                </svg>
            </a>
            <span class="w-[1px] h-3 bg-white/20"></span>
            <a href="index-en.html" class="opacity-60 hover:opacity-100 transition-opacity flex" title="English">
                <svg class="w-5 h-5 rounded-full overflow-hidden border border-white/10 hover:scale-110 transition-transform shadow-sm cursor-pointer" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                    <rect width="30" height="30" fill="#012169"/>
                    <path d="M0,0 L30,30 M30,0 L0,30" stroke="#fff" stroke-width="4"/>
                    <path d="M0,0 L30,30 M30,0 L0,30" stroke="#c8102e" stroke-width="1.5"/>
                    <path d="M15,0 V30 M0,15 H30" stroke="#fff" stroke-width="6"/>
                    <path d="M15,0 V30 M0,15 H30" stroke="#c8102e" stroke-width="4"/>
                </svg>
            </a>
        </div>
        <!-- LANGUAGE_SELECTOR_END -->"""

    es_pln = es_pln.replace(en_pln_flag_widget, es_pln_flag_widget)
    
    # Convert Pound prices back to Euro format for Spanish version
    es_pln = re.sub(r'£(\d+)', r'\1€', es_pln)

    translations_planes = {
        # SEO
        'Digital Architecture Plans - MYNEXT': 'Planes de Arquitectura Digital - MYNEXT',
        
        # Header
        'WEB DESIGN PLANS': 'PLANES DE DISEÑO WEB',
        'PROFESSIONAL & CUSTOM': 'PROFESIONAL Y A MEDIDA',
        'We create impactful, fast, and optimized websites to help your business stand out online and attract more customers.': 'Creamos páginas web impactantes, rápidas y optimizadas para que tu negocio destaque en internet y consigas más clientes.',
        '💎 LAUNCH OFFER - UNTIL JULY 1ST': '💎 OFERTA DE LANZAMIENTO - HASTA EL 1 DE JULIO',
        
        # Essential
        'ESSENTIAL': 'ESENCIAL',
        '50€ PER FIX': '50€ POR MODIFICACIÓN',
        'Professional web design (2-3 sections)': 'Diseño web profesional (2-3 secciones)',
        'Google Maps Integration': 'Vinculación con Google Maps',
        'Domain & Basic Hosting Included': 'Dominio & Hosting básico incluido',
        'Basic Local SEO Optimization': 'Optimización de SEO Local Básico',
        'From': 'Desde',
        'One-time payment': 'Pago único',
        
        # Elite
        'ELITE': 'ÉLITE',
        '★ MOST POPULAR': '★ MÁS SOLICITADO',
        'Everything included in the Essential Plan': 'Todo lo incluido en el Plan Esencial',
        'Professional Profile Strategy': 'Estrategia de Perfil Profesional',
        'Comprehensive Domain Management': 'Gestión integral de Dominio',
        'Priority Technical Support 24/7': 'Soporte Técnico Prioritario 24/7',
        'INCLUDED': 'INCLUIDO',
        
        # Notes
        'DOMAIN MANAGEMENT': 'GESTIÓN DE DOMINIO',
        'The annual domain renewal cost will be paid by the client. MYNEXT handles all technical management.': 'El coste de renovación anual del dominio correrá a cargo del cliente. MYNEXT se encarga de toda la gestión técnica.',
        'INCLUDED FIXES': 'MODIFICACIONES INCLUIDAS',
        'Covers quick modifications (e.g., changing texts or images, 15-20 minute tasks). If the request requires more development time, it will be billed at 20€/hour.': 'Cubre modificaciones rápidas (ej. cambiar textos o imágenes, tareas de 15-20 minutos). Si la solicitud requiere más tiempo de desarrollo, se facturará a 20€/hora.',
        'PRO PROFILE STRATEGY': 'ESTRATEGIA PERFIL PRO',
        'Includes a deep business analysis. The website can be extended to more than 3 pages (expandable up to a maximum of 6 pages) according to the specific needs detected in each case.': 'Incluye un análisis profundo del negocio. La web se puede ampliar a más de 3 páginas (ampliable hasta un máximo de 6 páginas) según las necesidades específicas detectadas.',
        
        # Musa Card
        'CONSULTING & WEB DESIGN': 'CONSULTORÍA & DISEÑO WEB',
        'Direct Line': 'Línea Directa',
        'Open WhatsApp &rarr;': 'Abrir WhatsApp &rarr;',
        'HQ Inquiries': 'Consultas HQ',
        'Send Email &rarr;': 'Enviar Email &rarr;',
        'https://wa.me/34673109486?text=Hello!%20I%20am%20coming%20from%20the%20MYNEXT%20website.%20I%20would%20like%20to%20receive%20information%20about%20your%20digital%20architecture%20and%20design%20services%20for%20my%20business.%20Thank%20you!': 'https://wa.me/34673109486?text=%C2%A1Hola!%20Vengo%20desde%20la%20web%20de%20MYNEXT.%20Me%20gustar%C3%ADa%20recibir%20informaci%C3%B3n%20sobre%20vuestros%20servicios%20de%20dise%C3%B1o%20y%20arquitectura%20digital%20para%20mi%20negocio.%20%C2%A1Gracias!',
        'mailto:mynextbymusa@gmail.com?subject=Inquiry%20about%20ESSENTIAL%20plan': 'mailto:mynextbymusa@gmail.com?subject=Consulta%20sobre%20plan%20ESENCIAL',
        'mailto:mynextbymusa@gmail.com?subject=Inquiry%20about%20ELITE%20plan': 'mailto:mynextbymusa@gmail.com?subject=Consulta%20sobre%20plan%20ELITE',
        
        # Footer
        'SINCE 2026': 'DESDE 2026',
        
        # Modal / Script
        'Select your plan': 'Selecciona tu plan',
        'Plan ESSENTIAL': 'Plan ESENCIAL',
        'Plan ELITE': 'Plan ÉLITE',
        'Cancel': 'Cancelar',
        'Select your Plan': 'Selecciona tu Plan',
        'Inquire Plan': 'Consultar Plan',
        'Hello, I am interested in the ${plan} plan': 'Hola, estoy interesado en el plan ${plan}',
        'Inquiry about ${plan} plan': 'Consulta sobre el plan ${plan}',
        'PERSONALIZADO': 'PERSONALIZADO'
    }

    # Sort keys by length descending to make sure longer sentences are replaced first
    sorted_keys_pln = sorted(translations_planes.keys(), key=len, reverse=True)

    # Apply fuzzy replacements in order
    for en_txt in sorted_keys_pln:
        es_txt = translations_planes[en_txt]
        es_pln = replace_fuzzy(es_pln, en_txt, es_txt)

    with open('planes/index.html', 'w', encoding='utf-8') as f:
        f.write(es_pln)

    print("planes/index.html translated successfully.")
