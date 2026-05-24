"use client";

import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import type { ParkingSpot } from "@/lib/types";
import { formatINR } from "@/lib/utils/format";

import "leaflet/dist/leaflet.css";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapFocus({
  spot,
  spots,
}: {
  spot: ParkingSpot | null;
  spots: ParkingSpot[];
}) {
  const map = useMap();

  useEffect(() => {
    if (spot) {
      map.setView([spot.latitude, spot.longitude], 15, { animate: true });
      return;
    }

    if (spots.length === 1) {
      map.setView([spots[0].latitude, spots[0].longitude], 14);
      return;
    }

    if (spots.length > 1) {
      const bounds = L.latLngBounds(
        spots.map((s) => [s.latitude, s.longitude] as [number, number]),
      );
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }
  }, [map, spot, spots]);

  return null;
}

type ParkingMapProps = {
  spots: ParkingSpot[];
  selectedSpotId?: string | null;
  onSelectSpot?: (spotId: string) => void;
  className?: string;
  heightClassName?: string;
};

export default function ParkingMap({
  spots,
  selectedSpotId = null,
  onSelectSpot,
  className = "",
  heightClassName = "h-72 sm:h-96",
}: ParkingMapProps) {
  const selectedSpot =
    spots.find((spot) => spot.id === selectedSpotId) ?? null;

  const center = selectedSpot
    ? ([selectedSpot.latitude, selectedSpot.longitude] as [number, number])
    : spots.length > 0
      ? ([spots[0].latitude, spots[0].longitude] as [number, number])
      : ([28.6139, 77.209] as [number, number]);

  if (spots.length === 0) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-500 ${heightClassName} ${className}`}
      >
        No parking locations to show yet.
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-slate-200 shadow-md ${className}`}
    >
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={false}
        className={`w-full ${heightClassName}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapFocus spot={selectedSpot} spots={spots} />
        {spots.map((spot) => (
          <Marker
            key={spot.id}
            position={[spot.latitude, spot.longitude]}
            icon={markerIcon}
            eventHandlers={{
              click: () => onSelectSpot?.(spot.id),
            }}
          >
            <Popup>
              <div className="min-w-[180px]">
                <p className="font-semibold text-slate-900">{spot.title}</p>
                <p className="mt-1 text-xs text-slate-600">{spot.address}</p>
                <p className="mt-2 text-xs font-medium text-emerald-700">
                  {formatINR(spot.pricePerDay)} / day
                </p>
                {onSelectSpot && (
                  <button
                    type="button"
                    onClick={() => onSelectSpot(spot.id)}
                    className="mt-2 text-xs font-semibold text-orange-600 hover:underline"
                  >
                    View spot →
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
