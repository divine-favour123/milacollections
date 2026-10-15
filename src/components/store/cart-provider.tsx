'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react';
import { MAX_QTY } from '@/lib/constants';

export type CartCustom = {
  sides: 'front' | 'front_and_back';
  frontPath: string;
  backPath: string | null;
  note: string;
};

export type CartLine = {
  id: string;
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  /** Display price only – the server always re-prices at checkout. */
  unitPrice: number;
  quantity: number;
  options: Record<string, string>;
  custom: CartCustom | null;
};

type State = { lines: CartLine[]; hydrated: boolean };
type Action =
  | { type: 'hydrate'; lines: CartLine[] }
  | { type: 'add'; line: CartLine }
  | { type: 'qty'; id: string; quantity: number }
  | { type: 'remove'; id: string }
  | { type: 'clear' };

const STORAGE_KEY = 'milla.cart.v1';

/** Same product + same options merge into one line. Custom photo pieces never merge. */
export function lineId(productId: string, options: Record<string, string>, custom: CartCustom | null, unique: string) {
  if (custom) return `${productId}:custom:${unique}`;
  const opts = Object.entries(options)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('|');
  return `${productId}:${opts}`;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'hydrate':
      return { lines: action.lines, hydrated: true };
    case 'add': {
      const existing = state.lines.find((l) => l.id === action.line.id);
      if (existing) {
        return {
          ...state,
          lines: state.lines.map((l) =>
            l.id === existing.id
              ? { ...l, unitPrice: action.line.unitPrice, quantity: Math.min(MAX_QTY, l.quantity + action.line.quantity) }
              : l,
          ),
        };
      }
      return { ...state, lines: [...state.lines, action.line] };
    }
    case 'qty':
      return {
        ...state,
        lines: state.lines.map((l) => (l.id === action.id ? { ...l, quantity: Math.max(1, Math.min(MAX_QTY, action.quantity)) } : l)),
      };
    case 'remove':
      return { ...state, lines: state.lines.filter((l) => l.id !== action.id) };
    case 'clear':
      return { ...state, lines: [] };
  }
}

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  hydrated: boolean;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (line: CartLine) => void;
  setQuantity: (id: string, quantity: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { lines: [], hydrated: false });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let lines: CartLine[] = [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) {
        lines = parsed.filter((l) => l && typeof l.id === 'string' && typeof l.productId === 'string' && Number(l.quantity) > 0);
      }
    } catch {
      // corrupted or blocked storage – start with an empty cart
    }
    dispatch({ type: 'hydrate', lines });
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.lines));
    } catch {
      // storage full / private mode – cart just won't persist
    }
  }, [state]);

  // keep multiple tabs in sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      try {
        const parsed = e.newValue ? JSON.parse(e.newValue) : [];
        if (Array.isArray(parsed)) dispatch({ type: 'hydrate', lines: parsed });
      } catch {
        /* ignore */
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const add = useCallback((line: CartLine) => dispatch({ type: 'add', line }), []);
  const setQuantity = useCallback((id: string, quantity: number) => dispatch({ type: 'qty', id, quantity }), []);
  const remove = useCallback((id: string) => dispatch({ type: 'remove', id }), []);
  const clear = useCallback(() => dispatch({ type: 'clear' }), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines: state.lines,
      count: state.lines.reduce((n, l) => n + l.quantity, 0),
      subtotal: state.lines.reduce((n, l) => n + l.unitPrice * l.quantity, 0),
      hydrated: state.hydrated,
      isOpen,
      open,
      close,
      add,
      setQuantity,
      remove,
      clear,
    }),
    [state, isOpen, open, close, add, setQuantity, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
