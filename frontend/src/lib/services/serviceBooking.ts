import type { AuthUser } from "@/lib/auth";
import type { ServiceCategory } from "@/types";

/** Whether the person booking is also the person receiving the service. */
export type BookingFor = "self" | "someone_else";

export type BookingRelationship =
  | "child"
  | "spouse"
  | "parent"
  | "sibling"
  | "friend"
  | "colleague"
  | "other";

export interface BookingContactDetails {
  bookingFor: BookingFor;
  bookerName: string;
  bookerEmail: string;
  bookerPhone: string;
  recipientName: string;
  recipientRelationship: BookingRelationship;
  recipientDetail: string;
  notes: string;
}

export type BookingContactErrors = Partial<Record<keyof BookingContactDetails, string>>;

export const BOOKING_RELATIONSHIP_OPTIONS: {
  value: BookingRelationship;
  label: string;
}[] = [
  { value: "child", label: "My child" },
  { value: "spouse", label: "My spouse / partner" },
  { value: "parent", label: "My parent" },
  { value: "sibling", label: "My sibling" },
  { value: "friend", label: "A friend" },
  { value: "colleague", label: "A colleague" },
  { value: "other", label: "Someone else" },
];

export function emptyBookingContact(
  user: AuthUser | null,
  phone = ""
): BookingContactDetails {
  return {
    bookingFor: "self",
    bookerName: user?.name ?? "",
    bookerEmail: user?.email ?? "",
    bookerPhone: phone,
    recipientName: "",
    recipientRelationship: "child",
    recipientDetail: "",
    notes: "",
  };
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function hasUsablePhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 15;
}

export function validateBookingContact(
  details: BookingContactDetails,
  recipientNoun = "person attending"
): BookingContactErrors {
  const errors: BookingContactErrors = {};

  if (details.bookerName.trim().length < 2) {
    errors.bookerName = "Enter the full name of the person making this booking.";
  }

  if (!EMAIL_PATTERN.test(details.bookerEmail.trim())) {
    errors.bookerEmail = "Enter a valid email — the confirmation is sent here.";
  }

  if (!hasUsablePhone(details.bookerPhone)) {
    errors.bookerPhone = "Enter a contact number, e.g. +971 50 123 4567.";
  }

  if (details.bookingFor === "someone_else" && details.recipientName.trim().length < 2) {
    errors.recipientName = `Enter the name of the ${recipientNoun}.`;
  }

  return errors;
}

export function isBookingContactValid(
  details: BookingContactDetails,
  recipientNoun?: string
): boolean {
  return Object.keys(validateBookingContact(details, recipientNoun)).length === 0;
}

export function relationshipLabel(relationship: BookingRelationship): string {
  return (
    BOOKING_RELATIONSHIP_OPTIONS.find((o) => o.value === relationship)?.label ?? "Someone else"
  );
}

/** One-line recap shown once the booking is confirmed. */
export function bookingSummary(details: BookingContactDetails): string {
  if (details.bookingFor === "self") {
    return `Booked for ${details.bookerName.trim()}`;
  }

  const label = relationshipLabel(details.recipientRelationship).toLowerCase();
  return `Booked for ${details.recipientName.trim()} (${label}) by ${details.bookerName.trim()}`;
}

/** Category-specific wording so the same form reads naturally everywhere. */
export interface BookingCopy {
  audienceQuestion: string;
  selfLabel: string;
  selfDescription: string;
  otherLabel: string;
  otherDescription: string;
  recipientSectionTitle: string;
  recipientSectionHint: string;
  recipientNameLabel: string;
  recipientNamePlaceholder: string;
  recipientDetailLabel: string;
  recipientDetailPlaceholder: string;
  recipientNoun: string;
  notesLabel: string;
  notesPlaceholder: string;
}

const TUTORING_COPY: BookingCopy = {
  audienceQuestion: "Who is this session for?",
  selfLabel: "Myself",
  selfDescription: "I am the student attending this session.",
  otherLabel: "Someone else",
  otherDescription: "I'm booking on behalf of another student.",
  recipientSectionTitle: "Student details",
  recipientSectionHint: "The tutor prepares for this student and contacts you as the organiser.",
  recipientNameLabel: "Student's full name",
  recipientNamePlaceholder: "Layla Al Marri",
  recipientDetailLabel: "Level or age (optional)",
  recipientDetailPlaceholder: "e.g. Grade 6, or Beginner",
  recipientNoun: "student attending",
  notesLabel: "Anything the tutor should know? (optional)",
  notesPlaceholder: "Goals for the session, preferred focus areas, exam dates…",
};

const MEALS_COPY: BookingCopy = {
  audienceQuestion: "Who is this order for?",
  selfLabel: "Myself",
  selfDescription: "I'm the one eating — deliver or hand over to me.",
  otherLabel: "Someone else",
  otherDescription: "This is a gift or an order on someone's behalf.",
  recipientSectionTitle: "Recipient details",
  recipientSectionHint: "The cook prepares for this recipient and contacts you as the orderer.",
  recipientNameLabel: "Recipient's full name",
  recipientNamePlaceholder: "Layla Al Marri",
  recipientDetailLabel: "Allergies or dietary needs (optional)",
  recipientDetailPlaceholder: "e.g. No nuts, halal only",
  recipientNoun: "person receiving the order",
  notesLabel: "Anything the cook should know? (optional)",
  notesPlaceholder: "Spice level, portion size, delivery window…",
};

const MOVERS_COPY: BookingCopy = {
  audienceQuestion: "Who is this move for?",
  selfLabel: "Myself",
  selfDescription: "I'm the one moving and I'll be on site.",
  otherLabel: "Someone else",
  otherDescription: "I'm arranging this move for another person.",
  recipientSectionTitle: "On-site contact details",
  recipientSectionHint: "The crew coordinates with this person on the day, and bills you.",
  recipientNameLabel: "On-site contact name",
  recipientNamePlaceholder: "Layla Al Marri",
  recipientDetailLabel: "Their phone number (optional)",
  recipientDetailPlaceholder: "+971 50 123 4567",
  recipientNoun: "person on site",
  notesLabel: "Anything the movers should know? (optional)",
  notesPlaceholder: "Building access, lift booking, fragile items…",
};

const HOME_SERVICE_COPY: BookingCopy = {
  audienceQuestion: "Who is this booking for?",
  selfLabel: "Myself",
  selfDescription: "The job is at my address and I'll be there.",
  otherLabel: "Someone else",
  otherDescription: "I'm booking for another person or property.",
  recipientSectionTitle: "On-site contact details",
  recipientSectionHint:
    "The provider coordinates access with this person, and contacts you as the organiser.",
  recipientNameLabel: "On-site contact name",
  recipientNamePlaceholder: "Layla Al Marri",
  recipientDetailLabel: "Their phone number (optional)",
  recipientDetailPlaceholder: "+971 50 123 4567",
  recipientNoun: "person on site",
  notesLabel: "Anything the provider should know? (optional)",
  notesPlaceholder: "Access instructions, parking, pets at home…",
};

export function bookingCopyForCategory(category: ServiceCategory): BookingCopy {
  if (category === "Language Tutoring") return TUTORING_COPY;
  if (category === "Homemade Meals") return MEALS_COPY;
  if (category === "Movers") return MOVERS_COPY;
  return HOME_SERVICE_COPY;
}

export const PICKUP_BOOKING_COPY: BookingCopy = MOVERS_COPY;
