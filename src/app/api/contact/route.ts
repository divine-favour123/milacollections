import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const schema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(100),
  email: z.string().trim().email('Enter a valid email address').max(200),
  phone: z.string().trim().max(30).optional().default(''),
  subject: z.string().trim().max(150).optional().default(''),
  message: z.string().trim().min(10, 'Tell us a little more (at least 10 characters)').max(3000),
  website: z.string().optional().default(''), // honeypot – real people leave this empty
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Check your message and try again.' }, { status: 400 });
  const d = parsed.data;
  if (d.website) return NextResponse.json({ ok: true }); // bot – pretend it worked

  try {
    const admin = createAdminClient();
    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await admin
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('email', d.email)
      .gte('created_at', since);
    if ((count ?? 0) >= 3) {
      return NextResponse.json({ error: 'You have sent a few messages already. Please wait a few minutes.' }, { status: 429 });
    }
    const { error } = await admin.from('messages').insert({
      name: d.name,
      email: d.email,
      phone: d.phone || null,
      subject: d.subject || null,
      message: d.message,
    });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[contact]', (e as Error).message);
    return NextResponse.json({ error: 'We could not send your message. Please try WhatsApp or try again shortly.' }, { status: 500 });
  }
}
