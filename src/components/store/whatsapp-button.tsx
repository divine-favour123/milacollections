'use client';

import { MessageCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { whatsappLink } from '@/lib/utils';

const HIDE_ON = ['/product/', '/checkout', '/login', '/signup'];

export function WhatsAppButton({ number }: { number: string | null }) {
  const pathname = usePathname();
  const href = whatsappLink(number, 'Hello Mila Collections, I have a question.');
  if (!href || HIDE_ON.some((p) => pathname.startsWith(p))) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed right-4 bottom-4 z-30 grid size-13 place-items-center rounded-full bg-ink text-gold-light ring-1 ring-gold/60 shadow-float transition-transform duration-200 hover:scale-105 active:scale-95"
    >
      <MessageCircle className="size-6" aria-hidden />
    </a>
  );
}
