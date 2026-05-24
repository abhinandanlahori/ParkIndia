import { BETA_ACCESS_CODE } from "@/lib/constants";
import { phoneToAuthEmail, normalizePhone } from "@/lib/auth/phone";
import { fetchProfileByUserId, upsertProfile } from "@/lib/services/profile";
import { getSupabase } from "@/lib/supabase/client";
import type { UserProfile } from "@/lib/types";

export type AuthResult =
  | { ok: true; profile: UserProfile }
  | { ok: false; message: string };

export async function signUpWithProfile(input: {
  fullName: string;
  phone: string;
  password: string;
  vehicleRegistration: string;
  betaCode: string;
}): Promise<AuthResult> {
  if (input.betaCode.trim() !== BETA_ACCESS_CODE) {
    return { ok: false, message: "Invalid beta access code." };
  }

  if (input.password.length < 8) {
    return { ok: false, message: "Password must be at least 8 characters." };
  }

  const phone = normalizePhone(input.phone);
  if (phone.length !== 10) {
    return { ok: false, message: "Enter a valid 10-digit mobile number." };
  }

  const registerResponse = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: input.fullName.trim(),
      phone,
      password: input.password,
      vehicleRegistration: input.vehicleRegistration,
      betaCode: input.betaCode,
    }),
  });

  const registerBody = (await registerResponse.json()) as { error?: string };

  if (!registerResponse.ok) {
    const message = registerBody.error ?? "Registration failed.";
    if (message.toLowerCase().includes("rate limit")) {
      return {
        ok: false,
        message:
          "Too many sign-up attempts. Wait a few minutes, or add SUPABASE_SERVICE_ROLE_KEY to .env.local to skip email limits.",
      };
    }
    return { ok: false, message };
  }

  return signInWithPhone(phone, input.password);
}

export async function signInWithPhone(
  phone: string,
  password: string,
): Promise<AuthResult> {
  const normalized = normalizePhone(phone);
  if (normalized.length !== 10) {
    return { ok: false, message: "Enter a valid 10-digit mobile number." };
  }

  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: phoneToAuthEmail(normalized),
    password,
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("rate limit")) {
      return {
        ok: false,
        message:
          "Too many attempts. Please wait a few minutes and try signing in again.",
      };
    }
    if (msg.includes("email not confirmed")) {
      return {
        ok: false,
        message:
          "Account not confirmed. In Supabase, disable “Confirm email” under Authentication → Providers → Email.",
      };
    }
    return { ok: false, message: "Invalid phone or password." };
  }

  const userId = data.user?.id;
  if (!userId) {
    return { ok: false, message: "Login failed. Please try again." };
  }

  let profile = await fetchProfileByUserId(userId);

  if (!profile && data.user?.user_metadata) {
    const meta = data.user.user_metadata as Record<string, string>;
    profile = await upsertProfile(userId, {
      fullName: meta.full_name ?? "Driver",
      phone: meta.phone ?? normalized,
      vehicleRegistration: meta.vehicle_registration ?? "",
    });
  }

  if (!profile) {
    return {
      ok: false,
      message: "Profile not found. Ensure supabase/schema.sql has been applied.",
    };
  }

  return { ok: true, profile };
}

export async function signOut(): Promise<void> {
  const supabase = getSupabase();
  await supabase.auth.signOut();
}
