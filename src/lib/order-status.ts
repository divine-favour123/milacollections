import type { OrderStatus, PaymentStatus } from '@/types';

export const STATUS_META: Record<OrderStatus, { label: string; tone: 'neutral' | 'gold' | 'info' | 'success' | 'danger' | 'warn'; hint: string }> = {
  pending_payment: { label: 'Awaiting payment', tone: 'warn', hint: 'We have not received your payment yet.' },
  received: { label: 'Order received', tone: 'info', hint: 'Payment confirmed. We are getting your order ready.' },
  in_production: { label: 'Being prepared', tone: 'gold', hint: 'Your pieces are being made and checked.' },
  shipped: { label: 'On its way', tone: 'info', hint: 'Your order has left us and is on its way to you.' },
  delivered: { label: 'Delivered', tone: 'success', hint: 'Your order has been delivered. Enjoy!' },
  cancelled: { label: 'Cancelled', tone: 'danger', hint: 'This order was cancelled.' },
};

export const STATUS_STEPS: OrderStatus[] = ['received', 'in_production', 'shipped', 'delivered'];

export const PAYMENT_META: Record<PaymentStatus, { label: string; tone: 'success' | 'warn' | 'danger' }> = {
  paid: { label: 'Paid', tone: 'success' },
  unpaid: { label: 'Unpaid', tone: 'warn' },
  failed: { label: 'Payment failed', tone: 'danger' },
};

/** Statuses an admin can move an order to, in the order they normally happen. */
export const ADMIN_STATUS_OPTIONS: OrderStatus[] = ['received', 'in_production', 'shipped', 'delivered', 'cancelled'];
