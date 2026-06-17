import { Link } from "react-router-dom";
import { CheckCircle2, Clock, MapPin, Star, Zap } from "lucide-react";
import type { Service } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import { providerAccountLabel, serviceDetailPath } from "@/lib/services/catalog";

interface Props {
  service: Service;
  compact?: boolean;
}

export function ServiceCard({ service, compact = false }: Props) {
  const detailPath = serviceDetailPath(service.id);

  return (
    <Link
      to={detailPath}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-soft"
    >
      <div className="relative aspect-[5/3] overflow-hidden bg-slate-100">
        <img
          src={service.photos[0]}
          alt={service.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between gap-2 p-3">
          <Badge tone="brand" className="bg-brand-600 text-white">
            {service.category}
          </Badge>
          <div className="flex flex-wrap justify-end gap-1">
            {service.sameDayAvailable && (
              <Badge tone="success" className="bg-emerald-500 text-white">
                <Zap className="h-3 w-3" />
                Same day
              </Badge>
            )}
            {service.verified && (
              <Badge tone="success" className="bg-white/95 text-emerald-700">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className={compact ? "flex flex-1 flex-col p-3" : "flex flex-1 flex-col p-4"}>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <img
            src={service.providerAvatar}
            alt={service.provider}
            className="h-6 w-6 rounded-full object-cover ring-1 ring-slate-200"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-700">{service.provider}</p>
            <p className="truncate text-[10px] text-slate-400">
              {service.providerHeadline ?? providerAccountLabel(service.providerAccountType)}
            </p>
          </div>
        </div>
        <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-slate-900 group-hover:text-brand-700">
          {service.title}
        </h3>

        {service.category === "Language Tutoring" && service.tutoringLanguages?.length ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {service.tutoringLanguages.slice(0, 3).map((lang) => (
              <span
                key={lang}
                className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700"
              >
                {lang}
              </span>
            ))}
            {service.sessionFormat && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                {service.sessionFormat}
              </span>
            )}
          </div>
        ) : null}

        {service.category === "Homemade Meals" ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {(service.mealCuisines ?? []).slice(0, 2).map((cuisine) => (
              <span
                key={cuisine}
                className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800"
              >
                {cuisine}
              </span>
            ))}
            {service.mealOfferingType && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                {service.mealOfferingType}
              </span>
            )}
            {service.mealFulfillment && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                {service.mealFulfillment}
              </span>
            )}
          </div>
        ) : null}

        {service.category === "Pest Control" && (service.pestTypes?.length ?? 0) > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {service.pestTypes!.slice(0, 3).map((pest) => (
              <span
                key={pest}
                className="rounded-full bg-lime-50 px-2 py-0.5 text-[10px] font-semibold text-lime-800"
              >
                {pest}
              </span>
            ))}
            {service.pestTypes!.length > 3 && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                +{service.pestTypes!.length - 3}
              </span>
            )}
          </div>
        ) : null}

        <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
          <span className="inline-flex items-center gap-1 font-semibold text-slate-900">
            <Star className="h-3.5 w-3.5 fill-accent-500 text-accent-500" />
            {service.rating.toFixed(1)}
            <span className="font-normal text-slate-500">({service.reviewCount})</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> {service.responseTime}
          </span>
        </div>

        <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-3">
          <div>
            <div className="text-[11px] text-slate-500">Book from</div>
            <div className="text-lg font-bold tracking-tight text-slate-900">
              {formatPrice(service.priceFrom)}
              <span className="text-xs font-normal text-slate-500"> / {service.unit}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {service.emirate}
            </span>
            <div className="mt-1 text-xs font-semibold text-brand-600 opacity-0 transition group-hover:opacity-100">
              View details →
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
