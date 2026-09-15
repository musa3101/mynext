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
  // Strip inline event handlers (e.g. onerror=, onclick=) and script tags
  let clean = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');
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
    if (key && settingsMap[key]) {
      const translation = getTranslation(settingsMap[key], currentLang);
      if (translation) {
        el.innerHTML = sanitizeHtml(translation);
      }
    }
  });
}
