import type { RoommateProfile } from "./types";

/** What gender of roommate someone is looking for (search filter). */
export type GenderPreference = "Male" | "Female" | "Any" | "Family";

function formatGender(value: unknown): string {
  if (value == null || value === "") return "—";
  return String(value);
}

export function resolveGenderPreference(profile: RoommateProfile): unknown {
  return (
    profile.lookingFor?.gender_preference ??
    profile.preferences?.gender_preference
  );
}

export function resolveActualGender(profile: RoommateProfile): unknown {
  return profile.gender;
}

/** True when the user wants a specific gender of roommate (not Any / Family). */
export function isSpecificGenderPreference(preference: unknown): boolean {
  return preference === "Male" || preference === "Female";
}

/** Hard filter — both search preference and reciprocal gender preference must fit. */
export function passesGenderFilter(
  seeker: RoommateProfile,
  candidate: RoommateProfile
): boolean {
  const seekerPref = resolveGenderPreference(seeker);
  const candidatePref = resolveGenderPreference(candidate);
  const seekerGender = resolveActualGender(seeker);
  const candidateGender = resolveActualGender(candidate);

  if (isSpecificGenderPreference(seekerPref)) {
    if (!candidateGender || /^prefer not to say$/i.test(String(candidateGender))) {
      return false;
    }
    if (String(candidateGender) !== String(seekerPref)) {
      return false;
    }
  }

  if (isSpecificGenderPreference(candidatePref)) {
    if (!seekerGender || /^prefer not to say$/i.test(String(seekerGender))) {
      return false;
    }
    if (String(seekerGender) !== String(candidatePref)) {
      return false;
    }
  }

  return true;
}

/** @alias passesGenderFilter */
export function passesSeekerGenderFilter(
  seeker: RoommateProfile,
  candidate: RoommateProfile
): boolean {
  return passesGenderFilter(seeker, candidate);
}

/** One direction: does `preference` accept `actualGender`? */
export function scoreGenderPreferenceVsGender(
  preference: unknown,
  actualGender: unknown
): { score: number; explanation: string; contributed: boolean } {
  if (preference == null && actualGender == null) {
    return { score: 0.5, explanation: "No data on either side", contributed: false };
  }
  if (preference == null || actualGender == null) {
    return {
      score: 0.5,
      explanation: "Gender or preference not set yet",
      contributed: false,
    };
  }

  const pref = String(preference);
  const gender = String(actualGender);

  if (/^prefer not to say$/i.test(gender)) {
    return { score: 0.5, explanation: "Gender not shared", contributed: false };
  }

  if (pref === "Any") {
    return {
      score: 1,
      explanation: `Open to any gender · Them: ${gender}`,
      contributed: true,
    };
  }

  if (pref === "Family") {
    return {
      score: 0.5,
      explanation: `Family housing preference · Them: ${gender}`,
      contributed: false,
    };
  }

  const match = pref === gender;
  return {
    score: match ? 1 : 0,
    explanation: match
      ? `Prefers ${pref} · They are ${gender}`
      : `Prefers ${pref} · They are ${gender} — mismatch`,
    contributed: true,
  };
}

/** Mutual check: seeker's preference vs candidate gender, and vice versa. */
export function scoreGenderCompatibility(
  seeker: RoommateProfile,
  candidate: RoommateProfile
): { score: number; explanation: string; contributed: boolean } {
  const seekerPref = resolveGenderPreference(seeker);
  const candidatePref = resolveGenderPreference(candidate);
  const seekerGender = resolveActualGender(seeker);
  const candidateGender = resolveActualGender(candidate);

  const seekerToCandidate = scoreGenderPreferenceVsGender(seekerPref, candidateGender);
  const candidateToSeeker = scoreGenderPreferenceVsGender(candidatePref, seekerGender);

  if (isSpecificGenderPreference(seekerPref)) {
    if (!candidateGender || /^prefer not to say$/i.test(String(candidateGender))) {
      return {
        score: 0,
        explanation: `You prefer ${seekerPref} roommates — candidate gender not available`,
        contributed: true,
      };
    }
    if (seekerToCandidate.score === 0) {
      return { score: 0, explanation: seekerToCandidate.explanation, contributed: true };
    }
  }

  if (isSpecificGenderPreference(candidatePref)) {
    if (!seekerGender || /^prefer not to say$/i.test(String(seekerGender))) {
      return {
        score: 0,
        explanation: `They prefer ${candidatePref} roommates — your gender is not set on your profile`,
        contributed: true,
      };
    }
    if (candidateToSeeker.score === 0) {
      return { score: 0, explanation: candidateToSeeker.explanation, contributed: true };
    }
  }

  if (!seekerToCandidate.contributed && !candidateToSeeker.contributed) {
    return {
      score: 0.5,
      explanation: "Gender data incomplete on one or both sides",
      contributed: false,
    };
  }

  const parts = [seekerToCandidate, candidateToSeeker].filter((p) => p.contributed);
  const score = Math.min(...parts.map((p) => p.score));
  const explanation =
    score >= 1
      ? `Mutual gender fit — you: ${formatGender(seekerGender)}, them: ${formatGender(candidateGender)}`
      : `You → them: ${seekerToCandidate.explanation} · Them → you: ${candidateToSeeker.explanation}`;

  return { score, explanation, contributed: true };
}

export function isOpenGenderPreference(value: unknown): boolean {
  return value === "Any";
}

export function genderFilterFailureReason(
  seeker: RoommateProfile,
  candidate: RoommateProfile
): string | null {
  if (passesGenderFilter(seeker, candidate)) return null;

  const seekerPref = resolveGenderPreference(seeker);
  const candidatePref = resolveGenderPreference(candidate);
  const seekerGender = resolveActualGender(seeker);
  const candidateGender = resolveActualGender(candidate);

  if (isSpecificGenderPreference(seekerPref)) {
    if (!candidateGender) {
      return `You prefer ${seekerPref} roommates — ${candidate.name} has not set their gender`;
    }
    if (String(candidateGender) !== String(seekerPref)) {
      return `You prefer ${seekerPref} roommates — ${candidate.name} is ${candidateGender}`;
    }
  }

  if (isSpecificGenderPreference(candidatePref)) {
    if (!seekerGender) {
      return `${candidate.name} prefers ${candidatePref} roommates — set your gender on your profile`;
    }
    if (String(seekerGender) !== String(candidatePref)) {
      return `${candidate.name} prefers ${candidatePref} roommates — you are ${seekerGender}`;
    }
  }

  return "Gender preference mismatch";
}

export function seekerGenderFilterFailureReason(
  seeker: RoommateProfile,
  candidate: RoommateProfile
): string | null {
  return genderFilterFailureReason(seeker, candidate);
}
