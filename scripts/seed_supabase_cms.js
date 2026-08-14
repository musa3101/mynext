#!/usr/bin/env node

/**
 * MYNEXT - Seed 100% Real Clean Data into Supabase CMS
 */

import fs from 'fs';
import path from 'path';

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const val = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
          process.env[key.trim()] = val;
        }
      }
    });
  }
}

loadEnv();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://elfdkbqlvawaprgidqhd.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

async function postTable(table, data) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      console.log(`✅ Registro inyectado en ${table}`);
    } else {
      const err = await res.text();
      console.warn(`⚠️ Warning en ${table}:`, err);
    }
  } catch (err) {
    console.error(`❌ Error en ${table}:`, err.message);
  }
}

async function main() {
  console.log('🚀 Iniciando volcado de datos REALES y LIMPIOS en Supabase CMS...\n');

  // 1. Hero
  await postTable('mynext_hero', {
    id: 1,
    title_es: 'Arquitectura Digital Premium',
    title_en: 'Premium Digital Architecture',
    subtitle_es: 'Diseñamos y construimos experiencias web exclusivas, rápidas y orientadas a resultados para marcas exigentes.',
    subtitle_en: 'We design and build exclusive, fast, and result-oriented web experiences for demanding brands.',
    cta_primary_es: 'Explorar Proyectos →',
    cta_primary_en: 'Explore Projects →',
    banner_offer_es: '💎 OFERTA DE LANZAMIENTO - RESERVA TU PROYECTO',
    banner_offer_en: '💎 LAUNCH OFFER - BOOK YOUR PROJECT'
  });

  // 2. About
  await postTable('mynext_about', {
    id: 1,
    title_es: 'Sobre Mí',
    title_en: 'About Me',
    subtitle_es: 'Apasionado por la tecnología, el diseño limpio y el desarrollo web de alta gama.',
    subtitle_en: 'Passionate about technology, clean design, and high-end web development.',
    bio_p1_es: 'Hola, soy Musa. Ayudo a negocios y marcas locales a destacar en el entorno digital mediante páginas web ultra rápidas, funcionales y con una estética prémium.',
    bio_p1_en: 'Hi, I am Musa. I help businesses and local brands stand out in the digital environment through ultra-fast, functional, and premium-aesthetic websites.',
    bio_p2_es: 'Cada proyecto que construyo combina diseño intuitivo, optimización SEO local y una estructura pensada para convertir visitas en clientes reales.',
    bio_p2_en: 'Every project I build combines intuitive design, local SEO optimization, and a structure built to convert visits into real customers.',
    stat_experience: '5+ años',
    stat_projects: '30+'
  });

  // 3. Services (Planes y Precios)
  const services = [
    {
      id: 1,
      title_es: 'Landing Page Express',
      title_en: 'Express Landing Page',
      badge_es: 'MÁS POPULAR',
      badge_en: 'MOST POPULAR',
      price: '490€',
      period_es: 'Pago Único',
      period_en: 'One-Time Payment',
      description_es: 'Diseño web de alto impacto en 1 sola página, optimizado para conversión rápida, reservas y presentación de producto.',
      description_en: 'High-impact 1-page web design, optimized for fast conversion, bookings, and product presentation.',
      features_es: ['Diseño 100% Responsive & Móvil', 'Integración con WhatsApp y Google Maps', 'Menú o Catálogo en alta calidad', 'Optimización SEO Local Básico', 'Entrega ultra rápida en 3-5 días'],
      features_en: ['100% Responsive & Mobile Design', 'WhatsApp & Google Maps Integration', 'High Quality Menu or Catalog', 'Basic Local SEO Optimization', 'Ultra fast 3-5 days delivery'],
      popular: true,
      sort_order: 1
    },
    {
      id: 2,
      title_es: 'Web Corporativa / Negocio',
      title_en: 'Corporate / Business Web',
      badge_es: 'COMPLETA',
      badge_en: 'COMPLETE',
      price: '890€',
      period_es: 'Pago Único',
      period_en: 'One-Time Payment',
      description_es: 'Solución web completa multipágina con catálogo interactivo, galería de trabajos y sistema de citas/reservas.',
      description_en: 'Full multi-page web solution with interactive catalog, work gallery, and appointment/booking system.',
      features_es: ['Hasta 5 páginas o secciones dedicadas', 'Galería interactiva & Menú QR', 'Integración de Reseñas de Google Maps', 'SEO Avanzado & Certificado SSL', 'Panel de administración sencillo'],
      features_en: ['Up to 5 dedicated pages or sections', 'Interactive Gallery & QR Menu', 'Google Maps Reviews Integration', 'Advanced SEO & SSL Certificate', 'Simple admin management'],
      popular: false,
      sort_order: 2
    },
    {
      id: 3,
      title_es: 'Tienda Online / E-Commerce',
      title_en: 'E-Commerce Online Store',
      badge_es: 'VENTAS ONLINE',
      badge_en: 'ONLINE SALES',
      price: '1.290€',
      period_es: 'Pago Único',
      period_en: 'One-Time Payment',
      description_es: 'Plataforma de venta online completa con pasarela de pago (Stripe/Bizum), gestión de stock y diseño exclusivo.',
      description_en: 'Full online sales platform with payment gateway (Stripe/Bizum), inventory management, and custom design.',
      features_es: ['Catálogo ilimitado de productos', 'Pasarela de Pago Segura (Stripe/Bizum)', 'Panel de control para gestionar pedidos', 'Carga ultra rápida & SEO para productos', 'Soporte y formación incluida'],
      features_en: ['Unlimited product catalog', 'Secure Payment Gateway (Stripe/Bizum)', 'Control panel to manage orders', 'Ultra fast load & product SEO', 'Support and training included'],
      popular: false,
      sort_order: 3
    },
    {
      id: 4,
      title_es: 'Mantenimiento & Soporte',
      title_en: 'Maintenance & Support',
      badge_es: 'SUSCRIPCIÓN',
      badge_en: 'SUBSCRIPTION',
      price: '49€/mes',
      period_es: 'Mensual',
      period_en: 'Monthly',
      description_es: 'Tranquilidad total con supervisión técnica constante, copias de seguridad y pequeños cambios incluidos.',
      description_en: 'Total peace of mind with ongoing technical supervision, backups, and small edits included.',
      features_es: ['Copias de seguridad semanales', 'Supervisión 24/7 de tiempo de actividad', 'Peticiones de cambios menores incluidas', 'Actualizaciones de seguridad y SSL'],
      features_en: ['Weekly backups', '24/7 uptime monitoring', 'Minor change requests included', 'Security updates & SSL'],
      popular: false,
      sort_order: 4
    }
  ];

  for (const s of services) {
    await postTable('mynext_services', s);
  }

  // 4. Projects (Proyectos)
  const projects = [
    {
      id: 1,
      slug: 'blessed-barber-studio',
      title: 'Blessed Barber Studio',
      category_es: 'Barbería de Alta Gama',
      category_en: 'High-End Barbershop',
      description_es: 'Diseño y desarrollo web premium para Barbería de Alta Gama con cartel exterior de horarios y QR de reserva directa.',
      description_en: 'Premium web design and development for High-End Barbershop with exterior QR booking poster.',
      image_url: './assets/img/portfolio/porfolio1.png',
      project_url: 'https://blessedstudio.pages.dev/',
      sort_order: 1,
      active: true
    },
    {
      id: 2,
      slug: 'bar-cafeteria-luna-llena',
      title: 'Bar Cafetería Luna Llena',
      category_es: 'Bar & Cafetería de Especialidad',
      category_en: 'Specialty Coffee & Bar',
      description_es: 'Carta digital interactiva y presencia web premium para bar-cafetería de especialidad.',
      description_en: 'Interactive digital menu and premium web presence for specialty coffee shop & bar.',
      image_url: './assets/img/portfolio/porfolio2-v3.png',
      project_url: 'https://barlunallena.pages.dev',
      sort_order: 2,
      active: true
    },
    {
      id: 3,
      slug: 'ecuaplac',
      title: 'Ecuaplac',
      category_es: 'Reformas & Tabiquería de Lujo',
      category_en: 'Luxury Renovations',
      description_es: 'Diseño web corporativo, tarjetas de visita con QR y vinilado para furgonetas de flota.',
      description_en: 'Corporate web design, business cards with QR, and fleet vehicle QR vinyl design.',
      image_url: './assets/img/portfolio/porfolio3.png',
      project_url: 'https://ecuapv2.pages.dev/',
      sort_order: 3,
      active: true
    },
    {
      id: 4,
      slug: 'rbari-restaurant',
      title: 'RBARI RESTAURANT',
      category_es: 'Restaurante Gastronómico',
      category_en: 'Gastronomic Restaurant',
      description_es: 'Experiencia inmersiva y menú digital para restaurante gastronómico en Birmingham.',
      description_en: 'Immersive experience and digital menu for gastronomic restaurant in Birmingham.',
      image_url: './assets/img/portfolio/porfolio4.png',
      project_url: 'https://rbari-v1.pages.dev',
      sort_order: 4,
      active: true
    },
    {
      id: 5,
      slug: 'next-era',
      title: 'NEXT ERA',
      category_es: 'Tienda Online / E-Commerce',
      category_en: 'E-Commerce Store',
      description_es: 'Prototipo de tienda e-commerce premium adaptable para marcas exclusivas.',
      description_en: 'Premium e-commerce store prototype adaptable for exclusive brands.',
      image_url: './assets/img/portfolio/porfolio5.png',
      project_url: 'https://nexterabymusa.pages.dev',
      sort_order: 5,
      active: true
    },
    {
      id: 6,
      slug: 'mezquita-arrahma',
      title: 'Mezquita Arrahma',
      category_es: 'Centro Islámico',
      category_en: 'Islamic Center',
      description_es: 'Arquitectura Digital solidaria con horarios de rezo en tiempo real y donaciones.',
      description_en: 'Solidary Digital Architecture with real-time prayer schedules and donations.',
      image_url: './assets/img/portfolio/porfolio6.png',
      project_url: 'https://mezquita-arrahma.pages.dev',
      sort_order: 6,
      active: true
    },
    {
      id: 7,
      slug: 'gran-marrakech',
      title: 'Gran Marrakech',
      category_es: 'Restaurante Marroquí',
      category_en: 'Moroccan Restaurant',
      description_es: 'Presencia online inmersiva y carta digital para restaurante marroquí en Palma.',
      description_en: 'Immersive online presence and digital menu for Moroccan Restaurant in Palma.',
      image_url: './assets/img/portfolio/porfolio7.png',
      project_url: 'https://granmarrakech.pages.dev',
      sort_order: 7,
      active: true
    },
    {
      id: 8,
      slug: 'tacos-marrakech',
      title: 'Tacos Marrakech',
      category_es: 'Restaurante Marroquí',
      category_en: 'Moroccan Restaurant',
      description_es: 'Experiencia digital con carta online intuitiva, soportes QR en mesa y reseñas.',
      description_en: 'Digital experience featuring intuitive online menu, table QR displays, and reviews.',
      image_url: './assets/img/portfolio/porfolio8.png',
      project_url: 'https://tacosmarrakech.pages.dev',
      sort_order: 8,
      active: true
    }
  ];

  for (const p of projects) {
    await postTable('mynext_projects', p);
  }

  // 5. Testimonials (Reseñas)
  const testimonials = [
    {
      id: 1,
      name: 'gustavo coyo quiñonez',
      company: 'Palma Barber Club',
      content_es: 'Brutal el curro de MYNEXT con la web de la barbería. Ha clavado el diseño y además está genial porque se adapta perfecto al móvil y al ordenador, que para el tema de las citas nos viene de lujo. Nos ha dado muchísima visibilidad y reservas en el día a día. Si quieres llevar tu negocio a otro nivel, habla con él ya que te asesora en todo y es un crack. ¡Servicio recomendado para negocios en Palma de Mallorca!',
      content_en: "Brutal work by MYNEXT on the barbershop's website. He nailed the design and it's also great because it adapts perfectly to mobile and desktop, which is fantastic for booking appointments. It has given us a lot of visibility and reservations on a daily basis. If you want to take your business to another level, talk to him as he advises you on everything and is brilliant. Highly recommended service for businesses in Palma de Mallorca!",
      rating: 5,
      author_photo: '',
      relative_time: 'Hace un mes',
      source: 'google',
      active: true
    },
    {
      id: 2,
      name: 'Danna Delgado',
      company: 'Cliente Verificado',
      content_es: '',
      content_en: '',
      rating: 5,
      author_photo: '',
      relative_time: 'Hace 3 semanas',
      source: 'google',
      active: true
    },
    {
      id: 3,
      name: 'Jhon Soliz',
      company: 'Teen G / Next Era',
      content_es: 'Como creador de Teen G, quería llevar mi idea a internet de una forma profesional. Conocí Next Era, un prototipo de ecommerce desarrollado por MyNext, y me gustó mucho el diseño y la imagen que transmitía. Musa me ayudó desde el principio, resolviendo dudas, aportando ideas y entendiendo lo que quería conseguir con mi proyecto. El trato fue cercano y siempre estuvo dispuesto a ayudar cuando lo necesitaba. Estoy muy contento con la experiencia y recomiendo MyNext a cualquier persona que necesite una página web profesional.',
      content_en: 'As the creator of Teen G, I wanted to take my idea to the internet in a professional way. I met Next Era, an ecommerce prototype developed by MyNext, and I really liked the design and the image it transmitted. Musa helped me from the beginning, answering questions, providing ideas and understanding what I wanted to achieve with my project. The treatment was close and he was always willing to help when I needed it. I am very happy with the experience and I recommend MyNext to anyone who needs a professional website for their business or brand.',
      rating: 5,
      author_photo: '',
      relative_time: 'Hace un mes',
      source: 'google',
      active: true
    },
    {
      id: 4,
      name: 'Ilyas Etaouriri',
      company: 'Cliente Verificado',
      content_es: 'Muy buen chico lo recomiendo puntual profesional atiende muy bien se explica muy bien',
      content_en: 'Very good guy, I recommend him. Punctual, professional, attends very well, explains himself very well',
      rating: 5,
      author_photo: '',
      relative_time: 'Hace un mes',
      source: 'google',
      active: true
    },
    {
      id: 5,
      name: 'John Smith',
      company: 'Cliente Verificado',
      content_es: '',
      content_en: '',
      rating: 5,
      author_photo: '',
      relative_time: 'Hace un mes',
      source: 'google',
      active: true
    },
    {
      id: 6,
      name: 'Goyo J.R.',
      company: 'Ecuaplac',
      content_es: 'Muy contento con el trabajo de MyNext. Musa nos hizo la página web de Ecuaplac desde cero y el resultado ha sido justo lo que buscábamos. Ahora nuestros clientes pueden encontrar toda la información de la empresa de una forma mucho más cómoda y profesional. Además, también diseñó nuestras nuevas tarjetas de visita con el nuevo logo y el código QR que lleva directamente a la web, y preparó el QR para colocarlo en la furgoneta de la empresa. Son pequeños detalles que ayudan a dar una imagen mucho más profesional. Durante todo el proceso la comunicación con Musa ha sido muy buena. Siempre ha respondido rápido, ha escuchado nuestras ideas y ha ido haciendo los cambios que necesitábamos sin ningún problema. Si tienes un negocio y estás pensando en hacer una página web o renovar la imagen de tu empresa, recomiendo contactar con MyNext. En nuestro caso, la experiencia ha sido muy positiva.',
      content_en: "Very happy with MyNext's work. Musa made the Ecuaplac website from scratch and the result was exactly what we were looking for. Now our clients can find all the company information in a much more convenient and professional way. In addition, he also designed our new business cards with the new logo and the QR code that leads directly to the web, and prepared the QR code to place on the company van. These are small details that help project a much more professional image. Throughout the process, communication with Musa has been very good. He always responded quickly, listened to our ideas, and made the changes we needed without any issues. If you have a business and are thinking about making a website or renewing your company's image, I recommend contacting MyNext. In our case, the experience has been very positive.",
      rating: 5,
      author_photo: '',
      relative_time: 'Hace 3 días',
      source: 'google',
      active: true
    },
    {
      id: 7,
      name: 'Anuar Zbat',
      company: 'Cliente Verificado',
      content_es: '',
      content_en: '',
      rating: 5,
      author_photo: '',
      relative_time: 'Hace 4 días',
      source: 'google',
      active: true
    }
  ];

  for (const t of testimonials) {
    await postTable('mynext_testimonials', t);
  }

  // 6. FAQ
  const faqs = [
    {
      id: 1,
      question_es: '1. ¿Qué es exactamente MyNext?',
      question_en: '1. What exactly is MyNext?',
      answer_es: 'MyNext es una marca digital independiente especializada en crear páginas web modernas para negocios locales, ecommerce, landing pages y experiencias digitales diseñadas a medida.',
      answer_en: 'MyNext is an independent digital brand specialized in creating modern websites for local businesses, ecommerce, landing pages, and custom digital experiences.',
      sort_order: 1,
      active: true
    },
    {
      id: 2,
      question_es: '2. ¿Por qué elegir MyNext en lugar de una agencia tradicional?',
      question_en: '2. Why choose MyNext over a traditional agency?',
      answer_es: 'Porque aquí hablas directamente con la persona que diseña y desarrolla tu proyecto. No hay intermediarios ni procesos innecesariamente complejos, lo que permite mayor agilidad y precios justos.',
      answer_en: 'Because here you speak directly with the person who designs and develops your project. No intermediaries or complex processes, allowing greater agility and fair prices.',
      sort_order: 2,
      active: true
    },
    {
      id: 3,
      question_es: '3. ¿Cuánto tiempo tarda una página web en estar lista?',
      question_en: '3. How long does a website take to be ready?',
      answer_es: 'La mayoría de las webs se completan entre 3 y 7 días laborales cuando el cliente facilita el contenido necesario desde el principio.',
      answer_en: 'Most websites are completed within 3 to 7 business days when the client provides the required content from the start.',
      sort_order: 3,
      active: true
    },
    {
      id: 4,
      question_es: '4. ¿Trabajas únicamente en Mallorca?',
      question_en: '4. Do you only work in Mallorca?',
      answer_es: 'No. Aunque MyNext tiene base en Mallorca, trabajo con clientes de cualquier ciudad o país de forma cómoda mediante comunicación online.',
      answer_en: 'No. Although MyNext is based in Mallorca, I work with clients from any city or country comfortably via online communication.',
      sort_order: 4,
      active: true
    },
    {
      id: 5,
      question_es: '5. ¿La página web será completamente mía una vez finalizado el proyecto?',
      question_en: '5. Will the website be completely mine once finished?',
      answer_es: 'Sí. Una vez entregado el proyecto, la web, el contenido y todos los activos pertenecen 100% al cliente.',
      answer_en: 'Yes. Once delivered, the website, content, and assets belong 100% to the client.',
      sort_order: 5,
      active: true
    }
  ];

  for (const f of faqs) {
    await postTable('mynext_faq', f);
  }

  // 7. Contact & Settings
  await postTable('mynext_contact', {
    id: 1,
    phone: '34673109486',
    email: 'mynextbymusa@gmail.com',
    whatsapp_message_es: '¡Hola! Vengo desde la web de MYNEXT. Me gustaría recibir información sobre vuestros servicios de diseño y arquitectura digital para mi negocio. ¡Gracias!',
    whatsapp_message_en: 'Hello! I came from the MYNEXT website. I would like to receive information about your design and digital architecture services for my business. Thank you!',
    site_title_es: 'Diseño Web en Palma de Mallorca | MYNEXT - Arquitectura Digital',
    site_title_en: 'Premium Web Design in Palma de Mallorca | MYNEXT Digital Architecture',
    meta_description_es: '¿Buscas diseño web en Palma de Mallorca? En MYNEXT creamos páginas web exclusivas, responsivas y optimizadas para SEO que impulsan tu negocio. ¡Contáctanos!',
    meta_description_en: 'Looking for premium web design in Palma de Mallorca? MYNEXT creates exclusive, responsive, and SEO-optimized websites to elevate your brand. Contact us!',
    footer_text_es: 'Diseñamos arquitectura digital de alta gama que transforma visiones en experiencias inmersivas y memorables.',
    footer_text_en: 'We design high-end digital architecture that transforms visions into immersive and memorable experiences.'
  });

  console.log('\n🎉 Volcado de datos REALES completado con ÉXITO en Supabase.');
}

main();
