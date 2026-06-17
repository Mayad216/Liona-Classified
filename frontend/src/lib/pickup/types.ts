import type { Emirate } from "@/types";

export type VehicleSizeId = "compact" | "pickup" | "truck_3t" | "truck_7t";

export type PickupBookingStatus =
  | "searching"
  | "confirmed"
  | "driver_assigned"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface VehicleOption {
  id: VehicleSizeId;
  name: string;
  subtitle: string;
  capacity: string;
  examples: string;
  baseFare: number;
  perKm: number;
  eta: string;
  icon: "compact" | "pickup" | "truck" | "truck_large";
}

export interface PickupFareEstimate {
  base: number;
  distance: number;
  distanceCharge: number;
  helpers: number;
  helperCharge: number;
  platformFee: number;
  total: number;
  estimatedKm: number;
}

export interface PickupBooking {
  id: string;
  userId: string;
  pickupAddress: string;
  dropoffAddress: string;
  emirate: Emirate;
  vehicleId: VehicleSizeId;
  vehicleName: string;
  helpers: number;
  scheduledAt: string;
  scheduleLabel: string;
  contactPhone: string;
  notes: string;
  fare: PickupFareEstimate;
  status: PickupBookingStatus;
  driverName?: string;
  driverPhone?: string;
  vehiclePlate?: string;
  createdAt: string;
}
