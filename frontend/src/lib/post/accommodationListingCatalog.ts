/** Notice period options for accommodation listings (advance notice before move-out). */
export const ACCOMMODATION_NOTICE_PERIOD_OPTIONS = [
  { value: "Immediate", label: "Immediate — no notice required" },
  { value: "7 days", label: "7 days" },
  { value: "14 days", label: "14 days" },
  { value: "30 days", label: "30 days" },
  { value: "60 days", label: "60 days" },
  { value: "90 days", label: "90 days" },
  { value: "Flexible", label: "Flexible / negotiable" },
] as const;

export type AccommodationNoticePeriod =
  (typeof ACCOMMODATION_NOTICE_PERIOD_OPTIONS)[number]["value"];

/** Minimum stay options for accommodation listings (commitment length). */
export const ACCOMMODATION_MINIMUM_STAY_OPTIONS = [
  { value: "1 month", label: "1 month" },
  { value: "3 months", label: "3 months" },
  { value: "6 months", label: "6 months" },
  { value: "12 months", label: "12 months" },
  { value: "Flexible", label: "Flexible" },
] as const;

export type AccommodationMinimumStay =
  (typeof ACCOMMODATION_MINIMUM_STAY_OPTIONS)[number]["value"];
