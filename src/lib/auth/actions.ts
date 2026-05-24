import { BETA_ACCESS_CODE } from "@/lib/constants";
import { phoneToAuthEmail, normalizePhone } from "@/lib/auth/phone";
import { fetchProfileByUserId, upsertProfile } from "@/lib/services/profile";
import { getSupabase } from "@/lib/supabase/client";
import type { UserProfile } from "@/lib/types";

export type AuthResult = { ok: true; profile: UserProfile } | { ok: false; message: string };

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

  const supabase = getSupabase();
  const email = phoneToAuthEmail(phone);

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password: input.password,
    options: {
      data: {
        full_name: input.fullName.trim(),
        phone,
        vehicle_registration: input.vehicleRegistration,
      },
    },
  });

  if (signUpError) {
    if (signUpError.message.toLowerCase().includes("already registered")) {
      return {
        ok: false,
        message: "This phone is already registered. Log in instead.",
      };
    }
    return { ok: false, message: signUpError.message };
  }

  const userId = signUpData.user?.id;
  if (!userId) {
    return { ok: false, message: "Account created but session unavailable. Try logging in." };
  }

  const profile = await upsertProfile(userId, {
    fullName: input.fullName.trim(),
    phone,
    vehicleRegistration: input.vehicleRegistration,
  });

  if (!profile) {
    return { ok: false, message: "Could not save profile. Check database setup." };
  }

  return { ok: true, profile };
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
    return { ok: false, message: "Profile not found. Contact support or re-register." };
  }

  return { ok: true, profile };
}

export async function signOut(): Promise<void> {
  const supabase = getSupabase();
  await supabase.auth.signOut();
}
