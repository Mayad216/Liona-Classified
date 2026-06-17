import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calculator,
  Home,
  Wallet,
  Receipt,
  ShieldCheck,
  Info,
  Zap,
  Sparkles,
  TrendingDown,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

interface CostInputs {
  rent: number;
  /** Security deposit — % of annual rent (≈8.33% = one month on a 12-month lease). */
  depositPct: number;
  agencyPct: number;
  ejari: number;
  /** DEWA security deposit — % of annual rent. */
  dewaDepositPct: number;
  /** District cooling deposit — % of annual rent. */
  chillerDepositPct: number;
  furniture: number;
  contractMonths: number;
  numCheques: number;
  brokerFee: number;
}

/** 1 month rent on a 12-month contract ≈ 8.33% of annual rent. */
const ONE_MONTH_DEPOSIT_PCT = Math.round((100 / 12) * 100) / 100;

const DEFAULTS: CostInputs = {
  rent: 4500,
  depositPct: ONE_MONTH_DEPOSIT_PCT,
  agencyPct: 5,
  ejari: 220,
  dewaDepositPct: 3.7,
  chillerDepositPct: 2.8,
  furniture: 0,
  contractMonths: 12,
  numCheques: 4,
  brokerFee: 0,
};

function pctOfAnnual(annual: number, pct: number) {
  return Math.round((annual * pct) / 100);
}

export function MoveInCalculator() {
  const [c, setC] = useState<CostInputs>(DEFAULTS);

  const breakdown = useMemo(() => {
    const annual = c.rent * c.contractMonths;
    const depositAmt = pctOfAnnual(annual, c.depositPct);
    const dewaAmt = pctOfAnnual(annual, c.dewaDepositPct);
    const chillerAmt = pctOfAnnual(annual, c.chillerDepositPct);
    const agency = pctOfAnnual(annual, c.agencyPct);

    const lines = [
      {
        label: `Refundable deposit (${c.depositPct}% of annual rent)`,
        value: depositAmt,
        refundable: true,
        icon: Wallet,
      },
      { label: `Agency fee (${c.agencyPct}%)`, value: agency, icon: Receipt },
      { label: "Ejari registration", value: c.ejari, icon: ShieldCheck },
      {
        label: `DEWA deposit (${c.dewaDepositPct}% of annual rent)`,
        value: dewaAmt,
        refundable: true,
        icon: Zap,
      },
      {
        label: `Chiller deposit (${c.chillerDepositPct}% of annual rent)`,
        value: chillerAmt,
        refundable: true,
        icon: Zap,
      },
      { label: "Furniture / setup", value: c.furniture, icon: Sparkles },
      { label: "First cheque (rent)", value: Math.round(annual / c.numCheques), icon: Home },
      { label: "Other broker / commission", value: c.brokerFee, icon: Receipt },
    ];
    const upfront = lines.reduce((s, l) => s + l.value, 0);
    const refundable = lines.reduce((s, l) => s + (l.refundable ? l.value : 0), 0);
    const onPlatform = upfront - agency - c.brokerFee;
    return { lines, upfront, refundable, annual, onPlatform, agency };
  }, [c]);

  const annual = c.rent * c.contractMonths;

  return (
    <div className="bg-slate-50/60 pb-20 pt-10">
      <div className="container max-w-5xl">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            <Calculator className="h-3.5 w-3.5" />
            Move-in cost calculator
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Know exactly what your first month costs.
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            UAE move-ins hide a stack of one-off fees. Deposits are calculated as a
            percentage of your annual rent — adjust the % and see amounts update
            instantly.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_400px]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-bold">Your situation</h2>
            <p className="mt-1 text-xs text-slate-500">
              Annual rent: {formatPrice(annual)} ({c.contractMonths} × {formatPrice(c.rent)}/mo)
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field label="Monthly rent (AED)">
                <input
                  type="number"
                  value={c.rent}
                  onChange={(e) => setC({ ...c, rent: Number(e.target.value) || 0 })}
                  className="input"
                />
              </Field>
              <Field label="Contract length (months)">
                <select
                  value={c.contractMonths}
                  onChange={(e) =>
                    setC({ ...c, contractMonths: Number(e.target.value) })
                  }
                  className="input"
                >
                  <option value={6}>6 months</option>
                  <option value={12}>12 months</option>
                  <option value={24}>24 months</option>
                </select>
              </Field>
              <Field label="Number of cheques">
                <select
                  value={c.numCheques}
                  onChange={(e) =>
                    setC({ ...c, numCheques: Number(e.target.value) })
                  }
                  className="input"
                >
                  {[1, 2, 4, 6, 12].map((n) => (
                    <option key={n} value={n}>
                      {n} cheque{n > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </Field>

              <PctDepositField
                label="Security deposit"
                hint="Typically ~8.3% (= 1 month on a 12-month lease)"
                pct={c.depositPct}
                annual={annual}
                onPct={(depositPct) => setC({ ...c, depositPct })}
                presets={[
                  { label: "None", value: 0 },
                  { label: "1 mo (12-mo lease)", value: ONE_MONTH_DEPOSIT_PCT },
                  { label: "2 mo (12-mo lease)", value: ONE_MONTH_DEPOSIT_PCT * 2 },
                ]}
              />

              <Field label="Agency commission (%)" hint="Usually 5% of annual rent">
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  value={c.agencyPct}
                  onChange={(e) =>
                    setC({ ...c, agencyPct: Number(e.target.value) || 0 })
                  }
                  className="input"
                />
                <span className="mt-1 block text-[10px] font-medium text-slate-600">
                  ≈ {formatPrice(pctOfAnnual(annual, c.agencyPct))}
                </span>
              </Field>

              <Field label="Ejari fee (AED)">
                <input
                  type="number"
                  value={c.ejari}
                  onChange={(e) => setC({ ...c, ejari: Number(e.target.value) || 0 })}
                  className="input"
                />
              </Field>

              <PctDepositField
                label="DEWA deposit"
                hint="Refundable utility deposit — often ~3–5% of annual rent"
                pct={c.dewaDepositPct}
                annual={annual}
                onPct={(dewaDepositPct) => setC({ ...c, dewaDepositPct })}
                presets={[
                  { label: "3%", value: 3 },
                  { label: "4%", value: 4 },
                  { label: "5%", value: 5 },
                ]}
              />

              <PctDepositField
                label="Chiller deposit"
                hint="Empower / Tabreed — often ~2–4% of annual rent"
                pct={c.chillerDepositPct}
                annual={annual}
                onPct={(chillerDepositPct) => setC({ ...c, chillerDepositPct })}
                presets={[
                  { label: "2%", value: 2 },
                  { label: "3%", value: 3 },
                  { label: "4%", value: 4 },
                ]}
              />

              <Field label="Furniture / setup (AED)">
                <input
                  type="number"
                  value={c.furniture}
                  onChange={(e) =>
                    setC({ ...c, furniture: Number(e.target.value) || 0 })
                  }
                  className="input"
                />
              </Field>
              <Field label="Other broker / commission (AED)">
                <input
                  type="number"
                  value={c.brokerFee}
                  onChange={(e) =>
                    setC({ ...c, brokerFee: Number(e.target.value) || 0 })
                  }
                  className="input"
                />
              </Field>
            </div>
          </div>

          <aside className="h-fit lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 text-white shadow-xl">
              <div className="p-6">
                <div className="text-xs font-medium uppercase tracking-widest text-brand-200">
                  Total upfront
                </div>
                <div className="mt-1 text-4xl font-black tracking-tight sm:text-5xl">
                  {formatPrice(breakdown.upfront)}
                </div>
                <div className="mt-2 text-xs text-brand-100">
                  Of which {formatPrice(breakdown.refundable)} is refundable when you
                  move out
                </div>
              </div>

              <div className="border-t border-white/10 px-6 py-4">
                <div className="flex items-center gap-2 text-sm font-bold text-accent-300">
                  <TrendingDown className="h-4 w-4" />
                  You save {formatPrice(breakdown.agency)} on agency fees
                </div>
                <p className="mt-1.5 text-xs text-brand-100">
                  Tenant-to-tenant listings on Khaleej skip the 5% broker commission.
                </p>
                <Link to="/accommodation?listedBy=Tenant">
                  <Button
                    variant="secondary"
                    size="md"
                    className="mt-3 w-full bg-white text-brand-700 hover:bg-brand-50"
                  >
                    Browse tenant listings <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-600" />
                <span>
                  All deposits use % of annual rent ({formatPrice(annual)}). Actual
                  rates depend on emirate, building, and provider.
                </span>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold">Itemised breakdown</h2>
          <div className="mt-5 divide-y divide-slate-100">
            {breakdown.lines.map(({ label, value, refundable, icon: Icon }) => (
              <div
                key={label}
                className="flex items-center justify-between gap-3 py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-600">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="font-medium text-slate-900">{label}</div>
                    {refundable && (
                      <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                        Refundable
                      </div>
                    )}
                  </div>
                </div>
                <div className="font-semibold tabular-nums">
                  {formatPrice(value)}
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between pt-4 text-base font-bold">
              <span>Total upfront</span>
              <span className="tabular-nums">{formatPrice(breakdown.upfront)}</span>
            </div>
            <div className="flex items-center justify-between pt-3 text-sm text-emerald-700">
              <span>Refundable on move-out</span>
              <span className="tabular-nums">
                – {formatPrice(breakdown.refundable)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-700">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <span className="mt-1 block text-[10px] text-slate-500">{hint}</span>}
    </label>
  );
}

function PctDepositField({
  label,
  hint,
  pct,
  annual,
  onPct,
  presets,
}: {
  label: string;
  hint?: string;
  pct: number;
  annual: number;
  onPct: (pct: number) => void;
  presets?: { label: string; value: number }[];
}) {
  const amount = pctOfAnnual(annual, pct);

  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-700">{label} (% of annual rent)</span>
      <div className="mt-1.5 flex items-center gap-2">
        <input
          type="number"
          step="0.1"
          min={0}
          max={100}
          value={pct}
          onChange={(e) => onPct(Number(e.target.value) || 0)}
          className="input flex-1"
        />
        <span className="text-sm font-medium text-slate-500">%</span>
      </div>
      <span className="mt-1 block text-[10px] font-medium text-brand-700">
        = {formatPrice(amount)}
      </span>
      {hint && <span className="mt-0.5 block text-[10px] text-slate-500">{hint}</span>}
      {presets && presets.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => onPct(p.value)}
              className="rounded-full border border-slate-200 px-2.5 py-0.5 text-[10px] font-medium text-slate-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </label>
  );
}
