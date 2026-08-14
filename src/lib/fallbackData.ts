export const fallbackServices = [
  {
    id: 1,
    title: JSON.stringify({ es: 'BÁSICO', en: 'BASIC' }),
    description: JSON.stringify({
      es: 'Diseño web profesional (2-3 secciones), Vinculación con Google Maps, Dominio & Hosting básico incluido, Optimización de SEO Local Básico',
      en: 'Professional web design (2-3 sections), Google Maps Integration, Domain & Basic Hosting Included, Basic Local SEO Optimization'
    }),
    price: '300',
    featured: false,
    active: true,
    sort_order: 1
  },
  {
    id: 2,
    title: JSON.stringify({ es: 'BUSINESS', en: 'BUSINESS' }),
    description: JSON.stringify({
      es: 'Todo lo incluido en el Plan Esencial, Estrategia de Perfil Profesional *3, Gestión integral de Dominio *1, Soporte Técnico Prioritario 24/7',
      en: 'Everything included in the Essential Plan, Professional Profile Strategy *3, Comprehensive Domain Management *1, Priority Technical Support 24/7'
    }),
    price: '400',
    featured: true,
    active: true,
    sort_order: 2
  }
];

export const fallbackProjects = [
  {
    id: 1,
    slug: 'blessed-barber-studio',
    title: 'Blessed Barber Studio',
    description: JSON.stringify({
      es: 'Diseño y desarrollo web premium para Barbería de Alta Gama en España.',
      en: 'Premium web design and development for High-End Barbershop in Spain.'
    }),
    full_description: JSON.stringify({
      es: 'Para Blessed Barber Studio desarrollamos una solución digital e impresa integral que eleva la experiencia del cliente dentro y fuera del local. Diseñamos un expositor de horario comercial exterior equipado con código QR de acceso rápido: al escanearlo, el cliente accede directamente a la web interactiva para elegir su barbero, seleccionar el tipo de corte y gestionar su cita al instante (vía Booksy o WhatsApp). Además, creamos soportes físicos de reseñas de Google Maps para incentivar las opiniones positivas y maximizar la reputación local de la barbería.',
      en: 'For Blessed Barber Studio we developed a comprehensive digital and print solution that elevates the customer experience both inside and outside the shop. We designed an exterior business hours display equipped with a quick QR access code: upon scanning, customers go directly to the interactive website to choose their barber, select their haircut, and book instantly (via Booksy or WhatsApp). Additionally, we created physical Google Maps review displays to drive positive feedback and boost local reputation.'
    }),
    image_url: './assets/img/portfolio/porfolio1.png',
    project_url: 'https://blessedstudio.pages.dev/',
    technologies: 'HTML, CSS, JS, Tailwind',
    featured: true,
    active: true,
    sort_order: 1,
    gallery_title: JSON.stringify({
      es: 'MATERIALES FÍSICOS & EXPERIENCIA EN LOCAL',
      en: 'PHYSICAL MATERIALS & LOCAL EXPERIENCE'
    }),
    gallery_subtitle: JSON.stringify({
      es: 'Cartel exterior con QR de reserva directa y expositor de reseñas de Google Maps',
      en: 'Exterior QR booking poster & Google Maps review display'
    }),
    gallery: [
      {
        url: './assets/img/portfolio/blessed-horario.jpg',
        title: JSON.stringify({
          es: 'Cartel de Horarios Exterior con QR de Reserva Directa (Booksy & WhatsApp)',
          en: 'Exterior Business Hours Display with Direct Booking QR Code'
        })
      },
      {
        url: './assets/img/portfolio/blessed-resena.jpg',
        title: JSON.stringify({
          es: 'Expositor Físico con Código QR para Reseñas en Google Maps',
          en: 'Physical Google Maps Review Display with QR Code'
        })
      }
    ]
  },
  {
    id: 2,
    slug: 'bar-cafeteria-luna-llena',
    title: 'Bar Cafetería Luna Llena',
    description: JSON.stringify({
      es: 'Carta digital y presencia web premium para bar-cafetería de especialidad.',
      en: 'Digital menu and premium web presence for specialty coffee shop & bar.'
    }),
    full_description: JSON.stringify({
      es: 'Con Luna Llena, el objetivo fue acercar su cocina al entorno digital. Integramos su carta de forma interactiva y un sistema de reservas ágil para que los clientes tengan toda la información a mano y puedan asegurar su mesa en un segundo. Una web útil, moderna y fácil de usar.',
      en: 'With Luna Llena, the goal was to bring their cuisine to the digital environment. We integrated their menu interactively and an agile booking system so that customers have all the information at hand and can secure their table in a second. A useful, modern, and easy-to-use website.'
    }),
    image_url: './assets/img/portfolio/porfolio2-v3.png',
    project_url: 'https://barlunallena.pages.dev',
    technologies: 'HTML, CSS, JS, Tailwind',
    featured: true,
    active: true,
    sort_order: 2
  },
  {
    id: 3,
    slug: 'ecuaplac',
    title: 'Ecuaplac',
    description: JSON.stringify({
      es: 'Tabiquería seca y reformas de lujo en Mallorca.',
      en: 'Drywall and luxury renovations in Mallorca.'
    }),
    full_description: JSON.stringify({
      es: 'Para Ecuaplac desarrollamos un ecosistema de marca completo que integra el diseño web corporativo con la presencia física de la empresa. Renovamos la identidad visual con el nuevo logotipo corporativo e implementamos nuevos materiales impresos: tarjetas de visita corporativas premium con código QR dinámico y un diseño especial de vinilado con QR para las furgonetas de la flota de la empresa. Al escanear el vinilo en carretera o la tarjeta de visita, los clientes acceden instantáneamente al catálogo digital y formulario de presupuestos.',
      en: 'For Ecuaplac we developed a complete brand ecosystem integrating corporate web design with physical company branding. We revamped the visual identity with a new corporate logo and created print materials: premium business cards with dynamic QR code access and custom vehicle vinyl designs with QR codes for the company fleet. Scanning the vehicle vinyl or business card gives clients instant access to the digital catalog and quote requests.'
    }),
    image_url: './assets/img/portfolio/porfolio3.png',
    project_url: 'https://ecuapv2.pages.dev/',
    technologies: 'HTML, CSS, JS, Tailwind',
    featured: false,
    active: true,
    sort_order: 3,
    gallery_title: JSON.stringify({
      es: 'MATERIALES IMPRESOS & IDENTIDAD CORPORATIVA',
      en: 'PRINT MATERIALS & CORPORATE IDENTITY'
    }),
    gallery_subtitle: JSON.stringify({
      es: 'Tarjetas de visita corporativas y vinilado publicitario con QR para furgonetas de flota',
      en: 'Corporate business cards & fleet vehicle QR vinyl design'
    }),
    gallery: [
      {
        url: './assets/img/portfolio/ecuaplac-van-qr.png',
        title: JSON.stringify({
          es: 'Diseño de Vinilado para Furgoneta de Flota con Código QR de Acceso Web Directo',
          en: 'Fleet Vehicle Vinyl Design with Direct Web Access QR Code'
        })
      },
      {
        url: './assets/img/portfolio/ecuaplac-card-layout.png',
        title: JSON.stringify({
          es: 'Diseño de Tarjetas de Visita Corporativas con Nuevo Logotipo e Integración QR',
          en: 'Corporate Business Card Design with New Logo & QR Integration'
        })
      },
      {
        url: './assets/img/portfolio/ecuaplac-card-hand.png',
        title: JSON.stringify({
          es: 'Mockup de Tarjetas de Visita Físicas en Mano',
          en: 'In-Hand Physical Business Cards Display'
        })
      },
      {
        url: './assets/img/portfolio/ecuaplac-card-desk.jpg',
        title: JSON.stringify({
          es: 'Presentación Corporativa de Tarjetas sobre Escritorio',
          en: 'Desktop Corporate Business Cards Presentation'
        })
      }
    ]
  },
  {
    id: 4,
    slug: 'rbari-restaurant',
    title: 'RBARI RESTAURANT',
    description: JSON.stringify({
      es: 'Experiencia inmersiva y menú digital para restaurante gastronómico.',
      en: 'Immersive experience and digital menu for gastronomic restaurant.'
    }),
    full_description: JSON.stringify({
      es: 'Para RBARI, creamos una experiencia inmersiva que traduce la esencia de su gastronomía al mundo digital. Incorpora menú interactivo, fotografías de alta calidad y un sistema de reservas que optimiza la gestión del restaurante.',
      en: 'For RBARI, we created an immersive experience that translates the essence of their gastronomy to the digital world. It incorporates an interactive menu, high-quality photography, and a booking system that optimizes restaurant management.'
    }),
    image_url: './assets/img/portfolio/porfolio4.png',
    project_url: 'https://rbari-v1.pages.dev',
    technologies: 'HTML, CSS, JS, Tailwind',
    featured: false,
    active: true,
    sort_order: 4
  },
  {
    id: 5,
    slug: 'next-era',
    title: 'NEXT ERA',
    description: JSON.stringify({
      es: 'Prototipo de tienda e-commerce premium adaptable para marcas exclusivas.',
      en: 'Premium e-commerce store prototype adaptable for exclusive brands.'
    }),
    full_description: JSON.stringify({
      es: 'NEXT ERA es un concepto e-commerce de alto rendimiento. Desarrollado con una estética minimalista y tiempos de carga ultrarrápidos, está pensado para maximizar la conversión en marcas de moda o productos exclusivos.',
      en: 'NEXT ERA is a high-performance e-commerce concept. Developed with a minimalist aesthetic and ultra-fast loading times, it is designed to maximize conversion for fashion brands or exclusive products.'
    }),
    image_url: './assets/img/portfolio/porfolio5.png',
    project_url: 'https://nexterabymusa.pages.dev',
    technologies: 'HTML, CSS, JS, Tailwind',
    featured: false,
    active: true,
    sort_order: 5
  },
  {
    id: 6,
    slug: 'mezquita-arrahma',
    title: 'Mezquita Arrahma',
    description: JSON.stringify({
      es: 'Arquitectura Digital solidaria para la Mezquita Arrahma de Palma de Mallorca.',
      en: 'Solidary Digital Architecture for Arrahma Mosque in Palma de Mallorca.'
    }),
    full_description: JSON.stringify({
      es: 'Un proyecto solidario donde rediseñamos la presencia online de la Mezquita Arrahma. Una plataforma accesible e informativa para mantener a la comunidad conectada con horarios, eventos y donaciones.',
      en: 'A solidary project where we redesigned the online presence of the Arrahma Mosque. An accessible and informative platform to keep the community connected with schedules, events, and donations.'
    }),
    image_url: './assets/img/portfolio/porfolio6.png',
    project_url: 'https://mezquita-arrahma.pages.dev',
    technologies: 'HTML, CSS, JS, Tailwind',
    featured: false,
    active: true,
    sort_order: 6
  },
  {
    id: 7,
    slug: 'gran-marrakech',
    title: 'Gran Marrakech',
    description: JSON.stringify({
      es: 'Web moderna y menú digital para Restaurante Marroquí en Palma de Mallorca.',
      en: 'Modern website and digital menu for Moroccan Restaurant in Palma de Mallorca.'
    }),
    full_description: JSON.stringify({
      es: 'Para Gran Marrakech, diseñamos una presencia online que captura la esencia y la rica cultura de la gastronomía marroquí. La web cuenta con un diseño inmersivo, integración de menú interactivo y un flujo de reservas optimizado para potenciar su negocio local en Palma de Mallorca.',
      en: 'For Gran Marrakech, we designed an online presence that captures the essence and rich culture of Moroccan gastronomy. The website features an immersive design, interactive menu integration, and an optimized booking flow to boost their local business in Palma de Mallorca.'
    }),
    image_url: './assets/img/portfolio/porfolio7.png',
    project_url: 'https://granmarrakech.pages.dev',
    technologies: 'HTML, CSS, JS, Tailwind',
    featured: true,
    active: true,
    sort_order: 7
  },
  {
    id: 8,
    slug: 'tacos-marrakech',
    title: 'Tacos Marrakech',
    category: 'RESTAURANTE MARROQUÍ',
    description: JSON.stringify({
      es: 'Experiencia digital moderna con carta online intuitiva, diseño responsive y menú multiidioma con códigos QR.',
      en: 'Modern digital experience featuring an intuitive online menu, responsive design, and multi-language QR access.'
    }),
    full_description: JSON.stringify({
      es: 'Para Tacos Marrakech desarrollamos una experiencia digital moderna centrada en ofrecer una carta online intuitiva, un diseño totalmente responsive y un acceso rápido mediante códigos QR. Además, el proyecto incluye versiones del menú en varios idiomas para mejorar la experiencia de clientes locales y turistas.',
      en: 'For Tacos Marrakech we developed a modern digital experience focused on offering an intuitive online menu, a fully responsive design, and quick access via QR codes. In addition, the project includes multi-language menu versions to enhance the experience for both local customers and tourists.'
    }),
    image_url: './assets/img/portfolio/porfolio8.png',
    project_url: 'https://tacosmarrakech.pages.dev',
    technologies: 'HTML, CSS, JS, Tailwind',
    featured: true,
    active: true,
    sort_order: 8,
    gallery_title: JSON.stringify({
      es: 'MATERIALES FÍSICOS & CARTA DIGITAL',
      en: 'PHYSICAL MATERIALS & DIGITAL MENU'
    }),
    gallery_subtitle: JSON.stringify({
      es: 'Menú QR en mesas y expositores interactivos de reseñas',
      en: 'Table QR menus & interactive review displays'
    }),
    gallery: [
      {
        url: './assets/img/portfolio/tacos-qr-1.jpg',
        title: JSON.stringify({ es: 'Soporte con Código QR de Reseñas de Google', en: 'Google Reviews QR Display' })
      },
      {
        url: './assets/img/portfolio/tacos-qr-2.jpg',
        title: JSON.stringify({ es: 'Expositor de Menú QR para Mesas', en: 'Table QR Menu Display' })
      },
      {
        url: './assets/img/portfolio/tacos-qr-3.jpg',
        title: JSON.stringify({ es: 'Diseño e Impresión del Menú Digital', en: 'Digital Menu Print & Design' })
      },
      {
        url: './assets/img/portfolio/tacos-qr-4.jpg',
        title: JSON.stringify({ es: 'Presentación del Menú QR en Local', en: 'In-Store QR Display' })
      }
    ]
  }
];

export const fallbackTestimonials = [
  {
    id: 1,
    name: 'Gustavo Coyo',
    client_name: 'Gustavo Coyo',
    company: 'Palma Barber Club',
    rating: 5,
    relative_time: 'Hace 2 semanas',
    source: 'google',
    google_review_id: 'g_rev_gustavo',
    testimonial: JSON.stringify({
      es: 'Brutal el curro de MYNEXT con la web de la barbería. Ha clavado el diseño y además está genial porque se adapta perfecto al móvil y al ordenador, que para el tema de las citas nos viene de lujo. Nos ha dado muchísima visibilidad y reservas en el día a día. Si quieres llevar tu negocio a otro nivel, habla con él ya que te asesora en todo y es un crack. ¡Servicio recomendado para negocios en Palma de Mallorca!',
      en: "Brutal work by MYNEXT on the barbershop's website. He nailed the design and it's also great because it adapts perfectly to mobile and desktop, which is fantastic for booking appointments. It has given us a lot of visibility and reservations on a daily basis. If you want to take your business to another level, talk to him as he advises you on everything and is brilliant. Highly recommended service for businesses in Palma de Mallorca!"
    }),
    active: true
  },
  {
    id: 2,
    name: 'Danna Delgado',
    client_name: 'Danna Delgado',
    company: 'Cliente Verificado',
    rating: 5,
    relative_time: 'Hace 3 semanas',
    source: 'google',
    google_review_id: 'g_rev_danna',
    testimonial: JSON.stringify({
      es: 'Excelente servicio de diseño web y atención al detalle en Palma de Mallorca.',
      en: 'Excellent web design service and great attention to detail in Palma de Mallorca.'
    }),
    active: true
  },
  {
    id: 3,
    name: 'Jhon Soliz',
    client_name: 'Jhon Soliz',
    company: 'Teen G / Next Era',
    rating: 5,
    relative_time: 'Hace 4 semanas',
    source: 'google',
    google_review_id: 'g_rev_jhon',
    testimonial: JSON.stringify({
      es: 'Como creador de Teen G, quería llevar mi idea a internet de una forma profesional. Conocí Next Era, un prototipo de ecommerce desarrollado por MyNext, y me gustó mucho el diseño y la imagen que transmitía. Musa me ayudó desde el principio, resolviendo dudas, aportando ideas y entendiendo lo que quería conseguir con mi proyecto. El trato fue cercano y siempre estuvo dispuesto a ayudar cuando lo necesitaba. Estoy muy contento con la experiencia y recomiendo MyNext a cualquier persona que necesite una página web profesional.',
      en: 'As the creator of Teen G, I wanted to take my idea to the internet in a professional way. I met Next Era, an ecommerce prototype developed by MyNext, and I really liked the design and the image it transmitted. Musa helped me from the beginning, answering questions, providing ideas and understanding what I wanted to achieve with my project. The treatment was close and he was always willing to help when I needed it. I am very happy with the experience and I recommend MyNext to anyone who needs a professional website for their business or brand.'
    }),
    active: true
  },
  {
    id: 4,
    name: 'Juan',
    client_name: 'Juan',
    company: 'Cliente Verificado',
    rating: 5,
    relative_time: 'Hace 3 semanas',
    source: 'google',
    google_review_id: 'g_rev_juan',
    testimonial: JSON.stringify({
      es: 'Gran trabajo en el desarrollo web, rapidez y comunicación impecable.',
      en: 'Great job in web development, speed and flawless communication.'
    }),
    active: true
  },
  {
    id: 5,
    name: 'Ilyas Etaouriri',
    client_name: 'Ilyas Etaouriri',
    company: 'Cliente Verificado',
    rating: 5,
    relative_time: 'Hace 4 días',
    source: 'google',
    google_review_id: 'g_rev_ilyas',
    testimonial: JSON.stringify({
      es: 'Muy buen chico lo recomiendo puntual profesional atiende muy bien se explica muy bien',
      en: 'Very good guy, I recommend him. Punctual, professional, attends very well, explains himself very well'
    }),
    active: true
  },
  {
    id: 6,
    name: 'John Smith',
    client_name: 'John Smith',
    company: 'Cliente Verificado',
    rating: 5,
    relative_time: 'Hace 1 mes',
    source: 'google',
    google_review_id: 'g_rev_john',
    testimonial: JSON.stringify({
      es: 'Servicio altamente recomendado para negocios en Palma.',
      en: 'Highly recommended web service for businesses in Palma.'
    }),
    active: true
  }
];

export const fallbackSettings: Record<string, string> = {
  site_title: JSON.stringify({
    es: 'Diseño Web en Palma de Mallorca | MYNEXT - Arquitectura Digital',
    en: 'Premium Web Design in Palma de Mallorca | MYNEXT Digital Architecture'
  }),
  site_description: JSON.stringify({
    es: '¿Buscas diseño web en Palma de Mallorca? En MYNEXT creamos páginas web exclusivas, responsivas y optimizadas para SEO que impulsan tu negocio. ¡Contáctanos!',
    en: 'Looking for premium web design in Palma de Mallorca? MYNEXT creates exclusive, responsive, and SEO-optimized websites to elevate your brand. Contact us!'
  }),
  contact_phone: '34673109486',
  contact_email: 'mynextbymusa@gmail.com',
  launch_banner_text: JSON.stringify({
    es: '💎 OFERTA DE LANZAMIENTO - HASTA EL 4 DE AGOSTO',
    en: '💎 LAUNCH OFFER - UNTIL AUGUST 4TH'
  }),
  whatsapp_message_landing: JSON.stringify({
    es: '¡Hola! Vengo desde la web de MYNEXT. Me gustaría recibir información sobre vuestros servicios de diseño y arquitectura digital para mi negocio. ¡Gracias!',
    en: 'Hello! I came from the MYNEXT website. I would like to receive information about your design and digital architecture services for my business. Thank you!'
  }),
  email_subject_landing: JSON.stringify({
    es: 'Nuevo Proyecto Digital | MYNEXT',
    en: 'New Digital Project | MYNEXT'
  }),
  email_body_landing: JSON.stringify({
    es: 'Hola, Musa.\n\nHe estado revisando tu porfolio en MYNEXT y me interesa el enfoque de Arquitectura Digital para mi negocio. Me gustaría recibir más información sobre tus servicios y tarifas.\n\nUn saludo.',
    en: 'Hello Musa,\n\nI have been reviewing your portfolio on MYNEXT and I am interested in the Digital Architecture approach for my business. I would like to receive more information about your services and rates.\n\nBest regards.'
  })
};
