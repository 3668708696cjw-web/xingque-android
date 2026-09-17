import { QuietTabs } from "@/components/kit";
import type { ReactNode } from "react";
import { SIGNS } from "@/lib/horosa/types";
import { visiblePlanets, type NatalChart } from "@/lib/horosa/natal";
import { allTerms, termAt } from "@/lib/horosa/terms";
import type { Decennial, Firdaria, ZrPeriod } from "@/lib/horosa/transits";
import type { ZeriRow } from "@/lib/horosa/zeri";
import { cn } from "@/lib/utils";

export function ViewBar({
  views,
  value,
  onChange,
}: {
  views: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  if (views.length < 2) return null;
  return <QuietTabs tabs={views} value={value} onChange={onChange} />;
}

const ZW_POS: Record<string, string> = {
  巳: "col-start-1 row-start-1",
  午: "col-start-2 row-start-1",
  未: "col-start-3 row-start-1",
  申: "col-start-4 row-start-1",
  辰: "col-start-1 row-start-2",
  酉: "col-start-4 row-start-2",
  卯: "col-start-1 row-start-3",
  戌: "col-start-4 row-start-3",
  寅: "col-start-1 row-start-4",
  丑: "col-start-2 row-start-4",
  子: "col-start-3 row-start-4",
  亥: "col-start-4 row-start-4",
};

export type PalaceCell = {
  branch?: string;
  house?: number;
  title: string;
  kicker?: string;
  lines: string[];
  active?: boolean;
};

export function Palace12({
  cells,
  center,
}: {
  cells: PalaceCell[];
  center?: ReactNode;
}) {
  return (
    <div className="chart-stage">
      <div className="gl-board">
        {cells.map((c, i) => (
          <div
            key={c.branch ?? c.house ?? i}
            className={cn("gl-cell", c.branch ? ZW_POS[c.branch] : "", c.active && "is-ming")}
          >
            <div className="gl-stars">
              {c.lines.map((l) => (
                <div key={l} className="gl-star">
                  {l}
                </div>
              ))}
            </div>
            <div className="gl-foot">
              <span>{c.kicker ?? c.branch ?? ""}</span>
              <span className="gl-name">{c.title}</span>
              <span>{c.house ? `${c.house}` : ""}</span>
            </div>
          </div>
        ))}
        <div className="gl-center">{center}</div>
      </div>
    </div>
  );
}

export function HouseGrid({
  title,
  cells,
}: {
  title?: string;
  cells: { house: number; lines: string[] }[];
}) {
  const pos: { house: number; col: number; row: number }[] = [
    { house: 12, col: 1, row: 1 },
    { house: 1, col: 2, row: 1 },
    { house: 2, col: 3, row: 1 },
    { house: 3, col: 4, row: 1 },
    { house: 11, col: 1, row: 2 },
    { house: 4, col: 4, row: 2 },
    { house: 10, col: 1, row: 3 },
    { house: 5, col: 4, row: 3 },
    { house: 9, col: 1, row: 4 },
    { house: 8, col: 2, row: 4 },
    { house: 7, col: 3, row: 4 },
    { house: 6, col: 4, row: 4 },
  ];
  return (
    <div className="chart-stage">
      <div className="si-board">
        {pos.map((c) => {
          const cell = cells[c.house - 1];
          return (
            <div
              key={c.house}
              className={cn("si-cell", c.house === 1 && "is-lagna")}
              style={{ gridColumn: c.col, gridRow: c.row }}
            >
              <div className="si-head">
                <span>{c.house}宫</span>
              </div>
              <div className="si-body">
                {(cell?.lines ?? []).map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </div>
            </div>
          );
        })}
        <div className="si-center">
          <p className="font-display text-lg">{title ?? "宫位"}</p>
        </div>
      </div>
    </div>
  );
}

export function NavamsaGrid({ chart }: { chart: NatalChart }) {
  const cells = Array.from({ length: 12 }, (_, i) => ({
    house: i + 1,
    lines: chart.planets.filter((p) => !p.modern && p.house === i + 1).map((p) => `${p.glyph}${p.retro ? "R" : ""}`),
  }));
  return <HouseGrid title="D9 九分盘" cells={cells} />;
}

export function InfluenceGrid({ cells }: { cells: { house: number; lines: string[] }[] }) {
  return <HouseGrid title="乙星入甲宫" cells={cells} />;
}

export function EraStrip({
  items,
}: {
  items: { lord: string; fromAge: number; toAge: number; current: boolean }[];
}) {
  return (
    <div className="era-strip">
      {items.map((f) => (
        <div key={f.lord + f.fromAge} className={cn("era-cell", f.current && "is-on")}>
          <div className="font-display text-sm leading-none">{f.lord}</div>
          <div className="mt-1 text-[10px] tabular-nums opacity-70">
            {f.fromAge}–{Number.isInteger(f.toAge) ? f.toAge : f.toAge.toFixed(1)}
          </div>
        </div>
      ))}
    </div>
  );
}

export function FirdariaStrip({ items }: { items: Firdaria[] }) {
  return <EraStrip items={items} />;
}

export function DecennialStrip({ items }: { items: Decennial[] }) {
  return <EraStrip items={items} />;
}

export function ReleasingRing({ items }: { items: ZrPeriod[] }) {
  const lv1 = items.filter((r) => r.level === 1);
  return (
    <svg viewBox="0 0 420 420" className="chart-svg mx-auto max-w-[520px]" aria-label="黄道星释">
      <circle cx="210" cy="210" r="198" fill="var(--color-surface)" stroke="var(--color-ink)" strokeOpacity="0.25" />
      {lv1.map((r, i) => {
        const a = (i / lv1.length) * 360 - 90;
        const t = (a * Math.PI) / 180;
        const x = Math.round((210 + Math.cos(t) * 150) * 10) / 10;
        const y = Math.round((210 + Math.sin(t) * 150) * 10) / 10;
        return (
          <g key={r.sign + r.fromAge}>
            <circle cx={x} cy={y} r={r.current ? 28 : 22} fill={r.current ? "var(--color-ink)" : "var(--color-bg)"} stroke="var(--color-ink)" strokeOpacity={r.current ? 1 : 0.25} />
            <text x={x} y={y + (r.peak ? -4 : 0)} textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-display)" fontSize="13" fill={r.current ? "var(--color-bg)" : "var(--color-ink)"}>
              {r.sign}
            </text>
            {r.peak ? (
              <text x={x} y={y + 12} textAnchor="middle" fontSize="8" fill={r.current ? "var(--color-bg)" : "var(--color-cinnabar)"}>
                峰
              </text>
            ) : null}
          </g>
        );
      })}
      <text x="210" y="210" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-display)" fontSize="16">
        星释
      </text>
    </svg>
  );
}

const LORD_TONE: Record<string, string> = {
  木: "var(--color-wood)",
  金: "var(--color-metal)",
  水: "var(--color-water)",
  火: "var(--color-fire)",
  土: "var(--color-earth)",
};

export function TermsBelt({ chart }: { chart: NatalChart }) {
  const planets = visiblePlanets(chart, false, false);
  const terms = allTerms();
  return (
    <div>
      <div className="terms-belt" aria-label="埃及界限">
        {SIGNS.map((s) => (
          <div key={s.name} className="terms-sign">
            <div className="terms-name">
              {s.glyph} {s.name}
            </div>
            <div className="terms-spans">
              {terms
                .filter((t) => t.sign === s.name)
                .map((t) => (
                  <div
                    key={t.lord + t.from}
                    className="terms-span"
                    style={{ flexGrow: t.to - t.from, background: LORD_TONE[t.lord] ?? "var(--color-ink)" }}
                    title={`${t.lord} ${t.from}–${t.to}`}
                  >
                    {t.to - t.from >= 6 ? t.lord : ""}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
      <ul className="mt-4">
        {planets.map((p) => {
          const t = termAt(p.lon);
          return (
            <li key={p.key} className="flex justify-between border-b border-line py-2 text-sm">
              <span>
                {p.glyph} {p.name}
              </span>
              <span className="text-muted">
                {t.sign} {t.lord}限 {t.from}–{t.to}°
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function AcgWorldMap({
  lines,
}: {
  lines: { planet: string; lon: number }[];
}) {
  return (
    <svg viewBox="0 0 360 180" className="w-full text-ink" aria-label="ACG 星体地图">
      <rect width="360" height="180" fill="var(--color-surface)" />
      <path d="M40 70 L70 55 L95 62 L88 90 L55 95 Z" fill="currentColor" opacity="0.08" />
      <path d="M155 48 L210 42 L250 70 L230 110 L175 100 L150 72 Z" fill="currentColor" opacity="0.08" />
      <path d="M250 78 L300 70 L330 95 L310 130 L265 120 Z" fill="currentColor" opacity="0.08" />
      <path d="M70 118 L120 125 L100 155 L55 148 Z" fill="currentColor" opacity="0.08" />
      {[-180, -90, 0, 90, 180].map((x) => (
        <g key={x}>
          <line x1={x + 180} y1="0" x2={x + 180} y2="180" stroke="currentColor" strokeOpacity="0.12" />
          <text x={x + 180} y="174" textAnchor="middle" fontSize="8" fill="currentColor" opacity="0.45">
            {x}°
          </text>
        </g>
      ))}
      {lines.map((l, i) => {
        const x = Math.round((((l.lon + 180) % 360 + 360) % 360) * 10) / 10;
        return (
          <g key={l.planet}>
            <line x1={x} y1="8" x2={x} y2="168" stroke="var(--color-cinnabar)" strokeWidth="1.2" />
            <text x={x} y={14 + (i % 4) * 12} textAnchor="middle" fontSize="8" fill="currentColor">
              {l.planet}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function ZeriCalendar({ days }: { days: ZeriRow[] }) {
  return (
    <div className="zeri-cal">
      {days.map((d) => (
        <div key={d.ymd} className={cn("zeri-day", d.score >= 3 && "is-good", d.score <= 0 && "is-bad")}>
          <div className="text-[10px] text-muted">{d.ymd.slice(5)} 周{d.week}</div>
          <div className="mt-1 font-display text-lg leading-none">{d.note}</div>
          <div className="mt-2 h-1 bg-line">
            <div className="h-1 bg-cinnabar" style={{ width: `${Math.min(100, Math.max(8, (d.score + 4) * 10))}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CetianBoard({
  palaces,
  star,
}: {
  palaces: { branch: string; name: string; star: string; isYear: boolean }[];
  star: string;
}) {
  return (
    <Palace12
      cells={palaces.map((p) => ({
        branch: p.branch,
        title: p.name,
        kicker: p.branch,
        lines: [p.star],
        active: p.isYear,
      }))}
      center={
        <div>
          <p className="font-display text-xl">策天</p>
          <p className="mt-1 text-sm text-muted">年星 {star}</p>
        </div>
      }
    />
  );
}

export function NakshatraBoard({
  labels,
  current,
  placements,
}: {
  labels: { name: string; en: string }[];
  current: string;
  placements: { glyph: string; name: string; nak: string }[];
}) {
  return (
    <div className="nak-board">
      {labels.map((l) => {
        const here = placements.filter((p) => p.nak === l.en || p.nak === l.name);
        const on = l.en === current || l.name === current;
        return (
          <div key={l.en} className={cn("nak-cell", on && "is-on")}>
            <p className="font-display text-sm leading-none">{l.name}</p>
            <p className="mt-1 text-[10px] opacity-70">{l.en}</p>
            <p className="mt-2 text-xs">{here.map((p) => p.glyph).join(" ")}</p>
          </div>
        );
      })}
    </div>
  );
}

const BAZHAI_POS: { name: string; col: number; row: number }[] = [
  { name: "西北", col: 1, row: 1 },
  { name: "北", col: 2, row: 1 },
  { name: "东北", col: 3, row: 1 },
  { name: "西", col: 1, row: 2 },
  { name: "东", col: 3, row: 2 },
  { name: "西南", col: 1, row: 3 },
  { name: "南", col: 2, row: 3 },
  { name: "东南", col: 3, row: 3 },
];

export function BazhaiBoard({
  mingGua,
  group,
  sitting,
  title,
}: {
  mingGua: string;
  group: string;
  sitting: { name: string; kind: string; note: string }[];
  title?: string;
}) {
  const lucky = new Set(["生气", "天医", "延年", "伏位"]);
  return (
    <div className="chart-stage">
      <div className="fs-board">
        {BAZHAI_POS.map((p) => {
          const s = sitting.find((x) => x.name === p.name);
          const ji = s ? lucky.has(s.kind) : false;
          return (
            <div
              key={p.name}
              className={cn("fs-cell", ji && "is-lucky")}
              style={{ gridColumn: p.col, gridRow: p.row }}
            >
              <span className="fs-name">{p.name}</span>
              <span className="fs-star">{s?.kind ?? ""}</span>
              <span className="fs-kind">{ji ? "吉" : "凶"}</span>
            </div>
          );
        })}
        <div className="fs-cell is-center" style={{ gridColumn: 2, gridRow: 2 }}>
          <span className="fs-name">{title ?? "八宅"}</span>
          <span className="fs-star">{mingGua}</span>
          <span className="fs-kind">{group}</span>
        </div>
      </div>
    </div>
  );
}

export function SiXiangBoard({
  groups,
  current,
}: {
  groups: { name: string; items: { name: string; animal: string }[] }[];
  current: string;
}) {
  return (
    <div className="sixiang">
      {groups.map((g) => (
        <div key={g.name} className="sixiang-cell">
          <p className="text-[11px] tracking-[0.18em] text-muted">{g.name}</p>
          <ul className="mt-3 space-y-1.5">
            {g.items.map((it) => (
              <li key={it.name} className={cn("flex justify-between text-sm", (current.includes(it.name) || it.name === current) && "font-display text-ink")}>
                <span>{it.name}</span>
                <span className="text-faint">{it.animal}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

