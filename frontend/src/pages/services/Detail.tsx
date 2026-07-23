import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useService, useServices } from "@/lib/catalog/useCatalog";
import type { Service } from "@/types";
import {
  SERVICE_BOOKING_SLOTS,
  SERVICE_HIGHLIGHTS,
  SERVICE_TRUST_PILLARS,
  providerAccountLabel,
} from "@/lib/services/catalog";
import { formatPrice } from "@/lib/utils";
import { ServiceCard } from "@/components/ServiceCard";
import { ServiceReviewsSection } from "@/components/services/ServiceReviewsSection";
import { StarRatingDisplay } from "@/components/services/StarRatingDisplay";
import { useServiceReviews } from "@/lib/serviceReviews/useServiceReviews";

export function ServiceDetail() {
  const { id } = useParams();
  const location = useLocation();
  const serviceId = id ? decodeURIComponent(id) : undefined;
  const { service, loading, error, live } = useService(serviceId);

  if (loading) {
    return <div className="container py-20 text-center text-slate-600">Loading service…</div>;
  }

  if (!service) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold">Service not found</h1>
        {live && error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        <Link to="/services" className="mt-4 inline-block text-brand-600 underline">
          Back to services
        </Link>
      </div>
    );
  }

  return <ServiceDetailContent service={service} fromPath={location.pathname} />;
}

function serviceListBack(pathname: string, service: Service) {
  if (pathname.startsWith("/tutoring")) {
    return { to: "/tutoring", label: "Back to tutors" };
  }
  if (pathname.startsWith("/meals")) {
    return { to: "/meals", label: "Back to meals" };
  }
  if (pathname.startsWith("/movers")) {
    return { to: "/movers", label: "Back to movers" };
  }
  if (service.category === "Language Tutoring") {
    return { to: "/tutoring", label: "Back to tutors" };
  }
  if (service.category === "Homemade Meals") {
    return { to: "/meals", label: "Back to meals" };
  }
  if (service.category === "Movers") {
    return { to: "/movers", label: "Back to movers" };
  }
  return { to: "/services", label: "Back to services" };
}

function ServiceDetailContent({
  service,
  fromPath,
}: {
  service: Service;
  fromPath: string;
}) {
  const { items: allServices } = useServices();
  const [slotId, setSlotId] = useState<string>(SERVICE_BOOKING_SLOTS[0].id);
  const [booked, setBooked] = useState(false);
  const { stats: reviewStats } = useServiceReviews(
    service.id,
    service.category,
    service.rating,
    service.reviewCount
  );

  const isTutor = service.category === "Language Tutoring";
  const isMeal = service.category === "Homemade Meals";
  const isPest = service.category === "Pest Control";
  const { to: backTo, label: backLabel } = serviceListBack(fromPath, service);
  const similar = allServices
    .filter((s) => s.id !== service.id && s.category === service.category)
    .slice(0, 3);
  const fallbackSimilar = allServices.filter((s) => s.id !== service.id).slice(0, 3);
  const related = similar.length >= 2 ? similar : fallbackSimilar;

  const selectedSlot =
    SERVICE_BOOKING_SLOTS.find((s) => s.id === slotId) ?? SERVICE_BOOKING_SLOTS[0];
  const sameDaySlots = SERVICE_BOOKING_SLOTS.filter((s) => s.sameDay);

  return (
    <div className="bg-slate-50/40 pb-20">
      <div className="container pt-6">
        <Link
          to={backTo}
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> {backLabel}
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div>
            <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100">
              <img
                src={service.photos[0]}
                alt={service.title}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Badge tone="brand">{service.category}</Badge>
              {service.verified && (
                <Badge tone="success">
                  <ShieldCheck className="h-3 w-3" /> Verified account
                </Badge>
              )}
              <Badge tone={service.providerAccountType === "business" ? "brand" : undefined}>
                {providerAccountLabel(service.providerAccountType)}
              </Badge>
              {service.sameDayAvailable && (
                <Badge tone="success" className="bg-emerald-500 text-white">
                  <Zap className="h-3 w-3" /> Same-day available
                </Badge>
              )}
              <Badge>
                <Clock className="h-3 w-3" /> Responds {service.responseTime}
              </Badge>
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              {service.title}
            </h1>

            <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <img
                src={service.providerAvatar}
                alt={service.provider}
                className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-100"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
                  Posted by
                </p>
                <p className="font-semibold text-slate-900">{service.provider}</p>
                <p className="text-sm text-slate-600">
                  {service.providerHeadline ?? providerAccountLabel(service.providerAccountType)}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {service.emirate}
              </span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-slate-900">
                <StarRatingDisplay rating={reviewStats.averageRating} size="sm" />
                {reviewStats.averageRating.toFixed(1)}
                <span className="font-normal text-slate-500">
                  ({reviewStats.reviewCount.toLocaleString()} reviews)
                </span>
              </span>
              <span className="text-slate-500">
                {service.completedJobs.toLocaleString()} jobs completed
              </span>
              {service.durationMinutes && service.durationMinutes < 480 && (
                <span className="text-slate-500">~{service.durationMinutes} min</span>
              )}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {SERVICE_TRUST_PILLARS.slice(0, 2).map(({ icon: Icon, title, sub }) => (
                <div
                  key={title}
                  className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4"
                >
                  <Icon className="h-5 w-5 flex-shrink-0 text-brand-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{title}</p>
                    <p className="text-xs text-slate-500">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <Section title="About this service">
              <p className="text-base leading-relaxed text-slate-700">{service.description}</p>
            </Section>

            {isTutor && (
              <Section title="Tutoring details">
                <div className="flex flex-wrap gap-2">
                  {(service.tutoringLanguages ?? []).map((lang) => (
                    <span
                      key={lang}
                      className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
                {(service.teachesLevels?.length ?? 0) > 0 && (
                  <p className="mt-3 text-sm text-slate-600">
                    <span className="font-medium text-slate-900">Levels:</span>{" "}
                    {service.teachesLevels?.join(", ")}
                  </p>
                )}
                {service.sessionFormat && (
                  <p className="mt-2 text-sm text-slate-600">
                    <span className="font-medium text-slate-900">Format:</span>{" "}
                    {service.sessionFormat === "Both" ? "Online & in-person" : service.sessionFormat}
                  </p>
                )}
              </Section>
            )}

            {isMeal && (
              <Section title="Meal details">
                <div className="flex flex-wrap gap-2">
                  {(service.mealCuisines ?? []).map((cuisine) => (
                    <span
                      key={cuisine}
                      className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800"
                    >
                      {cuisine}
                    </span>
                  ))}
                </div>
                {(service.dietaryTags?.length ?? 0) > 0 && (
                  <p className="mt-3 text-sm text-slate-600">
                    <span className="font-medium text-slate-900">Dietary:</span>{" "}
                    {service.dietaryTags?.join(", ")}
                  </p>
                )}
                {service.mealOfferingType && (
                  <p className="mt-2 text-sm text-slate-600">
                    <span className="font-medium text-slate-900">Offering:</span>{" "}
                    {service.mealOfferingType}
                  </p>
                )}
                {service.mealFulfillment && (
                  <p className="mt-2 text-sm text-slate-600">
                    <span className="font-medium text-slate-900">Pickup / delivery:</span>{" "}
                    {service.mealFulfillment}
                  </p>
                )}
              </Section>
            )}

            {isPest && (
              <Section title="Pest control details">
                <div className="flex flex-wrap gap-2">
                  {(service.pestTypes ?? []).map((pest) => (
                    <span
                      key={pest}
                      className="rounded-full bg-lime-50 px-3 py-1 text-xs font-semibold text-lime-800"
                    >
                      {pest}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  Municipality-approved products where required. Follow-up visits included on
                  selected packages.
                </p>
              </Section>
            )}

            {!isTutor && !isMeal && (
              <Section title="What's included">
                <div className="grid gap-2 sm:grid-cols-2">
                  {SERVICE_HIGHLIGHTS.map((b) => (
                    <div
                      key={b}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      {b}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            <Section title="Reviews">
              <ServiceReviewsSection service={service} />
            </Section>
          </div>

          <aside className="self-start lg:sticky lg:top-24">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
              <div className="flex items-baseline justify-between gap-2">
                <div>
                  <div className="text-xs font-medium uppercase tracking-widest text-slate-500">
                    Book from
                  </div>
                  <div className="mt-1 text-3xl font-black text-slate-900">
                    {formatPrice(service.priceFrom)}
                    <span className="text-sm font-medium text-slate-500"> / {service.unit}</span>
                  </div>
                </div>
                {service.sameDayAvailable && (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                    Same day
                  </span>
                )}
              </div>

              {service.sameDayAvailable && sameDaySlots.length > 0 && (
                <div className="mt-5">
                  <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Fastest slots
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {sameDaySlots.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSlotId(s.id)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                          slotId === s.id
                            ? "border-brand-600 bg-brand-600 text-white"
                            : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-300"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-5">
                <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  All available times
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {SERVICE_BOOKING_SLOTS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSlotId(s.id)}
                      className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                        slotId === s.id
                          ? "border-brand-600 bg-brand-600 text-white"
                          : "border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                size="lg"
                className="mt-5 w-full"
                onClick={() => setBooked(true)}
                disabled={booked}
              >
                {booked ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Booked — check your email
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4" /> Book {selectedSlot.label}
                  </>
                )}
              </Button>
              <p className="mt-2 text-center text-[11px] text-slate-500">
                Free cancellation up to 3 hours before your slot
              </p>
              <Button variant="outline" size="md" className="mt-3 w-full">
                <MessageCircle className="h-4 w-4" /> Message {service.provider}
              </Button>
              <Button variant="ghost" size="md" className="mt-1 w-full">
                <Phone className="h-4 w-4" /> Call
              </Button>
            </div>
          </aside>
        </div>

        <section className="mt-20">
          <h2 className="text-2xl font-bold tracking-tight">Similar in {service.category}</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8 border-t border-slate-200 pt-8">
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}
