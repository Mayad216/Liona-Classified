import type { PickupFareEstimate, VehicleOption } from "./types";

export const PICKUP_BOOKINGS_KEY = "khaleej:pickup-bookings";

export const HELPER_RATE_AED = 75;
export const HELPER_HOURS_DEFAULT = 2;
export const PLATFORM_FEE_RATE = 0.05;

export const vehicleOptions: VehicleOption[] = [
  {
    id: "compact",
    name: "Compact pickup",
    subtitle: "Best for boxes & small loads",
    capacity: "Up to 500 kg",
    examples: "Studio move, furniture pickup, marketplace delivery",
    baseFare: 79,
    perKm: 2.5,
    eta: "12–18 min",
    icon: "compact",
  },
  {
    id: "pickup",
    name: "Pickup truck",
    subtitle: "1-bed apartment moves",
    capacity: "Up to 1.2 tons",
    examples: "Bed, sofa, appliances, 15–20 boxes",
    baseFare: 129,
    perKm: 3.5,
    eta: "15–22 min",
    icon: "pickup",
  },
  {
    id: "truck_3t",
    name: "3-ton truck",
    subtitle: "2–3 bed home moves",
    capacity: "Up to 3 tons",
    examples: "Full apartment, office cubicles",
    baseFare: 189,
    perKm: 4.5,
    eta: "20–30 min",
    icon: "truck",
  },
  {
    id: "truck_7t",
    name: "7-ton truck",
    subtitle: "Villa & large office moves",
    capacity: "Up to 7 tons",
    examples: "Villa, warehouse, heavy furniture",
    baseFare: 299,
    perKm: 6,
    eta: "25–40 min",
    icon: "truck_large",
  },
];

export const helperOptions = [0, 1, 2, 3, 4] as const;

export const scheduleSlots = [
  { id: "now", label: "Pickup now", sub: "Nearest available crew" },
  { id: "today_pm", label: "Today · 2–6 PM", sub: "Afternoon window" },
  { id: "today_eve", label: "Today · 6–9 PM", sub: "Evening window" },
  { id: "tomorrow_am", label: "Tomorrow · 9 AM–12 PM", sub: "Morning window" },
  { id: "tomorrow_pm", label: "Tomorrow · 2–6 PM", sub: "Afternoon window" },
] as const;

/** Mock distance from address text length / keywords (demo without maps API). */
export function estimateDistanceKm(pickup: string, dropoff: string): number {
  const p = pickup.trim().toLowerCase();
  const d = dropoff.trim().toLowerCase();
  if (!p || !d) return 0;
  if (p === d) return 2;
  const sameArea =
    p.split(",").some((part) => d.includes(part.trim()) && part.trim().length > 4);
  if (sameArea) return 8 + Math.min(12, Math.abs(p.length - d.length) * 0.3);
  const crossEmirate =
    (p.includes("abu dhabi") && d.includes("dubai")) ||
    (p.includes("dubai") && d.includes("abu dhabi"));
  if (crossEmirate) return 95;
  if (p.includes("sharjah") || d.includes("sharjah")) return 28;
  return 14 + Math.min(25, Math.abs(p.length - d.length) * 0.5);
}

export function calculateFare(
  vehicleId: VehicleOption["id"],
  pickup: string,
  dropoff: string,
  helpers: number
): PickupFareEstimate {
  const vehicle = vehicleOptions.find((v) => v.id === vehicleId) ?? vehicleOptions[1];
  const estimatedKm = Math.max(3, estimateDistanceKm(pickup, dropoff));
  const base = vehicle.baseFare;
  const distanceCharge = Math.round(estimatedKm * vehicle.perKm);
  const helperCharge = helpers * HELPER_RATE_AED * HELPER_HOURS_DEFAULT;
  const subtotal = base + distanceCharge + helperCharge;
  const platformFee = Math.round(subtotal * PLATFORM_FEE_RATE);
  return {
    base,
    distance: estimatedKm,
    distanceCharge,
    helpers,
    helperCharge,
    platformFee,
    total: subtotal + platformFee,
    estimatedKm,
  };
}

export function getVehicleById(id: VehicleOption["id"]) {
  return vehicleOptions.find((v) => v.id === id);
}
