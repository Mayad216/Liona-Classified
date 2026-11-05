import type { BookingFor, BookingRelationship } from "@/lib/services/serviceBooking";
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
  /** Booker confirmation — optional so bookings saved before this existed still load. */
  bookingFor?: BookingFor;
  bookerName?: string;
  bookerEmail?: string;
  recipientName?: string;
  recipientRelationship?: BookingRelationship;
  recipientDetail?: string;
  fare: PickupFareEstimate;
  status: PickupBookingStatus;
  driverName?: string;
  driverPhone?: string;
  vehiclePlate?: string;
  createdAt: string;
}
