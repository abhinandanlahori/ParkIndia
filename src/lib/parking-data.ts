import type { ParkingSpot } from "./types";

export const DEFAULT_PARKING_SPOTS: ParkingSpot[] = [
  {
    id: "spot-1",
    title: "Covered Basement Sector 62",
    address: "Tower B, Logix Blossom County, Sector 62, Noida, UP 201309",
    latitude: 28.624,
    longitude: 77.3649,
    pricePerDay: 350,
    pricePerNight: 200,
    gateInstructions:
      "Tell security you are visiting flat 1204. Take basement ramp B2.",
    hostName: "Rajesh Kumar",
    hostPhone: "919876543210",
    layout: "covered-basement",
    sector: "Sector 62",
    active: true,
  },
  {
    id: "spot-2",
    title: "Open Driveway Sector 15",
    address: "House 42, Block C, Sector 15, Gurgaon, HR 122001",
    latitude: 28.4378,
    longitude: 77.0419,
    pricePerDay: 250,
    pricePerNight: 150,
    gateInstructions:
      "Ring bell at main gate. Mention booking for driveway slot near marigold planter.",
    hostName: "Priya Sharma",
    hostPhone: "919812345678",
    layout: "open-driveway",
    sector: "Sector 15",
    active: true,
  },
  {
    id: "spot-3",
    title: "Stilt Parking Sector 44",
    address: "Emerald Heights, Plot 18, Sector 44, Noida, UP 201303",
    latitude: 28.5545,
    longitude: 77.354,
    pricePerDay: 400,
    pricePerNight: 250,
    gateInstructions:
      "Show booking confirmation to guard. Stilt slot S-14 on level 2.",
    hostName: "Amit Verma",
    hostPhone: "919900112233",
    layout: "stilt",
    sector: "Sector 44",
    active: true,
  },
  {
    id: "spot-4",
    title: "Compound Slot Sector 18",
    address: "DLF Phase 4, Lane 3, Sector 18, Gurgaon, HR 122015",
    latitude: 28.4853,
    longitude: 77.0785,
    pricePerDay: 300,
    pricePerNight: 180,
    gateInstructions:
      "Call host on arrival. Enter through service lane; spot marked with orange cone.",
    hostName: "Neha Gupta",
    hostPhone: "919811223344",
    layout: "compound",
    sector: "Sector 18",
    active: true,
  },
];

export const LAYOUT_LABELS: Record<ParkingSpot["layout"], string> = {
  "covered-basement": "Covered Basement",
  "open-driveway": "Open Driveway",
  stilt: "Stilt Parking",
  compound: "Compound Slot",
};

/** Fallback coords for host spots missing lat/lng (legacy localStorage entries). */
export const DEFAULT_SPOT_COORDS = {
  latitude: 28.6139,
  longitude: 77.209,
};
