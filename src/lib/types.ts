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
};

export type UserProfile = {
  fullName: string;
  phone: string;
  vehicleRegistration: string;
};

export type Booking = {
  spotId: string;
  spot: ParkingSpot;
  bookedAt: string;
  driverName: string;
  driverPhone: string;
  vehicleRegistration: string;
};
