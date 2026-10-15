'use client';

import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';

/** A button that asks "are you sure?" in a bottom sheet – friendlier than window.confirm on phones. */
export function ConfirmButton({
  children,
  title,
  description,
  confirmLabel = 'Delete',
  onConfirm,
  variant = 'danger-soft',
  size = 'md',
  className,
  disabled,
}: {
  children: ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
  variant?: 'danger-soft' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  className?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <>
      <Button type="button" variant={variant} size={size} className={className} disabled={disabled} onClick={() => setOpen(true)}>
        {children}
      </Button>
      <Drawer open={open} onClose={() => !busy && setOpen(false)} title={title} side="bottom">
        <div className="space-y-5 px-5 pt-4 pb-6">
          <p className="text-slate">{description}</p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="soft" onClick={() => setOpen(false)} disabled={busy}>
              Keep it
            </Button>
            <Button
              variant="danger"
              loading={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await onConfirm();
                } finally {
                  setBusy(false);
                  setOpen(false);
                }
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </Drawer>
    </>
  );
}
