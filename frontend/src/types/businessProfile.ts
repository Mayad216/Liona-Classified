import type { Emirate } from "@/types";

export interface BusinessProfile {
  id?: string | number;
  company_name: string;
  legal_name?: string | null;
  trade_licence_number?: string | null;
  industry: string;
  emirate: Emirate | string;
  website?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  description?: string | null;
  is_verified?: boolean;
  is_complete?: boolean;
  updated_at?: string;
}

export type BusinessProfileInput = Pick<
  BusinessProfile,
  | "company_name"
  | "legal_name"
  | "trade_licence_number"
  | "industry"
  | "emirate"
  | "website"
  | "contact_email"
  | "contact_phone"
  | "description"
>;

export function isBusinessProfileComplete(profile: BusinessProfile | null | undefined): boolean {
  if (!profile) return false;
  if (profile.is_complete === true) return true;
  return Boolean(
    profile.company_name?.trim() && profile.industry?.trim() && profile.emirate?.trim()
  );
}
