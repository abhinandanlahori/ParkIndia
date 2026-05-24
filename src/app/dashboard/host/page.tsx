"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import { createSupabaseClient } from "@/lib/supabase/client";
import { geocodeIndianAddress } from "@/lib/geocode";
import { DEFAULT_SPOT_COORDS } from "@/lib/parking-data";
import {
  getRegisteredProfile,
  getStoredProfile,
  isLoggedIn,
  saveHostSpot,
} from "@/lib/storage";
import type { ParkingSpot } from "@/lib/types";

const ParkingMap = dynamic(() => import("@/components/ParkingMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-500">
      Loading map…
    </div>
  ),
});

export default function HostDashboardPage() {
  const router = useRouter();
  const [profileName, setProfileName] = useState("Host");
  const [title, setTitle] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [pricePerNight, setPricePerNight] = useState("");
  const [address, setAddress] = useState("");
  const [gateInstructions, setGateInstructions] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/auth");
      return;
    }
    const profile = getStoredProfile() ?? getRegisteredProfile();
    if (profile?.fullName) setProfileName(profile.fullName);
  }, [router]);

  async function resolveLocation(): Promise<{ latitude: number; longitude: number }> {
    if (latitude !== null && longitude !== null) {
      return { latitude, longitude };
    }

    const geocoded = await geocodeIndianAddress(address);
    if (geocoded) return geocoded;

    return DEFAULT_SPOT_COORDS;
  }

  async function handlePinOnMap() {
    if (!address.trim()) {
      setError("Enter an address before pinning on the map.");
      return;
    }

    setGeocoding(true);
    setError(null);

    const geocoded = await geocodeIndianAddress(address);
    if (!geocoded) {
      setError("Could not locate that address. Try a fuller Delhi NCR address.");
      setGeocoding(false);
      return;
    }

    setLatitude(geocoded.latitude);
    setLongitude(geocoded.longitude);
    setGeocoding(false);
  }

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      setError("Location is not available in this browser.");
      return;
    }

    setGeocoding(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setGeocoding(false);
      },
      () => {
        setError("Could not access your location. Allow GPS or pin manually.");
        setGeocoding(false);
      },
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const dayRate = Number(pricePerDay);
    const nightRate = Number(pricePerNight);

    if (!title.trim() || !address.trim() || !gateInstructions.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!dayRate || !nightRate || dayRate < 50 || nightRate < 50) {
      setError("Enter valid daily and nightly prices (minimum ₹50).");
      return;
    }

    setLoading(true);

    const coords = await resolveLocation();
    const profile = getStoredProfile();
    const sectorMatch = title.match(/Sector\s+\d+/i);
    const sector = sectorMatch ? sectorMatch[0] : "Delhi NCR";

    const layoutFromTitle = (): ParkingSpot["layout"] => {
      const lower = title.toLowerCase();
      if (lower.includes("basement")) return "covered-basement";
      if (lower.includes("driveway")) return "open-driveway";
      if (lower.includes("stilt")) return "stilt";
      return "compound";
    };

    const spot: ParkingSpot = {
      id: `host-${Date.now()}`,
      title: title.trim(),
      address: address.trim(),
      latitude: coords.latitude,
      longitude: coords.longitude,
      pricePerDay: dayRate,
      pricePerNight: nightRate,
      gateInstructions: gateInstructions.trim(),
      hostName: profile?.fullName ?? "Host",
      hostPhone: profile?.phone
        ? `91${profile.phone.replace(/\D/g, "").slice(-10)}`
        : "919000000000",
      layout: layoutFromTitle(),
      sector,
      active: true,
    };

    try {
      const supabase = createSupabaseClient();
      await supabase.from("parking_spots").insert({
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
        active: spot.active,
      });
    } catch {
      // Persist locally when Supabase table is not yet provisioned.
    }

    saveHostSpot(spot);
    setSuccess(`"${spot.title}" is now live on the map for drivers to book.`);
    setTitle("");
    setPricePerDay("");
    setPricePerNight("");
    setAddress("");
    setGateInstructions("");
    setLatitude(null);
    setLongitude(null);
    setLoading(false);
  }

  const previewSpot: ParkingSpot | null =
    latitude !== null && longitude !== null
      ? {
          id: "preview",
          title: title || "Your spot preview",
          address: address || "Pinned location",
          latitude,
          longitude,
          pricePerDay: Number(pricePerDay) || 0,
          pricePerNight: Number(pricePerNight) || 0,
          gateInstructions: gateInstructions || "",
          hostName: profileName,
          hostPhone: "919000000000",
          layout: "compound",
          sector: "Preview",
          active: true,
        }
      : null;

  return (
    <div className="min-h-full bg-gradient-to-br from-orange-50 via-white to-emerald-50">
      <DashboardHeader
        title="Host Dashboard"
        profileName={profileName}
        accent="orange"
        extraLink={{ href: "/dashboard/driver", label: "Driver view" }}
      />

      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-2xl border border-orange-100 bg-white p-6 shadow-xl shadow-orange-100/40 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900">List a parking spot</h2>
          <p className="mt-1 text-sm text-slate-600">
            Add pricing, address, gate instructions, and pin your spot on the
            map for drivers.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Spot Title</span>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Covered Basement Sector 62"
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Daily Pricing (₹)
                </span>
                <input
                  required
                  type="number"
                  min={50}
                  step={10}
                  value={pricePerDay}
                  onChange={(e) => setPricePerDay(e.target.value)}
                  placeholder="350"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Nightly Pricing (₹)
                </span>
                <input
                  required
                  type="number"
                  min={50}
                  step={10}
                  value={pricePerNight}
                  onChange={(e) => setPricePerNight(e.target.value)}
                  placeholder="200"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Structural Address
              </span>
              <textarea
                required
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Tower A, Green Valley Apartments, Sector 15, Gurgaon, HR 122001"
                className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </label>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handlePinOnMap}
                disabled={geocoding}
                className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-800 transition hover:bg-orange-100 disabled:opacity-60"
              >
                {geocoding ? "Locating…" : "Pin address on map"}
              </button>
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={geocoding}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Use my GPS location
              </button>
            </div>

            {previewSpot ? (
              <ParkingMap
                spots={[previewSpot]}
                heightClassName="h-48 sm:h-56"
              />
            ) : (
              <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
                Map preview appears after you pin a location
              </div>
            )}

            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Gate Instructions
              </span>
              <textarea
                required
                rows={3}
                value={gateInstructions}
                onChange={(e) => setGateInstructions(e.target.value)}
                placeholder="Tell security guard you are visiting flat 10C. Use visitor lane on left."
                className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </label>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                role="status"
                className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
              >
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-emerald-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-200/30 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Publishing…" : "Publish parking spot"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
