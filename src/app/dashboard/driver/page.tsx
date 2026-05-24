"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import { LAYOUT_LABELS } from "@/lib/parking-data";
import type { Booking, ParkingSpot } from "@/lib/types";
import {
  buildWhatsAppGateLink,
  clearBooking,
  formatINR,
  getActiveBooking,
  getAllActiveSpots,
  getRegisteredProfile,
  getStoredProfile,
  isLoggedIn,
  saveBooking,
} from "@/lib/storage";

const ParkingMap = dynamic(() => import("@/components/ParkingMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-72 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-500 sm:h-96">
      Loading map…
    </div>
  ),
});

type RateType = "day" | "night";

export default function DriverDashboardPage() {
  const router = useRouter();
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [highlightedSpotId, setHighlightedSpotId] = useState<string | null>(null);
  const [rateType, setRateType] = useState<RateType>("day");
  const [profileName, setProfileName] = useState("Guest");

  useEffect(() => {
    setSpots(getAllActiveSpots());
    setBooking(getActiveBooking());
    const profile = getStoredProfile() ?? getRegisteredProfile();
    if (profile?.fullName) setProfileName(profile.fullName);
  }, []);

  const selectedSpot = spots.find((spot) => spot.id === selectedSpotId) ?? null;

  function handleBook(spot: ParkingSpot) {
    if (!isLoggedIn()) {
      router.push("/auth");
      return;
    }

    const profile = getStoredProfile();
    const newBooking: Booking = {
      spotId: spot.id,
      spot,
      bookedAt: new Date().toISOString(),
      driverName: profile?.fullName ?? "Guest Driver",
      driverPhone: profile?.phone ?? "0000000000",
      vehicleRegistration: profile?.vehicleRegistration ?? "DL 00 XX 0000",
    };

    saveBooking(newBooking);
    setBooking(newBooking);
    setSelectedSpotId(null);
  }

  function handleCancelBooking() {
    clearBooking();
    setBooking(null);
  }

  function handleSelectSpot(spotId: string) {
    setHighlightedSpotId(spotId);
    document.getElementById(`spot-${spotId}`)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  if (booking) {
    const whatsappUrl = buildWhatsAppGateLink(booking);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${booking.spot.latitude},${booking.spot.longitude}`;

    return (
      <div className="min-h-full bg-gradient-to-br from-emerald-50 via-white to-orange-50">
        <DashboardHeader title="Active Booking" profileName={profileName} />

        <main className="mx-auto max-w-2xl space-y-6 px-4 py-8">
          <ParkingMap spots={[booking.spot]} heightClassName="h-56 sm:h-64" />

          <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-xl shadow-emerald-100/50 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-800">
                  Active Booking
                </span>
                <h2 className="mt-3 text-2xl font-bold text-slate-900">
                  {booking.spot.title}
                </h2>
                <p className="mt-1 text-sm text-slate-600">{booking.spot.address}</p>
              </div>
              <span className="rounded-xl bg-orange-100 px-3 py-2 text-xs font-medium text-orange-800">
                {booking.vehicleRegistration}
              </span>
            </div>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:underline"
            >
              Open in Google Maps →
            </a>

            <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Gate Instructions
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                {booking.spot.gateInstructions}
              </p>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-emerald-300/50 transition hover:bg-emerald-700"
            >
              <span aria-hidden>📱</span>
              I am at the Gate (Alert Host via WhatsApp)
            </a>

            <button
              type="button"
              onClick={handleCancelBooking}
              className="mt-4 w-full rounded-xl border border-slate-200 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Cancel booking
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-emerald-50 via-white to-orange-50">
      <DashboardHeader
        title="Find Parking"
        profileName={profileName}
        extraLink={{ href: "/dashboard/host", label: "Host view" }}
      />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Parking map — Delhi NCR
            </h2>
            <p className="text-sm text-slate-600">
              {spots.length} active spots · tap a pin or card to explore
            </p>
          </div>
          {!isLoggedIn() && (
            <Link
              href="/auth"
              className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
            >
              Log in to book
            </Link>
          )}
        </div>

        <ParkingMap
          spots={spots}
          selectedSpotId={highlightedSpotId}
          onSelectSpot={handleSelectSpot}
          className="mb-8"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          {spots.map((spot) => (
            <article
              key={spot.id}
              id={`spot-${spot.id}`}
              className={`flex flex-col rounded-2xl border bg-white p-5 shadow-md transition hover:shadow-lg ${
                highlightedSpotId === spot.id
                  ? "border-emerald-400 ring-2 ring-emerald-100"
                  : "border-slate-100 shadow-slate-100/80 hover:border-emerald-200"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                    {LAYOUT_LABELS[spot.layout]}
                  </span>
                  <h3 className="mt-2 text-lg font-bold text-slate-900">
                    {spot.title}
                  </h3>
                </div>
                <span className="shrink-0 rounded-lg bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700">
                  {spot.sector}
                </span>
              </div>

              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                {spot.address}
              </p>

              <button
                type="button"
                onClick={() => setHighlightedSpotId(spot.id)}
                className="mt-2 text-left text-xs font-medium text-emerald-700 hover:underline"
              >
                Show on map
              </button>

              <div className="mt-4 flex items-center gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Day</p>
                  <p className="font-bold text-slate-900">
                    {formatINR(spot.pricePerDay)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Night</p>
                  <p className="font-bold text-slate-900">
                    {formatINR(spot.pricePerNight)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSpotId(spot.id)}
                className="mt-4 w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Book this spot
              </button>
            </article>
          ))}
        </div>

        {selectedSpot && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center">
            <div
              role="dialog"
              aria-modal="true"
              className="w-full max-w-md rounded-2xl border border-emerald-100 bg-white p-6 shadow-2xl"
            >
              <h3 className="text-lg font-bold text-slate-900">Confirm booking</h3>
              <p className="mt-1 text-sm text-slate-600">{selectedSpot.title}</p>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setRateType("day")}
                  className={`flex-1 rounded-xl border py-2 text-sm font-medium transition ${
                    rateType === "day"
                      ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  Day · {formatINR(selectedSpot.pricePerDay)}
                </button>
                <button
                  type="button"
                  onClick={() => setRateType("night")}
                  className={`flex-1 rounded-xl border py-2 text-sm font-medium transition ${
                    rateType === "night"
                      ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  Night · {formatINR(selectedSpot.pricePerNight)}
                </button>
              </div>

              <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
                {selectedSpot.gateInstructions}
              </p>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedSpotId(null)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => handleBook(selectedSpot)}
                  className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white"
                >
                  Confirm · {rateType === "day" ? "Day" : "Night"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
