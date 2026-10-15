import type { EmailOtpType } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { safeNext } from '@/lib/utils';

export const dynamic = 'force-dynamic';

/** Landing point for Google sign-in, email confirmation and password-reset links. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = safeNext(searchParams.get('next'), '');

  const supabase = await createClient();
  let failed = false;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    failed = Boolean(error);
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    failed = Boolean(error);
  } else {
    failed = true;
  }

  if (failed) return NextResponse.redirect(`${origin}/login?error=auth`);

  // This is the customer sign-in flow (email confirmation, Google, password reset),
  // so it only ever lands customers back on the store — never in the admin panel.
  return NextResponse.redirect(`${origin}${next || '/'}`);
}
