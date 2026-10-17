import { supabase } from './supabase.ts';
import type { Database } from '../types/database.ts';

export type CookieConsentRow = Database['public']['Tables']['mynext_cookie_consents']['Insert'];
export type ClientEmailRow = Database['public']['Tables']['mynext_client_emails']['Insert'];

const VISITOR_STORAGE_KEY = 'mynext_visitor_id';

/**
 * Obtiene o genera un identificador anónimo único para el visitante (cumplimiento RGPD).
 */
export function getOrCreateVisitorId(): string {
  try {
    if (typeof localStorage !== 'undefined') {
      const existing = localStorage.getItem(VISITOR_STORAGE_KEY);
      if (existing && existing.trim().length > 0) {
        return existing;
      }
      const generated =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `vis_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      localStorage.setItem(VISITOR_STORAGE_KEY, generated);
      return generated;
    }
  } catch {
    // Fallback si el navegador bloquea localStorage
  }
  return `vis_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}

/**
 * Construye el payload validado para la tabla `mynext_cookie_consents`.
 */
export function buildCookieConsentPayload(
  preference: string,
  options?: {
    visitorId?: string;
    pageUrl?: string;
    language?: 'es' | 'en';
    userAgent?: string;
    screenResolution?: string;
    referrer?: string;
  }
): CookieConsentRow {
  const normalizedStatus: CookieConsentRow['consent_status'] =
    preference === 'accepted-all'
      ? 'accepted-all'
      : preference === 'rejected-non-essential'
      ? 'rejected-non-essential'
      : 'custom';

  const isAcceptedAll = normalizedStatus === 'accepted-all';

  const pageUrl =
    options?.pageUrl ?? (typeof window !== 'undefined' ? window.location.href : '');
  const language: 'es' | 'en' =
    options?.language ??
    (typeof document !== 'undefined' &&
    (document.documentElement.lang === 'en' ||
      (typeof window !== 'undefined' && window.location.pathname.includes('-en')))
      ? 'en'
      : 'es');
  const userAgent =
    options?.userAgent ?? (typeof navigator !== 'undefined' ? navigator.userAgent : '');
  const screenResolution =
    options?.screenResolution ??
    (typeof window !== 'undefined' && window.screen
      ? `${window.screen.width}x${window.screen.height}`
      : '');
  const referrer =
    options?.referrer ?? (typeof document !== 'undefined' ? document.referrer || 'direct' : 'direct');

  return {
    visitor_id: options?.visitorId || getOrCreateVisitorId(),
    consent_status: normalizedStatus,
    analytics_allowed: isAcceptedAll,
    marketing_allowed: isAcceptedAll,
    page_url: pageUrl,
    language,
    user_agent: userAgent,
    screen_resolution: screenResolution,
    referrer,
  };
}

/**
 * Construye el payload validado para la tabla `mynext_client_emails`.
 */
export function buildClientEmailPayload(input: {
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  projectType?: string;
  budgetPlan?: string;
  message?: string;
  sourcePage?: string;
  language?: 'es' | 'en';
  cookieConsent?: string;
  userAgent?: string;
}): ClientEmailRow {
  const cookieConsent =
    input.cookieConsent ??
    (typeof localStorage !== 'undefined'
      ? localStorage.getItem('cookie-preference') || 'not-set'
      : 'not-set');

  return {
    client_name: (input.clientName || 'Cliente / Negocio').trim(),
    client_email: input.clientEmail.trim().toLowerCase(),
    client_phone: (input.clientPhone || '').trim(),
    project_type: (input.projectType || 'General').trim(),
    budget_plan: (input.budgetPlan || '').trim(),
    message: (input.message || '').trim(),
    source_page:
      input.sourcePage ?? (typeof window !== 'undefined' ? window.location.href : ''),
    language: input.language || 'es',
    cookie_consent: cookieConsent,
    status: 'new',
    user_agent:
      input.userAgent ?? (typeof navigator !== 'undefined' ? navigator.userAgent : ''),
  };
}

/**
 * Registra en Supabase (`mynext_cookie_consents`) la decisión de cookies del visitante.
 * Usa INSERT sin `.select()` (`return=minimal`) para cumplir con la política RLS de solo-inserción anónima.
 */
export async function recordCookieConsent(preference: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = buildCookieConsentPayload(preference);
    const { error } = await supabase.from('mynext_cookie_consents').insert(payload);
    if (error) {
      if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
        console.warn('⚠️ [Supabase Cookie Log]:', error.message);
      }
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Registra en Supabase (`mynext_client_emails`) el correo / solicitud enviado por un cliente desde la web.
 * Usa INSERT sin `.select()` (`return=minimal`) para cumplir con la política RLS de solo-inserción anónima.
 */
export async function recordClientEmail(input: {
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  projectType?: string;
  budgetPlan?: string;
  message?: string;
  sourcePage?: string;
  language?: 'es' | 'en';
}): Promise<boolean> {
  if (!supabase || !input.clientEmail || !input.clientEmail.includes('@')) return false;
  try {
    const payload = buildClientEmailPayload(input);
    const { error } = await supabase.from('mynext_client_emails').insert(payload);
    if (error) {
      if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
        console.warn('⚠️ [Supabase Client Email Log]:', error.message);
      }
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
