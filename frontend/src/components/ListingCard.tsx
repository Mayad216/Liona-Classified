import { Link } from "react-router-dom";
import {
  Heart,
  MapPin,
  Sparkles,
  ShieldCheck,
  Bed,
  Bath,
  Square,
  GitCompare,
} from "lucide-react";
import type { Listing } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, relativeTime, cn } from "@/lib/utils";
import { useWishlist } from "@/pages/Wishlist";
import { useCompare, COMPARE_LIMIT } from "@/components/CompareDrawer";

interface Props {
  listing: Listing;
}

export function ListingCard({ listing }: Props) {
  const wishlist = useWishlist();
  const compare = useCompare();
  const liked = wishlist.has(listing.id);
  const comparing = compare.has(listing.id);
  const compareDisabled = !comparing && compare.items.length >= COMPARE_LIMIT;

  return (
    <Link
      to={`/accommodation/${listing.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-soft"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={listing.photos[0]}
          alt={listing.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <div className="flex flex-wrap gap-1.5">
            {listing.featured && (
              <Badge tone="warning" className="bg-accent-500 text-white">
                <Sparkles className="h-3 w-3" />
                Featured
              </Badge>
            )}
            {listing.matchScore && listing.matchScore >= 85 && (
              <Badge tone="brand" className="bg-brand-600 text-white">
                {listing.matchScore}% match
              </Badge>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                wishlist.toggle(listing.id);
              }}
              aria-label={liked ? "Remove from wishlist" : "Save listing"}
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-sm transition",
                liked ? "text-red-500" : "text-slate-700 hover:text-red-500"
              )}
            >
              <Heart className={cn("h-4 w-4", liked && "fill-current")} />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (compareDisabled) return;
                compare.toggle(listing.id);
              }}
              disabled={compareDisabled}
              aria-label={comparing ? "Remove from compare" : "Add to compare"}
              title={
                compareDisabled
                  ? `Compare full (max ${COMPARE_LIMIT})`
                  : "Add to compare"
              }
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-full shadow-sm transition",
                comparing
                  ? "bg-brand-600 text-white"
                  : "bg-white/95 text-slate-700 hover:text-brand-700",
                compareDisabled && "cursor-not-allowed opacity-50"
              )}
            >
              <GitCompare className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3">
          <Badge className="bg-white/95 text-slate-900 shadow-sm">{listing.roomType}</Badge>
          {listing.host.verified && (
            <Badge tone="success" className="bg-emerald-500 text-white">
              <ShieldCheck className="h-3 w-3" />
              Verified
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 group-hover:text-brand-700">
            {listing.title}
          </h3>
        </div>
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
          <MapPin className="h-3 w-3" />
          {listing.area}, {listing.emirate}
        </p>

        <div className="mt-3 flex items-center gap-3 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1">
            <Bed className="h-3.5 w-3.5" /> {listing.tenants}
          </span>
          {listing.attachedBathroom && (
            <span className="inline-flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" /> Private
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Square className="h-3.5 w-3.5" /> {listing.size} ft²
          </span>
        </div>

        <div className="mt-4 flex items-end justify-between pt-3 border-t border-slate-100">
          <div>
            <div className="text-lg font-bold tracking-tight text-slate-900">
              {formatPrice(listing.price)}
            </div>
            <div className="text-[11px] text-slate-500">per month</div>
          </div>
          <span className="text-[11px] text-slate-400">{relativeTime(listing.postedAt)}</span>
        </div>
      </div>
    </Link>
  );
}
