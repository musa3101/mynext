/// <reference types="vite/client" />

const DEFAULT_SUPABASE_URL = 'https://elfdkbqlvawaprgidqhd.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_9qAEy3xuzB8HU2wSW1e36w_n051oO66';

const rawUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  DEFAULT_SUPABASE_URL;
const supabaseUrl = rawUrl.replace(/\/$/, '');
const supabaseAnonKey =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase credentials are not defined. The portfolio will automatically run in local fallback mode.'
  );
}

interface QueryResult<T = any> {
  data: T | null;
  error: Error | null;
}

class PostgrestQueryBuilder<T = any> implements PromiseLike<QueryResult<T>> {
  private table: string;
  private params: URLSearchParams;
  private singleMode = false;
  private method: 'GET' | 'POST' = 'GET';
  private bodyPayload: unknown = null;

  constructor(table: string) {
    this.table = table;
    this.params = new URLSearchParams();
  }

  select(columns = '*') {
    this.params.set('select', columns);
    return this;
  }

  insert(values: Record<string, any> | Record<string, any>[]) {
    this.method = 'POST';
    this.bodyPayload = values;
    return this;
  }

  eq(column: string, value: string | number | boolean) {
    this.params.append(column, `eq.${value}`);
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    const dir = options?.ascending === false ? 'desc' : 'asc';
    this.params.set('order', `${column}.${dir}`);
    return this;
  }

  maybeSingle() {
    this.singleMode = true;
    this.params.set('limit', '1');
    return this;
  }

  private async execute(): Promise<QueryResult<T>> {
    try {
      const query = this.params.toString();
      const url = `${supabaseUrl}/rest/v1/${this.table}${query ? `?${query}` : ''}`;

      if (this.method === 'POST') {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify(this.bodyPayload),
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          return {
            data: null,
            error: new Error(`Supabase INSERT HTTP ${res.status}: ${errText}`),
          };
        }
        return { data: null, error: null };
      }

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        return { data: null, error: new Error(`Supabase HTTP ${res.status}`) };
      }

      const rows = await res.json();
      if (this.singleMode) {
        return { data: (Array.isArray(rows) ? rows[0] ?? null : rows) as T, error: null };
      }
      return { data: rows as T, error: null };
    } catch (err: any) {
      return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
    }
  }

  then<TResult1 = QueryResult<T>, TResult2 = never>(
    onfulfilled?: ((value: QueryResult<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

export const supabase = isSupabaseConfigured
  ? {
      from<T = any>(table: string) {
        return new PostgrestQueryBuilder<T>(table);
      },
    }
  : null;

