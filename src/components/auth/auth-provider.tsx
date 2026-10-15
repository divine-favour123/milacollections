'use client';

import type { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';

type Profile = { full_name: string | null; role: 'customer' | 'admin' } | null;

type AuthContextValue = {
  user: User | null;
  profile: Profile;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    const load = async (u: User | null) => {
      if (!active) return;
      setUser(u);
      if (!u) {
        setProfile(null);
        setLoading(false);
        return;
      }
      const { data } = await supabase.from('profiles').select('full_name, role').eq('id', u.id).maybeSingle();
      if (!active) return;
      setProfile((data as Profile) ?? null);
      setLoading(false);
    };

    supabase.auth.getUser().then(({ data }) => load(data.user ?? null));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Defer to avoid deadlocks inside the auth callback.
      setTimeout(() => load(session?.user ?? null), 0);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    await createClient().auth.signOut();
    setUser(null);
    setProfile(null);
    router.push('/');
    router.refresh();
  }, [router]);

  const value = useMemo(() => ({ user, profile, loading, signOut }), [user, profile, loading, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
