"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Input, TextArea } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import { geocodeIndianAddress } from "@/lib/geocode";
import { DEFAULT_SPOT_COORDS, LAYOUT_LABELS } from "@/lib/parking-data";
import {
  createParkingSpot,
  fetchHostListings,
} from "@/lib/services/parking";
import type { ParkingSpot } from "@/lib/types";
import { formatINR } from "@/lib/utils/format";

const ParkingMap = dynamic(() => import("@/components/ParkingMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-48 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-500">
      Loading map…
    </div>
  ),
});

export default function HostDashboardPage() {
  const router = useRouter();
  const { profile, loading: authLoading, isAuthenticated } = useAuth();

  const [listings, setListings] = useState<ParkingSpot[]>([]);
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
  const [submitting, setSubmitting] = useState(false);

  const loadListings = useCallback(async () => {
    if (!profile) return;
    const data = await fetchHostListings(profile.id);
    setListings(data);
  }, [profile]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace("/auth");
      return;
    }
    loadListings();
  }, [authLoading, isAuthenticated, router, loadListings]);

  async function handlePinOnMap() {
    if (!address.trim()) {
      setError("Enter an address before pinning on the map.");
      return;
    }
    setGeocoding(true);
    setError(null);
    const geocoded = await geocodeIndianAddress(address);
    setGeocoding(false);
    if (!geocoded) {
      setError("Could not locate that address. Try a fuller Delhi NCR address.");
      return;
    }
    setLatitude(geocoded.latitude);
    setLongitude(geocoded.longitude);
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
        setError("Could not access your location.");
        setGeocoding(false);
      },
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!profile) return;

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

    setSubmitting(true);

    let coords = { latitude, longitude };
    if (latitude === null || longitude === null) {
      const geocoded = await geocodeIndianAddress(address);
      coords = geocoded ?? DEFAULT_SPOT_COORDS;
    }

    const sectorMatch = title.match(/Sector\s+\d+/i);
    const sector = sectorMatch ? sectorMatch[0] : "Delhi NCR";
    const lower = title.toLowerCase();
    const layout: ParkingSpot["layout"] = lower.includes("basement")
      ? "covered-basement"
      : lower.includes("driveway")
        ? "open-driveway"
        : lower.includes("stilt")
          ? "stilt"
          : "compound";

    const created = await createParkingSpot(profile.id, {
      title: title.trim(),
      address: address.trim(),
      latitude: coords.latitude!,
      longitude: coords.longitude!,
      pricePerDay: dayRate,
      pricePerNight: nightRate,
      gateInstructions: gateInstructions.trim(),
      hostName: profile.fullName,
      hostPhone: `91${profile.phone}`,
      layout,
      sector,
      active: true,
    });

    setSubmitting(false);

    if (!created) {
      setError("Could not publish spot. Run supabase/schema.sql if tables are missing.");
      return;
    }

    setSuccess(`"${created.title}" is live on the map.`);
    setTitle("");
    setPricePerDay("");
    setPricePerNight("");
    setAddress("");
    setGateInstructions("");
    setLatitude(null);
    setLongitude(null);
    await loadListings();
  }

  const previewSpot: ParkingSpot | null =
    latitude !== null && longitude !== null
      ? {
          id: "preview",
          title: title || "Preview",
          address: address || "Pinned location",
          latitude,
          longitude,
          pricePerDay: Number(pricePerDay) || 0,
          pricePerNight: Number(pricePerNight) || 0,
          gateInstructions: gateInstructions || "",
          hostName: profile?.fullName ?? "Host",
          hostPhone: profile ? `91${profile.phone}` : "",
          layout: "compound",
          sector: "Preview",
          active: true,
        }
      : null;

  if (authLoading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-zinc-50">
        <p className="text-sm text-zinc-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-zinc-50">
      <DashboardHeader
        title="Host dashboard"
        extraLink={{ href: "/dashboard/driver", label: "Driver" }}
      />

      <main className="mx-auto max-w-2xl space-y-6 px-4 py-6">
        <Card>
          <h2 className="font-semibold text-zinc-900">List a parking spot</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Listings are saved to your account and visible on every device.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              label="Spot title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Covered Basement Sector 62"
              required
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Daily price (₹)"
                type="number"
                min={50}
                step={10}
                value={pricePerDay}
                onChange={(e) => setPricePerDay(e.target.value)}
                required
              />
              <Input
                label="Nightly price (₹)"
                type="number"
                min={50}
                step={10}
                value={pricePerNight}
                onChange={(e) => setPricePerNight(e.target.value)}
                required
              />
            </div>

            <TextArea
              label="Structural address"
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Tower A, Sector 15, Gurgaon, HR 122001"
              required
            />

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handlePinOnMap}
                disabled={geocoding}
              >
                {geocoding ? "Locating…" : "Pin on map"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleUseMyLocation}
                disabled={geocoding}
              >
                Use GPS
              </Button>
            </div>

            {previewSpot ? (
              <ParkingMap spots={[previewSpot]} heightClassName="h-44" />
            ) : (
              <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-zinc-200 text-xs text-zinc-400">
                Map preview after pinning location
              </div>
            )}

            <TextArea
              label="Gate instructions"
              rows={3}
              value={gateInstructions}
              onChange={(e) => setGateInstructions(e.target.value)}
              placeholder="Tell security you are visiting flat 10C"
              required
            />

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
            {success && (
              <p className="rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-700">
                {success}
              </p>
            )}

            <Button type="submit" fullWidth disabled={submitting}>
              {submitting ? "Publishing…" : "Publish spot"}
            </Button>
          </form>
        </Card>

        {listings.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-semibold text-zinc-900">
              Your listings ({listings.length})
            </h2>
            <div className="space-y-3">
              {listings.map((spot) => (
                <Card key={spot.id} className="!p-4">
                  <p className="font-medium text-zinc-900">{spot.title}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {LAYOUT_LABELS[spot.layout]} · {spot.sector}
                  </p>
                  <p className="mt-2 text-sm text-zinc-600">
                    {formatINR(spot.pricePerDay)} / day ·{" "}
                    {formatINR(spot.pricePerNight)} / night
                  </p>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
