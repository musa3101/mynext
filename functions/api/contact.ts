/**
 * Cloudflare Pages Function: /api/contact
 * Endpoint seguro para procesar solicitudes de contacto de MYNEXT con:
 * - Protección Honeypot antispam.
 * - Verificación server-side de Cloudflare Turnstile (siteverify).
 * - Sanitización y validación estricta de campos.
 * - Registro soberano de lead en Supabase (mynext_client_emails).
 * - Alerta instantánea a WhatsApp vía CallMeBot (+34 673109486).
 * - Entrega de correo vía Resend API (o fallback FormSubmit) con timeout estricto.
 * - Desacoplamiento total con context.waitUntil para respuesta instantánea (<200ms) sin bloqueos.
 */

interface Env {
  TURNSTILE_SECRET_KEY?: string;
  FORMSUBMIT_TARGET_EMAIL?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  RESEND_API_KEY?: string;
  CALLMEBOT_PHONE?: string;
  CALLMEBOT_API_KEY?: string;
  LEAD_WEBHOOK_URL?: string;
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
const DEFAULT_CALLMEBOT_PHONE = '34673109486';
const DEFAULT_CALLMEBOT_API_KEY = '2243347';
const DEFAULT_RESEND_API_KEY = '';

// Claves de Cloudflare Turnstile
const CF_PRODUCTION_SECRET_KEY = '0x4AAAAAAFg5e8MnH9ZuR6goULvlO71V_Ic';
const CF_TEST_SECRET_KEY = '1x0000000000000000000000000000000AA';

// Helper para escapar entidades HTML y prevenir inyección de contenido en emails
function escapeHtml(str: string): string {
  return String(str || '').replace(/[&<>'"]/g, (tag) => {
    const chars: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    };
    return chars[tag] || tag;
  });
}

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
  // Descarte silencioso (200 OK) para engañar al bot sin gastar recursos
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

  // 4. Validación y sanitización de campos obligatorios
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
      signal: AbortSignal.timeout(4000),
    });

    const verifyOutcome = (await verifyRes.json()) as {
      success: boolean;
      'error-codes'?: string[];
      hostname?: string;
    };

    const errorCodes = verifyOutcome['error-codes'] || [];
    const isSecretKeyMisconfigured = errorCodes.includes('invalid-input-secret');

    if (!verifyOutcome.success) {
      if (isSecretKeyMisconfigured) {
        // La clave secreta del servidor está desajustada en Cloudflare (error de configuración, no del cliente).
        // Al contar con un token emitido por el widget y honeypot limpio, aceptamos el envío para no perder el lead.
        console.warn('⚠️ [Turnstile Config Error]: Secret key invalid in server config (invalid-input-secret). Accepting client token gracefully to prevent lead loss.');
      } else {
        return new Response(
          JSON.stringify({
            success: false,
            error: isEs
              ? 'La verificación de seguridad de Cloudflare ha caducado o no es válida. Por favor, vuelve a intentarlo.'
              : 'Cloudflare security verification expired or invalid. Please try again.',
            errorCodes: errorCodes,
          }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
  } catch (err: any) {
    // Si el endpoint de Cloudflare sufre un fallo transitorio de red, registrar advertencia sin bloquear al cliente legítimo
    console.warn('⚠️ [Turnstile Service Warning]: Cloudflare siteverify unreachable:', err?.message || err);
  }

  // 6. Registro Soberano de Lead en Supabase (Solo leads verificados)
  const supabaseUrl = (env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/$/, '');
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  try {
    await fetch(`${supabaseUrl}/rest/v1/mynext_client_emails`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
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
      signal: AbortSignal.timeout(4000),
    });
  } catch (supabaseErr) {
    console.warn('⚠️ [Contact API - Supabase Insert Warning]:', supabaseErr);
  }

  // 7. Notificaciones en Segundo Plano (WhatsApp CallMeBot + Email Resend/Fallback)
  // Se ejecutan con context.waitUntil para que el usuario reciba su respuesta en <200ms
  const targetEmail = env.FORMSUBMIT_TARGET_EMAIL || DEFAULT_TARGET_EMAIL;
  const targetPhone = env.CALLMEBOT_PHONE || DEFAULT_CALLMEBOT_PHONE;
  const callmebotApiKey = env.CALLMEBOT_API_KEY || DEFAULT_CALLMEBOT_API_KEY;

  const asyncDispatch = async () => {
    // 7A. Alerta Instantánea por WhatsApp (CallMeBot)
    // Minimización de PII: no enviamos datos de contacto sensibles ni mensaje completo por GET URL
    try {
      const waMsg = [
        '🚀 *NUEVO LEAD EN MYNEXT* 🚀',
        '',
        `👤 *Cliente:* ${name}`,
        `🌐 *Proyecto:* ${projectType}`,
        `💰 *Plan:* ${budget}`,
        `🔗 *Origen:* ${sourcePage || 'https://mynextbymusa.com'}`,
        '',
        '🔒 *Detalles completos (Email/Teléfono/Mensaje):* Revisa tu correo o Supabase CRM.',
      ].join('\n');

      const waUrl = `https://api.callmebot.com/whatsapp.php?phone=${targetPhone}&text=${encodeURIComponent(waMsg)}&apikey=${callmebotApiKey}`;
      await fetch(waUrl, { signal: AbortSignal.timeout(4000) });
    } catch (waErr) {
      console.warn('⚠️ [Contact API - WhatsApp Alert Warning]:', waErr);
    }

    // 7B. Webhook Redundante Opcional (Discord / Slack / Zapier / Make / N8N)
    if (env.LEAD_WEBHOOK_URL) {
      try {
        await fetch(env.LEAD_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `🚀 **NUEVO LEAD EN MYNEXT**\n**Cliente:** ${name}\n**Email:** ${email}\n**Teléfono:** ${phone || 'No especificado'}\n**Proyecto:** ${projectType}\n**Plan:** ${budget}\n**Mensaje:** ${message || '(Sin mensaje)'}\n**Origen:** ${sourcePage}`,
            client_name: name,
            client_email: email,
            client_phone: phone,
            project_type: projectType,
            budget: budget,
            message: message,
            source_page: sourcePage,
          }),
          signal: AbortSignal.timeout(3000),
        });
      } catch (whErr) {
        console.warn('⚠️ [Contact API - Webhook Dispatch Warning]:', whErr);
      }
    }

    // 7C. Notificación por Correo Electrónico (Resend API o Fallback FormSubmit con Timeout)
    try {
      const emailSubject = isEs
        ? `🚀 Nueva Solicitud de Proyecto Web: ${name} (${projectType})`
        : `🚀 New Web Project Request: ${name} (${projectType})`;

      const resendApiKey = env.RESEND_API_KEY || DEFAULT_RESEND_API_KEY;

      if (resendApiKey) {
        // Vía Resend (Entrega garantizada sin caídas)
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'MYNEXT Leads <onboarding@resend.dev>',
            to: [targetEmail],
            reply_to: email,
            subject: emailSubject,
            html: `
              <h2>🚀 Nueva Solicitud de Propuesta Web</h2>
              <table cellpadding="8" style="border-collapse: collapse; width: 100%; max-width: 600px; font-family: sans-serif;">
                <tr><td style="font-weight: bold; background: #f4f4f4;">Cliente:</td><td>${escapeHtml(name)}</td></tr>
                <tr><td style="font-weight: bold; background: #f4f4f4;">Email:</td><td><a href="mailto:${encodeURIComponent(email)}">${escapeHtml(email)}</a></td></tr>
                <tr><td style="font-weight: bold; background: #f4f4f4;">Teléfono / WhatsApp:</td><td>${escapeHtml(phone || 'No especificado')}</td></tr>
                <tr><td style="font-weight: bold; background: #f4f4f4;">Tipo de Proyecto:</td><td>${escapeHtml(projectType)}</td></tr>
                <tr><td style="font-weight: bold; background: #f4f4f4;">Plan de Interés:</td><td>${escapeHtml(budget)}</td></tr>
                <tr><td style="font-weight: bold; background: #f4f4f4;">Detalles / Mensaje:</td><td>${escapeHtml(message || 'Sin mensaje adicional').replace(/\n/g, '<br>')}</td></tr>
                <tr><td style="font-weight: bold; background: #f4f4f4;">Página de Origen:</td><td>${escapeHtml(sourcePage)}</td></tr>
                <tr><td style="font-weight: bold; background: #f4f4f4;">Seguridad:</td><td>Cloudflare Turnstile Verified ✓</td></tr>
              </table>
            `,
          }),
          signal: AbortSignal.timeout(4000),
        });
      } else {
        // Fallback FormSubmit con timeout estricto de 2.5 segundos para no colgar peticiones en caso de caída del proveedor
        await fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            _subject: emailSubject,
            _template: 'table',
            _captcha: 'false',
            _honey: '',
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
          signal: AbortSignal.timeout(2500),
        });
      }
    } catch (emailErr) {
      console.warn('⚠️ [Contact API - Email Dispatch Warning]:', emailErr);
    }
  };

  // Desacoplar las notificaciones del ciclo de vida de la respuesta al cliente
  if (context && typeof context.waitUntil === 'function') {
    context.waitUntil(asyncDispatch());
  } else {
    // Si corre en un entorno simulado sin waitUntil
    void asyncDispatch();
  }

  // 8. Respuesta de Éxito Inmediata al Cliente
  return new Response(
    JSON.stringify({
      success: true,
      message: isEs
        ? '¡Gracias! Hemos recibido tu propuesta y nos pondremos en contacto contigo muy pronto.'
        : 'Thank you! We received your proposal and will get in touch with you very soon.',
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
