import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Star, MessageSquare } from "lucide-react";
import { AreaCategoryBadges } from "@/components/area/AreaCategoryBadges";
import { Badge } from "@/components/ui/Badge";
import type { AreaInsight } from "@/types/areaInsights";

export function AreaInsightCard({ insight }: { insight: AreaInsight }) {
  return (
    <Link
      to={`/community/areas/${insight.id}`}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={insight.type === "building" ? "brand" : "outline"}>
              {insight.type === "building" ? "Building" : "Neighborhood"}
            </Badge>
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="h-3 w-3" />
              {insight.emirate}
            </span>
          </div>
          <h3 className="mt-2 text-lg font-bold text-slate-900 group-hover:text-brand-700">
            {insight.name}
          </h3>
        </div>
        <div className="flex flex-shrink-0 flex-col items-end">
          <div className="inline-flex items-center gap-1 text-amber-600">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-lg font-bold tabular-nums">{insight.communityRating}</span>
          </div>
          <span className="text-[10px] text-slate-500">community</span>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-slate-600">{insight.summary}</p>

      <div className="mt-4">
        <AreaCategoryBadges tags={insight.tags} compact />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <MessageSquare className="h-3.5 w-3.5" />
          {insight.reviewCount} community reviews
        </span>
        <span className="inline-flex items-center gap-1 font-semibold text-brand-700">
          View guide
          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
