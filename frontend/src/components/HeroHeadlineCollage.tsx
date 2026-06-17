import { cn } from "@/lib/utils";

const COLLAGE_IMAGES = [
  "/images/hero-collage/01-bedroom.jpg",
  "/images/hero-collage/02-living.jpg",
  "/images/hero-collage/03-apartment.jpg",
  "/images/hero-collage/04-room.jpg",
  "/images/hero-collage/05-cozy.jpg",
  "/images/hero-collage/06-modern.jpg",
  "/images/hero-collage/07-bedroom.jpg",
  "/images/hero-collage/08-living.jpg",
] as const;

type Props = {
  className?: string;
};

/** Room photo grid — positioned beside the hero headline, not under it */
export function HeroHeadlineCollage({ className }: Props) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-slate-100 shadow-xl shadow-slate-900/10 ring-1 ring-slate-200/80",
        className
      )}
      aria-hidden
    >
      <div className="grid aspect-[16/10] grid-cols-4 grid-rows-2 gap-0.5 sm:aspect-[5/3]">
        {COLLAGE_IMAGES.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className="h-full w-full object-cover"
            loading={i < 4 ? "eager" : "lazy"}
            decoding="async"
          />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-slate-900/10 via-transparent to-white/20" />
    </div>
  );
}
