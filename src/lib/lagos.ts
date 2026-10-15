/** Lagos is UTC+1 all year (no daylight saving). */
const OFFSET_MS = 60 * 60 * 1000;

export function lagosNow() {
  return new Date(Date.now() + OFFSET_MS);
}

export function lagosStartOfDay(d = new Date()) {
  const l = new Date(d.getTime() + OFFSET_MS);
  return new Date(Date.UTC(l.getUTCFullYear(), l.getUTCMonth(), l.getUTCDate()) - OFFSET_MS);
}

export function lagosStartOfMonth(d = new Date()) {
  const l = new Date(d.getTime() + OFFSET_MS);
  return new Date(Date.UTC(l.getUTCFullYear(), l.getUTCMonth(), 1) - OFFSET_MS);
}

export function lagosGreeting() {
  const h = lagosNow().getUTCHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

/** 0803 123 4567 → 2348031234567 for wa.me links */
export function toWhatsappDigits(phone: string) {
  const d = phone.replace(/\D/g, '');
  if (d.startsWith('234')) return d;
  if (d.startsWith('0')) return `234${d.slice(1)}`;
  return d;
}
