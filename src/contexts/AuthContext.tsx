"use client";

import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { signInWithPhone, signOut as authSignOut, signUpWithProfile } from "@/lib/auth/actions";
import { fetchProfileByUserId } from "@/lib/services/profile";
import { getSupabase } from "@/lib/supabase/client";
import type { UserProfile } from "@/lib/types";

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  signUp: (input: {
    fullName: string;
    phone: string;
    password: string;
    vehicleRegistration: string;
    betaCode: string;
  }) => Promise<string | null>;
  signIn: (phone: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    const data = await fetchProfileByUserId(userId);
    setProfile(data);
  }, []);

  useEffect(() => {
    const supabase = getSupabase();

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        loadProfile(data.session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        loadProfile(nextSession.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const signUp = useCallback(
    async (input: Parameters<AuthContextValue["signUp"]>[0]) => {
      const result = await signUpWithProfile(input);
      if (!result.ok) return result.message;
      setProfile(result.profile);
      const { data } = await getSupabase().auth.getSession();
      setSession(data.session);
      return null;
    },
    [],
  );

  const signIn = useCallback(async (phone: string, password: string) => {
    const result = await signInWithPhone(phone, password);
    if (!result.ok) return result.message;
    setProfile(result.profile);
    const { data } = await getSupabase().auth.getSession();
    setSession(data.session);
    return null;
  }, []);

  const signOut = useCallback(async () => {
    await authSignOut();
    setSession(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!session?.user) return;
    await loadProfile(session.user.id);
  }, [session?.user, loadProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      profile,
      loading,
      isAuthenticated: Boolean(session?.user && profile),
      signUp,
      signIn,
      signOut,
      refreshProfile,
    }),
    [session, profile, loading, signUp, signIn, signOut, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
