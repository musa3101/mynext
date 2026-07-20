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
      es: 'Para Blessed Barber Studio, buscamos reflejar la elegancia y el detalle que ponen en cada corte. Creamos una web con una estética impecable que conecta con el cliente desde el primer vistazo, integrando un sistema de reservas directo y funcional. La experiencia digital se siente tan premium como visitar el estudio en persona.',
      en: 'For Blessed Barber Studio, we sought to reflect the elegance and detail they put into every cut. We created a website with an impeccable aesthetic that connects with the client from the first glance, integrating a direct and functional booking system. The digital experience feels as premium as visiting the studio in person.'
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
      es: 'Diseño corporativo y profesional para Ecuaplac, una empresa líder en tabiquería y reformas. La web destaca sus proyectos de lujo, servicios detallados y un formulario de contacto optimizado para la captación de leads en el sector de la construcción.',
      en: 'Corporate and professional design for Ecuaplac, a leading company in drywall and renovations. The website highlights their luxury projects, detailed services, and a contact form optimized for lead generation in the construction sector.'
    }),
    image_url: './assets/img/portfolio/porfolio3.png',
    project_url: 'https://ecuapv2.pages.dev/',
    technologies: 'HTML, CSS, JS, Tailwind',
    featured: false,
    active: true,
    sort_order: 3
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
  }
];

export const fallbackTestimonials = [
  {
    id: 1,
    client_name: 'Gustavo',
    role: JSON.stringify({ es: 'Dueño', en: 'Owner' }),
    company: 'Blessed Barber Studio',
    testimonial: JSON.stringify({
      es: 'Para Blessed Barber Studio, buscamos reflejar la elegancia y el detalle que ponen en cada corte. Creamos una web con una estética impecable que conecta con el cliente desde el primer vistazo, pero sin descuidar lo importante: un sistema de reservas directo y funcional. Logramos que la experiencia digital se sienta tan premium como visitar el estudio en persona.',
      en: 'For Blessed Barber Studio, we sought to reflect the elegance and detail they put into every cut. We created a website with an impeccable aesthetic that connects with the client from the first glance, without neglecting what is important: a direct and functional booking system. We made the digital experience feel as premium as visiting the studio in person.'
    }),
    active: true
  },
  {
    id: 2,
    client_name: 'Shamira',
    role: JSON.stringify({ es: 'Propietaria', en: 'Owner' }),
    company: 'Bar Cafetería Luna Llena',
    testimonial: JSON.stringify({
      es: 'Con Luna Llena, el objetivo fue acercar su cocina al entorno digital. Integramos su carta de forma interactiva y un sistema de reservas ágil para que los clientes tengan toda la información a mano y puedan asegurar su mesa en un segundo. Es una web pensada para ser útil, moderna y, sobre todo, para facilitar la vida tanto al dueño como al cliente.',
      en: 'With Luna Llena, the goal was to bring their cuisine to the digital environment. We integrated their menu interactively and an agile booking system so that customers have all the information at hand and can secure their table in a second. It is a website designed to be useful, modern and, above all, to make life easier for both the owner and the customer.'
    }),
    active: true
  },
  {
    id: 3,
    client_name: '',
    role: JSON.stringify({ es: 'Reformas & Construcción', en: 'Renovations & Construction' }),
    company: 'Ecuaplac',
    testimonial: JSON.stringify({
      es: 'Ecuaplac necesitaba una web que hiciera justicia a la calidad de sus reformas y tabiquería en Mallorca. Diseñamos un catálogo visual limpio y profesional que permite apreciar el detalle de cada obra, transmitiendo la seriedad, el orden y el minimalismo que definen su estilo de construcción.',
      en: 'Ecuaplac needed a website that did justice to the quality of their renovations and drywall in Mallorca. We designed a clean and professional visual catalog that allows appreciating the detail of each work, conveying the seriousness, order, and minimalism that define their construction style.'
    }),
    active: true
  },
  {
    id: 4,
    client_name: '',
    role: JSON.stringify({ es: 'Web Gastronómica', en: 'GASTRONOMIC WEB DESIGN' }),
    company: 'RBARI RESTAURANT',
    testimonial: JSON.stringify({
      es: 'Con Rbari Restaurant, cruzamos fronteras para trabajar con un cliente en Birmingham, Reino Unido. Desarrollamos una solución integral que digitaliza la carta y facilita las reservas, combinando un diseño visualmente atractivo con una estructura pensada para convertir visitas online en clientes reales. Es el ejemplo perfecto de cómo una web bien diseñada puede potenciar un negocio local, sin importar la distancia.',
      en: 'With Rbari Restaurant, we crossed borders to work with a client in Birmingham, United Kingdom. We developed a comprehensive solution that digitizes the menu and facilitates bookings, combining a visually attractive design with a structure designed to convert online visits into real customers. It is the perfect example of how a well-designed website can boost a local business, no matter the distance.'
    }),
    active: true
  },
  {
    id: 5,
    client_name: '',
    role: JSON.stringify({ es: 'Prototipo E-Commerce', en: 'E-Commerce Prototype' }),
    company: 'NEXT ERA',
    testimonial: JSON.stringify({
      es: 'Este proyecto no es una marca real. Es un prototipo de tienda e-commerce premium que he creado yo mismo! He diseñado esta plantilla para ser totalmente adaptable y funcional para marcas exclusivas. Si te gusta la estética y el flujo, puedes adquirir esta plantilla para tu propia marca. Plantilla disponible. Contáctame si necesitas integrarla o si tienes preguntas.',
      en: 'This project is not a real brand. It is a premium e-commerce store prototype that I created myself! I designed this template to be fully adaptable and functional for exclusive brands. If you like the aesthetics and flow, you can purchase this template for your own brand. Template available. Contact me if you need to integrate it or if you have any questions.'
    }),
    active: true
  },
  {
    id: 6,
    client_name: '',
    role: JSON.stringify({ es: 'Donación · Arquitectura Digital Solidaria', en: 'Donation · Solidary Digital Architecture' }),
    company: 'Mezquita Arrahma',
    testimonial: JSON.stringify({
      es: 'Un proyecto especial y solidario. Donamos nuestra Arquitectura Digital a la Mezquita Arrahma de Palma para modernizar su presencia online. Diseñamos una web con horarios de rezo en tiempo real, consulta al Imán y sistema de donaciones, todo con una estética que respeta la identidad y tradición de la comunidad.',
      en: 'A special and solidary project. We donated our Digital Architecture to the Arrahma Mosque in Palma to modernize their online presence. We designed a website with real-time prayer schedules, Imam consultation and donation system, all with an aesthetic that respects the identity and tradition of the community.'
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
