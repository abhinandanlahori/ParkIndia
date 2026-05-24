export type ProfileRow = {
  id: string;
  full_name: string;
  phone: string;
  vehicle_registration: string;
  created_at: string;
  updated_at: string;
};

export type ParkingSpotRow = {
  id: string;
  host_id: string | null;
  title: string;
  address: string;
  latitude: number;
  longitude: number;
  price_per_day: number;
  price_per_night: number;
  gate_instructions: string;
  host_name: string;
  host_phone: string;
  layout: string;
  sector: string;
  active: boolean;
  created_at: string;
};

export type BookingRow = {
  id: string;
  driver_id: string;
  spot_id: string | null;
  spot_snapshot: unknown;
  rate_type: string;
  status: string;
  vehicle_registration: string;
  driver_name: string;
  driver_phone: string;
  booked_at: string;
};
