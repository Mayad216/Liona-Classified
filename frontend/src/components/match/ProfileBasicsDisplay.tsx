import { Link } from "react-router-dom";
import {
  Banknote,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  DoorOpen,
  Globe2,
  Heart,
  MapPin,
  UserRound,
  UsersRound,
} from "lucide-react";
import type { RoommateProfile } from "@/lib/matchmaking/types";
import {
  formatLocationPreferences,
  formatLocationPreference,
  normalizeLocationPreferences,
} from "@/lib/matchmaking/uaeLocations";
import { hydrateResidenceFields } from "@/lib/matchmaking/residenceHistory";
import { cn } from "@/lib/utils";

function preferenceLabel(profile: RoommateProfile, key: string): string | null {
  const value = profile.preferences[key];
  if (value == null || value === "") return null;
  if (typeof value === "string") return value;
  return null;
}

export function formatMoveInDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("en-AE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function hasProfileBasics(profile: RoommateProfile): boolean {
  return (
    (profile.monthlyBudgetAed != null && profile.monthlyBudgetAed > 0) ||
    Boolean(profile.moveInDate) ||
    Boolean(profile.leaseDuration)
  );
}

type FactRow = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  missing?: boolean;
};

function buildProfileFacts(
  profile: RoommateProfile,
  showMissingBasics = false
): FactRow[] {
  const hydrated = hydrateResidenceFields(profile);
  const languages = Array.isArray(profile.preferences.languages)
    ? (profile.preferences.languages as string[]).join(", ")
    : null;

  const locations = formatLocationPreferences(
    normalizeLocationPreferences(profile.preferences.preferred_locations)
  );
  const hasLocations = normalizeLocationPreferences(profile.preferences.preferred_locations).length > 0;

  const rows: FactRow[] = [];

  if (hasLocations) {
    rows.push({
      icon: MapPin,
      label: "Preferred locations",
      value: locations,
    });
  }

  if (hydrated.currentNeighborhood) {
    rows.push({
      icon: MapPin,
      label: "Current neighborhood",
      value: formatLocationPreference(hydrated.currentNeighborhood),
    });
  }

  if ((hydrated.previousNeighborhoods?.length ?? 0) > 0) {
    rows.push({
      icon: MapPin,
      label: "Lived in before",
      value: formatLocationPreferences(hydrated.previousNeighborhoods!),
    });
  }

  if (hydrated.currentBuilding) {
    rows.push({
      icon: Building2,
      label: "Current building",
      value: hydrated.currentBuilding,
    });
  }

  if ((hydrated.previousBuildings?.length ?? 0) > 0) {
    rows.push({
      icon: Building2,
      label: "Buildings before",
      value: hydrated.previousBuildings!.join(", "),
    });
  }

  if (profile.age != null) {
    rows.push({
      icon: Calendar,
      label: "Age",
      value: String(profile.age),
    });
  }

  if (profile.gender) {
    rows.push({
      icon: UsersRound,
      label: "Gender",
      value: profile.gender,
    });
  }

  if (profile.occupation) {
    rows.push({
      icon: Briefcase,
      label: "Occupation",
      value: profile.occupation,
    });
  }

  if (languages) {
    rows.push({
      icon: Globe2,
      label: "Languages",
      value: languages,
    });
  }

  const ethnicity = preferenceLabel(profile, "ethnicity");
  if (ethnicity && ethnicity !== "Prefer not to say") {
    rows.push({
      icon: UsersRound,
      label: "Ethnicity",
      value: ethnicity,
    });
  }

  const relationshipStatus = preferenceLabel(profile, "relationship_status");
  if (relationshipStatus) {
    rows.push({
      icon: Heart,
      label: "Relationship status",
      value: relationshipStatus,
    });
  }

  const guestsPreferability = preferenceLabel(profile, "guests");
  if (guestsPreferability) {
    rows.push({
      icon: DoorOpen,
      label: "Guests preferability",
      value: guestsPreferability,
    });
  }

  if (profile.monthlyBudgetAed != null && profile.monthlyBudgetAed > 0) {
    rows.push({
      icon: Banknote,
      label: "Monthly budget",
      value: `${profile.monthlyBudgetAed.toLocaleString()} AED`,
    });
  } else if (showMissingBasics) {
    rows.push({
      icon: Banknote,
      label: "Monthly budget",
      value: "Not set",
      missing: true,
    });
  }

  if (profile.moveInDate) {
    rows.push({
      icon: Calendar,
      label: "Move-in date",
      value: formatMoveInDate(profile.moveInDate),
    });
  } else if (showMissingBasics) {
    rows.push({
      icon: Calendar,
      label: "Move-in date",
      value: "Not set",
      missing: true,
    });
  }

  if (profile.leaseDuration) {
    rows.push({
      icon: Clock,
      label: "Lease duration",
      value: profile.leaseDuration,
    });
  }

  return rows;
}

interface OverviewProps {
  profile: RoommateProfile;
  compact?: boolean;
  /** Display profile facts in a multi-column grid (e.g. 2 on match cards). */
  factColumns?: 1 | 2;
  /** For the signed-in user's own search panel — show empty budget / move-in. */
  showMissingBasics?: boolean;
  title?: string;
  className?: string;
}

/** Unified profile block: about me, background, lifestyle prefs, and search basics. */
export function MatchProfileOverview({
  profile,
  compact = false,
  factColumns = 1,
  showMissingBasics = false,
  title = "Profile",
  className,
}: OverviewProps) {
  const facts = buildProfileFacts(profile, showMissingBasics);
  const hasContent = Boolean(profile.bio) || facts.length > 0;

  if (!hasContent) return null;

  return (
    <div className={className}>
      {title && (
        <h3
          className={cn(
            "font-semibold uppercase tracking-widest text-slate-500",
            compact ? "text-[10px]" : "text-sm"
          )}
        >
          {title}
        </h3>
      )}

      {profile.bio && (
        <div className={cn(title && "mt-3", factColumns === 2 && "col-span-2")}>
          <div className="flex items-start gap-2">
            <UserRound
              className={cn(
                "mt-0.5 flex-shrink-0 text-brand-600",
                compact ? "h-3 w-3" : "h-4 w-4"
              )}
            />
            <div className="min-w-0">
              {!compact && (
                <p className="text-sm font-medium text-slate-500">About me</p>
              )}
              <p
                className={cn(
                  "leading-snug text-slate-800",
                  compact ? "line-clamp-2 text-[11px]" : "mt-0.5 text-sm"
                )}
              >
                {profile.bio}
              </p>
            </div>
          </div>
        </div>
      )}

      {facts.length > 0 && (
        <dl
          className={cn(
            profile.bio ? (compact ? "mt-2" : "mt-4") : title ? "mt-3" : "",
            factColumns === 2
              ? "grid grid-cols-2 gap-x-2.5 gap-y-2"
              : cn("space-y-3", compact && "space-y-2")
          )}
        >
          {facts.map(({ icon: Icon, label, value, missing }) => (
            <div
              key={label}
              className={cn(
                "flex items-start gap-1.5 min-w-0",
                compact ? "text-[11px]" : "text-sm",
                factColumns === 2 && "gap-1"
              )}
            >
              <Icon
                className={cn(
                  "mt-0.5 flex-shrink-0 text-brand-600",
                  compact ? "h-3 w-3" : "h-4 w-4"
                )}
              />
              <div className="min-w-0">
                <dt className="truncate font-medium text-slate-500">{label}</dt>
                <dd
                  className={cn(
                    "truncate font-semibold",
                    missing ? "text-slate-400" : "text-slate-900"
                  )}
                >
                  {value}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

interface ListProps {
  profile: RoommateProfile;
  compact?: boolean;
  showMissing?: boolean;
  className?: string;
}

/** @deprecated Prefer MatchProfileOverview — kept for the user's search panel. */
export function ProfileBasicsList({
  profile,
  compact = false,
  showMissing = false,
  className,
}: ListProps) {
  const facts = buildProfileFacts(profile, showMissing);
  if (facts.length === 0) return null;

  return (
    <dl className={cn(compact ? "space-y-2" : "space-y-3", className)}>
      {facts
        .filter((row) =>
          ["Monthly budget", "Move-in date", "Lease duration"].includes(row.label)
        )
        .map(({ icon: Icon, label, value, missing }) => (
          <div
            key={label}
            className={cn("flex items-start gap-2.5", compact ? "text-xs" : "text-sm")}
          >
            <Icon
              className={cn(
                "mt-0.5 flex-shrink-0 text-brand-600",
                compact ? "h-3.5 w-3.5" : "h-4 w-4"
              )}
            />
            <div className="min-w-0">
              <dt className="font-medium text-slate-500">{label}</dt>
              <dd
                className={cn(
                  "font-semibold",
                  missing ? "text-slate-400" : "text-slate-900"
                )}
              >
                {value}
              </dd>
            </div>
          </div>
        ))}
    </dl>
  );
}

export function ProfileBasicsSummary({ profile }: { profile: RoommateProfile }) {
  const locationLabel = formatLocationPreferences(
    normalizeLocationPreferences(profile.preferences.preferred_locations)
  );
  const hasLocations = normalizeLocationPreferences(profile.preferences.preferred_locations).length > 0;

  if (!hasProfileBasics(profile) && !hasLocations) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {profile.monthlyBudgetAed != null && profile.monthlyBudgetAed > 0 && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
          <Banknote className="h-3.5 w-3.5 text-brand-600" />
          Up to {profile.monthlyBudgetAed.toLocaleString()} AED / mo
        </span>
      )}
      {profile.moveInDate && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
          <Calendar className="h-3.5 w-3.5 text-brand-600" />
          Move-in {formatMoveInDate(profile.moveInDate)}
        </span>
      )}
      {profile.leaseDuration && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
          <Clock className="h-3.5 w-3.5 text-brand-600" />
          {profile.leaseDuration}
        </span>
      )}
      {hasLocations && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
            <MapPin className="h-3.5 w-3.5 text-brand-600" />
            {locationLabel}
          </span>
        )}
    </div>
  );
}

interface PanelProps {
  profile: RoommateProfile;
  title?: string;
  editTo?: string;
}

export function ProfileBasicsPanel({ profile, title = "Search criteria", editTo }: PanelProps) {
  const complete =
    profile.monthlyBudgetAed != null &&
    profile.monthlyBudgetAed > 0 &&
    Boolean(profile.moveInDate);

  return (
    <div className="rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50/60 to-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-800">
            {title}
          </h2>
          {!complete && (
            <p className="mt-1 text-xs text-amber-700">
              Add budget and move-in date for better matches.
            </p>
          )}
        </div>
        {editTo && (
          <Link
            to={editTo}
            className="text-xs font-semibold text-brand-700 hover:text-brand-800"
          >
            Edit
          </Link>
        )}
      </div>
      <div className="mt-4">
        <ProfileBasicsList profile={profile} showMissing />
      </div>
    </div>
  );
}
