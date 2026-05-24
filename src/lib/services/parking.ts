import { DEFAULT_PARKING_SPOTS, DEFAULT_SPOT_COORDS } from "@/lib/parking-data";
import { getSupabase } from "@/lib/supabase/client";
import type { BookingRow, ParkingSpotRow } from "@/lib/supabase/database";
import type { Booking, ParkingSpot, UserProfile } from "@/lib/types";

export function normalizeParkingSpot(spot: ParkingSpot): ParkingSpot {
  return {
    ...spot,
    latitude: spot.latitude ?? DEFAULT_SPOT_COORDS.latitude,
    longitude: spot.longitude ?? DEFAULT_SPOT_COORDS.longitude,
  };
}

export function mapSpotRow(row: ParkingSpotRow): ParkingSpot {
  return normalizeParkingSpot({
    id: row.id,
    title: row.title,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    pricePerDay: row.price_per_day,
    pricePerNight: row.price_per_night,
    gateInstructions: row.gate_instructions,
    hostName: row.host_name,
    hostPhone: row.host_phone,
    layout: row.layout as ParkingSpot["layout"],
    sector: row.sector,
    active: row.active,
    hostId: row.host_id ?? undefined,
  });
}

function mapBookingRow(row: BookingRow): Booking {
  const spot = normalizeParkingSpot(row.spot_snapshot as ParkingSpot);
  return {
    id: row.id,
    spotId: row.spot_id ?? spot.id,
    spot,
    rateType: row.rate_type as Booking["rateType"],
    bookedAt: row.booked_at,
    driverName: row.driver_name,
    driverPhone: row.driver_phone,
    vehicleRegistration: row.vehicle_registration,
    status: row.status as Booking["status"],
  };
}

export async function fetchActiveSpots(): Promise<ParkingSpot[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("parking_spots")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });

  const dbSpots =
    error || !data ? [] : (data as ParkingSpotRow[]).map(mapSpotRow);

  const dbIds = new Set(dbSpots.map((s) => s.id));
  const seedSpots = DEFAULT_PARKING_SPOTS.filter((s) => !dbIds.has(s.id));

  return [...dbSpots, ...seedSpots];
}

export async function fetchHostListings(hostId: string): Promise<ParkingSpot[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("parking_spots")
    .select("*")
    .eq("host_id", hostId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return (data as ParkingSpotRow[]).map(mapSpotRow);
}

export async function createParkingSpot(
  hostId: string,
  spot: Omit<ParkingSpot, "id" | "active"> & { active?: boolean },
): Promise<ParkingSpot | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("parking_spots")
    .insert({
      host_id: hostId,
      title: spot.title,
      address: spot.address,
      latitude: spot.latitude,
      longitude: spot.longitude,
      price_per_day: spot.pricePerDay,
      price_per_night: spot.pricePerNight,
      gate_instructions: spot.gateInstructions,
      host_name: spot.hostName,
      host_phone: spot.hostPhone,
      layout: spot.layout,
      sector: spot.sector,
      active: spot.active ?? true,
    })
    .select()
    .single();

  if (error || !data) return null;
  return mapSpotRow(data as ParkingSpotRow);
}

export async function fetchActiveBooking(
  driverId: string,
): Promise<Booking | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("driver_id", driverId)
    .eq("status", "active")
    .order("booked_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return mapBookingRow(data as BookingRow);
}

export async function createBooking(
  driverId: string,
  profile: UserProfile,
  spot: ParkingSpot,
  rateType: Booking["rateType"],
): Promise<Booking | null> {
  const supabase = getSupabase();

  await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("driver_id", driverId)
    .eq("status", "active");

  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      spot.id,
    );

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      driver_id: driverId,
      spot_id: isUuid ? spot.id : null,
      spot_snapshot: spot,
      rate_type: rateType,
      status: "active",
      vehicle_registration: profile.vehicleRegistration,
      driver_name: profile.fullName,
      driver_phone: profile.phone,
    })
    .select()
    .single();

  if (error || !data) return null;
  return mapBookingRow(data as BookingRow);
}

export async function cancelBooking(
  driverId: string,
  bookingId: string,
): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId)
    .eq("driver_id", driverId);

  return !error;
}
