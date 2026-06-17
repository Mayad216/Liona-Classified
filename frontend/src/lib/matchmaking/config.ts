/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 *  ╔══════════════════════════════════════════════════════════════════════╗
 *  ║                                                                      ║
 *  ║      AI ROOMMATE MATCHMAKING — PARAMETER CONFIG (front-end)          ║
 *  ║                                                                      ║
 *  ║  This is the SINGLE SOURCE OF TRUTH for matching dimensions.         ║
 *  ║  Replace / extend `DIMENSIONS` with your real parameters and         ║
 *  ║  the form, scoring engine, results page, and AI summary all          ║
 *  ║  re-adapt automatically.                                             ║
 *  ║                                                                      ║
 *  ║  Mirror this file at: backend/config/matchmaking.php                 ║
 *  ║                                                                      ║
 *  ╚══════════════════════════════════════════════════════════════════════╝
 *
 *  Each dimension has:
 *    - key         : stable id (used everywhere)
 *    - label       : shown to users
 *    - category    : groups the form + breakdown
 *    - type        : enum / multi-select / scale / boolean / range
 *    - weight      : 0..1, relative share of the score
 *    - suggestedDealbreaker : pre-selected in the deal-breaker picker
 *    - rule        : optional override of the comparison rule
 *
 *  ⚠️  WEIGHTS DON'T HAVE TO SUM TO 1 — the engine normalises them.
 */

import type { Dimension, Gender, LeaseDuration } from "./types";

export { UAE_EMIRATES, UAE_AREAS_BY_EMIRATE } from "./uaeLocations";
export type { LocationPreference } from "./uaeLocations";

export const CATEGORIES = {
  lifestyle: { label: "Lifestyle", icon: "🏡" },
  habits: { label: "Habits", icon: "🧼" },
  schedule: { label: "Schedule", icon: "🌙" },
  social: { label: "Social vibe", icon: "🎉" },
  background: { label: "Background", icon: "🌍" },
  logistics: { label: "Logistics", icon: "📋" },
} as const;

/* ─────────────────────────────────────────────────────────────────────
 * 👇  REPLACE THIS LIST WITH YOUR PARAMETERS WHEN READY.
 *      Everything below is placeholder data so the UI works today.
 * ──────────────────────────────────────────────────────────────────── */
export const GENDER_OPTIONS: Gender[] = ["Male", "Female", "Prefer not to say"];

export const DIMENSIONS: Dimension[] = [
  // ──────────────  Search-only: compared against the other person's gender  ──────────────
  {
    key: "gender_preference",
    label: "Gender preference",
    description: "Who you're comfortable sharing space with — matched against each person's actual gender.",
    category: "logistics",
    type: { kind: "enum", options: ["Male", "Female", "Any", "Family"] },
    weight: 1.0,
    suggestedDealbreaker: true,
    searchOnly: true,
    icon: "👥",
  },
  {
    key: "preferred_locations",
    label: "Preferred locations",
    description:
      "Emirates and neighborhoods you're open to — on your profile this is where you want to live; in search it's where you're looking.",
    category: "logistics",
    type: { kind: "location-select" },
    weight: 0.85,
    rule: "overlap",
    suggestedDealbreaker: true,
    icon: "📍",
  },
  {
    key: "smoking",
    label: "Smoking",
    category: "habits",
    type: {
      kind: "enum",
      options: ["No smoking", "Outdoors only", "Smoker", "Vape only"],
    },
    weight: 0.9,
    suggestedDealbreaker: true,
    icon: "🚭",
  },
  {
    key: "pets",
    label: "Pets",
    category: "lifestyle",
    type: {
      kind: "enum",
      options: ["No pets", "Cats OK", "Dogs OK", "Any pets"],
    },
    weight: 0.7,
    icon: "🐾",
  },

  // ──────────────  Lifestyle scales  ──────────────
  {
    key: "cleanliness",
    label: "Cleanliness",
    description: "How tidy do you keep shared spaces?",
    category: "habits",
    type: {
      kind: "scale",
      min: 1,
      max: 5,
      labelLow: "Relaxed",
      labelHigh: "Spotless",
    },
    weight: 0.9,
    icon: "🧽",
  },
  {
    key: "noise_tolerance",
    label: "Noise tolerance",
    category: "lifestyle",
    type: {
      kind: "scale",
      min: 1,
      max: 5,
      labelLow: "Need quiet",
      labelHigh: "Don't mind noise",
    },
    weight: 0.6,
    icon: "🔇",
  },
  {
    key: "social_level",
    label: "Social with roommate",
    description: "Do you want to hang out, or just coexist?",
    category: "social",
    type: {
      kind: "scale",
      min: 1,
      max: 5,
      labelLow: "Keep to ourselves",
      labelHigh: "Best friends",
    },
    weight: 0.5,
    icon: "🤝",
  },

  // ──────────────  Schedule  ──────────────
  {
    key: "sleep_schedule",
    label: "Sleep schedule",
    category: "schedule",
    type: {
      kind: "enum",
      options: ["Early bird (≤ 10pm)", "Standard (10pm – 1am)", "Night owl (after 1am)"],
    },
    weight: 0.7,
    icon: "🌙",
  },
  {
    key: "work_from_home",
    label: "Work-from-home days",
    category: "schedule",
    type: {
      kind: "scale",
      min: 0,
      max: 5,
      labelLow: "Never",
      labelHigh: "Every day",
    },
    weight: 0.4,
    icon: "💻",
  },

  // ──────────────  Social ──────────────
  {
    key: "relationship_status",
    label: "Relationship status",
    description: "Your current relationship status — helps avoid mismatched expectations at home.",
    category: "social",
    type: {
      kind: "enum",
      options: [
        "Single",
        "In a relationship",
        "Engaged",
        "Married",
        "Prefer not to say",
        "Any",
      ],
    },
    weight: 0.55,
    icon: "💑",
  },
  {
    key: "guests",
    label: "Guests preferability",
    description: "How often you're comfortable with roommates hosting guests.",
    category: "social",
    type: {
      kind: "enum",
      options: ["No overnight guests", "Rarely", "Sometimes", "Often", "Parties OK", "Any"],
    },
    weight: 0.5,
    suggestedDealbreaker: true,
    icon: "🚪",
  },
  {
    key: "alcohol",
    label: "Alcohol at home",
    category: "habits",
    type: { kind: "enum", options: ["Never", "Occasionally", "Often"] },
    weight: 0.4,
    icon: "🍷",
  },
  {
    key: "diet",
    label: "Diet",
    category: "habits",
    type: {
      kind: "enum",
      options: ["No restrictions", "Vegetarian", "Vegan", "Halal only", "Kosher"],
    },
    weight: 0.3,
    icon: "🥗",
  },

  // ──────────────  Background ──────────────
  {
    key: "age_range",
    label: "Preferred age range",
    category: "background",
    type: { kind: "range", min: 18, max: 65, unit: "yrs" },
    weight: 0.3,
    rule: "range",
    icon: "🎂",
  },
  {
    key: "languages",
    label: "Languages spoken",
    description: "Add every language you speak — pick from the full world list.",
    category: "background",
    type: {
      kind: "language-multi-select",
    },
    weight: 0.3,
    icon: "🗣️",
  },
  {
    key: "occupation_type",
    label: "Occupation type",
    category: "background",
    type: {
      kind: "enum",
      options: ["Student", "Working professional", "Freelancer", "Business owner", "Other"],
    },
    weight: 0.25,
    icon: "💼",
  },
  {
    key: "ethnicity",
    label: "Ethnicity",
    description: "Optional — only used for matching if you choose to share.",
    category: "background",
    optional: true,
    type: {
      kind: "enum",
      options: [
        "Arab / Middle Eastern",
        "South Asian",
        "East Asian",
        "Southeast Asian",
        "Central Asian",
        "African",
        "Caribbean",
        "European",
        "Latin American",
        "Mixed / Multicultural",
        "Other",
        "Prefer not to say",
        "Any",
      ],
    },
    weight: 0.2,
    icon: "🌐",
  },

  // ──────────────  Interests  ──────────────
  {
    key: "interests",
    label: "Shared interests",
    description: "Pick up to 5 — overlap boosts your match.",
    category: "social",
    type: {
      kind: "multi-select",
      maxSelectable: 5,
      options: [
        "Gym & fitness",
        "Yoga / meditation",
        "Cooking",
        "Reading",
        "Gaming",
        "Movies & TV",
        "Live music",
        "Travel",
        "Photography",
        "Outdoors / hiking",
        "Tech / startups",
        "Art & design",
        "Sports",
      ],
    },
    weight: 0.4,
    rule: "overlap",
    icon: "✨",
  },
];

/** Dimensions shown on the lifestyle profile (excludes search-only fields). */
export const PROFILE_DIMENSIONS = DIMENSIONS.filter((d) => !d.searchOnly);

/** Dimensions that count toward profile completion (excludes optional + search-only fields). */
export const REQUIRED_DIMENSIONS = PROFILE_DIMENSIONS.filter((d) => !d.optional);
export const REQUIRED_DIMENSION_COUNT = REQUIRED_DIMENSIONS.length;

/** Dimensions counted when measuring search-filter completeness (includes search-only fields). */
export const SEARCH_REQUIRED_DIMENSIONS = DIMENSIONS.filter((d) => !d.optional);

/* ─────────────────────────────────────────────────────────────────────
 *  Engine tuning — change here if you want a different scoring style.
 * ──────────────────────────────────────────────────────────────────── */

export const LEASE_DURATION_OPTIONS: { value: LeaseDuration; label: string }[] = [
  { value: "1 month (rolling)", label: "1 month (rolling)" },
  { value: "3 months", label: "3 months" },
  { value: "6 months", label: "6 months" },
  { value: "12 months", label: "12 months" },
  { value: "Flexible", label: "Flexible" },
];

/** Pre-selected deal-breaker keys for new profiles (from `suggestedDealbreaker`). */
export const DEFAULT_DEALBREAKER_KEYS: string[] = DIMENSIONS.filter(
  (d) => d.suggestedDealbreaker
).map((d) => d.key);

/** Compatibility below this on a deal-breaker dimension excludes the match. */
export const DEALBREAKER_THRESHOLD = 0.5;

export const ENGINE_TUNING = {
  /** Match below this percentage are hidden by default. */
  minDisplayScore: 55,
  /** Score >= this is considered a "great match" → green badge. */
  greatMatchAt: 85,
  /**
   * Deal-breaker clashes still show in results when score is at or above this
   * (with a warning), instead of being hidden.
   */
  dealbreakerOverrideMinScore: 85,
  /** Score >= this is "good" → amber badge. */
  goodMatchAt: 70,
  /**
   * Bonus applied when ≥ this many "highlight" dimensions are all > 0.8.
   * Encourages multi-dimensional alignment over a single strong overlap.
   */
  consistencyBonus: { thresholdCount: 4, perDimension: 0.005, cap: 0.05 },
} as const;
