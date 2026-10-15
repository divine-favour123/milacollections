import type { Metadata } from 'next';
import { AdminLoginShell } from '@/components/admin/admin-login-shell';
import { AdminLoginForm } from '@/components/auth/auth-forms';

export const metadata: Metadata = { title: 'Admin sign in', robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return (
    <AdminLoginShell>
      <AdminLoginForm />
    </AdminLoginShell>
  );
}