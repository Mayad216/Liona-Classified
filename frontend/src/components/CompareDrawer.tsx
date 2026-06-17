import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bath,
  Bed,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Square,
  Train,
  X,
} from "lucide-react";
import { useLocalList } from "@/lib/useLocalList";
import { mockListings } from "@/data/mock";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { useState } from "react";

export const COMPARE_KEY = "khaleej:compare";
export const COMPARE_LIMIT = 3;

export function useCompare() {
  return useLocalList<string>(COMPARE_KEY);
}

export function CompareBar() {
  const compare = useCompare();
  const [open, setOpen] = useState(false);

  if (compare.items.length === 0) return null;

  const listings = compare.items
    .map((id) => mockListings.find((l) => l.id === id))
    .filter(Boolean);

  return (
    <>
      <div className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2">
        <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-2xl shadow-slate-900/10">
          <div className="text-xs font-semibold text-slate-700">
            {compare.items.length} selected
          </div>
          <div className="hidden gap-1 sm:flex">
            {listings.slice(0, COMPARE_LIMIT).map((l) => (
              <button
                key={l!.id}
                onClick={() => compare.remove(l!.id)}
                className="group relative h-9 w-9 overflow-hidden rounded-lg"
                title="Remove"
              >
                <img src={l!.photos[0]} alt="" className="h-full w-full object-cover" />
                <span className="absolute inset-0 hidden items-center justify-center bg-black/50 text-white group-hover:flex">
                  <X className="h-4 w-4" />
                </span>
              </button>
            ))}
          </div>
          <Button
            size="sm"
            onClick={() => setOpen(true)}
            disabled={compare.items.length < 2}
          >
            Compare <ArrowRight className="h-4 w-4" />
          </Button>
          <button
            onClick={() => compare.clear()}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700"
            title="Clear"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute inset-x-2 top-10 mx-auto max-w-6xl rounded-3xl bg-white p-6 shadow-2xl sm:inset-x-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold sm:text-2xl">
                Side-by-side comparison
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-separate border-spacing-0 text-sm">
                <thead>
                  <tr>
                    <th className="w-32" />
                    {listings.map((l) => (
                      <th
                        key={l!.id}
                        className="px-2 pb-3 text-left align-top"
                      >
                        <div className="relative overflow-hidden rounded-xl">
                          <img
                            src={l!.photos[0]}
                            alt=""
                            className="aspect-[16/10] w-full object-cover"
                          />
                          <button
                            onClick={() => compare.remove(l!.id)}
                            className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="mt-2 line-clamp-2 font-semibold text-slate-900">
                          {l!.title}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="[&>tr>td]:border-t [&>tr>td]:border-slate-100 [&>tr>td]:px-2 [&>tr>td]:py-3 [&>tr>th]:px-2 [&>tr>th]:py-3 [&>tr>th]:text-left [&>tr>th]:font-medium [&>tr>th]:text-slate-500 [&>tr>th]:text-xs [&>tr>th]:uppercase [&>tr>th]:tracking-widest [&>tr>th]:border-t [&>tr>th]:border-slate-100">
                  <tr>
                    <th>Price / mo</th>
                    {listings.map((l) => (
                      <td key={l!.id} className="text-lg font-bold text-slate-900">
                        {formatPrice(l!.price)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th>Deposit</th>
                    {listings.map((l) => (
                      <td key={l!.id}>{formatPrice(l!.deposit)}</td>
                    ))}
                  </tr>
                  <tr>
                    <th>Location</th>
                    {listings.map((l) => (
                      <td key={l!.id}>
                        <div className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {l!.area}, {l!.emirate}
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th>Room type</th>
                    {listings.map((l) => (
                      <td key={l!.id}>{l!.roomType}</td>
                    ))}
                  </tr>
                  <tr>
                    <th>Size</th>
                    {listings.map((l) => (
                      <td key={l!.id}>
                        <span className="inline-flex items-center gap-1.5">
                          <Square className="h-3.5 w-3.5 text-slate-400" />
                          {l!.size} ft²
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th>Tenants</th>
                    {listings.map((l) => (
                      <td key={l!.id}>
                        <span className="inline-flex items-center gap-1.5">
                          <Bed className="h-3.5 w-3.5 text-slate-400" />
                          {l!.tenants}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th>Bathroom</th>
                    {listings.map((l) => (
                      <td key={l!.id}>
                        <span className="inline-flex items-center gap-1.5">
                          <Bath className="h-3.5 w-3.5 text-slate-400" />
                          {l!.attachedBathroom ? "Private" : "Shared"}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th>Metro</th>
                    {listings.map((l) => (
                      <td key={l!.id}>
                        <span className="inline-flex items-center gap-1.5">
                          <Train className="h-3.5 w-3.5 text-slate-400" />
                          {l!.distanceToMetro} km
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th>Gender</th>
                    {listings.map((l) => (
                      <td key={l!.id}>{l!.genderPreference}</td>
                    ))}
                  </tr>
                  <tr>
                    <th>Listed by</th>
                    {listings.map((l) => (
                      <td key={l!.id}>{l!.listedBy}</td>
                    ))}
                  </tr>
                  <tr>
                    <th>Verified host</th>
                    {listings.map((l) => (
                      <td key={l!.id}>
                        {l!.host.verified ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600">
                            <ShieldCheck className="h-4 w-4" /> Yes
                          </span>
                        ) : (
                          "No"
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th>AI match</th>
                    {listings.map((l) => (
                      <td key={l!.id}>
                        <span className="font-bold text-brand-700">
                          {l!.matchScore ?? "—"}
                          {l!.matchScore ? "%" : ""}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th>Top amenities</th>
                    {listings.map((l) => (
                      <td key={l!.id}>
                        <ul className="space-y-1">
                          {l!.amenities.slice(0, 4).map((a) => (
                            <li key={a} className="inline-flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                              <span className="text-xs">{a}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th />
                    {listings.map((l) => (
                      <td key={l!.id}>
                        <Link to={`/accommodation/${l!.id}`}>
                          <Button size="sm" variant="primary" className="w-full">
                            View listing
                          </Button>
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
