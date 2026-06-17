import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Maximize2, Star } from "lucide-react";
import type { Listing } from "@/types";
import { formatPrice } from "@/lib/utils";

/**
 * Stylised UAE map with pin markers for listings.
 * Uses approximate normalised coordinates per area (x: 0-1000, y: 0-600).
 * Real production version would swap this for Leaflet/Mapbox + real lat/lng.
 */
const AREA_COORDS: Record<string, [number, number]> = {
  "Dubai Marina": [340, 360],
  "Jumeirah Lake Towers": [360, 370],
  "Bur Dubai": [445, 320],
  "Downtown Dubai": [430, 335],
  "Business Bay": [435, 345],
  "Al Reem Island": [205, 470],
  "Al Nahda": [555, 250],
  "Deira": [460, 305],
  "Sharjah Al Nahda": [555, 250],
  "Internet City": [350, 355],
  "Media City": [355, 360],
  "DIFC": [420, 335],
};

const EMIRATE_FALLBACK: Record<string, [number, number]> = {
  Dubai: [430, 340],
  "Abu Dhabi": [180, 480],
  Sharjah: [555, 255],
  Ajman: [600, 215],
  "Ras Al Khaimah": [700, 130],
  Fujairah: [780, 290],
  "Umm Al Quwain": [645, 190],
};

function coordsFor(l: Listing): [number, number] {
  const a = AREA_COORDS[l.area];
  if (a) return a;
  const e = EMIRATE_FALLBACK[l.emirate];
  if (e) return e;
  return [430, 340];
}

interface Props {
  listings: Listing[];
}

export function MapView({ listings }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const points = useMemo(
    () =>
      listings.map((l, i) => {
        const [bx, by] = coordsFor(l);
        // jitter overlapping pins deterministically by id-hash
        const seed = l.id.charCodeAt(l.id.length - 1) + i;
        const dx = ((seed * 17) % 21) - 10;
        const dy = ((seed * 31) % 21) - 10;
        return { listing: l, x: bx + dx, y: by + dy };
      }),
    [listings]
  );

  const activeId = selected ?? hovered;
  const active = points.find((p) => p.listing.id === activeId);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-br from-sky-50 via-white to-emerald-50 shadow-sm">
      <div className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-600 shadow-sm backdrop-blur">
        <Maximize2 className="h-3 w-3" /> UAE map · {listings.length} pins
      </div>

      <svg
        viewBox="0 0 1000 600"
        className="block h-[520px] w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="0.5"
            />
          </pattern>
          <linearGradient id="landGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#fde68a" />
          </linearGradient>
          <radialGradient id="pinShadow">
            <stop offset="0%" stopColor="#0f172a" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="1000" height="600" fill="url(#grid)" />

        {/* Stylised UAE landmass (approximate outline) */}
        <path
          d="M 120 500 C 100 460 80 420 110 380 C 140 340 180 320 220 320 C 260 310 290 280 330 270 C 380 255 430 260 470 270 C 510 280 540 290 580 280 C 630 265 680 240 720 200 C 750 170 770 140 800 130 C 830 125 850 145 855 175 C 860 210 845 245 825 275 C 805 310 775 335 745 355 C 715 375 685 380 660 400 C 635 420 615 440 600 460 C 580 485 555 500 525 510 C 495 520 460 525 425 525 C 380 530 335 530 290 530 C 240 530 180 525 145 520 C 130 515 122 508 120 500 Z"
          fill="url(#landGrad)"
          stroke="#fbbf24"
          strokeWidth="2"
          opacity="0.55"
        />

        {/* Coast line / sea hint */}
        <path
          d="M 0 540 Q 250 520 500 540 T 1000 540 L 1000 600 L 0 600 Z"
          fill="#bae6fd"
          opacity="0.4"
        />

        {/* Emirate labels */}
        {Object.entries(EMIRATE_FALLBACK).map(([name, [x, y]]) => (
          <text
            key={name}
            x={x}
            y={y - 18}
            textAnchor="middle"
            className="select-none"
            fontSize="11"
            fontWeight="600"
            fill="#475569"
            opacity="0.7"
          >
            {name}
          </text>
        ))}

        {/* Pin shadows */}
        {points.map(({ listing, x, y }) => (
          <ellipse
            key={`s-${listing.id}`}
            cx={x}
            cy={y + 14}
            rx="14"
            ry="4"
            fill="url(#pinShadow)"
          />
        ))}

        {/* Pins */}
        {points.map(({ listing, x, y }) => {
          const isActive = activeId === listing.id;
          const featured = listing.featured;
          return (
            <g
              key={listing.id}
              onMouseEnter={() => setHovered(listing.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() =>
                setSelected((s) => (s === listing.id ? null : listing.id))
              }
              className="cursor-pointer"
              transform={`translate(${x},${y})`}
            >
              <circle
                r={isActive ? 22 : 16}
                fill={featured ? "#f59e0b" : "#2563eb"}
                opacity="0.15"
                className="transition-all"
              />
              <circle
                r={isActive ? 14 : 11}
                fill={featured ? "#f59e0b" : "#2563eb"}
                stroke="white"
                strokeWidth="3"
                className="transition-all"
              />
              <text
                textAnchor="middle"
                y={4}
                fontSize="9"
                fontWeight="800"
                fill="white"
              >
                {Math.round(listing.price / 1000)}K
              </text>
            </g>
          );
        })}
      </svg>

      {/* Hover/click popover */}
      {active && (
        <div
          className="pointer-events-auto absolute z-20 w-72 -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl"
          style={{
            left: `${(active.x / 1000) * 100}%`,
            top: `calc(${(active.y / 600) * 100}% - 200px)`,
          }}
        >
          <Link
            to={`/accommodation/${active.listing.id}`}
            className="block overflow-hidden rounded-xl"
          >
            <img
              src={active.listing.photos[0]}
              alt=""
              className="aspect-[16/10] w-full rounded-xl object-cover"
            />
            <div className="mt-2 line-clamp-1 text-sm font-semibold text-slate-900">
              {active.listing.title}
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="h-3 w-3" />
              {active.listing.area}, {active.listing.emirate}
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div className="text-base font-bold text-slate-900">
                {formatPrice(active.listing.price)}
                <span className="text-xs font-normal text-slate-500">/mo</span>
              </div>
              <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                {active.listing.host.rating}
              </span>
            </div>
          </Link>
        </div>
      )}

      <div className="absolute bottom-3 left-3 inline-flex items-center gap-3 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-medium text-slate-600 shadow-sm backdrop-blur">
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          Featured
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />
          Standard
        </span>
        <span className="text-slate-400">·</span>
        <span>Click a pin to preview</span>
      </div>
    </div>
  );
}
