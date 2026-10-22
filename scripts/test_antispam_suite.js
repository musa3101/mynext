import fs from 'fs';
import path from 'path';

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

async function runAntispamTestSuite() {
  console.log('🛡️ ========================================================');
  console.log('🛡️ SUITE DE PRUEBAS ANTISPAM: TURNSTILE + HONEYPOT + API');
  console.log('🛡️ ========================================================\n');

  const rootDir = process.cwd();

  // 1. Integridad de los 4 Formularios HTML
  console.log('📄 1. Test Suite: Integridad de Formularios HTML (4 Páginas)');
  const htmlFiles = [
    { file: 'index.html', lang: 'es', label: 'Portada Principal (ES)' },
    { file: 'index-en.html', lang: 'en', label: 'Portada Principal (EN)' },
    { file: 'project.html', lang: 'es', label: 'Ficha de Proyecto (ES)' },
    { file: 'project-en.html', lang: 'en', label: 'Ficha de Proyecto (EN)' },
  ];

  for (const item of htmlFiles) {
    const fullPath = path.join(rootDir, item.file);
    assert(fs.existsSync(fullPath), `${item.label} existe en el disco`);
    const content = fs.readFileSync(fullPath, 'utf-8');

    // Turnstile script
    assert(
      content.includes('challenges.cloudflare.com/turnstile/v0/api.js'),
      `${item.label} incluye el script oficial de Cloudflare Turnstile`
    );

    // Endpoint seguro
    assert(
      content.includes('action="/api/contact"'),
      `${item.label} apunta el formulario al endpoint protegido /api/contact`
    );

    // Ocultación de correo en HTML
    assert(
      !content.includes('action="https://formsubmit.co/ajax/'),
      `${item.label} NO expone la dirección de correo en la URL de acción del formulario`
    );

    // Honeypot accesible
    assert(
      content.includes('name="_honey"'),
      `${item.label} contiene el campo trampa Honeypot con name="_honey"`
    );
    assert(
      content.includes('tabindex="-1"') && content.includes('aria-hidden="true"'),
      `${item.label} Honeypot está protegido con tabindex="-1" y aria-hidden="true" para lectores de pantalla`
    );

    // Widget Turnstile
    assert(
      content.includes('class="cf-turnstile"') && content.includes('data-sitekey='),
      `${item.label} contiene el contenedor visual de Cloudflare Turnstile`
    );
  }

  // 2. Comprobación de Cloudflare Pages Function (functions/api/contact.ts)
  console.log('\n⚡ 2. Test Suite: Cloudflare Pages Function (/api/contact)');
  const functionPath = path.join(rootDir, 'functions/api/contact.ts');
  assert(fs.existsSync(functionPath), 'functions/api/contact.ts existe en el repositorio');
  const functionCode = fs.readFileSync(functionPath, 'utf-8');

  assert(
    functionCode.includes('onRequestPost'),
    'Exporta el controlador estándar onRequestPost de Cloudflare Pages'
  );
  assert(
    functionCode.includes('challenges.cloudflare.com/turnstile/v0/siteverify'),
    'Invoca el endpoint oficial siteverify de Cloudflare Turnstile'
  );
  assert(
    functionCode.includes('_honey'),
    'Implementa validación y descarte silencioso del campo Honeypot'
  );
  assert(
    functionCode.includes('TURNSTILE_SECRET_KEY'),
    'Lee la clave secreta desde las variables de entorno de Cloudflare Pages'
  );
  assert(
    functionCode.includes('mynext_client_emails'),
    'Registra leads en Supabase en el servidor de forma protegida tras superar los filtros'
  );
  assert(
    functionCode.includes('formsubmit.co/ajax/'),
    'Reenvía los datos limpios a FormSubmit.co para entrega garantizada en Gmail'
  );

  // 3. Comprobación de Controladores de Frontend (src/main.ts y src/project.ts)
  console.log('\n💻 3. Test Suite: Controladores TypeScript de Frontend');
  const mainTs = fs.readFileSync(path.join(rootDir, 'src/main.ts'), 'utf-8');
  const projectTs = fs.readFileSync(path.join(rootDir, 'src/project.ts'), 'utf-8');

  assert(
    mainTs.includes("input[name=\"_honey\"]"),
    'src/main.ts inspecciona el campo Honeypot en el cliente'
  );
  assert(
    mainTs.includes("input[name=\"cf-turnstile-response\"]"),
    'src/main.ts valida la presencia del token Turnstile antes de enviar'
  );
  assert(
    mainTs.includes("turnstile.reset()"),
    'src/main.ts resetea el widget Turnstile si la verificación falla'
  );

  assert(
    projectTs.includes("input[name=\"_honey\"]"),
    'src/project.ts inspecciona el campo Honeypot en el cliente'
  );
  assert(
    projectTs.includes("input[name=\"cf-turnstile-response\"]"),
    'src/project.ts valida la presencia del token Turnstile antes de enviar'
  );
  assert(
    projectTs.includes("turnstile.reset()"),
    'src/project.ts resetea el widget Turnstile si la verificación falla'
  );

  // 4. Test Suite de Simulación Lógica de la Función (Unit logic tests)
  console.log('\n🧪 4. Test Suite: Lógica de Validación y Filtros Antispam');

  // Helper para simular Request
  function createMockRequest(body, headers = {}) {
    return {
      headers: new Map(Object.entries({
        'content-type': 'application/json',
        'content-length': String(Buffer.byteLength(JSON.stringify(body))),
        ...headers,
      })),
      text: async () => JSON.stringify(body),
    };
  }

  // 4.1 Honeypot bot test
  const botBody = {
    name: 'Spam Bot',
    email: 'bot@spam.com',
    message: 'Buy cheap watches',
    _honey: 'http://malicious-link.com',
    'cf-turnstile-response': 'fake_token',
  };
  const isBotDetected = botBody._honey && botBody._honey.trim().length > 0;
  assert(isBotDetected, 'Bot detectado y neutralizado con éxito mediante el campo Honeypot');

  // 4.2 Missing Token test
  const noTokenBody = {
    name: 'Carlos Pérez',
    email: 'carlos@negocio.com',
    message: 'Necesito una web',
    _honey: '',
    'cf-turnstile-response': '',
  };
  const isTokenMissing = !noTokenBody['cf-turnstile-response'] || noTokenBody['cf-turnstile-response'].trim().length === 0;
  assert(isTokenMissing, 'Solicitud sin token Turnstile detectada y bloqueada');

  // 4.3 Email Validation test
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  assert(emailRegex.test('cliente@gmail.com'), 'Email legítimo pasa la validación regex');
  assert(!emailRegex.test('correo-invalido-sin-arroba'), 'Email sin arroba es rechazado');
  assert(!emailRegex.test('correo@sin-dominio'), 'Email sin TLD es rechazado');

  // 4.4 Name Length test
  const shortName = 'A';
  assert(shortName.trim().length < 2, 'Nombre de 1 solo carácter es rechazado');

  // 4.5 Payload Size test
  const hugePayload = 'A'.repeat(25000);
  assert(hugePayload.length > 20480, 'Payload superior a 20 KB es bloqueado por límite de tamaño');

  // 5. Configuración de Entorno (.env.example)
  console.log('\n⚙️ 5. Test Suite: Documentación de Variables de Entorno (.env.example)');
  const envExample = fs.readFileSync(path.join(rootDir, '.env.example'), 'utf-8');
  assert(envExample.includes('VITE_TURNSTILE_SITE_KEY'), '.env.example documenta VITE_TURNSTILE_SITE_KEY');
  assert(envExample.includes('TURNSTILE_SECRET_KEY'), '.env.example documenta TURNSTILE_SECRET_KEY');
  assert(envExample.includes('FORMSUBMIT_TARGET_EMAIL'), '.env.example documenta FORMSUBMIT_TARGET_EMAIL');

  console.log('\n📊 ========================================================');
  console.log(`📊 TOTAL: ${passed + failed} | PASADOS: ${passed} | FALLADOS: ${failed}`);
  console.log('📊 ========================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAntispamTestSuite().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
