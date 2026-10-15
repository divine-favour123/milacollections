'use client';

import { Mail, MessageCircle, Phone, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { deleteMessage, setMessageRead } from '@/app/admin/actions';
import { Button } from '@/components/ui/button';
import { ConfirmButton } from '@/components/ui/confirm-button';
import { toWhatsappDigits } from '@/lib/lagos';
import { cn, timeAgo } from '@/lib/utils';
import type { ContactMessage } from '@/types';

export function MessageList({ messages }: { messages: ContactMessage[] }) {
  const router = useRouter();
  const [open, setOpen] = useState<string | null>(null);
  const [, start] = useTransition();

  function toggle(m: ContactMessage) {
    const next = open === m.id ? null : m.id;
    setOpen(next);
    if (next && !m.is_read) {
      start(async () => {
        await setMessageRead(m.id, true);
        router.refresh();
      });
    }
  }

  return (
    <ul className="space-y-3">
      {messages.map((m) => {
        const expanded = open === m.id;
        return (
          <li key={m.id} className={cn('rounded-2xl border bg-paper', m.is_read ? 'border-line' : 'border-gold/50')}>
            <button type="button" onClick={() => toggle(m)} aria-expanded={expanded} className="flex w-full items-start gap-3 p-4 text-left">
              <span className={cn('mt-2 size-2.5 shrink-0 rounded-full', m.is_read ? 'bg-transparent' : 'bg-gold')} aria-label={m.is_read ? undefined : 'Unread'} />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-3">
                  <span className={cn('truncate', m.is_read ? 'font-medium' : 'font-semibold')}>{m.name}</span>
                  <span className="shrink-0 text-xs text-slate">{timeAgo(m.created_at)}</span>
                </span>
                {m.subject ? <span className="block truncate text-sm font-medium">{m.subject}</span> : null}
                <span className={cn('block text-sm text-slate', !expanded && 'line-clamp-1')}>{m.message}</span>
              </span>
            </button>
            {expanded ? (
              <div className="border-t border-line px-4 py-3">
                <p className="mb-3 text-sm text-slate">{m.email}{m.phone ? ` · ${m.phone}` : ''}</p>
                <div className="flex flex-wrap gap-2">
                  <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || 'Your message to Mila Collections'}`)}`} className="inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-sm font-semibold text-white"><Mail className="size-4" aria-hidden /> Reply</a>
                  {m.phone ? (
                    <>
                      <a href={`https://wa.me/${toWhatsappDigits(m.phone)}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-1.5 rounded-full bg-frost px-4 text-sm font-semibold"><MessageCircle className="size-4" aria-hidden /> WhatsApp</a>
                      <a href={`tel:${m.phone.replace(/\s/g, '')}`} className="inline-flex h-10 items-center gap-1.5 rounded-full bg-frost px-4 text-sm font-semibold"><Phone className="size-4" aria-hidden /> Call</a>
                    </>
                  ) : null}
                  <Button
                    size="sm"
                    variant="soft"
                    className="h-10"
                    onClick={() =>
                      start(async () => {
                        await setMessageRead(m.id, false);
                        setOpen(null);
                        router.refresh();
                      })
                    }
                  >
                    Mark unread
                  </Button>
                  <ConfirmButton
                    title="Delete this message?"
                    description="This cannot be undone."
                    onConfirm={async () => {
                      const res = await deleteMessage(m.id);
                      if (!res.ok) return void toast.error(res.error);
                      router.refresh();
                    }}
                    size="sm"
                    className="h-10"
                  >
                    <Trash2 className="size-4" aria-hidden /> Delete
                  </ConfirmButton>
                </div>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
