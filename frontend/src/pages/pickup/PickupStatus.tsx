import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Phone,
  Truck,
  Users,
  Loader2,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { usePickupBookings } from "@/lib/pickup/usePickupBookings";
import { formatPrice } from "@/lib/utils";

const statusLabels: Record<string, { label: string; tone: "brand" | "success" | "warning" | "outline" }> = {
  searching: { label: "Finding your driver…", tone: "warning" },
  confirmed: { label: "Scheduled", tone: "brand" },
  driver_assigned: { label: "Driver on the way", tone: "success" },
  in_progress: { label: "Move in progress", tone: "success" },
  completed: { label: "Completed", tone: "outline" },
  cancelled: { label: "Cancelled", tone: "outline" },
};

export function PickupStatus() {
  const { id } = useParams();
  const { getBooking, updateStatus } = usePickupBookings();
  const booking = id ? getBooking(id) : undefined;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!booking || booking.status !== "searching") return;
    const t = setInterval(() => {
      setProgress((p) => Math.min(100, p + 12));
    }, 400);
    return () => clearInterval(t);
  }, [booking?.status, booking?.id]);

  useEffect(() => {
    if (!booking || booking.status !== "searching" || progress < 100) return;
    updateStatus(booking.id, "driver_assigned", {
      driverName: booking.driverName ?? "Ahmed K.",
      driverPhone: booking.driverPhone ?? "+971 50 555 0192",
      vehiclePlate: booking.vehiclePlate ?? "D 45291",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once when progress completes
  }, [progress === 100, booking?.id, booking?.status]);

  if (!booking) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold">Booking not found</h1>
        <Link to="/pickup" className="mt-4 inline-block text-brand-600 hover:underline">
          Book a new pickup
        </Link>
      </div>
    );
  }

  const meta = statusLabels[booking.status] ?? statusLabels.confirmed;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50/60 pb-16 pt-8">
      <div className="container max-w-lg">
        <Link
          to="/pickup"
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Book another pickup
        </Link>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-brand-700 to-brand-900 p-6 text-white">
            <Badge className="bg-white/15 text-white">{booking.id}</Badge>
            <h1 className="mt-3 text-2xl font-bold">{meta.label}</h1>
            {booking.status === "searching" && (
              <div className="mt-4">
                <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 flex items-center gap-2 text-sm text-brand-100">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Matching nearest crew…
                </p>
              </div>
            )}
          </div>

          {booking.driverName && (
            <div className="border-b border-slate-100 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Your driver
              </p>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{booking.driverName}</p>
                  <p className="text-sm text-slate-500">
                    {booking.vehicleName} · {booking.vehiclePlate}
                  </p>
                </div>
                <a href={`tel:${booking.driverPhone}`}>
                  <Button size="sm">
                    <Phone className="h-4 w-4" /> Call
                  </Button>
                </a>
              </div>
            </div>
          )}

          <div className="space-y-4 p-5 text-sm">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-emerald-600" />
              <div>
                <p className="text-xs text-slate-500">Pickup</p>
                <p className="font-medium">{booking.pickupAddress}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-brand-600" />
              <div>
                <p className="text-xs text-slate-500">Drop-off</p>
                <p className="font-medium">{booking.dropoffAddress}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-xl bg-slate-50 p-3">
                <Truck className="h-4 w-4 text-slate-400" />
                <p className="mt-1 text-xs text-slate-500">Vehicle</p>
                <p className="font-medium">{booking.vehicleName}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <Users className="h-4 w-4 text-slate-400" />
                <p className="mt-1 text-xs text-slate-500">Helpers</p>
                <p className="font-medium">{booking.helpers}</p>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-slate-500">{booking.scheduleLabel}</span>
              <span className="text-lg font-bold">{formatPrice(booking.fare.total)}</span>
            </div>
          </div>
        </div>

        {booking.status === "driver_assigned" && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center gap-2 text-emerald-800">
              <Navigation className="h-5 w-5" />
              <span className="font-semibold">Live tracking active</span>
            </div>
            <p className="mt-1 text-sm text-emerald-700">
              Ahmed is 8 minutes away. You&apos;ll get SMS updates at {booking.contactPhone}.
            </p>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link to="/dashboard">
            <Button variant="outline" className="w-full">
              Dashboard
            </Button>
          </Link>
          <Link to="/pickup">
            <Button className="w-full">
              <CheckCircle2 className="h-4 w-4" /> New booking
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
