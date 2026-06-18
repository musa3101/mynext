export const fallbackServices = [
  {
    id: 1,
    title: JSON.stringify({ es: 'ESENCIAL', en: 'ESSENTIAL' }),
    description: JSON.stringify({
      es: 'Diseño web profesional (2-3 secciones), Vinculación con Google Maps, Dominio & Hosting básico incluido, Optimización de SEO Local Básico',
      en: 'Professional web design (2-3 sections), Google Maps Integration, Domain & Basic Hosting Included, Basic Local SEO Optimization'
    }),
    price: '190',
    featured: false,
    active: true,
    sort_order: 1
  },
  {
    id: 2,
    title: JSON.stringify({ es: 'ÉLITE', en: 'ELITE' }),
    description: JSON.stringify({
      es: 'Todo lo incluido en el Plan Esencial, Estrategia de Perfil Profesional *3, Gestión integral de Dominio *1, Soporte Técnico Prioritario 24/7',
      en: 'Everything included in the Essential Plan, Professional Profile Strategy *3, Comprehensive Domain Management *1, Priority Technical Support 24/7'
    }),
    price: '290',
    featured: true,
    active: true,
    sort_order: 2
  }
];

export const fallbackProjects = [
  {
    id: 1,
    title: 'Blessed Barber Studio',
    description: JSON.stringify({
      es: 'Diseño y desarrollo web premium para Barbería de Alta Gama en España.',
      en: 'Premium web design and development for High-End Barbershop in Spain.'
    }),
    image_url: './assets/img/portfolio/porfolio1.png',
    project_url: 'https://blessedstudio.pages.dev/',
    technologies: 'HTML, CSS, JS, Tailwind',
    featured: true,
    active: true,
    sort_order: 1
  },
  {
    id: 2,
    title: 'Bar Cafetería Luna Llena',
    description: JSON.stringify({
      es: 'Carta digital y presencia web premium para bar-cafetería de especialidad.',
      en: 'Digital menu and premium web presence for specialty coffee shop & bar.'
    }),
    image_url: './assets/img/portfolio/porfolio2.png',
    project_url: 'https://barlunallena.pages.dev',
    technologies: 'HTML, CSS, JS, Tailwind',
    featured: true,
    active: true,
    sort_order: 2
  },
  {
    id: 3,
    title: 'Ecuaplac',
    description: JSON.stringify({
      es: 'Tabiquería seca y reformas de lujo en Mallorca.',
      en: 'Drywall and luxury renovations in Mallorca.'
    }),
    image_url: './assets/img/portfolio/porfolio3.png',
    project_url: 'https://ecuaplac-v1.pages.dev',
    technologies: 'HTML, CSS, JS, Tailwind',
    featured: false,
    active: true,
    sort_order: 3
  },
  {
    id: 4,
    title: 'RBARI RESTAURANT',
    description: JSON.stringify({
      es: 'Experiencia inmersiva y menú digital para restaurante gastronómico.',
      en: 'Immersive experience and digital menu for gastronomic restaurant.'
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
    title: 'NEXT ERA',
    description: JSON.stringify({
      es: 'Catálogo virtual interactivo para marca exclusiva de gorras.',
      en: 'Interactive virtual catalog for exclusive cap brand.'
    }),
    image_url: './assets/img/portfolio/porfolio5.png',
    project_url: 'https://nexterabymusa.pages.dev',
    technologies: 'HTML, CSS, JS, Tailwind',
    featured: false,
    active: true,
    sort_order: 5
  }
];

export const fallbackTestimonials = [
  {
    id: 1,
    client_name: 'Gustavo',
    role: JSON.stringify({ es: 'Dueño', en: 'Owner' }),
    company: 'Blessed Barber Studio',
    testimonial: JSON.stringify({
      es: 'Musa entendió a la perfección la esencia de nuestro estudio. No solo creó una web visualmente imponente, sino que logró trasladar el lujo y la precisión de cada uno de nuestros cortes al mundo digital. Ha elevado nuestra marca a otro nivel.',
      en: 'Musa perfectly understood the essence of our studio. He not only created a visually stunning website, but managed to translate the luxury and precision of each of our cuts into the digital world. He has elevated our brand to another level.'
    }),
    active: true
  },
  {
    id: 2,
    client_name: 'Shamira',
    role: JSON.stringify({ es: 'Propietaria', en: 'Owner' }),
    company: 'Bar Cafetería Luna Llena',
    testimonial: JSON.stringify({
      es: 'Llevar la esencia y la calidez de nuestro local al entorno digital parecía un reto, pero Musa lo hizo parecer fácil. Diseñó una carta digital impecable y sofisticada que entra por los ojos y refleja fielmente lo que somos.',
      en: 'Translating the essence and warmth of our venue to the digital environment seemed like a challenge, but Musa made it look easy. He designed an impeccable and sophisticated digital menu that is eye-catching and faithfully reflects who we are.'
    }),
    active: true
  },
  {
    id: 3,
    client_name: '',
    role: JSON.stringify({ es: 'Reformas & Construcción', en: 'Renovations & Construction' }),
    company: 'Ecuaplac',
    testimonial: JSON.stringify({
      es: 'Ecuaplac redefine el concepto de reformas de lujo y tabiquería seca para la arquitectura en Mallorca. Una fusión de minimalismo nórdico y transiciones interactivas ultra-fluidas.',
      en: 'Ecuaplac redefines the concept of luxury renovations and drywalls for architecture in Mallorca. A fusion of Nordic minimalism and ultra-fluid interactive transitions.'
    }),
    active: true
  },
  {
    id: 4,
    client_name: '',
    role: JSON.stringify({ es: 'Web Gastronómica', en: 'GASTRONOMIC WEB DESIGN' }),
    company: 'RBARI RESTAURANT',
    testimonial: JSON.stringify({
      es: 'Experiencia digital inmersiva para un auténtico restaurante de Bangladesh. Un diseño visualmente rico que transmite cultura y sabores a través de una interfaz limpia y de alto contraste.',
      en: 'Immersive digital experience for an authentic Bangladeshi restaurant. A visually rich design that conveys culture and flavors through a clean, high-contrast interface.'
    }),
    active: true
  },
  {
    id: 5,
    client_name: '',
    role: JSON.stringify({ es: 'Prototipo E-Commerce', en: 'E-Commerce Prototype' }),
    company: 'NEXT ERA',
    testimonial: JSON.stringify({
      es: 'Catálogo virtual interactivo para marca exclusiva de gorras. Excelente navegación y animaciones muy fluidas que enganchan al cliente en la compra.',
      en: 'Luxury caps and premium streetwear e-commerce. A high-contrast minimalist design and interactive animations focused on conversion and brand exclusivity.'
    }),
    active: true
  }
];

export const fallbackSettings: Record<string, string> = {
  site_title: JSON.stringify({
    es: 'MYNEXT - Arquitectura Digital Premium | Musa',
    en: 'MYNEXT - Premium Digital Architecture | Musa'
  }),
  site_description: JSON.stringify({
    es: 'Diseño y desarrollo de experiencias digitales exclusivas. Elevamos tu marca con arquitectura digital premium y diseño de alta fidelidad.',
    en: 'Design and development of exclusive digital experiences. We elevate your brand with premium digital architecture and high-fidelity design.'
  }),
  contact_phone: '34673109486',
  contact_email: 'mynextbymusa@gmail.com',
  launch_banner_text: JSON.stringify({
    es: '💎 OFERTA DE LANZAMIENTO - HASTA EL 1 DE JULIO',
    en: '💎 LAUNCH OFFER - UNTIL JULY 1ST'
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
