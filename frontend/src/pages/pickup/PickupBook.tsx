import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Navigation,
  Users,
  Truck,
  Clock,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Minus,
  Plus,
  Phone,
  ShieldCheck,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { VehicleIcon } from "@/components/pickup/VehicleIcon";
import { useAuth } from "@/lib/auth";
import { useDashboardStore } from "@/lib/dashboardStore";
import {
  calculateFare,
  getVehicleById,
  helperOptions,
  scheduleSlots,
  vehicleOptions,
} from "@/lib/pickup/config";
import { usePickupBookings } from "@/lib/pickup/usePickupBookings";
import type { PickupBooking, VehicleSizeId } from "@/lib/pickup/types";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

const steps = [
  { id: "route", label: "Route", icon: MapPin },
  { id: "vehicle", label: "Vehicle", icon: Truck },
  { id: "helpers", label: "Helpers", icon: Users },
  { id: "schedule", label: "When", icon: Clock },
  { id: "confirm", label: "Confirm", icon: CheckCircle2 },
] as const;

type StepId = (typeof steps)[number]["id"];

const popularPickup = [
  "Dubai Marina, Dubai",
  "JLT Cluster D, Dubai",
  "Business Bay, Dubai",
  "Al Reem Island, Abu Dhabi",
];

const popularDropoff = [
  "JVC District 12, Dubai",
  "Al Nahda, Sharjah",
  "Khalifa City, Abu Dhabi",
  "Downtown Dubai",
];

export function PickupBook() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getProfile } = useDashboardStore();
  const { addBooking } = usePickupBookings();
  const profile = user ? getProfile(user.id) : null;

  const [step, setStep] = useState<StepId>("route");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [vehicleId, setVehicleId] = useState<VehicleSizeId>("pickup");
  const [helpers, setHelpers] = useState(2);
  const [scheduleIdx, setScheduleIdx] = useState(0);
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fare = useMemo(
    () => calculateFare(vehicleId, pickup, dropoff, helpers),
    [vehicleId, pickup, dropoff, helpers]
  );

  const vehicle = getVehicleById(vehicleId);
  const schedule = scheduleSlots[scheduleIdx];
  const stepIndex = steps.findIndex((s) => s.id === step);

  const canNext = () => {
    switch (step) {
      case "route":
        return pickup.trim().length > 5 && dropoff.trim().length > 5;
      case "vehicle":
        return !!vehicleId;
      case "helpers":
        return helpers >= 0;
      case "schedule":
        return scheduleIdx >= 0;
      case "confirm":
        return phone.trim().length >= 8;
      default:
        return false;
    }
  };

  const goNext = () => {
    const i = stepIndex;
    if (i < steps.length - 1) setStep(steps[i + 1].id);
  };

  const goBack = () => {
    const i = stepIndex;
    if (i > 0) setStep(steps[i - 1].id);
  };

  const handleConfirm = () => {
    if (!user) {
      navigate("/auth/login", { state: { from: "/pickup" } });
      return;
    }
    if (!vehicle) return;

    setSubmitting(true);
    const id = `PK-${Date.now().toString(36).toUpperCase()}`;
    const booking: PickupBooking = {
      id,
      userId: user.id,
      pickupAddress: pickup.trim(),
      dropoffAddress: dropoff.trim(),
      emirate: pickup.includes("Abu Dhabi")
        ? "Abu Dhabi"
        : pickup.includes("Sharjah")
          ? "Sharjah"
          : "Dubai",
      vehicleId,
      vehicleName: vehicle.name,
      helpers,
      scheduledAt: new Date().toISOString(),
      scheduleLabel: schedule.label,
      contactPhone: phone.trim(),
      notes: notes.trim(),
      fare,
      status: schedule.id === "now" ? "searching" : "confirmed",
      createdAt: new Date().toISOString(),
    };

    if (schedule.id === "now") {
      setTimeout(() => {
        booking.status = "driver_assigned";
        booking.driverName = "Ahmed K.";
        booking.driverPhone = "+971 50 555 0192";
        booking.vehiclePlate = "D 45291";
        addBooking(booking);
        setSubmitting(false);
        navigate(`/pickup/${id}`);
      }, 1800);
    } else {
      addBooking(booking);
      setSubmitting(false);
      navigate(`/pickup/${id}`);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-900">
      {/* Map hero */}
      <div className="relative h-[220px] overflow-hidden sm:h-[280px]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1600&q=80)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-slate-900/50 to-slate-900" />
        <div className="absolute inset-0 bg-grid-light bg-[size:24px_24px] opacity-20" />

        {pickup && dropoff && step !== "route" && (
          <div className="absolute left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-6">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-1 pt-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-400/30" />
                  <span className="h-8 w-0.5 bg-white/40" />
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-400 ring-4 ring-brand-400/30" />
                </div>
                <div className="min-w-0 flex-1 space-y-3 text-sm text-white">
                  <p className="line-clamp-1 font-medium">{pickup}</p>
                  <p className="line-clamp-1 font-medium">{dropoff}</p>
                  <p className="text-xs text-white/70">
                    ~{fare.estimatedKm} km · {formatPrice(fare.total)} est.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="container relative pt-6">
          <Badge className="bg-white/15 text-white backdrop-blur">
            <Truck className="mr-1 h-3 w-3" /> Khaleej Pickup
          </Badge>
          <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
            Book movers like a ride
          </h1>
          <p className="mt-1 max-w-lg text-sm text-white/80">
            Choose your vehicle size and crew — instant quote, verified drivers, live tracking.
          </p>
        </div>
      </div>

      {/* Booking sheet */}
      <div className="container relative z-10 -mt-6 pb-16">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          {/* Step indicator */}
          <div className="flex overflow-x-auto border-b border-slate-100 px-2 py-3 scrollbar-none">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const done = i < stepIndex;
              const active = s.id === step;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => i <= stepIndex && setStep(s.id)}
                  className={cn(
                    "flex flex-shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition",
                    active && "bg-brand-50 text-brand-700",
                    done && !active && "text-emerald-600",
                    !active && !done && "text-slate-400"
                  )}
                >
                  {done && !active ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <Icon className="h-3.5 w-3.5" />
                  )}
                  {s.label}
                  {i < steps.length - 1 && (
                    <ChevronRight className="mx-0.5 h-3 w-3 text-slate-300" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-5 sm:p-6">
            {step === "route" && (
              <RouteStep
                pickup={pickup}
                dropoff={dropoff}
                onPickup={setPickup}
                onDropoff={setDropoff}
              />
            )}

            {step === "vehicle" && (
              <VehicleStep selected={vehicleId} onSelect={setVehicleId} fare={fare} />
            )}

            {step === "helpers" && (
              <HelpersStep
                count={helpers}
                onChange={setHelpers}
                vehicleName={vehicle?.name ?? ""}
              />
            )}

            {step === "schedule" && (
              <ScheduleStep selected={scheduleIdx} onSelect={setScheduleIdx} />
            )}

            {step === "confirm" && vehicle && (
              <ConfirmStep
                pickup={pickup}
                dropoff={dropoff}
                vehicle={vehicle}
                helpers={helpers}
                schedule={schedule}
                fare={fare}
                phone={phone}
                notes={notes}
                onPhone={setPhone}
                onNotes={setNotes}
              />
            )}
          </div>

          {/* Fare bar + actions */}
          <div className="border-t border-slate-100 bg-slate-50/80 p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
                  Estimated total
                </p>
                <p className="text-2xl font-black text-slate-900">
                  {formatPrice(fare.total)}
                  {fare.estimatedKm > 0 && (
                    <span className="ml-2 text-sm font-normal text-slate-500">
                      · ~{fare.estimatedKm} km
                    </span>
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                {stepIndex > 0 && (
                  <Button variant="outline" size="md" onClick={goBack}>
                    <ChevronLeft className="h-4 w-4" /> Back
                  </Button>
                )}
                {step !== "confirm" ? (
                  <Button size="md" onClick={goNext} disabled={!canNext()}>
                    Continue <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="md"
                    loading={submitting}
                    onClick={handleConfirm}
                    disabled={!canNext()}
                  >
                    {schedule.id === "now" ? "Request pickup now" : "Schedule pickup"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> Insured moves
          </span>
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> 4.9 avg rating
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> Background-checked crews
          </span>
        </div>
      </div>
    </div>
  );
}

function RouteStep({
  pickup,
  dropoff,
  onPickup,
  onDropoff,
}: {
  pickup: string;
  dropoff: string;
  onPickup: (v: string) => void;
  onDropoff: (v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-600">
        Enter pickup and drop-off locations — we&apos;ll match the right vehicle and crew.
      </p>
      <div className="relative space-y-3">
        <div className="absolute left-[1.15rem] top-8 bottom-8 w-0.5 bg-slate-200" />
        <div className="relative">
          <span className="absolute left-3 top-1/2 z-10 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
          <input
            value={pickup}
            onChange={(e) => onPickup(e.target.value)}
            placeholder="Pickup address"
            className="h-12 w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
          />
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 z-10 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white bg-brand-600 shadow-sm" />
          <input
            value={dropoff}
            onChange={(e) => onDropoff(e.target.value)}
            placeholder="Drop-off address"
            className="h-12 w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            const p = pickup;
            onPickup(dropoff);
            onDropoff(p);
          }}
          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-lg bg-slate-100 p-2 hover:bg-slate-200"
          title="Swap addresses"
        >
          <Navigation className="h-4 w-4 text-slate-600" />
        </button>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Popular pickup
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {popularPickup.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => onPickup(a)}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:border-brand-300 hover:bg-brand-50"
            >
              {a}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Popular drop-off
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {popularDropoff.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => onDropoff(a)}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:border-brand-300 hover:bg-brand-50"
            >
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function VehicleStep({
  selected,
  onSelect,
  fare,
}: {
  selected: VehicleSizeId;
  onSelect: (id: VehicleSizeId) => void;
  fare: ReturnType<typeof calculateFare>;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Select a vehicle size — pricing updates based on distance (~{fare.estimatedKm || "—"}{" "}
        km).
      </p>
      <div className="space-y-3">
        {vehicleOptions.map((v) => {
          const isSelected = selected === v.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onSelect(v.id)}
              className={cn(
                "flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition",
                isSelected
                  ? "border-brand-500 bg-brand-50/60 ring-2 ring-brand-500/20"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
              )}
            >
              <VehicleIcon type={v.icon} selected={isSelected} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-900">{v.name}</span>
                  <span className="text-sm font-bold text-brand-700">
                    from {formatPrice(v.baseFare)}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{v.subtitle}</p>
                <p className="mt-1 text-xs text-slate-400">{v.capacity} · ETA {v.eta}</p>
              </div>
              {isSelected && <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-brand-600" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function HelpersStep({
  count,
  onChange,
  vehicleName,
}: {
  count: number;
  onChange: (n: number) => void;
  vehicleName: string;
}) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">
        How many movers do you need? They load, carry, and unload — paired with your{" "}
        <strong>{vehicleName}</strong>.
      </p>

      <div className="flex items-center justify-center gap-6 py-4">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, count - 1))}
          disabled={count <= 0}
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-slate-200 text-slate-700 transition hover:border-brand-400 hover:bg-brand-50 disabled:opacity-40"
        >
          <Minus className="h-6 w-6" />
        </button>
        <div className="text-center">
          <div className="text-5xl font-black text-slate-900">{count}</div>
          <div className="mt-1 text-sm font-medium text-slate-500">
            helper{count !== 1 ? "s" : ""}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onChange(Math.min(4, count + 1))}
          disabled={count >= 4}
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-brand-600 bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-40"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {helperOptions.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={cn(
              "rounded-xl border py-3 text-center text-sm font-semibold transition",
              count === n
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            )}
          >
            {n === 4 ? "4+" : n}
          </button>
        ))}
      </div>

      <div className="rounded-xl bg-amber-50 border border-amber-100 p-4 text-sm text-amber-900">
        <strong>Tip:</strong> Studio = 1–2 helpers · 1-bed = 2 · 2-bed = 3 · Villa = 4+. Each
        helper is AED 75/hr (2 hr minimum included in quote).
      </div>

      {count === 0 && (
        <p className="text-center text-sm text-slate-500">
          Driver-only — you handle loading. Save on helper fees.
        </p>
      )}
    </div>
  );
}

function ScheduleStep({
  selected,
  onSelect,
}: {
  selected: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">When should we pick you up?</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {scheduleSlots.map((slot, i) => (
          <button
            key={slot.id}
            type="button"
            onClick={() => onSelect(i)}
            className={cn(
              "rounded-xl border p-4 text-left transition",
              selected === i
                ? "border-brand-600 bg-brand-50 ring-2 ring-brand-500/20"
                : "border-slate-200 hover:border-slate-300"
            )}
          >
            <div className="font-semibold text-slate-900">{slot.label}</div>
            <div className="mt-0.5 text-xs text-slate-500">{slot.sub}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ConfirmStep({
  pickup,
  dropoff,
  vehicle,
  helpers,
  schedule,
  fare,
  phone,
  notes,
  onPhone,
  onNotes,
}: {
  pickup: string;
  dropoff: string;
  vehicle: (typeof vehicleOptions)[0];
  helpers: number;
  schedule: (typeof scheduleSlots)[number];
  fare: ReturnType<typeof calculateFare>;
  phone: string;
  notes: string;
  onPhone: (v: string) => void;
  onNotes: (v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Vehicle</span>
            <span className="font-medium">{vehicle.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Helpers</span>
            <span className="font-medium">{helpers}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">When</span>
            <span className="font-medium">{schedule.label}</span>
          </div>
          <div className="border-t border-slate-200 pt-2">
            <div className="flex justify-between text-slate-500">
              <span>Base fare</span>
              <span>{formatPrice(fare.base)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Distance (~{fare.estimatedKm} km)</span>
              <span>{formatPrice(fare.distanceCharge)}</span>
            </div>
            {fare.helperCharge > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>Helpers ({helpers}× 2 hr)</span>
                <span>{formatPrice(fare.helperCharge)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500">
              <span>Platform fee</span>
              <span>{formatPrice(fare.platformFee)}</span>
            </div>
            <div className="mt-2 flex justify-between font-bold text-slate-900">
              <span>Total</span>
              <span>{formatPrice(fare.total)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1 text-sm">
        <p className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
          <span>{pickup}</span>
        </p>
        <p className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-600" />
          <span>{dropoff}</span>
        </p>
      </div>

      <Input
        label="Contact phone"
        type="tel"
        value={phone}
        onChange={(e) => onPhone(e.target.value)}
        placeholder="+971 50 123 4567"
        icon={<Phone className="h-4 w-4" />}
        required
      />
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Notes for driver (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => onNotes(e.target.value)}
          rows={2}
          placeholder="Building access, elevator, fragile items…"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
        />
      </div>

      <p className="text-xs text-slate-500">
        By confirming you agree to Khaleej&apos;s move terms. Cash or card on completion.
      </p>
    </div>
  );
}
