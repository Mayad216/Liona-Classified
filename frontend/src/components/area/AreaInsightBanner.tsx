import { Link } from "react-router-dom";
import { MapPin, Star, ArrowRight } from "lucide-react";
import { AreaCategoryBadges } from "@/components/area/AreaCategoryBadges";
import { getAreaInsightByName } from "@/data/areaInsights";

export function AreaInsightBanner({ areaName }: { areaName: string }) {
  const insight = getAreaInsightByName(areaName);
  if (!insight) return null;

  return (
    <div className="rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50/80 to-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-700">
            <MapPin className="h-3.5 w-3.5" />
            Community area guide
          </p>
          <h3 className="mt-1 font-bold text-slate-900">{insight.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-600">{insight.summary}</p>
        </div>
        <div className="flex items-center gap-1.5 text-amber-600">
          <Star className="h-4 w-4 fill-current" />
          <span className="text-xl font-bold">{insight.communityRating}</span>
          <span className="text-xs text-slate-500">({insight.reviewCount} reviews)</span>
        </div>
      </div>
      <div className="mt-3">
        <AreaCategoryBadges tags={insight.tags} compact />
      </div>
      <Link
        to={`/community/areas/${insight.id}`}
        className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline"
      >
        Full neighbourhood breakdown
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
