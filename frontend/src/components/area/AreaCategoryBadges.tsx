import { Users, Building2, Banknote, Globe2, Sparkles, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import {
  AGE_LABELS,
  CLEANLINESS_LABELS,
  CROWD_LABELS,
  MAINTENANCE_LABELS,
  PRICE_LABELS,
} from "@/lib/areaInsights/aggregate";
import type { UpkeepQuality } from "@/types/areaInsights";
import type { AreaInsightTags } from "@/types/areaInsights";

const crowdTone = {
  quiet: "success" as const,
  moderate: "outline" as const,
  crowded: "warning" as const,
};

const ageTone = {
  new: "success" as const,
  mixed: "outline" as const,
  established: "warning" as const,
};

const priceTone = {
  fair: "success" as const,
  pricey: "warning" as const,
  overpriced: "danger" as const,
};

const upkeepTone: Record<UpkeepQuality, "success" | "outline" | "warning" | "danger"> = {
  excellent: "success",
  good: "success",
  fair: "outline",
  poor: "danger",
};

export function AreaCategoryBadges({
  tags,
  compact,
}: {
  tags: AreaInsightTags;
  compact?: boolean;
}) {
  return (
    <div className={`flex flex-wrap gap-1.5 ${compact ? "" : "gap-2"}`}>
      <Badge tone={crowdTone[tags.crowd]} className="inline-flex items-center gap-1">
        <Users className="h-3 w-3" />
        {CROWD_LABELS[tags.crowd]}
      </Badge>
      <Badge tone={ageTone[tags.buildingAge]} className="inline-flex items-center gap-1">
        <Building2 className="h-3 w-3" />
        {AGE_LABELS[tags.buildingAge]}
      </Badge>
      <Badge tone={priceTone[tags.pricePerception]} className="inline-flex items-center gap-1">
        <Banknote className="h-3 w-3" />
        {PRICE_LABELS[tags.pricePerception]}
      </Badge>
      <Badge tone={upkeepTone[tags.cleanliness]} className="inline-flex items-center gap-1">
        <Sparkles className="h-3 w-3" />
        {CLEANLINESS_LABELS[tags.cleanliness]}
      </Badge>
      <Badge tone={upkeepTone[tags.maintenance]} className="inline-flex items-center gap-1">
        <Wrench className="h-3 w-3" />
        {MAINTENANCE_LABELS[tags.maintenance]}
      </Badge>
      {tags.mainNationalities.slice(0, compact ? 2 : 3).map((n) => (
        <Badge key={n.nationality} tone="brand" className="inline-flex items-center gap-1">
          <Globe2 className="h-3 w-3" />
          {n.nationality} {n.percent}%
        </Badge>
      ))}
    </div>
  );
}
