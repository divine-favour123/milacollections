import 'server-only';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/types';

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/** For pages that need a signed-in customer. */
export async function requireUser(nextPath: string) {
  const { supabase, user } = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
  return { supabase, user, profile: (profile as Profile | null) ?? null };
}

/** For admin pages: signed out → login, signed in but not admin → 404 (don't reveal the panel exists). */
export async function requireAdmin() {
  const { supabase, user } = await getSessionUser();
  if (!user) redirect('/admin/login');
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
  if (!profile || profile.role !== 'admin') notFound();
  return { supabase, user, profile: profile as Profile };
}

/** For server actions: returns null instead of redirecting so the action can return an error. */
export async function getAdminContext() {
  const { supabase, user } = await getSessionUser();
  if (!user) return null;
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (profile?.role !== 'admin') return null;
  return { supabase, user };
}
