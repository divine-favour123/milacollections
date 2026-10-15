import 'server-only';
import crypto from 'node:crypto';

const BASE = 'https://api.paystack.co';

function secret() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error('PAYSTACK_SECRET_KEY is missing. Add it to your environment variables.');
  return key;
}

export type PaystackVerifyData = {
  status: 'success' | 'failed' | 'abandoned' | 'pending' | 'ongoing' | 'reversed' | string;
  reference: string;
  amount: number;
  currency: string;
  paid_at?: string | null;
};

async function paystack<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    cache: 'no-store',
    headers: { Authorization: `Bearer ${secret()}`, 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  const json = (await res.json().catch(() => null)) as { status?: boolean; message?: string; data?: T } | null;
  if (!res.ok || !json?.status) throw new Error(json?.message || `Paystack request failed (${res.status})`);
  return json.data as T;
}

export function initializeTransaction(input: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}) {
  return paystack<{ authorization_url: string; access_code: string; reference: string }>('/transaction/initialize', {
    method: 'POST',
    body: JSON.stringify({
      email: input.email,
      amount: input.amountKobo,
      currency: 'NGN',
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata ?? {},
    }),
  });
}

export function verifyTransaction(reference: string) {
  return paystack<PaystackVerifyData>(`/transaction/verify/${encodeURIComponent(reference)}`);
}

export function isValidWebhookSignature(rawBody: string, signature: string | null) {
  if (!signature) return false;
  const hash = crypto.createHmac('sha512', secret()).update(rawBody).digest('hex');
  const a = Buffer.from(hash);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
