import { Apple, Smartphone, Bell, Zap, ShieldCheck } from "lucide-react";

const POINTS = [
  { icon: Bell, label: "Instant push alerts on new matching rooms" },
  { icon: ShieldCheck, label: "Face / fingerprint sign-in" },
  { icon: Zap, label: "Offline saved listings + photo uploads" },
];

export function MobileAppSection() {
  return (
    <section className="container mt-24">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-brand-950 px-6 py-14 text-white sm:px-12">
        <div
          className="absolute inset-0 bg-grid-light bg-[size:32px_32px] opacity-10"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-brand-500/30 blur-3xl"
          aria-hidden
        />
        <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              <Smartphone className="h-3.5 w-3.5" /> Coming to iOS & Android · TestFlight open
            </div>
            <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              Carry the UAE's classifieds in your pocket.
            </h2>
            <p className="mt-3 max-w-xl text-base text-slate-300">
              Get push alerts the moment a compatible room or job goes live. Chat,
              schedule viewings, and pay — all from one app.
            </p>

            <ul className="mt-7 space-y-3">
              {POINTS.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-sm">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                    <Icon className="h-4 w-4 text-accent-300" />
                  </span>
                  <span className="text-slate-200">{label}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#"
                className="group flex items-center gap-3 rounded-2xl bg-white px-5 py-3 text-slate-900 transition hover:-translate-y-0.5"
              >
                <Apple className="h-7 w-7" />
                <div className="text-left leading-tight">
                  <div className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
                    Download on the
                  </div>
                  <div className="text-base font-bold">App Store</div>
                </div>
              </a>
              <a
                href="#"
                className="group flex items-center gap-3 rounded-2xl bg-white px-5 py-3 text-slate-900 transition hover:-translate-y-0.5"
              >
                <PlayIcon />
                <div className="text-left leading-tight">
                  <div className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
                    Get it on
                  </div>
                  <div className="text-base font-bold">Google Play</div>
                </div>
              </a>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              Or <a className="underline-offset-2 hover:underline">SMS me the link</a>
            </p>
          </div>

          <PhoneMockup />
        </div>
      </div>
    </section>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden>
      <defs>
        <linearGradient id="pg1" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="pg2" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="pg3" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="100%" stopColor="#b91c1c" />
        </linearGradient>
        <linearGradient id="pg4" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <path d="M3.2 1.4 13.6 12 3.2 22.6c-.3-.2-.5-.6-.5-1V2.4c0-.4.2-.8.5-1z" fill="url(#pg4)" />
      <path d="m13.6 12 3.6-3.6 4.5 2.6c.6.4.6 1.6 0 2L17.2 15.6 13.6 12z" fill="url(#pg2)" />
      <path d="M3.2 1.4 17.2 8.4 13.6 12 3.2 1.4z" fill="url(#pg1)" />
      <path d="M3.2 22.6 13.6 12l3.6 3.6L3.2 22.6z" fill="url(#pg3)" />
    </svg>
  );
}

function PhoneMockup() {
  return (
    <div className="relative mx-auto hidden h-[520px] w-[260px] lg:block">
      <div className="absolute inset-0 rounded-[44px] bg-gradient-to-br from-slate-700 to-slate-900 p-2 shadow-2xl">
        <div className="relative h-full w-full overflow-hidden rounded-[36px] bg-slate-100">
          <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-slate-900" />
          <div className="flex h-full flex-col">
            <div className="bg-gradient-to-br from-brand-600 to-brand-800 px-5 pt-10 pb-6 text-white">
              <div className="text-[10px] uppercase tracking-widest opacity-80">
                AI Match · just now
              </div>
              <div className="mt-1 text-lg font-bold leading-tight">
                3 new roommates near you
              </div>
              <div className="mt-3 flex -space-x-2">
                {[
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
                  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
                  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80",
                ].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="h-9 w-9 rounded-full border-2 border-brand-600 object-cover"
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2 p-4">
              {[
                { area: "Marina · 92%", price: "AED 2,500" },
                { area: "JLT · 88%", price: "AED 3,200" },
                { area: "Reem · 85%", price: "AED 3,800" },
              ].map((r) => (
                <div
                  key={r.area}
                  className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm"
                >
                  <div>
                    <div className="text-[11px] font-semibold text-slate-900">
                      {r.area}
                    </div>
                    <div className="text-[9px] text-slate-500">Bedspace · F · 0.4 km metro</div>
                  </div>
                  <div className="text-xs font-bold text-brand-700">{r.price}</div>
                </div>
              ))}
            </div>
            <div className="mt-auto flex justify-around border-t border-slate-200 bg-white py-3 text-[10px] font-semibold text-slate-500">
              <span className="text-brand-700">Home</span>
              <span>Match</span>
              <span>Chat</span>
              <span>Me</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
