/** Emirates ID format: 784-YYYY-XXXXXXX-C (15 digits, starts with 784). */

export function normalizeEmiratesId(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function formatEmiratesId(digits: string): string {
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length <= 14) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 14)}-${digits.slice(14, 15)}`;
}

export function isValidEmiratesId(raw: string): boolean {
  const digits = normalizeEmiratesId(raw);
  return /^784\d{12}$/.test(digits);
}

export function emiratesIdBirthYear(raw: string): number | null {
  const digits = normalizeEmiratesId(raw);
  if (digits.length < 7) return null;
  return parseInt(digits.slice(3, 7), 10);
}

export function dobMatchesEmiratesId(dob: string, emiratesId: string): boolean {
  const year = emiratesIdBirthYear(emiratesId);
  if (!year || !dob) return false;
  const dobYear = parseInt(dob.slice(0, 4), 10);
  return dobYear === year;
}

export type EmiratesIdVerificationStatus = {
  status: "none" | "pending" | "verified" | "rejected";
  verified: boolean;
  verifiedAt?: string;
  emiratesIdLast4?: string;
  isVerified: boolean;
};

export const EMIRATES_ID_STORAGE_KEY = "khaleej:emirates_id_verified";

export function readLocalEmiratesIdStatus(): EmiratesIdVerificationStatus | null {
  try {
    const raw = localStorage.getItem(EMIRATES_ID_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as EmiratesIdVerificationStatus;
  } catch {
    return null;
  }
}

export function writeLocalEmiratesIdStatus(status: EmiratesIdVerificationStatus) {
  localStorage.setItem(EMIRATES_ID_STORAGE_KEY, JSON.stringify(status));
}
