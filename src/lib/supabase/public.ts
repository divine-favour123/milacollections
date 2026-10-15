import { createClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL, assertSupabaseEnv } from './env';

/**
 * Cookie-less anonymous client for the public catalogue.
 * Responses go through Next's data cache (tag: "catalog") so pages stay fast and
 * are refreshed instantly when the admin saves something.
 */
export function createPublicClient() {
  assertSupabaseEnv();
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, next: { revalidate: 120, tags: ['catalog'] } }),
    },
  });
}

/** Anonymous client that never caches – for price checks. */
export function createFreshAnonClient() {
  assertSupabaseEnv();
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }) },
  });
}
