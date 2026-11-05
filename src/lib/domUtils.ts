/**
 * Utility module for safe DOM manipulation and bilingual string resolution.
 */

// Escape basic HTML entities to prevent XSS injection
export function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Sanitize HTML string allowing safe basic markup (e.g. <span>, <br>, <strong>, <em>, <a>)
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  // Strip dangerous tags (pairs or self-closing), inline event handlers (quoted and unquoted), and pseudo-protocols
  let clean = html
    .replace(/<\s*(script|iframe|object|embed|svg|base|meta|link)\b[^>]*>[\s\S]*?<\/\s*\1\s*>/gi, '')
    .replace(/<\s*(?:script|iframe|object|embed|svg|base|meta|link)\b[^>]*\/?>/gi, '')
    .replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(?:javascript|vbscript|data):/gi, 'blocked:');
  return clean;
}

// Helper to resolve bilingual strings (JSON or raw string)
export function getTranslation(value: string | null | undefined, language: 'es' | 'en'): string {
  if (!value) return '';
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object') {
      if (parsed[language] !== undefined) {
        return parsed[language];
      }
      if (parsed['es'] !== undefined) {
        return parsed['es'];
      }
      return value;
    }
  } catch (e) {
    // Return raw string if parsing fails
  }
  return value;
}

// Utility to apply dynamic settings from Supabase/fallback to HTML elements safely
export function applyDynamicSettings(settingsMap: Record<string, string>, currentLang: 'es' | 'en'): void {
  const elements = document.querySelectorAll<HTMLElement>('[data-sb-content]');
  elements.forEach(el => {
    const key = el.getAttribute('data-sb-content');
    if (key === 'footer_madeby') return;
    if (key && settingsMap[key]) {
      const translation = getTranslation(settingsMap[key], currentLang);
      if (translation) {
        const sanitized = sanitizeHtml(translation);
        if (el.innerHTML.trim() !== sanitized.trim()) {
          el.innerHTML = sanitized;
        }
      }
    }
  });
}
