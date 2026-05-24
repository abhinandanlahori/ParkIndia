import type { Booking } from "@/lib/types";

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
