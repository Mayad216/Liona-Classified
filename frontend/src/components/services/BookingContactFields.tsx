import { Mail, Phone, User as UserIcon, Users } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  BOOKING_RELATIONSHIP_OPTIONS,
  type BookingContactDetails,
  type BookingContactErrors,
  type BookingCopy,
  type BookingFor,
  type BookingRelationship,
} from "@/lib/services/serviceBooking";

type Props = {
  copy: BookingCopy;
  details: BookingContactDetails;
  errors: BookingContactErrors;
  onChange: <K extends keyof BookingContactDetails>(
    key: K,
    value: BookingContactDetails[K]
  ) => void;
  /** Shows the "pre-filled from your account" hint when the user is signed in. */
  prefilled?: boolean;
  idPrefix: string;
};

export function BookingContactFields({
  copy,
  details,
  errors,
  onChange,
  prefilled = false,
  idPrefix,
}: Props) {
  const audienceOptions: {
    value: BookingFor;
    label: string;
    description: string;
    icon: typeof UserIcon;
  }[] = [
    {
      value: "self",
      label: copy.selfLabel,
      description: copy.selfDescription,
      icon: UserIcon,
    },
    {
      value: "someone_else",
      label: copy.otherLabel,
      description: copy.otherDescription,
      icon: Users,
    },
  ];

  return (
    <>
      <fieldset>
        <legend className="text-sm font-semibold text-slate-900">{copy.audienceQuestion}</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {audienceOptions.map(({ value, label, description, icon: Icon }) => {
            const active = details.bookingFor === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => onChange("bookingFor", value)}
                className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${
                  active
                    ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/15"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <Icon
                  className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
                    active ? "text-brand-600" : "text-slate-400"
                  }`}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-slate-900">{label}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">{description}</span>
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-slate-900">Your details</h3>
        <p className="mt-1 text-xs text-slate-500">
          {prefilled
            ? "Pre-filled from your account — edit anything that looks wrong."
            : "We use these to send your confirmation and let the provider reach you."}
        </p>

        <div className="mt-3 space-y-3">
          <Input
            label="Full name"
            name={`${idPrefix}-booker-name`}
            placeholder="Aisha Al Marri"
            icon={<UserIcon className="h-4 w-4" />}
            value={details.bookerName}
            error={errors.bookerName}
            onChange={(e) => onChange("bookerName", e.target.value)}
          />
          <Input
            type="email"
            label="Email"
            name={`${idPrefix}-booker-email`}
            placeholder="you@khaleej.ae"
            icon={<Mail className="h-4 w-4" />}
            value={details.bookerEmail}
            error={errors.bookerEmail}
            onChange={(e) => onChange("bookerEmail", e.target.value)}
          />
          <Input
            type="tel"
            label="Phone (UAE)"
            name={`${idPrefix}-booker-phone`}
            placeholder="+971 50 123 4567"
            icon={<Phone className="h-4 w-4" />}
            value={details.bookerPhone}
            error={errors.bookerPhone}
            onChange={(e) => onChange("bookerPhone", e.target.value)}
          />
        </div>
      </div>

      {details.bookingFor === "someone_else" && (
        <div className="mt-6 rounded-xl border border-brand-200 bg-brand-50/40 p-4">
          <h3 className="text-sm font-semibold text-slate-900">{copy.recipientSectionTitle}</h3>
          <p className="mt-1 text-xs text-slate-600">{copy.recipientSectionHint}</p>

          <div className="mt-3 space-y-3">
            <Input
              label={copy.recipientNameLabel}
              name={`${idPrefix}-recipient-name`}
              placeholder={copy.recipientNamePlaceholder}
              value={details.recipientName}
              error={errors.recipientName}
              onChange={(e) => onChange("recipientName", e.target.value)}
            />
            <Select
              label="Relationship to you"
              name={`${idPrefix}-recipient-relationship`}
              value={details.recipientRelationship}
              options={BOOKING_RELATIONSHIP_OPTIONS}
              onChange={(e) =>
                onChange("recipientRelationship", e.target.value as BookingRelationship)
              }
            />
            <Input
              label={copy.recipientDetailLabel}
              name={`${idPrefix}-recipient-detail`}
              placeholder={copy.recipientDetailPlaceholder}
              value={details.recipientDetail}
              onChange={(e) => onChange("recipientDetail", e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="mt-6">
        <label
          htmlFor={`${idPrefix}-notes`}
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          {copy.notesLabel}
        </label>
        <textarea
          id={`${idPrefix}-notes`}
          rows={3}
          value={details.notes}
          onChange={(e) => onChange("notes", e.target.value)}
          placeholder={copy.notesPlaceholder}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
      </div>
    </>
  );
}
