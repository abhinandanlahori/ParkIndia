import { getSupabase } from "@/lib/supabase/client";
import type { ProfileRow } from "@/lib/supabase/database";
import type { UserProfile } from "@/lib/types";

export function mapProfileRow(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    vehicleRegistration: row.vehicle_registration,
  };
}

export async function fetchProfileByUserId(
  userId: string,
): Promise<UserProfile | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return mapProfileRow(data as ProfileRow);
}

export async function fetchProfileByPhone(
  phone: string,
): Promise<UserProfile | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("phone", phone)
    .maybeSingle();

  if (error || !data) return null;
  return mapProfileRow(data as ProfileRow);
}

export async function upsertProfile(
  userId: string,
  profile: Omit<UserProfile, "id">,
): Promise<UserProfile | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        full_name: profile.fullName,
        phone: profile.phone,
        vehicle_registration: profile.vehicleRegistration,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    )
    .select()
    .single();

  if (error || !data) return null;
  return mapProfileRow(data as ProfileRow);
}

export async function updateVehicleRegistration(
  userId: string,
  vehicleRegistration: string,
): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("profiles")
    .update({
      vehicle_registration: vehicleRegistration,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  return !error;
}
