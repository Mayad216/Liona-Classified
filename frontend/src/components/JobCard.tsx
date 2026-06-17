import { Link } from "react-router-dom";
import { Briefcase, MapPin, Sparkles, Wifi } from "lucide-react";
import type { Job } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { StarRatingDisplay } from "@/components/services/StarRatingDisplay";
import { getCompanyReviewSnapshot } from "@/lib/companyReviews/useCompanyReviews";
import { formatPrice, relativeTime } from "@/lib/utils";

interface Props {
  job: Job;
}

export function JobCard({ job }: Props) {
  const companyStats = getCompanyReviewSnapshot(job.employerId);

  return (
    <Link
      to={`/jobs/${job.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-soft"
    >
      {job.featured && (
        <span className="absolute right-4 top-4">
          <Badge tone="warning" className="bg-accent-500 text-white">
            <Sparkles className="h-3 w-3" />
            Featured
          </Badge>
        </span>
      )}

      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-white">
          <img
            src={job.companyLogo}
            alt={job.company}
            className="h-full w-full object-contain p-1"
            onError={(e) => {
              const el = e.target as HTMLImageElement;
              el.style.display = "none";
              el.parentElement!.innerHTML = `<div class='flex h-full w-full items-center justify-center bg-brand-50 text-brand-600 font-bold'>${job.company.charAt(0)}</div>`;
            }}
          />
        </div>
        <div>
          <div className="text-xs font-medium text-slate-500">{job.company}</div>
          {companyStats.reviewCount > 0 && (
            <div className="mt-0.5 flex items-center gap-1">
              <StarRatingDisplay rating={companyStats.averageRating} size="sm" />
              <span className="text-[10px] font-semibold text-slate-600">
                {companyStats.averageRating.toFixed(1)}
              </span>
              <span className="text-[10px] text-slate-400">
                ({companyStats.reviewCount})
              </span>
            </div>
          )}
          <div className="text-[11px] text-slate-400">{job.industry}</div>
        </div>
      </div>

      <h3 className="mt-4 line-clamp-2 text-base font-semibold leading-snug text-slate-900 group-hover:text-brand-700">
        {job.title}
      </h3>

      <div className="mt-3 flex flex-wrap gap-2">
        <Badge tone="brand">
          <Briefcase className="h-3 w-3" /> {job.employmentType}
        </Badge>
        <Badge>{job.experience}</Badge>
        {job.remote && (
          <Badge tone="success">
            <Wifi className="h-3 w-3" /> Remote
          </Badge>
        )}
      </div>

      <p className="mt-3 line-clamp-2 text-xs text-slate-600">{job.description}</p>

      <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
        <div className="flex flex-col gap-1">
          {job.salaryMax > 0 ? (
            <span className="text-sm font-bold text-slate-900">
              {formatPrice(job.salaryMin)} – {formatPrice(job.salaryMax)}
            </span>
          ) : (
            <span className="text-sm font-semibold text-slate-700">Per-project</span>
          )}
          <span className="flex items-center gap-1 text-slate-500">
            <MapPin className="h-3 w-3" />
            {job.area}, {job.emirate}
          </span>
        </div>
        <span className="text-slate-400">{relativeTime(job.postedAt)}</span>
      </div>
    </Link>
  );
}
