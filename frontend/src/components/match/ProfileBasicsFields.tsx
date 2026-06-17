import { Calendar, Banknote, Clock } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { LEASE_DURATION_OPTIONS } from "@/lib/matchmaking/config";
import type { LeaseDuration, RoommateProfile } from "@/lib/matchmaking/types";
import { cn } from "@/lib/utils";
import { formatMoveInDate } from "./ProfileBasicsDisplay";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export {
  MatchProfileOverview,
  ProfileBasicsList,
  ProfileBasicsPanel,
  ProfileBasicsSummary,
  formatMoveInDate,
  hasProfileBasics,
} from "./ProfileBasicsDisplay";

interface Props {
  profile: RoommateProfile;
  onChange: (patch: Partial<RoommateProfile>) => void;
  compact?: boolean;
}

export function ProfileBasicsFields({ profile, onChange, compact = false }: Props) {
  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-3",
        !compact && "rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50/50 to-white p-5 sm:p-6"
      )}
    >
      {!compact && (
        <div className="mb-5 sm:col-span-full">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            Your search basics
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Budget and move-in date help us surface listings and roommates that fit your
            timeline. Lease length is optional. Set locations under Logistics below.
          </p>
        </div>
      )}

      <Input
        type="number"
        name="monthlyBudgetAed"
        label="Monthly budget (AED)"
        hint="Maximum rent you can pay per month"
        min={500}
        max={50000}
        step={100}
        placeholder="e.g. 3500"
        value={profile.monthlyBudgetAed ?? ""}
        onChange={(e) => {
          const raw = e.target.value;
          onChange({
            monthlyBudgetAed: raw === "" ? undefined : Math.max(0, Number(raw)),
          });
        }}
        icon={<Banknote className="h-4 w-4" />}
      />

      <Input
        type="date"
        name="moveInDate"
        label="Move-in date"
        hint={
          profile.moveInDate
            ? `Target: ${formatMoveInDate(profile.moveInDate)}`
            : "When do you need to move in?"
        }
        min={todayIso()}
        value={profile.moveInDate ?? ""}
        onChange={(e) =>
          onChange({ moveInDate: e.target.value || undefined })
        }
        icon={<Calendar className="h-4 w-4" />}
      />

      <Select
        name="leaseDuration"
        label="Lease duration (optional)"
        value={profile.leaseDuration ?? ""}
        onChange={(e) => {
          const value = e.target.value;
          onChange({
            leaseDuration: value ? (value as LeaseDuration) : undefined,
          });
        }}
        options={[
          { value: "", label: "Not sure yet" },
          ...LEASE_DURATION_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
        ]}
      />

      {!compact && profile.leaseDuration && (
        <p className="flex items-center gap-1.5 text-xs text-slate-500 sm:col-span-full">
          <Clock className="h-3.5 w-3.5" />
          Preferred lease: {profile.leaseDuration}
        </p>
      )}
    </div>
  );
}
