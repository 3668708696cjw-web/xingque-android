import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CITIES, cityOf } from "@/lib/horosa/cities";
import { useChartStore } from "@/lib/horosa/store";
import { pad2 } from "@/lib/horosa/types";
import { cn } from "@/lib/utils";
import { Chip, Field, FieldInput } from "./kit";

const QUICK = [
  { to: "/natal", name: "占星" },
  { to: "/bazi", name: "八字" },
  { to: "/ziwei", name: "紫微" },
  { to: "/qimen", name: "奇门" },
  { to: "/liuyao", name: "六爻" },
  { to: "/transits", name: "星运" },
] as const;

export function TimeStepper() {
  const draft = useChartStore((s) => s.draft);
  const setDraft = useChartStore((s) => s.setDraft);
  const shiftDraft = useChartStore((s) => s.shiftDraft);
  const setNow = useChartStore((s) => s.setNow);
  const rows: { key: string; label: string; value: number; delta: Parameters<typeof shiftDraft>[0]; min?: number; max?: number; width: string }[] = [
    { key: "y", label: "年", value: draft.year, delta: { years: 1 }, min: 1800, max: 2200, width: "w-[5.5rem]" },
    { key: "m", label: "月", value: draft.month, delta: { months: 1 }, min: 1, max: 12, width: "w-12" },
    { key: "d", label: "日", value: draft.day, delta: { days: 1 }, min: 1, max: 31, width: "w-12" },
    { key: "h", label: "时", value: draft.hour, delta: { hours: 1 }, min: 0, max: 23, width: "w-12" },
    { key: "min", label: "分", value: draft.minute, delta: { minutes: 1 }, min: 0, max: 59, width: "w-12" },
  ];
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium tracking-wide text-muted">时间</span>
        <button type="button" className="h-11 px-2 text-sm text-cinnabar" onClick={setNow}>
          用此刻
        </button>
      </div>
      <div className="mt-1 grid grid-cols-5 gap-1">
        {rows.map((r) => (
          <div key={r.key} className="min-w-0">
            <p className="mb-1 text-center text-[11px] text-faint">{r.label}</p>
            <div className="flex flex-col items-center">
              <button
                type="button"
                className="flex h-11 w-full items-center justify-center text-lg text-muted"
                aria-label={`${r.label}加一`}
                onClick={() => shiftDraft(r.delta)}
              >
                +
              </button>
              <input
                inputMode="numeric"
                className={cn(
                  "h-11 w-full rounded-sm border-0 bg-transparent text-center text-base tabular-nums outline-none focus:bg-surface",
                  r.width,
                )}
                value={r.value}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  if (!Number.isFinite(n)) return;
                  if (r.key === "y") setDraft({ year: n });
                  if (r.key === "m") setDraft({ month: Math.min(12, Math.max(1, n)) });
                  if (r.key === "d") setDraft({ day: Math.min(31, Math.max(1, n)) });
                  if (r.key === "h") setDraft({ hour: Math.min(23, Math.max(0, n)) });
                  if (r.key === "min") setDraft({ minute: Math.min(59, Math.max(0, n)) });
                }}
              />
              <button
                type="button"
                className="flex h-11 w-full items-center justify-center text-lg text-muted"
                aria-label={`${r.label}减一`}
                onClick={() => {
                  const neg: typeof r.delta = {};
                  for (const [k, v] of Object.entries(r.delta)) (neg as Record<string, number>)[k] = -(v as number);
                  shiftDraft(neg);
                }}
              >
                −
              </button>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-1 text-center text-xs tabular-nums text-faint">
        {draft.year}-{pad2(draft.month)}-{pad2(draft.day)} {pad2(draft.hour)}:{pad2(draft.minute)}
      </p>
    </div>
  );
}

export function CityPicker() {
  const draft = useChartStore((s) => s.draft);
  const setDraft = useChartStore((s) => s.setDraft);
  const [q, setQ] = useState("");
  const hits = useMemo(() => {
    const s = q.trim();
    if (!s) return CITIES;
    return CITIES.filter((c) => c.name.includes(s) || c.region.includes(s) || c.id.includes(s.toLowerCase()));
  }, [q]);
  const cur = cityOf(draft);
  return (
    <div>
      <Field label="地点">
        <FieldInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜城市，如 东京、台北" />
      </Field>
      <p className="mt-1 text-xs text-faint">
        {cur.name} · {cur.lat.toFixed(2)}° {cur.lon.toFixed(2)}° · UTC{cur.tz >= 0 ? "+" : ""}
        {cur.tz}
      </p>
      <div className="mt-2 max-h-44 overflow-y-auto">
        {hits.slice(0, 24).map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              setDraft({ cityId: c.id, lat: undefined, lon: undefined, place: undefined });
              setQ("");
            }}
            className={cn(
              "flex h-11 w-full items-center justify-between border-b border-line px-1 text-left text-sm",
              c.id === draft.cityId ? "text-ink" : "text-muted",
            )}
          >
            <span>{c.name}</span>
            <span className="text-xs text-faint">{c.region}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function OpenWith({ onPicked }: { onPicked?: () => void }) {
  const nav = useNavigate();
  return (
    <div className="-mx-1 flex flex-wrap">
      {QUICK.map((q) => (
        <Chip
          key={q.to}
          onClick={() => {
            onPicked?.();
            nav({ to: q.to as never });
          }}
        >
          {q.name}
        </Chip>
      ))}
    </div>
  );
}

export function ResultHero({
  kicker,
  title,
  note,
}: {
  kicker?: string;
  title: string;
  note?: string;
}) {
  return (
    <div>
      {kicker ? <p className="text-xs tracking-wide text-muted">{kicker}</p> : null}
      <p className="mt-2 font-display text-5xl leading-none tracking-tight">{title}</p>
      {note ? <p className="mt-5 max-w-md text-[15px] leading-7 text-muted">{note}</p> : null}
    </div>
  );
}

export function Kv({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex min-h-11 items-baseline justify-between gap-3 border-b border-line py-2.5 text-sm">
      <span className="text-muted">{k}</span>
      <span className="text-right">{v}</span>
    </div>
  );
}
