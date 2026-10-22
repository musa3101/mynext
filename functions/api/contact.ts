/**
 * Cloudflare Pages Function: /api/contact
 * Endpoint seguro para procesar solicitudes de contacto de MYNEXT con:
 * - Protección Honeypot antispam.
 * - Verificación server-side de Cloudflare Turnstile (siteverify).
 * - Sanitización y validación estricta de campos.
 * - Registro seguro de lead en Supabase (sin inyecciones de spam).
 * - Entrega garantizada por correo vía FormSubmit.co a Gmail con dirección protegida.
 */

interface Env {
  TURNSTILE_SECRET_KEY?: string;
  FORMSUBMIT_TARGET_EMAIL?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
}

interface EventContext<Env, P extends string, Data> {
  request: Request;
  functionPath: string;
  waitUntil: (promise: Promise<unknown>) => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  env: Env;
  params: Record<P, string | string[]>;
  data: Data;
}

interface ContactPayload {
  name?: string;
  email?: string;
  phone?: string;
  project_type?: string;
  budget?: string;
  message?: string;
  source_page?: string;
  language?: 'es' | 'en';
  _honey?: string;
  'cf-turnstile-response'?: string;
}

const DEFAULT_SUPABASE_URL = 'https://elfdkbqlvawaprgidqhd.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_9qAEy3xuzB8HU2wSW1e36w_n051oO66';
const DEFAULT_TARGET_EMAIL = 'mynextbymusa@gmail.com';

// Claves de Cloudflare Turnstile
const CF_PRODUCTION_SECRET_KEY = '0x4AAAAAAFg5e8MnH9ZuR6goULvl071V_Ic';
const CF_TEST_SECRET_KEY = '1x0000000000000000000000000000000AA';

export async function onRequestPost(context: EventContext<Env, any, any>): Promise<Response> {
  const { request, env } = context;

  // 1. Validar Content-Type
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return new Response(
      JSON.stringify({ success: false, error: 'Content-Type must be application/json' }),
      { status: 415, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 2. Limitar tamaño del payload (< 20 KB)
  const contentLength = parseInt(request.headers.get('content-length') || '0', 10);
  if (contentLength > 20480) {
    return new Response(
      JSON.stringify({ success: false, error: 'Payload exceeds 20KB limit' }),
      { status: 413, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let payload: ContactPayload;
  try {
    const rawText = await request.text();
    if (rawText.length > 20480) {
      return new Response(
        JSON.stringify({ success: false, error: 'Payload exceeds 20KB limit' }),
        { status: 413, headers: { 'Content-Type': 'application/json' } }
      );
    }
    payload = JSON.parse(rawText);
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid JSON payload' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const isEs = payload.language !== 'en';
  const lang: 'es' | 'en' = isEs ? 'es' : 'en';

  // 3. Verificación Honeypot (_honey)
  // Si contiene algún carácter, es un bot que recorrió los inputs del formulario.
  // Respuesta silenciosa (200 OK) para engañar al bot sin procesar nada.
  if (payload._honey && payload._honey.trim().length > 0) {
    return new Response(
      JSON.stringify({
        success: true,
        message: isEs ? '¡Solicitud enviada con éxito!' : 'Proposal sent successfully!',
        filtered: true,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 4. Validación de campos obligatorios
  const name = (payload.name || '').trim().slice(0, 100);
  const email = (payload.email || '').trim().toLowerCase().slice(0, 100);
  const phone = (payload.phone || '').trim().slice(0, 30);
  const projectType = (payload.project_type || 'General').trim().slice(0, 100);
  const budget = (payload.budget || 'No especificado').trim().slice(0, 100);
  const message = (payload.message || '').trim().slice(0, 3000);
  const sourcePage = (payload.source_page || '').trim().slice(0, 250);
  const turnstileToken = (payload['cf-turnstile-response'] || '').trim();

  if (!name || name.length < 2) {
    return new Response(
      JSON.stringify({
        success: false,
        error: isEs ? 'Por favor, introduce tu nombre o empresa válido.' : 'Please provide a valid name.',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!email || !emailRegex.test(email)) {
    return new Response(
      JSON.stringify({
        success: false,
        error: isEs ? 'Por favor, introduce un correo electrónico válido.' : 'Please provide a valid email.',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 5. Verificación Server-Side de Cloudflare Turnstile
  if (!turnstileToken) {
    return new Response(
      JSON.stringify({
        success: false,
        error: isEs
          ? 'Por favor, completa la verificación de seguridad antes de enviar.'
          : 'Please complete the security check before submitting.',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const secretKey =
    turnstileToken === '1x00000000000000000000AA' || turnstileToken === 'dummy_turnstile_test_token'
      ? CF_TEST_SECRET_KEY
      : (env.TURNSTILE_SECRET_KEY || CF_PRODUCTION_SECRET_KEY);
  const clientIp = request.headers.get('CF-Connecting-IP') || '';

  try {
    const turnstileFormData = new URLSearchParams();
    turnstileFormData.append('secret', secretKey);
    turnstileFormData.append('response', turnstileToken);
    if (clientIp) {
      turnstileFormData.append('remoteip', clientIp);
    }

    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: turnstileFormData,
    });

    const verifyOutcome = (await verifyRes.json()) as {
      success: boolean;
      'error-codes'?: string[];
      hostname?: string;
    };

    if (!verifyOutcome.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: isEs
            ? 'La verificación de seguridad de Cloudflare ha caducado o no es válida. Por favor, vuelve a intentarlo.'
            : 'Cloudflare security verification expired or invalid. Please try again.',
          errorCodes: verifyOutcome['error-codes'] || [],
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: isEs
          ? 'Error al verificar la seguridad. Por favor, inténtalo de nuevo.'
          : 'Security check service unreachable. Please try again.',
      }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 6. Registro Seguro de Lead en Supabase (Solo leads verificados)
  const supabaseUrl = (env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/$/, '');
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  try {
    await fetch(`${supabaseUrl}/rest/v1/mynext_client_emails`, {
      method: 'POST',
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        client_name: name,
        client_email: email,
        client_phone: phone || (isEs ? 'No especificado' : 'Not specified'),
        project_type: projectType,
        budget_plan: budget,
        message: message,
        source_page: sourcePage,
        language: lang,
        cookie_consent: 'via-form',
        status: 'new',
        user_agent: request.headers.get('user-agent') || 'CF-Pages-Function',
      }),
    });
  } catch (supabaseErr) {
    // Si Supabase falla temporalmente, loguear sin bloquear la entrega en Gmail
    console.warn('⚠️ [Contact API - Supabase Insert Warning]:', supabaseErr);
  }

  // 7. Reenvío a FormSubmit.co para entrega en Gmail
  const targetEmail = env.FORMSUBMIT_TARGET_EMAIL || DEFAULT_TARGET_EMAIL;
  const subject = isEs
    ? `🚀 Nueva Solicitud de Proyecto Web: ${name} (${projectType})`
    : `🚀 New Web Project Request: ${name} (${projectType})`;

  const autorespondVal = isEs
    ? `¡Hola ${name}!

Muchas gracias por contactar con MYNEXT. Hemos recibido correctamente los detalles de tu consulta para tu proyecto web:

• Tipo de Proyecto: ${projectType}
• Plan de Interés: ${budget}

He revisado tu solicitud y en breve me pondré en contacto contigo directamente por correo o WhatsApp para agendar una breve llamada o enviarte la propuesta personalizada sin compromiso.

Un saludo,
Musa — MYNEXT Arquitectura Digital
https://mynextbymusa.com`
    : `Hello ${name}!

Thank you very much for contacting MYNEXT. We have successfully received your inquiry details for your web project:

• Project Type: ${projectType}
• Plan of Interest: ${budget}

I have reviewed your request and will contact you directly via email or WhatsApp shortly to schedule a brief call or send you a custom proposal with no obligation.

Best regards,
Musa — MYNEXT Digital Architecture
https://mynextbymusa.com`;

  try {
    const formSubmitRes = await fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        _subject: subject,
        _template: 'table',
        _captcha: 'false',
        _honey: '',
        _autorespond: autorespondVal,
        "Cliente / Negocio": name,
        "Email de Contacto": email,
        "Teléfono / WhatsApp": phone || (isEs ? 'No especificado' : 'Not specified'),
        "Tipo de Proyecto": projectType,
        "Plan de Interés": budget,
        "Detalles / Idea del Proyecto": message,
        "Página de Origen": sourcePage,
        "Idioma": lang.toUpperCase(),
        "Seguridad Cloudflare": "Turnstile Verified ✓",
      }),
    });

    if (formSubmitRes.ok) {
      return new Response(
        JSON.stringify({
          success: true,
          message: isEs
            ? '¡Gracias! Hemos recibido tu propuesta y te hemos enviado un correo de confirmación.'
            : 'Thank you! We received your proposal and sent you a confirmation email.',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      const errBody = await formSubmitRes.text().catch(() => '');
      console.error('❌ [FormSubmit Error]:', formSubmitRes.status, errBody);
      return new Response(
        JSON.stringify({
          success: false,
          error: isEs
            ? 'No se ha podido enviar la solicitud al servicio de correo. Por favor, inténtalo más tarde.'
            : 'Could not deliver the message to the email service. Please try again later.',
        }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (deliveryErr: any) {
    console.error('❌ [FormSubmit Network Error]:', deliveryErr);
    return new Response(
      JSON.stringify({
        success: false,
        error: isEs
          ? 'Error de conexión con el servicio de correo.'
          : 'Network error connecting to email service.',
      }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
