import { useEffect, useState } from "react";
import { CalendarCheck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BookingContactFields } from "@/components/services/BookingContactFields";
import { useAuth } from "@/lib/auth";
import {
  bookingCopyForCategory,
  emptyBookingContact,
  validateBookingContact,
  type BookingContactDetails,
  type BookingContactErrors,
} from "@/lib/services/serviceBooking";
import { formatPrice } from "@/lib/utils";
import type { Service } from "@/types";

type Props = {
  service: Service;
  slotLabel: string;
  open: boolean;
  onClose: () => void;
  onConfirm: (details: BookingContactDetails) => void;
};

export function ServiceBookingModal({ service, slotLabel, open, onClose, onConfirm }: Props) {
  const { user } = useAuth();
  const copy = bookingCopyForCategory(service.category);
  const [details, setDetails] = useState<BookingContactDetails>(() => emptyBookingContact(user));
  const [errors, setErrors] = useState<BookingContactErrors>({});

  useEffect(() => {
    if (!open) return;
    setDetails(emptyBookingContact(user));
    setErrors({});
  }, [open, user]);

  if (!open) return null;

  function update<K extends keyof BookingContactDetails>(
    key: K,
    value: BookingContactDetails[K]
  ) {
    setDetails((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleConfirm() {
    const validation = validateBookingContact(details, copy.recipientNoun);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    onConfirm(details);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-slate-900">Confirm your booking</h2>
        <p className="mt-1 text-sm text-slate-600">
          Check the details below before we send this to {service.provider}.
        </p>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-sm font-semibold text-slate-900">{service.title}</p>
          <p className="mt-1 text-sm text-slate-600">
            with {service.provider} · {service.emirate}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-900">
              <CalendarCheck className="h-4 w-4 text-brand-600" />
              {slotLabel}
            </span>
            <span className="text-slate-600">
              From {formatPrice(service.priceFrom)} / {service.unit}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <BookingContactFields
            copy={copy}
            details={details}
            errors={errors}
            onChange={update}
            prefilled={Boolean(user)}
            idPrefix="service-booking"
          />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            <CalendarCheck className="h-4 w-4" /> Confirm booking
          </Button>
        </div>

        <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          Free cancellation up to 3 hours before your slot.
        </p>
      </div>
    </div>
  );
}
