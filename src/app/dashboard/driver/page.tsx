"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useAuth } from "@/contexts/AuthContext";
import { LAYOUT_LABELS } from "@/lib/parking-data";
import {
  cancelBooking,
  createBooking,
  fetchActiveBooking,
  fetchActiveSpots,
} from "@/lib/services/parking";
import type { Booking, ParkingSpot } from "@/lib/types";
import { formatINR } from "@/lib/utils/format";
import { buildWhatsAppGateLink } from "@/lib/utils/whatsapp";

const ParkingMap = dynamic(() => import("@/components/ParkingMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-72 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-500 sm:h-96">
      Loading map…
    </div>
  ),
});

type RateType = "day" | "night";

export default function DriverDashboardPage() {
  const router = useRouter();
  const { profile, loading: authLoading, isAuthenticated } = useAuth();

  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [highlightedSpotId, setHighlightedSpotId] = useState<string | null>(null);
  const [rateType, setRateType] = useState<RateType>("day");
  const [actionError, setActionError] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const loadData = useCallback(async () => {
    setDataLoading(true);
    try {
      const [spotsData, bookingData] = await Promise.all([
        fetchActiveSpots(),
        profile ? fetchActiveBooking(profile.id) : Promise.resolve(null),
      ]);
      setSpots(spotsData);
      setBooking(bookingData);
    } finally {
      setDataLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [authLoading, loadData]);

  const selectedSpot = spots.find((s) => s.id === selectedSpotId) ?? null;

  async function handleBook(spot: ParkingSpot) {
    if (!isAuthenticated || !profile) {
      router.push("/auth");
      return;
    }

    setBookingLoading(true);
    setActionError(null);

    const created = await createBooking(profile.id, profile, spot, rateType);
    setBookingLoading(false);

    if (!created) {
      setActionError("Could not complete booking. Check your connection.");
      return;
    }

    setBooking(created);
    setSelectedSpotId(null);
  }

  async function handleCancelBooking() {
    if (!profile || !booking) return;

    setBookingLoading(true);
    await cancelBooking(profile.id, booking.id);
    setBooking(null);
    setBookingLoading(false);
  }

  function handleSelectSpot(spotId: string) {
    setHighlightedSpotId(spotId);
    document.getElementById(`spot-${spotId}`)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  if (authLoading || dataLoading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-zinc-50">
        <p className="text-sm text-zinc-500">Loading your dashboard…</p>
      </div>
    );
  }

  if (booking) {
    const whatsappUrl = buildWhatsAppGateLink(booking);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${booking.spot.latitude},${booking.spot.longitude}`;

    return (
      <div className="min-h-full bg-zinc-50">
        <DashboardHeader title="Active booking" />

        <main className="mx-auto max-w-2xl space-y-4 px-4 py-6">
          <ParkingMap spots={[booking.spot]} heightClassName="h-56 sm:h-64" />

          <Card>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Confirmed · {booking.rateType}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-zinc-900">
              {booking.spot.title}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">{booking.spot.address}</p>
            <p className="mt-2 font-mono text-sm text-zinc-700">
              {booking.vehicleRegistration}
            </p>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm font-medium text-zinc-700 hover:underline"
            >
              Open in Google Maps →
            </a>

            <div className="mt-4 rounded-lg bg-zinc-50 p-3 text-sm text-zinc-600">
              <p className="text-xs font-medium uppercase text-zinc-400">
                Gate instructions
              </p>
              <p className="mt-1">{booking.spot.gateInstructions}</p>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex w-full items-center justify-center rounded-lg bg-zinc-900 py-3.5 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              I am at the Gate (Alert Host via WhatsApp)
            </a>

            <Button
              variant="secondary"
              fullWidth
              className="mt-3"
              onClick={handleCancelBooking}
              disabled={bookingLoading}
            >
              Cancel booking
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-zinc-50">
      <DashboardHeader
        title="Find parking"
        extraLink={{ href: "/dashboard/host", label: "Host" }}
      />

      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Parking map</h2>
            <p className="text-sm text-zinc-500">
              {spots.length} spots in Delhi NCR
            </p>
          </div>
          {!isAuthenticated && (
            <Link href="/auth">
              <Button variant="secondary">Sign in to book</Button>
            </Link>
          )}
        </div>

        <ParkingMap
          spots={spots}
          selectedSpotId={highlightedSpotId}
          onSelectSpot={handleSelectSpot}
          className="mb-6"
        />

        {actionError && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {actionError}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {spots.map((spot) => (
            <Card
              key={spot.id}
              id={`spot-${spot.id}`}
              className={
                highlightedSpotId === spot.id
                  ? "ring-2 ring-zinc-300"
                  : undefined
              }
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-medium text-zinc-500">
                    {LAYOUT_LABELS[spot.layout]}
                  </span>
                  <h3 className="mt-1 font-semibold text-zinc-900">{spot.title}</h3>
                </div>
                <span className="shrink-0 rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                  {spot.sector}
                </span>
              </div>

              <p className="mt-2 text-sm text-zinc-500">{spot.address}</p>

              <button
                type="button"
                onClick={() => setHighlightedSpotId(spot.id)}
                className="mt-2 text-xs font-medium text-zinc-600 hover:underline"
              >
                Show on map
              </button>

              <div className="mt-4 flex gap-6 text-sm">
                <div>
                  <p className="text-zinc-400">Day</p>
                  <p className="font-semibold">{formatINR(spot.pricePerDay)}</p>
                </div>
                <div>
                  <p className="text-zinc-400">Night</p>
                  <p className="font-semibold">{formatINR(spot.pricePerNight)}</p>
                </div>
              </div>

              <Button
                fullWidth
                className="mt-4"
                onClick={() => setSelectedSpotId(spot.id)}
              >
                Book spot
              </Button>
            </Card>
          ))}
        </div>

        {selectedSpot && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-900/40 p-4 sm:items-center">
            <Card className="w-full max-w-md">
              <h3 className="font-semibold text-zinc-900">Confirm booking</h3>
              <p className="mt-1 text-sm text-zinc-500">{selectedSpot.title}</p>

              <div className="mt-4 flex gap-2">
                {(["day", "night"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setRateType(type)}
                    className={`flex-1 rounded-lg border py-2 text-sm font-medium ${
                      rateType === type
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-200 text-zinc-600"
                    }`}
                  >
                    {type === "day"
                      ? `Day · ${formatINR(selectedSpot.pricePerDay)}`
                      : `Night · ${formatINR(selectedSpot.pricePerNight)}`}
                  </button>
                ))}
              </div>

              <p className="mt-4 rounded-lg bg-zinc-50 p-3 text-xs text-zinc-600">
                {selectedSpot.gateInstructions}
              </p>

              <div className="mt-5 flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setSelectedSpotId(null)}
                >
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => handleBook(selectedSpot)}
                  disabled={bookingLoading}
                >
                  {bookingLoading ? "Booking…" : "Confirm"}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
