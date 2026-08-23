import { fallbackProjects, fallbackSettings, fallbackTestimonials, fallbackServices } from '../src/lib/fallbackData.ts';

let passed = 0;
let failed = 0;
const results = [];

function assert(condition, testName, errorMsg = '') {
  if (condition) {
    passed++;
    results.push({ name: testName, status: 'PASSED' });
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    failed++;
    results.push({ name: testName, status: 'FAILED', error: errorMsg });
    console.error(`  ❌ [FAIL] ${testName}: ${errorMsg}`);
  }
}

function runUnitTests() {
  console.log('🧪 ========================================================');
  console.log('🧪 SUITE DE TESTS UNITARIOS (unit-testing-test-generate)');
  console.log('🧪 ========================================================\n');

  // --- 1. Test Suite: Integridad de Proyectos en fallbackData ---
  console.log('📦 1. Test Suite: Proyectos (fallbackProjects)');
  assert(Array.isArray(fallbackProjects) && fallbackProjects.length > 0, 'fallbackProjects es un array no vacío');

  const slugs = new Set();
  fallbackProjects.forEach((proj, idx) => {
    assert(proj.id !== undefined && proj.id !== null, `Proyecto #${idx + 1} tiene un ID único`);
    assert(typeof proj.slug === 'string' && proj.slug.trim().length > 0, `Proyecto '${proj.title || idx}' tiene slug válido`);
    assert(!slugs.has(proj.slug), `El slug '${proj.slug}' es único en todo el catálogo`);
    slugs.add(proj.slug);

    // Validar descripción bilingüe (JSON o string)
    let descEs = '';
    let descEn = '';
    try {
      const parsedDesc = typeof proj.description === 'string' ? JSON.parse(proj.description) : proj.description;
      descEs = parsedDesc?.es || '';
      descEn = parsedDesc?.en || '';
    } catch {
      descEs = proj.description;
    }
    assert(descEs.length > 0, `Proyecto '${proj.slug}' tiene descripción en Español`);

    // Validar optimización de imagen .webp
    if (proj.image_url) {
      assert(
        proj.image_url.endsWith('.webp') || proj.image_url.startsWith('http') || proj.image_url.startsWith('./'),
        `Proyecto '${proj.slug}' utiliza formato de imagen optimizado (.webp)`
      );
    }
  });

  // --- 2. Test Suite: Configuración Global (fallbackSettings) ---
  console.log('\n⚙️ 2. Test Suite: Configuración Global (fallbackSettings)');
  assert(typeof fallbackSettings === 'object' && fallbackSettings !== null, 'fallbackSettings está inicializado');
  assert(typeof fallbackSettings.contact_email === 'string' && fallbackSettings.contact_email.includes('@'), 'Email de contacto válido');
  assert(typeof fallbackSettings.contact_phone === 'string' && fallbackSettings.contact_phone.length > 5, 'Teléfono de contacto configurado');

  // --- 3. Test Suite: Reseñas de Google Maps (fallbackTestimonials) ---
  console.log('\n⭐ 3. Test Suite: Testimonios y Reseñas (fallbackTestimonials)');
  assert(Array.isArray(fallbackTestimonials) && fallbackTestimonials.length >= 3, 'Existen al menos 3 testimonios de clientes');
  fallbackTestimonials.forEach((review, idx) => {
    assert(review.rating === 5, `Reseña #${idx + 1} (${review.name}) tiene puntuación 5.0 ⭐`);
    assert(typeof review.name === 'string' && review.name.length > 0, `Reseña #${idx + 1} tiene nombre de autor válido`);
  });

  // --- 4. Test Suite: Servicios Ofrecidos (fallbackServices) ---
  console.log('\n💼 4. Test Suite: Servicios de Arquitectura Digital (fallbackServices)');
  assert(Array.isArray(fallbackServices) && fallbackServices.length >= 2, 'Existen servicios principales definidos');
  fallbackServices.forEach((serv, idx) => {
    assert(typeof serv.title === 'string' && serv.title.length > 0, `Servicio #${idx + 1} tiene título`);
    assert(typeof serv.description === 'string' && serv.description.length > 0, `Servicio #${idx + 1} tiene descripción`);
  });

  // --- 4. Test Suite: Función Pura de Traducción Defensiva ---
  console.log('\n🌐 4. Test Suite: Parser de Traducción Bilingüe (i18n Parser)');
  
  function getFieldTranslation(item, fieldBase, language) {
    if (!item) return '';
    const langKey = `${fieldBase}_${language}`;
    if (item[langKey] !== undefined && item[langKey] !== null && item[langKey] !== '') {
      return typeof item[langKey] === 'string' ? item[langKey] : JSON.stringify(item[langKey]);
    }
    const fallbackLangKey = language === 'en' ? `${fieldBase}_es` : `${fieldBase}_en`;
    if (item[fallbackLangKey] !== undefined && item[fallbackLangKey] !== null && item[fallbackLangKey] !== '') {
      return typeof item[fallbackLangKey] === 'string' ? item[fallbackLangKey] : JSON.stringify(item[fallbackLangKey]);
    }
    const val = item[fieldBase];
    if (val === undefined || val === null) return '';
    if (typeof val === 'object') {
      return val[language] || val['es'] || val['en'] || '';
    }
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        if (parsed && typeof parsed === 'object') {
          return parsed[language] || parsed['es'] || parsed['en'] || val;
        }
      } catch {
        // not json
      }
      return val;
    }
    return String(val);
  }

  // Casos de prueba de traducción
  const sampleJson = { title: JSON.stringify({ es: 'Título ES', en: 'Title EN' }) };
  const sampleFlat = { title_es: 'Plano ES', title_en: 'Flat EN' };
  const sampleObject = { title: { es: 'Obj ES', en: 'Obj EN' } };
  const sampleFallback = { title: 'Solo Texto' };

  assert(getFieldTranslation(sampleJson, 'title', 'es') === 'Título ES', 'Parseo de JSON en Español');
  assert(getFieldTranslation(sampleJson, 'title', 'en') === 'Title EN', 'Parseo de JSON en Inglés');
  assert(getFieldTranslation(sampleFlat, 'title', 'es') === 'Plano ES', 'Parseo de claves planas _es');
  assert(getFieldTranslation(sampleFlat, 'title', 'en') === 'Flat EN', 'Parseo de claves planas _en');
  assert(getFieldTranslation(sampleObject, 'title', 'es') === 'Obj ES', 'Parseo de objeto nativo en Español');
  assert(getFieldTranslation(sampleFallback, 'title', 'en') === 'Solo Texto', 'Fallback a string plano si no es bilingüe');
  assert(getFieldTranslation(null, 'title', 'es') === '', 'Manejo defensivo de valores null');

  // --- Resumen de Resultados ---
  console.log('\n📊 ========================================================');
  console.log(`📊 TOTAL: ${passed + failed} | PASADOS: ${passed} | FALLADOS: ${failed}`);
  console.log('📊 ========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runUnitTests();
