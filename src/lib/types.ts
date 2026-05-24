export type ParkingSpot = {
  id: string;
  title: string;
  address: string;
  latitude: number;
  longitude: number;
  pricePerDay: number;
  pricePerNight: number;
  gateInstructions: string;
  hostName: string;
  hostPhone: string;
  layout: "covered-basement" | "open-driveway" | "stilt" | "compound";
  sector: string;
  active: boolean;
  hostId?: string;
};

export type UserProfile = {
  id: string;
  fullName: string;
  phone: string;
  vehicleRegistration: string;
};

export type Booking = {
  id: string;
  spotId: string;
  spot: ParkingSpot;
  rateType: "day" | "night";
  bookedAt: string;
  driverName: string;
  driverPhone: string;
  vehicleRegistration: string;
  status: "active" | "cancelled";
};
