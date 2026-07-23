import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bath,
  Bed,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  FileCheck2,
  GitCompare,
  Heart,
  MapPin,
  MessageCircle,
  Phone,
  PlayCircle,
  Share2,
  ShieldCheck,
  Sparkles,
  Square,
  Star,
  Train,
  Users,
  Video,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useListing, useListings } from "@/lib/catalog/useCatalog";
import { formatPrice, relativeTime, cn } from "@/lib/utils";
import { ListingCard } from "@/components/ListingCard";
import { TrustScore } from "@/components/TrustScore";
import { useWishlist } from "@/pages/Wishlist";
import { useCompare, COMPARE_LIMIT } from "@/components/CompareDrawer";
import { AreaInsightBanner } from "@/components/area/AreaInsightBanner";

export function AccommodationDetail() {
  const { id } = useParams();
  const { listing, loading, error, live } = useListing(id);
  const { items: allListings } = useListings();
  const [photoIdx, setPhotoIdx] = useState(0);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const wishlist = useWishlist();
  const compare = useCompare();

  if (loading) {
    return (
      <div className="container py-20 text-center text-slate-600">Loading listing…</div>
    );
  }

  if (!listing) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold">Listing not found</h1>
        {live && error ? (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        ) : null}
        <Link to="/accommodation" className="mt-4 inline-block text-brand-600 underline">
          Back to listings
        </Link>
      </div>
    );
  }

  const similar = allListings.filter((l) => l.id !== listing.id).slice(0, 3);
  const liked = wishlist.has(listing.id);
  const comparing = compare.has(listing.id);
  const titleDeedVerified = listing.host.verified && listing.listedBy === "Landlord";

  return (
    <div className="bg-slate-50/40 pb-20">
      <div className="container pt-6">
        <Link
          to="/accommodation"
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to listings
        </Link>

        <div className="relative mt-6 grid gap-4 sm:grid-cols-4 sm:grid-rows-2 sm:h-[480px]">
          <button
            onClick={() => setPhotoIdx(0)}
            className="relative col-span-2 row-span-2 overflow-hidden rounded-2xl"
          >
            <img
              src={listing.photos[0]}
              alt=""
              className="h-full w-full object-cover transition-transform hover:scale-105"
            />
          </button>
          {listing.photos.slice(1, 5).map((p, i) => (
            <button
              key={i}
              onClick={() => setPhotoIdx(i + 1)}
              className="relative hidden overflow-hidden rounded-2xl sm:block"
            >
              <img
                src={p}
                alt=""
                className="h-full w-full object-cover transition-transform hover:scale-105"
              />
              {i === 3 && listing.photos.length > 5 && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-semibold text-white">
                  +{listing.photos.length - 5} more
                </span>
              )}
            </button>
          ))}

          <button
            onClick={() => setTourOpen(true)}
            className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-900 shadow-md backdrop-blur transition hover:bg-white"
          >
            <Video className="h-4 w-4 text-brand-600" />
            Virtual tour
            <span className="rounded-full bg-brand-100 px-1.5 py-0.5 text-[9px] text-brand-700">
              3D
            </span>
          </button>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {listing.featured && (
                <Badge tone="warning" className="bg-accent-500 text-white">
                  <Sparkles className="h-3 w-3" /> Featured
                </Badge>
              )}
              <Badge tone="brand">{listing.roomType}</Badge>
              <Badge>{listing.listedBy}</Badge>
              {listing.host.verified && (
                <Badge tone="success">
                  <ShieldCheck className="h-3 w-3" /> Verified host
                </Badge>
              )}
              {titleDeedVerified && (
                <Badge tone="success" className="bg-sky-100 text-sky-800">
                  <FileCheck2 className="h-3 w-3" /> Title Deed verified
                </Badge>
              )}
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {listing.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {listing.area}, {listing.emirate}
              </span>
              <span className="inline-flex items-center gap-1">
                <Train className="h-4 w-4" /> {listing.distanceToMetro} km to metro
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-4 w-4" /> Posted {relativeTime(listing.postedAt)}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-4">
              <Stat icon={Bed} label="Tenants" value={String(listing.tenants)} />
              <Stat
                icon={Bath}
                label="Bathroom"
                value={listing.attachedBathroom ? "Private" : "Shared"}
              />
              <Stat icon={Square} label="Size" value={`${listing.size} ft²`} />
              <Stat
                icon={Users}
                label="Preference"
                value={listing.genderPreference}
              />
            </div>

            <Section title="About this listing">
              <p className="text-base leading-relaxed text-slate-700">{listing.description}</p>
            </Section>

            <Section title="Amenities">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {listing.amenities.map((a) => (
                  <div
                    key={a}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    {a}
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Preferences">
              <div className="grid gap-3 sm:grid-cols-2">
                <Pref label="Gender preference" value={listing.genderPreference} />
                <Pref label="Nationality" value={listing.nationalityPreference} />
                <Pref label="Deposit" value={formatPrice(listing.deposit)} />
                <Pref label="Balcony" value={listing.balcony ? "Yes" : "No"} />
              </div>
            </Section>

            <Section title="Location">
              <div className="aspect-[16/8] overflow-hidden rounded-2xl bg-slate-100">
                <iframe
                  title="map"
                  loading="lazy"
                  className="h-full w-full border-0"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(
                    `${listing.area}, ${listing.emirate}`
                  )}&output=embed`}
                />
              </div>
            </Section>

            <AreaInsightBanner areaName={listing.area} />

            <Section title="Reviews & ratings">
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center gap-3">
                  <div className="text-4xl font-black text-slate-900">
                    {listing.host.rating.toFixed(1)}
                  </div>
                  <div>
                    <div className="flex gap-1 text-accent-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <div className="text-xs text-slate-500">Based on 42 reviews</div>
                  </div>
                </div>
                <div className="mt-6 space-y-5">
                  {[
                    {
                      n: "Daniel K.",
                      t: "Aisha is super welcoming — felt at home from day one!",
                    },
                    {
                      n: "Maria L.",
                      t: "Place is exactly as pictured, very clean and quiet.",
                    },
                  ].map((r) => (
                    <div key={r.n} className="flex gap-3 border-t border-slate-100 pt-5">
                      <Avatar name={r.n} size="md" />
                      <div>
                        <div className="text-sm font-semibold">{r.n}</div>
                        <p className="mt-1 text-sm text-slate-600">{r.t}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Section>
          </div>

          <aside className="lg:sticky lg:top-24 self-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">
                  {formatPrice(listing.price)}
                </span>
                <span className="text-sm font-medium text-slate-500">/ month</span>
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Deposit {formatPrice(listing.deposit)}
              </div>
              <Link
                to="/payments"
                className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/50 px-3 py-2 text-xs font-medium text-emerald-800 transition hover:bg-emerald-50"
              >
                <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0" />
                Secure chat & payment options — learn how we protect you
              </Link>

              {listing.matchScore && (
                <div className="mt-5 rounded-xl bg-gradient-to-br from-brand-50 to-accent-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-700">
                    <Sparkles className="h-3.5 w-3.5" />
                    AI match score
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-brand-700">
                      {listing.matchScore}%
                    </span>
                    <span className="text-xs text-slate-600">based on your profile</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full bg-gradient-to-r from-brand-500 to-accent-500"
                      style={{ width: `${listing.matchScore}%` }}
                    />
                  </div>
                </div>
              )}

              <Button size="lg" className="mt-5 w-full">
                <MessageCircle className="h-4 w-4" /> Message host
              </Button>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setScheduleOpen(true)}
                >
                  <CalendarCheck className="h-4 w-4" /> Schedule
                </Button>
                <Button variant="outline" size="md">
                  <Phone className="h-4 w-4" /> Call
                </Button>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-1 border-t border-slate-100 pt-4 text-sm">
                <button
                  onClick={() => wishlist.toggle(listing.id)}
                  className={cn(
                    "inline-flex items-center justify-center gap-1.5 rounded-lg py-2 transition",
                    liked
                      ? "text-red-500"
                      : "text-slate-600 hover:bg-red-50 hover:text-red-500"
                  )}
                >
                  <Heart className={cn("h-4 w-4", liked && "fill-current")} />
                  {liked ? "Saved" : "Save"}
                </button>
                <button
                  onClick={() => {
                    if (
                      !comparing &&
                      compare.items.length >= COMPARE_LIMIT
                    )
                      return;
                    compare.toggle(listing.id);
                  }}
                  className={cn(
                    "inline-flex items-center justify-center gap-1.5 rounded-lg py-2 transition",
                    comparing
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-600 hover:bg-brand-50 hover:text-brand-700"
                  )}
                >
                  <GitCompare className="h-4 w-4" />
                  {comparing ? "Comparing" : "Compare"}
                </button>
                <button className="inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-slate-600 hover:bg-slate-100">
                  <Share2 className="h-4 w-4" /> Share
                </button>
              </div>
              <button className="mt-2 block w-full text-center text-xs font-medium text-slate-500 underline-offset-2 hover:underline">
                Report this listing
              </button>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar src={listing.host.avatar} name={listing.host.name} size="lg" />
                  <div>
                    <div className="flex items-center gap-1.5 font-semibold">
                      {listing.host.name}
                      {listing.host.verified && (
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Star className="h-3 w-3 fill-accent-500 text-accent-500" />
                      {listing.host.rating} · Joined{" "}
                      {new Date(listing.host.joinedAt).getFullYear()}
                    </div>
                  </div>
                </div>
                <TrustScore user={listing.host} />
              </div>
              <p className="mt-4 text-sm text-slate-600">
                Typically responds within an hour. Last active{" "}
                {relativeTime(new Date(Date.now() - 30 * 60 * 1000).toISOString())}.
              </p>
            </div>
          </aside>
        </div>

        <section className="mt-20">
          <h2 className="text-2xl font-bold tracking-tight">Similar listings</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      </div>

      {/* simple lightbox-ish overlay when photoIdx > 0 */}
      {photoIdx > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6"
          onClick={() => setPhotoIdx(0)}
        >
          <img
            src={listing.photos[photoIdx]}
            alt=""
            className="max-h-full max-w-full rounded-xl object-contain"
          />
        </div>
      )}

      {scheduleOpen && (
        <ScheduleViewingModal
          onClose={() => setScheduleOpen(false)}
          hostName={listing.host.name}
        />
      )}

      {tourOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6"
          onClick={() => setTourOpen(false)}
        >
          <div
            className="relative max-h-full w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setTourOpen(false)}
              className="absolute -top-12 right-0 inline-flex items-center gap-1 text-sm text-white hover:underline"
            >
              <X className="h-4 w-4" /> Close
            </button>
            <div className="overflow-hidden rounded-2xl bg-slate-900">
              <div
                className="relative aspect-video bg-cover bg-center"
                style={{ backgroundImage: `url(${listing.photos[0]})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-white/90 text-brand-700 shadow-2xl transition hover:scale-105">
                    <PlayCircle className="h-12 w-12" />
                  </button>
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                  <div>
                    <div className="text-xs font-medium uppercase tracking-widest text-white/70">
                      3D walkthrough
                    </div>
                    <div className="text-lg font-bold">{listing.title}</div>
                  </div>
                  <Badge className="bg-white/20 text-white backdrop-blur">
                    2 min · Matterport
                  </Badge>
                </div>
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-white/60">
              Tour rendering — in production this loads a Matterport / Kuula embed.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const VIEWING_SLOTS = [
  "Today · 6:00 PM",
  "Today · 7:30 PM",
  "Tomorrow · 11:00 AM",
  "Tomorrow · 2:00 PM",
  "Tomorrow · 6:30 PM",
  "Sat · 10:00 AM",
];

function ScheduleViewingModal({
  onClose,
  hostName,
}: {
  onClose: () => void;
  hostName: string;
}) {
  const [slot, setSlot] = useState<string | null>(null);
  const [mode, setMode] = useState<"in-person" | "video">("in-person");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
        >
          <X className="h-5 w-5" />
        </button>

        {submitted ? (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-xl font-bold">Viewing request sent</h2>
            <p className="mt-2 text-sm text-slate-600">
              {hostName} typically replies within an hour. You'll get a confirmation in
              your inbox.
            </p>
            <Button size="md" className="mt-5 w-full" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              <CalendarCheck className="h-3.5 w-3.5" />
              Schedule a viewing
            </div>
            <h2 className="mt-3 text-xl font-bold">When works for you?</h2>
            <p className="mt-1 text-xs text-slate-500">
              Pick a slot — {hostName} confirms within ~1 hour.
            </p>

            <div className="mt-5">
              <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100 p-1">
                {(["in-person", "video"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={cn(
                      "rounded-lg py-2 text-xs font-semibold transition",
                      mode === m
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600"
                    )}
                  >
                    {m === "in-person" ? "In person" : "Video call"}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {VIEWING_SLOTS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSlot(s)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-xs font-medium transition",
                    slot === s
                      ? "border-brand-600 bg-brand-50 text-brand-700"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>

            <textarea
              placeholder={
                mode === "video"
                  ? "Optional message (e.g., I'd like to see the kitchen and bathroom)…"
                  : "Optional message (e.g., I'd like to view with my partner)…"
              }
              className="mt-4 h-20 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
            />

            <Button
              size="lg"
              className="mt-5 w-full"
              disabled={!slot}
              onClick={() => setSubmitted(true)}
            >
              <CalendarCheck className="h-4 w-4" />
              Request {slot ?? "a viewing"}
            </Button>
            <p className="mt-2 text-center text-[10px] text-slate-400">
              Free · cancel anytime · in-app reminders
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-10 border-t border-slate-200 pt-8">
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-0.5 text-base font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function Pref({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-medium uppercase tracking-widest text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}
