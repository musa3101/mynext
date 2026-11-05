/**
 * =====================================================================
 * MYNEXT - GESTOR DE CONSENTIMIENTO Y PERSISTENCIA DE COOKIES (365 DÍAS)
 * =====================================================================
 * Proporciona persistencia híbrida redundante (Cookie de 1ª parte + LocalStorage)
 * con auto-reparación bidireccional para solventar la purga agresiva de
 * almacenamiento en Safari iOS (WebKit ITP), navegación privada y
 * diferencias de subdominios (www vs apex).
 */

export const COOKIE_PREFERENCE_KEY = 'cookie-preference';
export const VISITOR_ID_KEY = 'mynext_visitor_id';
export const ONE_YEAR_SECONDS = 31536000; // 365 días en segundos

/**
 * Resuelve el dominio de la cookie para que funcione tanto en el dominio raíz
 * como en subdominios (ej. mynextbymusa.com y www.mynextbymusa.com).
 * Excluye entornos locales y sufijos públicos (pages.dev).
 */
export function resolveCookieDomain(hostname: string): string {
  if (
    !hostname ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.pages.dev')
  ) {
    return '';
  }
  const parts = hostname.split('.');
  if (parts.length >= 2) {
    return '.' + parts.slice(-2).join('.');
  }
  return '';
}

/**
 * Parsea el valor de una cookie a partir de una cadena tipo document.cookie.
 */
export function parseCookieValue(cookieHeader: string, cookieName: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp('(?:^|;\\s*)' + encodeURIComponent(cookieName) + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Construye la directiva Set-Cookie con parámetros de seguridad y duración óptimos.
 */
export function buildCookieString(
  name: string,
  value: string,
  options?: {
    maxAge?: number;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'Lax' | 'Strict' | 'None';
  }
): string {
  const maxAge = options?.maxAge ?? ONE_YEAR_SECONDS;
  const path = options?.path ?? '/';
  const domain = options?.domain ?? '';
  const secure = options?.secure ?? false;
  const sameSite = options?.sameSite ?? 'Lax';

  let str = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=${path}; SameSite=${sameSite};`;
  if (domain) {
    str += ` Domain=${domain};`;
  }
  if (secure) {
    str += ' Secure;';
  }
  return str;
}

/**
 * Obtiene la preferencia de cookies guardada usando el sistema híbrido redundante.
 * Si Safari borró localStorage pero la cookie sobrevive, repara localStorage.
 * Si la cookie expiró pero localStorage sigue intacto, renueva la cookie.
 */
export function getCookiePreference(): string | null {
  let localPref: string | null = null;
  let cookiePref: string | null = null;

  // 1. Intentar leer de localStorage
  try {
    if (typeof localStorage !== 'undefined') {
      localPref = localStorage.getItem(COOKIE_PREFERENCE_KEY);
    }
  } catch {
    // Acceso restringido en modo privado estricto
  }

  // 2. Intentar leer de document.cookie
  try {
    if (typeof document !== 'undefined') {
      cookiePref = parseCookieValue(document.cookie, COOKIE_PREFERENCE_KEY);
    }
  } catch {
    // Acceso restringido
  }

  const effective = localPref || cookiePref;

  // 3. Auto-reparación bidireccional (Self-healing):
  if (effective && !localPref) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(COOKIE_PREFERENCE_KEY, effective);
      }
    } catch {
      // Ignorar si el almacenamiento está completamente bloqueado
    }
  }

  if (effective && !cookiePref) {
    setCookiePreference(effective);
  }

  return effective;
}

/**
 * Guarda la decisión del usuario tanto en localStorage como en una Cookie real de 1 año.
 */
export function setCookiePreference(pref: string): void {
  // 1. Persistencia en localStorage
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(COOKIE_PREFERENCE_KEY, pref);
    }
  } catch {
    // Ignorar si localStorage está bloqueado
  }

  // 2. Persistencia en Cookie de 1ª parte (365 días)
  try {
    if (typeof document !== 'undefined') {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
      const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
      const domain = resolveCookieDomain(hostname);
      const cookieStr = buildCookieString(COOKIE_PREFERENCE_KEY, pref, {
        maxAge: ONE_YEAR_SECONDS,
        path: '/',
        domain,
        secure: isHttps,
        sameSite: 'Lax',
      });
      document.cookie = cookieStr;
    }
  } catch {
    // Ignorar si cookies están deshabilitadas
  }
}

/**
 * Comprueba de forma instantánea si el usuario ya ha tomado una decisión de cookies.
 */
export function hasUserConsented(): boolean {
  return getCookiePreference() !== null;
}

