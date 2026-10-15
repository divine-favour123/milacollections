'use client';

import { X } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Side = 'right' | 'left' | 'bottom';

const panelClass: Record<Side, { base: string; hidden: string }> = {
  right: { base: 'ml-auto h-full w-full max-w-md', hidden: 'translate-x-full' },
  left: { base: 'mr-auto h-full w-full max-w-sm', hidden: '-translate-x-full' },
  bottom: { base: 'mt-auto max-h-[92dvh] w-full rounded-t-3xl sm:mx-auto sm:max-w-lg', hidden: 'translate-y-full' },
};

/**
 * Slide-in panel built on the native <dialog> element, so focus trapping, Escape to close
 * and screen-reader semantics come from the browser.
 */
export function Drawer({
  open,
  onClose,
  title,
  side = 'right',
  children,
  footer,
  hideTitle,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  side?: Side;
  children: ReactNode;
  footer?: ReactNode;
  hideTitle?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) dialog.showModal();
      const raf = requestAnimationFrame(() => setShown(true));
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        cancelAnimationFrame(raf);
        document.body.style.overflow = prev;
      };
    }
    setShown(false);
    const t = setTimeout(() => {
      if (dialog.open) dialog.close();
    }, 220);
    return () => clearTimeout(t);
  }, [open]);

  const p = panelClass[side];

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 backdrop:transition-opacity"
    >
      <div
        className={cn(
          'flex flex-col overflow-hidden bg-paper shadow-float transition-transform duration-[220ms] ease-out',
          p.base,
          !shown && p.hidden,
          className,
        )}
      >
        <div className={cn('flex items-center justify-between gap-3 border-b border-line px-5 py-3.5', hideTitle && 'border-b-0 pb-0')}>
          <h2 className={cn('text-lg font-semibold', hideTitle && 'sr-only')}>{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-10 place-items-center rounded-full text-slate transition-colors hover:bg-frost hover:text-ink"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
        {footer ? <div className="safe-bottom border-t border-line bg-paper px-5 pt-3.5">{footer}</div> : null}
      </div>
    </dialog>
  );
}
