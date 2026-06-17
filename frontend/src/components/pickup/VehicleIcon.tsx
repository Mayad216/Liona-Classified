import type { VehicleOption } from "@/lib/pickup/types";
import { cn } from "@/lib/utils";

export function VehicleIcon({
  type,
  className,
  selected,
}: {
  type: VehicleOption["icon"];
  className?: string;
  selected?: boolean;
}) {
  const stroke = selected ? "#4f46e5" : "#64748b";
  const fill = selected ? "#eef2ff" : "#f8fafc";

  const icons: Record<VehicleOption["icon"], React.ReactNode> = {
    compact: (
      <svg viewBox="0 0 64 32" className={cn("h-8 w-16", className)} aria-hidden>
        <rect x="4" y="14" width="36" height="12" rx="2" fill={fill} stroke={stroke} strokeWidth="1.5" />
        <rect x="40" y="10" width="18" height="16" rx="2" fill={fill} stroke={stroke} strokeWidth="1.5" />
        <circle cx="14" cy="26" r="4" fill="#0f172a" />
        <circle cx="50" cy="26" r="4" fill="#0f172a" />
      </svg>
    ),
    pickup: (
      <svg viewBox="0 0 72 36" className={cn("h-9 w-[4.5rem]", className)} aria-hidden>
        <path d="M6 20h38v8H6z" fill={fill} stroke={stroke} strokeWidth="1.5" />
        <path d="M44 14h20v14H44z" fill={fill} stroke={stroke} strokeWidth="1.5" />
        <circle cx="16" cy="28" r="5" fill="#0f172a" />
        <circle cx="56" cy="28" r="5" fill="#0f172a" />
      </svg>
    ),
    truck: (
      <svg viewBox="0 0 80 40" className={cn("h-10 w-20", className)} aria-hidden>
        <rect x="4" y="12" width="48" height="20" rx="2" fill={fill} stroke={stroke} strokeWidth="1.5" />
        <rect x="52" y="8" width="24" height="24" rx="2" fill={fill} stroke={stroke} strokeWidth="1.5" />
        <circle cx="18" cy="32" r="5" fill="#0f172a" />
        <circle cx="62" cy="32" r="5" fill="#0f172a" />
      </svg>
    ),
    truck_large: (
      <svg viewBox="0 0 96 44" className={cn("h-11 w-24", className)} aria-hidden>
        <rect x="4" y="10" width="58" height="26" rx="2" fill={fill} stroke={stroke} strokeWidth="1.5" />
        <rect x="62" y="6" width="30" height="30" rx="2" fill={fill} stroke={stroke} strokeWidth="1.5" />
        <circle cx="20" cy="36" r="5" fill="#0f172a" />
        <circle cx="76" cy="36" r="5" fill="#0f172a" />
        <rect x="8" y="14" width="50" height="8" rx="1" fill={selected ? "#c7d2fe" : "#e2e8f0"} />
      </svg>
    ),
  };

  return <>{icons[type]}</>;
}
