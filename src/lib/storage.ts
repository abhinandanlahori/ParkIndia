import type { Booking, ParkingSpot, UserProfile } from "./types";
import { DEFAULT_PARKING_SPOTS, DEFAULT_SPOT_COORDS } from "./parking-data";

const PROFILE_KEY = "parkindia:profile";
const SESSION_KEY = "parkindia:session";
const SPOTS_KEY = "parkindia:host-spots";
const BOOKING_KEY = "parkindia:active-booking";

export const BETA_ACCESS_CODE = "PI67BETA";

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "").slice(-10);
}

export function getRegisteredProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(SESSION_KEY) === "true";
}

/** Profile available only while the user is logged in. */
export function getStoredProfile(): UserProfile | null {
  if (!isLoggedIn()) return null;
  return getRegisteredProfile();
}

export function registerProfile(profile: UserProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  localStorage.setItem(SESSION_KEY, "true");
}

/** @deprecated Use registerProfile — kept for compatibility. */
export function saveProfile(profile: UserProfile) {
  registerProfile(profile);
}

export function loginSession(): boolean {
  const profile = getRegisteredProfile();
  if (!profile) return false;
  localStorage.setItem(SESSION_KEY, "true");
  return true;
}

export function loginWithPhone(phone: string): boolean {
  const profile = getRegisteredProfile();
  if (!profile) return false;
  if (normalizePhone(phone) !== normalizePhone(profile.phone)) return false;
  localStorage.setItem(SESSION_KEY, "true");
  return true;
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(BOOKING_KEY);
}

export function normalizeParkingSpot(spot: ParkingSpot): ParkingSpot {
  return {
    ...spot,
    latitude: spot.latitude ?? DEFAULT_SPOT_COORDS.latitude,
    longitude: spot.longitude ?? DEFAULT_SPOT_COORDS.longitude,
  };
}

export function getHostSpots(): ParkingSpot[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(SPOTS_KEY);
  if (!raw) return [];
  try {
    return (JSON.parse(raw) as ParkingSpot[]).map(normalizeParkingSpot);
  } catch {
    return [];
  }
}

export function saveHostSpot(spot: ParkingSpot) {
  const existing = getHostSpots();
  localStorage.setItem(SPOTS_KEY, JSON.stringify([spot, ...existing]));
}

export function getAllActiveSpots(): ParkingSpot[] {
  const hostSpots = getHostSpots().filter((s) => s.active);
  const defaultIds = new Set(DEFAULT_PARKING_SPOTS.map((s) => s.id));
  const uniqueHostSpots = hostSpots.filter((s) => !defaultIds.has(s.id));
  return [...uniqueHostSpots, ...DEFAULT_PARKING_SPOTS.filter((s) => s.active)];
}

export function getActiveBooking(): Booking | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(BOOKING_KEY);
  if (!raw) return null;
  try {
    const booking = JSON.parse(raw) as Booking;
    return { ...booking, spot: normalizeParkingSpot(booking.spot) };
  } catch {
    return null;
  }
}

export function saveBooking(booking: Booking) {
  localStorage.setItem(BOOKING_KEY, JSON.stringify(booking));
}

export function clearBooking() {
  localStorage.removeItem(BOOKING_KEY);
}

export function buildWhatsAppGateLink(booking: Booking): string {
  const message = [
    `Namaste ${booking.spot.hostName}!`,
    "",
    "I have arrived at the gate for my ParkIndia booking.",
    "",
    `Spot: ${booking.spot.title}`,
    `Address: ${booking.spot.address}`,
    `Vehicle: ${booking.vehicleRegistration}`,
    `Driver: ${booking.driverName} (${booking.driverPhone})`,
    "",
    "Please alert security / guide me in. Thank you!",
  ].join("\n");

  return `https://wa.me/${booking.spot.hostPhone}?text=${encodeURIComponent(message)}`;
}

/** Normalizes plate input while typing (all states / Bharat series). */
export function formatIndianPlate(value: string): string {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Accepts Indian plates from any state/UT, including:
 * - Classic: MH 12 AB 1234, DL 3C XX 0000, KA 01 MA 2345
 * - Short district: TN 9 Z 1234
 * - Bharat (BH) series: 22 BH 1234 AA
 */
export function isValidIndianPlate(plate: string): boolean {
  const normalized = formatIndianPlate(plate);
  const parts = normalized.split(" ").filter(Boolean);

  if (parts.length < 3 || parts.length > 5) return false;

  // Bharat series (all-India): YY BH #### XX
  if (/^\d{2}$/.test(parts[0]) && parts[1] === "BH") {
    return (
      parts.length === 4 &&
      /^\d{4}$/.test(parts[2]) &&
      /^[A-Z]{2}$/.test(parts[3])
    );
  }

  // State / UT code (2 letters) — any valid RTO prefix
  const state = parts[0];
  if (!/^[A-Z]{2}$/.test(state)) return false;

  const registrationNumber = parts[parts.length - 1];
  if (!/^\d{1,4}$/.test(registrationNumber)) return false;

  const middle = parts.slice(1, -1);
  if (middle.length < 1 || middle.length > 3) return false;

  return middle.every((segment) => /^[A-Z0-9]{1,4}$/.test(segment));
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
