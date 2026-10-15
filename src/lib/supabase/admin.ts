import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL } from './env';

/**
 * Service-role client. Bypasses Row Level Security – only ever use it in server
 * code AFTER you have checked who the caller is (checkout, Paystack webhook, contact form).
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing. Add it to your environment variables.');
  }
  return createClient(SUPABASE_URL, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
