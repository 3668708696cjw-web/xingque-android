import type { ReactNode } from "react";
import { QIMEN_LAYOUT, type QimenResult } from "@/lib/horosa/qimen";
import type { BaziResult } from "@/lib/horosa/bazi";
import type { ZiweiResult } from "@/lib/horosa/ziwei";
import type { LiuYaoResult } from "@/lib/horosa/liuyao";
import type { LiuRenResult } from "@/lib/horosa/liuren";
import type { TaiyiResult } from "@/lib/horosa/taiyi";
import type { FengshuiResult } from "@/lib/horosa/fengshui";
import type { GeomancyResult } from "@/lib/horosa/geomancy";
import { GAN_WX, ZHI, wxClass } from "@/lib/horosa/types";
import { cn } from "@/lib/utils";

const REL_TONE: Record<string, string> = {
  合: "text-wood",
  三合: "text-wood",
  冲: "text-cinnabar",
  刑: "text-cinnabar",
  害: "text-earth",
  破: "text-muted",
};

export function BaziBoard({ data }: { data: BaziResult }) {
  const max = Math.max(...Object.values(data.scores), 1);
  const rows: { key: string; cells: ReactNode[] }[] = [
    {
      key: "神",
      cells: data.pillars.map((p) => (
        <span key={p.label} className="text-[11px] text-cinnabar">
          {p.shishenGan}
        </span>
      )),
    },
    {
      key: "干",
      cells: data.pillars.map((p) => (
        <span key={p.label} className={cn("font-display text-[40px] leading-none md:text-[48px]", wxClass(p.wxGan))}>
          {p.gan}
        </span>
      )),
    },
    {
      key: "支",
      cells: data.pillars.map((p) => (
        <span key={p.label} className={cn("font-display text-[40px] leading-none md:text-[48px]", wxClass(p.wxZhi))}>
          {p.zhi}
        </span>
      )),
    },
    {
      key: "藏",
      cells: data.pillars.map((p) => (
        <span key={p.label} className="block space-y-0.5 text-[11px] leading-4 text-muted">
          {p.hide.map((h, i) => (
            <span key={h + i} className="block">
              <span className={wxClass(GAN_WX[h] ?? "")}>{h}</span>
              <span className="ml-0.5 text-faint">{p.shishenZhi[i] ?? ""}</span>
            </span>
          ))}
        </span>
      )),
    },
    {
      key: "势",
      cells: data.pillars.map((p) => (
        <span key={p.label} className="text-[11px] text-faint">
          {p.dishi}
        </span>
      )),
    },
    {
      key: "音",
      cells: data.pillars.map((p) => (
        <span key={p.label} className="text-[11px] text-faint">
          {p.nayin}
        </span>
      )),
    },
    {
      key: "空",
      cells: data.pillars.map((p) => (
        <span key={p.label} className="text-[11px] text-faint">
          {p.xunkong}
        </span>
      )),
    },
  ];

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[20rem] border-collapse text-center">
          <thead>
            <tr>
              <th className="w-8" />
              {data.pillars.map((p) => (
                <th key={p.label} className="pb-2 text-[11px] font-normal tracking-wide text-muted">
                  {p.label}柱
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="border-t border-line/70">
                <th className="py-2 text-left text-[10px] font-normal tracking-wide text-faint">{r.key}</th>
                {r.cells.map((c, i) => (
                  <td key={i} className="px-1 py-2 align-middle">
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.relations.length ? (
        <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1">
          {data.relations.map((r, i) => (
            <span key={i} className={cn("text-xs", REL_TONE[r.kind] ?? "text-muted")}>
              {r.a}
              {r.b} {r.label}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-1 text-sm md:grid-cols-4">
        <p>
          日主 <span className={wxClass(data.dayWx)}>{data.dayMaster}</span>
        </p>
        <p>{data.strength}</p>
        <p>
          用神 <span className={wxClass(data.yongshen)}>{data.yongshen}</span>
        </p>
        <p className="text-muted">{data.geju}</p>
      </div>

      <div className="mt-6 space-y-2">
        {Object.entries(data.scores).map(([k, v]) => (
          <div key={k} className="flex items-center gap-3">
            <span className={cn("w-6 text-xs", wxClass(k))}>{k}</span>
            <div className="h-1.5 flex-1 bg-line">
              <div className={cn("h-1.5", `wx-bar-${k}`)} style={{ width: `${(v / max) * 100}%` }} />
            </div>
            <span className="w-8 text-right text-xs tabular-nums text-faint">{v}</span>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <p className="mb-3 text-[11px] tracking-[0.22em] text-muted">大运 · 起运 {data.yunStart}</p>
        <div className="flex gap-px overflow-x-auto bg-line [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {data.dayun.map((d) => (
            <div
              key={d.startYear}
              className={cn(
                "min-w-[4.6rem] flex-1 bg-bg px-2 py-3 text-center",
                d.current && "outline outline-1 outline-ink outline-offset-[-1px]",
              )}
            >
              <div className="font-display text-lg leading-none">
                {d.ganzhi === "起运前" ? "—" : d.ganzhi}
              </div>
              <div className="mt-1 text-[10px] text-cinnabar">{d.shishen}</div>
              <div className="mt-1 text-[10px] tabular-nums text-faint">
                {d.startAge}–{d.endAge}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const JI_DOORS = new Set(["开门", "休门", "生门"]);

const QM_FACE: Record<number, string> = {
  4: "qm-face-br",
  9: "qm-face-b",
  2: "qm-face-bl",
  3: "qm-face-r",
  7: "qm-face-l",
  8: "qm-face-tr",
  1: "qm-face-t",
  6: "qm-face-tl",
};

export function QimenBoard({ data }: { data: QimenResult }) {
  const by = Object.fromEntries(data.cells.map((c) => [c.palace, c]));
  return (
    <div className="chart-stage">
      <div className="qm-board">
        {QIMEN_LAYOUT.flat().map((n) => {
          const c = by[n];
          const fu = c.god === "值符" || c.zhifu;
          const ji = JI_DOORS.has(c.door);
          if (n === 5) {
            return (
              <div key={n} className={cn("qm-cell qm-center", (c.zhifu || c.zhishi) && "qm-focus")}>
                <div className="qm-center-stack">
                  <span className={cn("qm-gan", wxClass(c.wx))}>{c.tianGan || c.diGan}</span>
                  <span className="qm-center-name">{c.name}宫</span>
                  {c.star ? <span className="qm-star">{c.star}</span> : null}
                </div>
              </div>
            );
          }
          return (
            <div
              key={n}
              className={cn(
                "qm-cell",
                (c.zhifu || c.zhishi) && "qm-focus",
                c.kong && "qm-kong",
                c.menpo && "qm-menpo",
              )}
            >
              <span className={cn("qm-gan qm-tl", wxClass(GAN_WX[c.tianGan] ?? c.wx))}>{c.tianGan || "　"}</span>
              <span className={cn("qm-god qm-tr", fu && "is-fu")}>{c.god || "　"}</span>
              <span className={cn("qm-door", ji && "is-ji")}>
                {c.door || "　"}
                {c.zhishi ? <em>使</em> : null}
              </span>
              <span className={cn("qm-di qm-bl", wxClass(GAN_WX[c.diGan] ?? ""))}>{c.diGan || "　"}</span>
              <span className="qm-star qm-br">{c.star || "　"}</span>
              <span className={cn("qm-palace", QM_FACE[n])}>
                {c.name}
                {c.kong ? " 空" : ""}
                {c.ma ? " 马" : ""}
                {c.menpo ? " 迫" : ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
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

const SIHUA: Record<string, string> = {
  禄: "si-lu",
  权: "si-quan",
  科: "si-ke",
  忌: "si-ji",
};

export function ZiweiBoard({ data }: { data: ZiweiResult }) {
  return (
    <div className="chart-stage">
      <div className="zw-board">
        {data.palaces.map((p) => (
          <div
            key={p.branch}
            className={cn("zw-cell", ZW_POS[p.branch], p.name === "命宫" && "zw-ming", p.isBody && "zw-body")}
          >
            <div className="zw-stars">
              {p.majors.map((s) => (
                <div key={s.name} className="zw-major">
                  <span>{s.name}</span>
                  {s.mutagen ? <i className={SIHUA[s.mutagen] ?? ""}>{s.mutagen}</i> : null}
                  {s.brightness ? <b>{s.brightness}</b> : null}
                </div>
              ))}
            </div>
            <div className="zw-foot">
              <span className="zw-gz">
                {p.stem}
                {p.branch}
              </span>
              <span className="zw-name">
                {p.name}
                {p.isBody ? " 身" : ""}
              </span>
              <span className="zw-age">
                {p.decadal ? `${p.decadal.range[0]}–${p.decadal.range[1]}` : p.changsheng}
              </span>
            </div>
          </div>
        ))}
        <div className="zw-center">
          <div className="font-display text-xl leading-none md:text-3xl">{data.five}</div>
          <div className="mt-2 text-xs text-muted md:text-sm">
            命主 {data.soul} · 身主 {data.body}
          </div>
          <div className="mt-1 text-[11px] text-faint md:text-xs">
            {data.lunar} {data.time}
          </div>
          <div className="mt-1 text-[11px] text-faint">
            {data.zodiac} · {data.sign}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LiuyaoBoard({ data }: { data: LiuYaoResult }) {
  const lines = [...data.lines].reverse();
  const change = [...data.changeLines].reverse();
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
      <div>
        <p className="mb-3 text-[11px] tracking-wide text-muted">本卦 {data.name}</p>
        <YaoLines lines={lines} />
      </div>
      <div>
        <p className="mb-3 text-[11px] tracking-wide text-muted">变卦 {data.changeName}</p>
        <YaoLines lines={change} mute />
      </div>
    </div>
  );
}

function YaoLines({
  lines,
  mute,
}: {
  lines: LiuYaoResult["lines"];
  mute?: boolean;
}) {
  return (
    <div className="space-y-3">
      {lines.map((l) => (
        <div key={l.pos} className="flex items-center gap-3">
          <span className="w-8 text-[11px] text-cinnabar">{l.shi ? "世" : l.ying ? "应" : ""}</span>
          <div className={cn("flex-1", mute && "opacity-55")}>
            {l.yang ? (
              <div className={cn("h-1 bg-ink", l.changing && "bg-cinnabar")} />
            ) : (
              <div className="flex gap-2">
                <div className={cn("h-1 flex-1 bg-ink", l.changing && "bg-cinnabar")} />
                <div className={cn("h-1 flex-1 bg-ink", l.changing && "bg-cinnabar")} />
              </div>
            )}
          </div>
          <span className="w-36 text-right text-xs text-muted">
            {l.shen} {l.qin} {l.najia}
            {l.changing ? " 动" : ""}
          </span>
        </div>
      ))}
    </div>
  );
}

function lrPolar(cx: number, cy: number, r: number, i: number) {
  const t = ((i - 6) * 30 - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(t), y: cy + r * Math.sin(t) };
}

export function LiurenBoard({ data }: { data: LiuRenResult }) {
  const size = 480;
  const cx = size / 2;
  const cy = size / 2;
  return (
    <div>
      <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto block w-full max-w-[520px] text-ink lg:max-w-none">
        <circle cx={cx} cy={cy} r={226} fill="var(--color-surface)" stroke="currentColor" strokeOpacity={0.28} />
        <circle cx={cx} cy={cy} r={168} fill="none" stroke="currentColor" strokeOpacity={0.16} />
        <circle cx={cx} cy={cy} r={110} fill="none" stroke="currentColor" strokeOpacity={0.14} />
        <circle cx={cx} cy={cy} r={52} fill="var(--color-bg)" stroke="currentColor" strokeOpacity={0.14} />
        {ZHI.map((z, i) => {
          const outer = lrPolar(cx, cy, 198, i);
          const mid = lrPolar(cx, cy, 138, i);
          const inner = lrPolar(cx, cy, 80, i);
          const tian = data.tianpan[z];
          const jiang = data.generals[z];
          return (
            <g key={z}>
              <text x={outer.x} y={outer.y} textAnchor="middle" dominantBaseline="middle" fontSize={18} fill="currentColor" fontFamily="var(--font-display)">
                {tian}
              </text>
              <text x={mid.x} y={mid.y} textAnchor="middle" dominantBaseline="middle" fontSize={11} fill="currentColor" opacity={0.55}>
                {jiang}
              </text>
              <text x={inner.x} y={inner.y} textAnchor="middle" dominantBaseline="middle" fontSize={15} fill="currentColor" opacity={0.8} fontFamily="var(--font-display)">
                {z}
              </text>
            </g>
          );
        })}
        <text x={cx} y={cy - 8} textAnchor="middle" dominantBaseline="middle" fontSize={13} fill="currentColor" opacity={0.7} fontFamily="var(--font-display)">
          月将{data.yuejiang}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.45}>
          {data.method}
        </text>
      </svg>
      <div className="mt-6 grid grid-cols-4 gap-2 text-center">
        {data.sik.map((k) => (
          <div key={k.name} className="border-b border-line pb-2">
            <div className="text-[10px] text-muted">{k.name}</div>
            <div className="font-display text-2xl">{k.upper}</div>
            <div className="text-xs text-muted">{k.lower}</div>
          </div>
        ))}
      </div>
      <p className="mt-5 text-center font-display text-2xl tracking-[0.4em]">{data.san.join(" ")}</p>
    </div>
  );
}

export function TaiyiBoard({ data }: { data: TaiyiResult }) {
  const by = Object.fromEntries(data.cells.map((c) => [c.palace, c]));
  return (
    <div className="mx-auto w-full max-w-[520px] lg:max-w-none">
      <div className="board-grid grid aspect-square grid-cols-3 grid-rows-3 gap-px">
        {QIMEN_LAYOUT.flat().map((n) => {
          const c = by[n];
          return (
            <div key={n} className={cn("board-cell flex flex-col justify-between p-2 md:p-3", n === 5 && "bg-surface-2")}>
              <div className="text-[11px] text-muted">{c.name}</div>
              <div className="font-display text-sm leading-6 md:text-base">{c.stars.join(" ") || "—"}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function FengshuiLuopan({ data }: { data: FengshuiResult }) {
  const dirs = [
    { name: "北", a: 0 },
    { name: "东北", a: 45 },
    { name: "东", a: 90 },
    { name: "东南", a: 135 },
    { name: "南", a: 180 },
    { name: "西南", a: 225 },
    { name: "西", a: 270 },
    { name: "西北", a: 315 },
  ];
  const size = 420;
  const cx = size / 2;
  const cy = size / 2;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto block w-full max-w-[480px] text-ink">
      <circle cx={cx} cy={cy} r={190} fill="var(--color-surface)" stroke="currentColor" strokeOpacity={0.28} />
      <circle cx={cx} cy={cy} r={128} fill="none" stroke="currentColor" strokeOpacity={0.16} />
      <circle cx={cx} cy={cy} r={64} fill="var(--color-bg)" stroke="currentColor" strokeOpacity={0.14} />
      {dirs.map((d) => {
        const t = ((d.a - 90) * Math.PI) / 180;
        const lucky = data.lucky.includes(d.name);
        const x = cx + Math.cos(t) * 158;
        const y = cy + Math.sin(t) * 158;
        const sit = data.sitting.find((s) => s.name === d.name);
        return (
          <g key={d.name}>
            <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={14} fill={lucky ? "#8f3d36" : "currentColor"} opacity={lucky ? 1 : 0.55} fontFamily="var(--font-display)">
              {d.name}
            </text>
            <text x={x} y={y + 16} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.45}>
              {sit?.kind ?? ""}
            </text>
          </g>
        );
      })}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize={20} fontFamily="var(--font-display)" fill="currentColor">
        {data.mingGua}
      </text>
      <text x={cx} y={cy + 16} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.5}>
        {data.group}
      </text>
    </svg>
  );
}

export function GeomancyShield({ data }: { data: GeomancyResult }) {
  const row = (figs: GeomancyResult["mothers"], title: string) => (
    <div>
      <p className="mb-2 text-[11px] tracking-wide text-muted">{title}</p>
      <div className="grid grid-cols-4 gap-2">
        {figs.map((f, i) => (
          <div key={title + i} className="border border-line bg-surface px-2 py-3 text-center">
            <div className="font-mono text-xs leading-4 tracking-widest">
              {[0, 1, 2, 3].map((b) => (
                <div key={b}>{(f.bits >> b) & 1 ? "●" : "○"}</div>
              ))}
            </div>
            <div className="mt-2 font-display text-xs">{f.name.split(" ")[0]}</div>
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <div className="space-y-5">
      {row(data.mothers, "四母")}
      {row(data.daughters, "四女")}
      {row(data.nieces, "四甥")}
      <div className="grid grid-cols-3 gap-2">
        {data.witnesses.map((f, i) => (
          <div key={i} className="border border-line bg-surface p-3 text-center">
            <div className="text-[10px] text-muted">证人</div>
            <div className="mt-1 font-display">{f.name.split(" ")[0]}</div>
          </div>
        ))}
        <div className="border border-ink bg-surface p-3 text-center">
          <div className="text-[10px] text-muted">判官</div>
          <div className="mt-1 font-display text-lg">{data.judge.name.split(" ")[0]}</div>
        </div>
      </div>
    </div>
  );
}
