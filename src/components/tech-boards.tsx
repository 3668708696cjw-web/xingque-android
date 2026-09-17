import { QIMEN_LAYOUT } from "@/lib/horosa/qimen";
import type { QiZhengItem, QiZhengResult } from "@/lib/horosa/qizheng";
import { XIU, XIU_W } from "@/lib/horosa/qizheng";
import { XIU28 } from "@/lib/horosa/stars";
import type { FeiGongResult, JingJueResult, LingqiResult, WuZhaoResult, XiaoChengResult, XiaoLiurenResult } from "@/lib/horosa/modules";
import type { JinKouResult } from "@/lib/horosa/jinkou";
import type { TaiyiResult } from "@/lib/horosa/taiyi";
import type { FengshuiResult } from "@/lib/horosa/fengshui";
import type { GeomancyResult } from "@/lib/horosa/geomancy";
import type { Drawn } from "@/lib/horosa/tarot";
import type { UranianResult } from "@/lib/horosa/uranian";
import type { LiuYaoResult } from "@/lib/horosa/liuyao";
import type { NatalChart } from "@/lib/horosa/natal";
import type { AsteroidRow } from "@/lib/horosa/asteroids";
import { ZHI } from "@/lib/horosa/types";
import { cn } from "@/lib/utils";

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

export function GuoLaoBoard({ data }: { data: QiZhengResult }) {
  return (
    <div className="chart-stage">
      <div className="gl-board">
        {data.palaces.map((p) => (
          <div key={p.branch} className={cn("gl-cell", ZW_POS[p.branch], p.isMing && "is-ming", p.isShen && "is-shen")}>
            <div className="gl-stars">
              {p.items.map((it) => (
                <div key={it.name} className="gl-star">
                  <span className="gl-glyph">{it.glyph}</span>
                  <span>{it.name}</span>
                </div>
              ))}
            </div>
            <div className="gl-foot">
              <span>{p.branch}</span>
              <span className="gl-name">
                {p.name}
                {p.isMing ? " 命" : ""}
                {p.isShen ? " 身" : ""}
              </span>
              <span>{p.items[0]?.xiu.replace("宿", "") ?? ""}</span>
            </div>
          </div>
        ))}
        <div className="gl-center">
          <div className="font-display text-xl md:text-2xl">果老星宗</div>
          <div className="mt-2 text-xs text-muted">
            命度 {data.mingdu.branch} · {data.mingdu.xiu}
          </div>
          <div className="mt-1 text-[11px] text-faint">
            身度 {data.shendu.branch} · {data.shendu.xiu}
          </div>
        </div>
      </div>
    </div>
  );
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const t = ((deg - 90) * Math.PI) / 180;
  return { x: Math.round((cx + r * Math.cos(t)) * 10) / 10, y: Math.round((cy + r * Math.sin(t)) * 10) / 10 };
}

function sector(cx: number, cy: number, r1: number, r2: number, a0: number, a1: number) {
  const p1 = polar(cx, cy, r2, a0);
  const p2 = polar(cx, cy, r2, a1);
  const p3 = polar(cx, cy, r1, a1);
  const p4 = polar(cx, cy, r1, a0);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${p1.x} ${p1.y} A ${r2} ${r2} 0 ${large} 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${r1} ${r1} 0 ${large} 0 ${p4.x} ${p4.y} Z`;
}

const PALACE_TONE: Record<string, string> = {
  东方苍龙: "var(--color-wood)",
  北方玄武: "var(--color-water)",
  西方白虎: "var(--color-metal)",
  南方朱雀: "var(--color-fire)",
};

export function XiuRing({ items }: { items: QiZhengItem[] }) {
  const size = 1000;
  const cx = 500;
  const cy = 500;
  const sum = XIU_W.reduce((a, b) => a + b, 0);
  let acc = 0;
  const segs = XIU.map((name, i) => {
    const a0 = (acc / sum) * 360;
    acc += XIU_W[i];
    const a1 = (acc / sum) * 360;
    const meta = XIU28[i];
    return { name, a0, a1, mid: (a0 + a1) / 2, meta, w: XIU_W[i] };
  });
  const angs = items.map((it) => ((it.lon - 180) % 360 + 360) % 360);
  const placed = angs.map((a, i) => a + ((i % 5) - 2) * 5);
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="chart-svg" aria-label="二十八宿盘">
      <circle cx={cx} cy={cy} r={460} fill="var(--color-surface)" stroke="var(--color-ink)" strokeOpacity={0.28} />
      {segs.map((s) => {
        const tone = PALACE_TONE[s.meta?.palace ?? ""] ?? "var(--color-ink)";
        const label = polar(cx, cy, 410, s.mid);
        return (
          <g key={s.name}>
            <path d={sector(cx, cy, 330, 458, s.a0, s.a1)} fill={tone} fillOpacity={0.12} stroke="var(--color-ink)" strokeOpacity={0.22} />
            <text x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-display)" fontSize={22} fill="var(--color-ink)">
              {s.name}
            </text>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={328} fill="var(--color-bg)" stroke="var(--color-ink)" strokeOpacity={0.18} />
      {items.map((it, i) => {
        const pt = polar(cx, cy, 268, placed[i]);
        const tick = polar(cx, cy, 328, angs[i]);
        return (
          <g key={it.name}>
            <line x1={tick.x} y1={tick.y} x2={pt.x} y2={pt.y} stroke="var(--color-ink)" strokeOpacity={0.25} />
            <text x={pt.x} y={pt.y} textAnchor="middle" dominantBaseline="middle" fontSize={16} fontFamily="var(--font-display)" fill="var(--color-ink)">
              {it.glyph}
            </text>
          </g>
        );
      })}
      <text x={cx} y={cy - 8} textAnchor="middle" fontFamily="var(--font-display)" fontSize={28} fill="var(--color-ink)">
        二十八宿
      </text>
      <text x={cx} y={cy + 22} textAnchor="middle" fontSize={13} fill="var(--color-muted)">
        距星入宿 · 四象分宫
      </text>
    </svg>
  );
}

export function TaiyiPalaceBoard({ data, mode = "key" }: { data: TaiyiResult; mode?: "key" | "sixteen" }) {
  if (mode === "sixteen") return <TaiyiSixteenBoard data={data} />;
  const by = Object.fromEntries(data.cells.map((c) => [c.palace, c]));
  const KEY = new Set(["太乙", "文昌", "始击", "计神"]);
  const sixteen = new Set(data.sixteen.map((s) => s.name));
  return (
    <div className="chart-stage">
      <div className="ty-board">
        {QIMEN_LAYOUT.flat().map((n) => {
          const c = by[n];
          const keyStars = c.stars.filter((s) => KEY.has(s));
          const rest = c.stars.filter((s) => !KEY.has(s) && !sixteen.has(s));
          return (
            <div key={n} className={cn("ty-cell", n === 5 && "is-center", keyStars.length > 0 && "is-focus")}>
              <span className="ty-name">{c.name}宫</span>
              <span className="ty-men">{c.men}</span>
              <div className="ty-keys">
                {keyStars.map((s) => (
                  <span key={s} className="ty-key">
                    {s}
                  </span>
                ))}
              </div>
              <p className="ty-rest">{rest.slice(0, 4).join(" ")}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const TY_PALACE = ["", "坎", "坤", "震", "巽", "中", "乾", "兑", "艮", "离"];

export function TaiyiSixteenBoard({ data }: { data: TaiyiResult }) {
  return (
    <div className="ty-sixteen">
      {data.sixteen.map((g) => (
        <div key={g.name} className={cn("ty-sg", g.palace === data.tianyimu && "is-on")}>
          <span className="ty-sg-name">{g.name}</span>
          <span className="ty-sg-p">{TY_PALACE[g.palace]}宫</span>
        </div>
      ))}
    </div>
  );
}

export function TaiyiJinian({ data }: { data: TaiyiResult }) {
  const cycle = ((data.jinian - 1) % 72) + 1;
  return (
    <div className="text-center">
      <p className="text-[11px] tracking-[0.22em] text-muted">太乙积年</p>
      <p className="mt-4 font-display text-7xl tabular-nums leading-none">{data.jinian}</p>
      <p className="mt-5 text-sm text-muted">
        {data.yang ? "阳" : "阴"}
        {data.ju}局 · {data.yuan} · 合神{data.heshen}
      </p>
      <div className="ty-cycle mt-10">
        {Array.from({ length: 72 }, (_, i) => (
          <i key={i} className={cn(i + 1 === cycle && "is-on")} />
        ))}
      </div>
      <p className="mt-3 text-[11px] text-faint">本元第 {cycle} / 72</p>
    </div>
  );
}

const XL_RING = ["大安", "留连", "速喜", "赤口", "小吉", "空亡"] as const;

export function XiaoLiurenPalm({ data }: { data: XiaoLiurenResult }) {
  const hits = new Set([data.month, data.day, data.hour]);
  return (
    <div>
      <svg viewBox="0 0 420 420" className="chart-svg mx-auto max-w-[480px]" aria-label="小六壬掌诀">
        <circle cx="210" cy="210" r="198" fill="var(--color-surface)" stroke="var(--color-ink)" strokeOpacity="0.28" />
        <circle cx="210" cy="210" r="58" fill="var(--color-bg)" stroke="var(--color-ink)" strokeOpacity="0.16" />
        {XL_RING.map((name, i) => {
          const p = polar(210, 210, 148, i * 60);
          const on = hits.has(name);
          const tag = name === data.hour ? "时" : name === data.day ? "日" : name === data.month ? "月" : "";
          return (
            <g key={name}>
              <circle cx={p.x} cy={p.y} r={on ? 34 : 28} fill={on ? "var(--color-ink)" : "var(--color-bg)"} stroke="var(--color-ink)" strokeOpacity={on ? 1 : 0.25} />
              <text x={p.x} y={p.y - (tag ? 5 : 0)} textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-display)" fontSize="15" fill={on ? "var(--color-bg)" : "var(--color-ink)"}>
                {name}
              </text>
              {tag ? (
                <text x={p.x} y={p.y + 12} textAnchor="middle" fontSize="10" fill={on ? "var(--color-bg)" : "var(--color-cinnabar)"}>
                  {tag}
                </text>
              ) : null}
            </g>
          );
        })}
        <text x="210" y="206" textAnchor="middle" fontFamily="var(--font-display)" fontSize="18" fill="var(--color-ink)">
          掌诀
        </text>
        <text x="210" y="226" textAnchor="middle" fontSize="11" fill="var(--color-muted)">
          月日起时
        </text>
      </svg>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[
          ["月", data.month],
          ["日", data.day],
          ["时", data.hour],
        ].map(([k, v]) => (
          <div key={k} className="border-b border-line py-2">
            <p className="text-[11px] text-muted">{k}</p>
            <p className="font-display text-2xl">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function JinKouSiwei({ data }: { data: JinKouResult }) {
  const rows = [
    ["人元", data.renyuan, "天干遁"],
    ["贵神", data.guishen, "天乙"],
    ["将神", data.jiang, "月将加时"],
    ["地分", data.difen, "问事落宫"],
  ] as const;
  return (
    <div className="siwei">
      <p className="mb-3 text-center text-[11px] tracking-[0.2em] text-muted">月将 {data.yuejiang}</p>
      {rows.map(([k, v, n]) => (
        <div key={k} className="siwei-row">
          <span className="siwei-k">{k}</span>
          <span className="siwei-v">{v}</span>
          <span className="siwei-n">{n}</span>
        </div>
      ))}
    </div>
  );
}

export function JinKouYuejiang({ data }: { data: JinKouResult }) {
  return (
    <svg viewBox="0 0 420 420" className="chart-svg mx-auto max-w-[480px]" aria-label="金口月将">
      <circle cx="210" cy="210" r="198" fill="var(--color-surface)" stroke="var(--color-ink)" strokeOpacity="0.28" />
      <circle cx="210" cy="210" r="58" fill="var(--color-bg)" stroke="var(--color-ink)" strokeOpacity="0.16" />
      {ZHI.map((z, i) => {
        const p = polar(210, 210, 148, i * 30);
        const on = z === data.yuejiang;
        return (
          <g key={z}>
            <circle cx={p.x} cy={p.y} r={on ? 32 : 24} fill={on ? "var(--color-ink)" : "var(--color-bg)"} stroke="var(--color-ink)" strokeOpacity={on ? 1 : 0.25} />
            <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-display)" fontSize="16" fill={on ? "var(--color-bg)" : "var(--color-ink)"}>
              {z}
            </text>
          </g>
        );
      })}
      <text x="210" y="204" textAnchor="middle" fontFamily="var(--font-display)" fontSize="18" fill="var(--color-ink)">
        月将
      </text>
      <text x="210" y="226" textAnchor="middle" fontSize="13" fill="var(--color-muted)">
        {data.yuejiang}
      </text>
    </svg>
  );
}

export function JinKouKoujue({ data }: { data: JinKouResult }) {
  return (
    <ul className="space-y-6">
      {data.notes.map((n) => (
        <li key={n} className="font-display text-xl leading-8 md:text-2xl md:leading-9">
          {n}
        </li>
      ))}
    </ul>
  );
}

export function FeiGongBoard({ data }: { data: FeiGongResult }) {
  const by = Object.fromEntries(data.cells.map((c) => [c.palace, c]));
  return (
    <div className="chart-stage">
      <div className="fg-board">
        {QIMEN_LAYOUT.flat().map((n) => {
          const c = n === 5 ? { palace: 5, name: "中", men: "寄", star: data.zhiShi } : by[n];
          const focus = c?.men === data.zhiShi;
          return (
            <div key={n} className={cn("fg-cell", n === 5 && "is-center", focus && "is-focus")}>
              <span className="fg-name">{c?.name ?? "中"}</span>
              <span className="fg-men">{c?.men || "寄"}</span>
              <span className="fg-star">{c?.star}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const BAGUA_POS: { name: string; x: number; y: number }[] = [
  { name: "坎", x: 210, y: 52 },
  { name: "艮", x: 330, y: 90 },
  { name: "震", x: 368, y: 210 },
  { name: "巽", x: 330, y: 330 },
  { name: "离", x: 210, y: 368 },
  { name: "坤", x: 90, y: 330 },
  { name: "兑", x: 52, y: 210 },
  { name: "乾", x: 90, y: 90 },
];

export function XiaoChengBoard({ data }: { data: XiaoChengResult }) {
  return (
    <svg viewBox="0 0 420 420" className="chart-svg mx-auto max-w-[480px]" aria-label="小成图">
      <rect x="36" y="36" width="348" height="348" fill="var(--color-surface)" stroke="var(--color-ink)" strokeOpacity="0.28" />
      <polygon points="210,70 350,210 210,350 70,210" fill="none" stroke="var(--color-ink)" strokeOpacity="0.2" />
      {BAGUA_POS.map((p) => {
        const role = p.name === data.ti ? "体" : p.name === data.yong ? "用" : p.name === data.hu ? "互" : "";
        const on = Boolean(role);
        return (
          <g key={p.name}>
            <circle cx={p.x} cy={p.y} r={on ? 34 : 26} fill={on ? "var(--color-ink)" : "var(--color-bg)"} stroke="var(--color-ink)" strokeOpacity={on ? 1 : 0.25} />
            <text x={p.x} y={p.y - 2} textAnchor="middle" fontFamily="var(--font-display)" fontSize="18" fill={on ? "var(--color-bg)" : "var(--color-ink)"}>
              {p.name}
            </text>
            {role ? (
              <text x={p.x} y={p.y + 14} textAnchor="middle" fontSize="10" fill="var(--color-bg)">
                {role}
              </text>
            ) : null}
          </g>
        );
      })}
      <text x="210" y="200" textAnchor="middle" fontFamily="var(--font-display)" fontSize="20" fill="var(--color-ink)">
        体{data.ti} 用{data.yong}
      </text>
      <text x="210" y="224" textAnchor="middle" fontSize="12" fill="var(--color-muted)">
        互{data.hu} · 动第{data.dong}爻
      </text>
    </svg>
  );
}

export function LingqiStones({ data }: { data: LingqiResult }) {
  const rows = [
    ["上", data.upper],
    ["中", data.mid],
    ["下", data.lower],
  ] as const;
  return (
    <div className="lq-board">
      {rows.map(([lab, n]) => (
        <div key={lab} className="lq-row">
          <span className="lq-lab">{lab}</span>
          <div className="lq-stones">
            {Array.from({ length: 4 }).map((_, i) => (
              <span key={i} className={cn("lq-stone", i < n ? "is-yang" : "is-yin")} />
            ))}
          </div>
          <span className="lq-n">{n}</span>
        </div>
      ))}
      <p className="mt-6 text-center font-display text-3xl">{data.name}</p>
      <p className="mt-2 text-center text-sm leading-7 text-muted">{data.ci}</p>
    </div>
  );
}

export function HexagramBars({
  lines,
  title,
}: {
  lines: { yang: boolean; changing?: boolean; label?: string }[];
  title?: string;
}) {
  const vis = [...lines].reverse();
  return (
    <div>
      {title ? <p className="mb-3 text-[11px] tracking-wide text-muted">{title}</p> : null}
      <div className="space-y-2.5">
        {vis.map((l, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-6 text-right text-[11px] text-faint">{lines.length - i}</span>
            {l.yang ? (
              <div className={cn("h-[5px] flex-1", l.changing ? "bg-cinnabar" : "bg-ink")} />
            ) : (
              <div className="flex flex-1 gap-2">
                <div className={cn("h-[5px] flex-1", l.changing ? "bg-cinnabar" : "bg-ink")} />
                <div className={cn("h-[5px] flex-1", l.changing ? "bg-cinnabar" : "bg-ink")} />
              </div>
            )}
            <span className="w-10 text-[11px] text-cinnabar">{l.changing ? "动" : l.label ?? ""}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function JingJueBoard({ data }: { data: JingJueResult }) {
  const lines = data.lines.map((l) => ({ yang: l.includes("阳") }));
  return (
    <div>
      <p className="font-display text-4xl">{data.name}</p>
      <div className="mt-8 max-w-sm">
        <HexagramBars lines={lines} />
      </div>
    </div>
  );
}

const WU_MARK: Record<string, string> = {
  雨: "M 20 28 Q 40 8 60 28 Q 80 48 100 28",
  霁: "M 60 12 L 60 48 M 36 24 L 84 24 M 42 18 L 78 42 M 78 18 L 42 42",
  蒙: "M 24 32 Q 60 8 96 32 Q 60 20 24 32",
  济: "M 20 40 L 100 40 M 28 28 L 92 28 M 36 18 L 84 18",
  中: "M 60 14 L 60 50 M 32 32 L 88 32",
};

export function WuZhaoBoard({ data }: { data: WuZhaoResult }) {
  const all = ["雨", "霁", "蒙", "济", "中"];
  return (
    <div className="grid grid-cols-5 gap-2">
      {all.map((n) => {
        const on = n === data.name;
        return (
          <div key={n} className={cn("border border-line bg-surface px-1 py-3 text-center", on && "border-ink")}>
            <svg viewBox="0 0 120 64" className="mx-auto h-10 w-full" aria-hidden>
              <path d={WU_MARK[n]} fill="none" stroke="currentColor" strokeWidth="3" className={on ? "text-cinnabar" : "text-ink"} opacity={on ? 1 : 0.4} />
            </svg>
            <p className={cn("mt-1 font-display text-xl", on ? "text-ink" : "text-muted")}>{n}</p>
          </div>
        );
      })}
    </div>
  );
}

function GeoDots({ bits }: { bits: number }) {
  return (
    <div className="flex flex-col items-center gap-1 py-1">
      {[0, 1, 2, 3].map((b) => (
        <span key={b} className={cn("block h-1.5", (bits >> b) & 1 ? "w-6 bg-ink" : "w-1.5 rounded-full bg-ink")} />
      ))}
    </div>
  );
}

export function GeomancyPyramid({ data, view }: { data: GeomancyResult; view?: string }) {
  const Card = ({ fig, label }: { fig: GeomancyResult["mothers"][number]; label: string }) => (
    <div className="geo-card">
      <GeoDots bits={fig.bits} />
      <p className="mt-2 truncate font-display text-lg">{fig.name.split(" ")[0]}</p>
      <p className="mt-1 text-[11px] text-faint">{label}</p>
      <p className="mt-1 text-[11px] text-muted">{fig.planet}</p>
    </div>
  );
  if (view === "四母") {
    return (
      <div className="geo-focus">
        {data.mothers.map((f, i) => (
          <Card key={i} fig={f} label={`母${i + 1}`} />
        ))}
      </div>
    );
  }
  if (view === "四女") {
    return (
      <div className="geo-focus">
        {data.daughters.map((f, i) => (
          <Card key={i} fig={f} label={`女${i + 1}`} />
        ))}
      </div>
    );
  }
  if (view === "四甥") {
    return (
      <div className="geo-focus">
        {data.nieces.map((f, i) => (
          <Card key={i} fig={f} label={`甥${i + 1}`} />
        ))}
      </div>
    );
  }
  if (view === "判官") {
    return (
      <div>
        <div className="mx-auto max-w-xs">
          <Card fig={data.judge} label="判官" />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {data.witnesses.map((f, i) => (
            <Card key={i} fig={f} label={`证人${i + 1}`} />
          ))}
          <Card fig={data.recon} label="调和" />
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <div className="mx-auto grid max-w-[12rem] grid-cols-1">
        <Card fig={data.judge} label="判官" />
      </div>
      <div className="mx-auto grid max-w-[20rem] grid-cols-2 gap-2">
        {data.witnesses.map((f, i) => (
          <Card key={i} fig={f} label={`证人${i + 1}`} />
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {data.nieces.map((f, i) => (
          <Card key={i} fig={f} label={`甥${i + 1}`} />
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {data.daughters.map((f, i) => (
          <Card key={i} fig={f} label={`女${i + 1}`} />
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {data.mothers.map((f, i) => (
          <Card key={i} fig={f} label={`母${i + 1}`} />
        ))}
      </div>
      <p className="pt-2 text-center text-xs text-muted">调和 {data.recon.name.split(" ")[0]}</p>
    </div>
  );
}

function tarotEmblem(c: Drawn) {
  if (c.suit === "大阿卡纳") {
    const id = c.id;
    if (id === 0) return "M 40 70 L 60 30 L 80 70";
    if (id === 17 || id === 19) return "M 60 24 L 64 38 L 80 38 L 68 48 L 72 64 L 60 54 L 48 64 L 52 48 L 40 38 L 56 38 Z";
    if (id === 18) return "M 36 48 A 24 24 0 1 0 60 28";
    if (id === 16) return "M 40 70 L 40 30 L 80 30 L 80 70 M 60 30 L 60 70";
    if (id === 13) return "M 30 60 L 90 60 M 60 28 L 60 72";
    return "M 60 28 A 22 22 0 1 1 59.9 28";
  }
  if (c.suit === "权杖") return "M 60 22 L 60 78 M 48 34 L 72 34";
  if (c.suit === "圣杯") return "M 42 28 L 78 28 L 70 52 Q 60 68 60 68 Q 60 68 50 52 Z";
  if (c.suit === "宝剑") return "M 60 22 L 60 78 M 48 30 L 72 30 L 60 22";
  return "M 60 32 A 16 16 0 1 1 59.9 32";
}

export function TarotFace({ c }: { c: Drawn }) {
  return (
    <article className="min-w-0">
      <p className="mb-2 text-[11px] tracking-wide text-muted">{c.pos}</p>
      <div className={cn("tarot-face", c.flipped && "is-rev")}>
        <p className="tarot-suit">{c.suit}</p>
        <svg viewBox="0 0 120 90" className="mx-auto mt-2 h-16 w-full" aria-hidden>
          <path d={tarotEmblem(c)} fill="none" stroke="currentColor" strokeWidth="2.4" />
        </svg>
        <p className="tarot-name">{c.name}</p>
        <p className="tarot-mean">{c.flipped ? c.meaningR : c.meaningU}</p>
      </div>
    </article>
  );
}

export function UranianDial({ data }: { data: UranianResult }) {
  const size = 640;
  const cx = 320;
  const cy = 320;
  const toA = (d: number) => (d / 90) * 360;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="chart-svg" aria-label="汉堡九十度盘">
      <circle cx={cx} cy={cy} r={292} fill="var(--color-surface)" stroke="var(--color-ink)" strokeOpacity={0.28} />
      {[0, 22.5, 45, 67.5].map((d) => {
        const p1 = polar(cx, cy, 292, toA(d));
        const p2 = polar(cx, cy, 210, toA(d));
        return <line key={d} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="var(--color-ink)" strokeOpacity={0.25} />;
      })}
      {["0°", "22.5", "45°", "67.5"].map((lab, i) => {
        const p = polar(cx, cy, 306, i * 90);
        return (
          <text key={lab} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="var(--color-muted)">
            {lab}
          </text>
        );
      })}
      {data.bodies.map((b, i) => {
        const p = polar(cx, cy, 248 - (i % 4) * 18, toA(b.dial));
        return (
          <text key={b.key} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize="13" fontFamily="var(--font-display)" fill="var(--color-ink)">
            {b.name.slice(0, 2)}
          </text>
        );
      })}
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-display)" fontSize="18" fill="var(--color-ink)">
        90°
      </text>
    </svg>
  );
}

const ANIMALS = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];

export function YanqinWheel({
  year,
  month,
  day,
  hour,
  label = "演禽",
}: {
  year: string;
  month: string;
  day: string;
  hour: string;
  label?: string;
}) {
  const hits: Record<string, string> = { [year]: "年", [month]: "月", [day]: "日", [hour]: "时" };
  return (
    <svg viewBox="0 0 420 420" className="chart-svg mx-auto max-w-[480px]" aria-label="演禽盘">
      <circle cx="210" cy="210" r="188" fill="var(--color-surface)" stroke="var(--color-ink)" strokeOpacity="0.28" />
      {ANIMALS.map((a, i) => {
        const p = polar(210, 210, 148, i * 30);
        const tag = hits[a];
        return (
          <g key={a}>
            <circle cx={p.x} cy={p.y} r={tag ? 28 : 22} fill={tag ? "var(--color-ink)" : "var(--color-bg)"} />
            <text x={p.x} y={p.y + (tag ? -4 : 1)} textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-display)" fontSize="16" fill={tag ? "var(--color-bg)" : "var(--color-ink)"}>
              {a}
            </text>
            {tag ? (
              <text x={p.x} y={p.y + 12} textAnchor="middle" fontSize="9" fill="var(--color-bg)">
                {tag}
              </text>
            ) : null}
          </g>
        );
      })}
      <text x="210" y="206" textAnchor="middle" fontFamily="var(--font-display)" fontSize="18">
        {label}
      </text>
      <text x="210" y="226" textAnchor="middle" fontSize="11" fill="var(--color-muted)">
        年日月时
      </text>
    </svg>
  );
}

const PALM8 = [
  { name: "乾", x: 90, y: 78 },
  { name: "兑", x: 54, y: 150 },
  { name: "离", x: 90, y: 222 },
  { name: "震", x: 168, y: 268 },
  { name: "巽", x: 246, y: 222 },
  { name: "坎", x: 282, y: 150 },
  { name: "艮", x: 246, y: 78 },
  { name: "坤", x: 168, y: 40 },
];

export function YizhangPalm({ palace }: { palace: string }) {
  return (
    <svg viewBox="0 0 340 320" className="mx-auto block w-full max-w-[280px]" aria-label="一掌经">
      <ellipse cx="170" cy="168" rx="118" ry="138" fill="var(--color-surface)" stroke="var(--color-ink)" strokeOpacity="0.28" />
      {PALM8.map((p) => {
        const on = p.name === palace;
        return (
          <g key={p.name}>
            <circle cx={p.x + 20} cy={p.y + 20} r={on ? 22 : 16} fill={on ? "var(--color-ink)" : "var(--color-bg)"} stroke="var(--color-ink)" strokeOpacity="0.3" />
            <text x={p.x + 20} y={p.y + 24} textAnchor="middle" fontFamily="var(--font-display)" fontSize="14" fill={on ? "var(--color-bg)" : "var(--color-ink)"}>
              {p.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function FengshuiBagui({ data }: { data: FengshuiResult }) {
  const lucky = new Set(["生气", "天医", "延年", "伏位"]);
  const names = ["", "坎", "坤", "震", "巽", "中", "乾", "兑", "艮", "离"];
  const dirOf: Record<string, string> = {
    坎: "北",
    坤: "西南",
    震: "东",
    巽: "东南",
    乾: "西北",
    兑: "西",
    艮: "东北",
    离: "南",
  };
  const starOf = Object.fromEntries(data.feixing.map((f) => [f.palace, f.star]));
  const sitOf = Object.fromEntries(data.sitting.map((s) => [s.name, s]));
  return (
    <div className="chart-stage">
      <div className="fs-board">
        {QIMEN_LAYOUT.flat().map((n) => {
          const name = names[n];
          const sit = sitOf[dirOf[name] ?? ""];
          const star = starOf[name] ?? (n === 5 ? data.yun : 0);
          return (
            <div key={n} className={cn("fs-cell", n === 5 && "is-center", sit && lucky.has(sit.kind) && "is-lucky")}>
              <span className="fs-name">{name}宫</span>
              <span className="fs-star">{star}</span>
              <span className="fs-kind">{n === 5 ? data.mingGua : sit?.kind ?? ""}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ProfectionWheel({ age, current }: { age: number; current: string }) {
  const names = ["命", "财", "兄", "家", "子", "病", "偶", "危", "迁", "业", "福", "隐"];
  const on = age % 12;
  return (
    <svg viewBox="0 0 420 420" className="chart-svg mx-auto max-w-[480px]" aria-label="小限盘">
      <circle cx="210" cy="210" r="188" fill="var(--color-surface)" stroke="var(--color-ink)" strokeOpacity="0.28" />
      {names.map((n, i) => {
        const p = polar(210, 210, 148, i * 30);
        const hit = i === on;
        return (
          <g key={n}>
            <circle cx={p.x} cy={p.y} r={hit ? 28 : 22} fill={hit ? "var(--color-ink)" : "var(--color-bg)"} />
            <text x={p.x} y={p.y - (hit ? 4 : 0)} textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-display)" fontSize="16" fill={hit ? "var(--color-bg)" : "var(--color-ink)"}>
              {i + 1}
            </text>
            {hit ? (
              <text x={p.x} y={p.y + 12} textAnchor="middle" fontSize="9" fill="var(--color-bg)">
                {n}
              </text>
            ) : (
              <text x={p.x} y={p.y + 18} textAnchor="middle" fontSize="9" fill="var(--color-muted)">
                {n}
              </text>
            )}
          </g>
        );
      })}
      <text x="210" y="204" textAnchor="middle" fontFamily="var(--font-display)" fontSize="22">
        {age}岁
      </text>
      <text x="210" y="226" textAnchor="middle" fontSize="12" fill="var(--color-muted)">
        {current}
      </text>
    </svg>
  );
}

export function MeihuaBoard({ data }: { data: LiuYaoResult }) {
  return (
    <div className="grid gap-8 sm:grid-cols-2">
      <HexagramBars
        title={`本卦 ${data.name}`}
        lines={data.lines.map((l) => ({ yang: l.yang, changing: l.changing, label: l.qin }))}
      />
      <HexagramBars title={`变卦 ${data.changeName}`} lines={data.changeLines.map((l) => ({ yang: l.yang }))} />
    </div>
  );
}

export function HeluoLuoShu({ xiantian, houtian }: { xiantian: number; houtian: number }) {
  const luo = [4, 9, 2, 3, 5, 7, 8, 1, 6];
  return (
    <div className="chart-stage">
      <div className="hl-board">
        {luo.map((n) => (
          <div key={n} className={cn("hl-cell", (n === xiantian || n === houtian) && "is-on")}>
            <span className="font-display text-3xl">{n}</span>
            <span className="text-[11px] text-muted">{n === xiantian ? "先天" : n === houtian ? "后天" : ""}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function lonAng(lon: number, asc: number) {
  return ((asc - lon + 360) % 360);
}

export function AsteroidRing({ natal, rows }: { natal: NatalChart; rows: AsteroidRow[] }) {
  const cx = 500;
  const cy = 500;
  return (
    <svg viewBox="0 0 1000 1000" className="chart-svg" aria-label="小行星盘">
      <circle cx={cx} cy={cy} r={460} fill="var(--color-surface)" stroke="var(--color-ink)" strokeOpacity={0.28} />
      {Array.from({ length: 12 }).map((_, i) => {
        const a0 = lonAng(i * 30, natal.asc);
        const mid = polar(cx, cy, 410, a0 + 15);
        return (
          <g key={i}>
            <path d={sector(cx, cy, 360, 458, a0, a0 + 30)} fill="none" stroke="var(--color-ink)" strokeOpacity={0.2} />
            <text x={mid.x} y={mid.y} textAnchor="middle" dominantBaseline="middle" fontSize="16" fill="var(--color-muted)">
              {["白羊", "金牛", "双子", "巨蟹", "狮子", "处女", "天秤", "天蝎", "射手", "摩羯", "水瓶", "双鱼"][i]}
            </text>
          </g>
        );
      })}
      {rows.map((r, i) => {
        const p = polar(cx, cy, 280 - (i % 4) * 22, lonAng(r.lon, natal.asc));
        return (
          <text key={r.n} x={p.x} y={p.y} textAnchor="middle" fontSize="14" fontFamily="var(--font-display)" fill="var(--color-ink)">
            {r.name.replace("星", "")}
          </text>
        );
      })}
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-display)" fontSize="22">
        小行星
      </text>
    </svg>
  );
}
