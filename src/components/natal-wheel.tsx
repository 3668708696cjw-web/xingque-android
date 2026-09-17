import { SIGNS, type NatalChart, type PlanetKey, type PlanetPos, visiblePlanets } from "@/lib/horosa/natal";
import { cn } from "@/lib/utils";

function polar(cx: number, cy: number, r: number, deg: number) {
  const t = ((deg - 180) * Math.PI) / 180;
  return { x: Math.round((cx + r * Math.cos(t)) * 10) / 10, y: Math.round((cy + r * Math.sin(t)) * 10) / 10 };
}

function arc(cx: number, cy: number, r1: number, r2: number, a0: number, a1: number) {
  let end = a1;
  if (end <= a0) end += 360;
  const large = end - a0 > 180 ? 1 : 0;
  const p1 = polar(cx, cy, r2, a0);
  const p2 = polar(cx, cy, r2, end);
  const p3 = polar(cx, cy, r1, end);
  const p4 = polar(cx, cy, r1, a0);
  return `M ${p1.x} ${p1.y} A ${r2} ${r2} 0 ${large} 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${r1} ${r1} 0 ${large} 0 ${p4.x} ${p4.y} Z`;
}

function norm360(x: number) {
  return ((x % 360) + 360) % 360;
}

/**
 * Windows Horosa AstroChartCircle.declusterPlanetPositions:
 * break the ring at the largest gap, unwrap, then forward-push ≥ minGap.
 */
function decluster(lons: number[], minGap: number): number[] {
  const n = lons.length;
  if (n === 0) return [];
  if (n === 1) return [lons[0]];
  const vis = lons.map((lon, i) => ({ i, lon: norm360(lon) }));
  vis.sort((a, b) => a.lon - b.lon);
  let startIdx = 0;
  let maxGap = -1;
  for (let k = 0; k < n; k++) {
    const cur = vis[k].lon;
    const next = vis[(k + 1) % n].lon;
    const gap = norm360(next - cur);
    if (gap > maxGap) {
      maxGap = gap;
      startIdx = (k + 1) % n;
    }
  }
  const out = new Array<number>(n);
  let prev: number | null = null;
  let base = vis[startIdx].lon;
  for (let k = 0; k < n; k++) {
    const p = vis[(startIdx + k) % n];
    let lon = p.lon;
    while (lon < base - 1e-6) lon += 360;
    base = lon;
    if (prev !== null && lon < prev + minGap) lon = prev + minGap;
    prev = lon;
    out[p.i] = lon;
  }
  return out;
}

const P_CLASS: Record<string, string> = {
  Sun: "p-sun",
  Moon: "p-moon",
  Mercury: "p-mercury",
  Venus: "p-venus",
  Mars: "p-mars",
  Jupiter: "p-jupiter",
  Saturn: "p-saturn",
  Uranus: "p-uranus",
  Neptune: "p-neptune",
  Pluto: "p-pluto",
  Node: "p-node",
  SNode: "p-node",
  Lilith: "p-pluto",
  Chiron: "p-chiron",
};

function aspectStyle(typeZh: string) {
  if (typeZh === "冲") return { stroke: "var(--color-cinnabar)", op: 0.72, dash: undefined as string | undefined, w: 1.8 };
  if (typeZh === "刑") return { stroke: "var(--color-cinnabar)", op: 0.55, dash: "5 3", w: 1.35 };
  if (typeZh === "三合") return { stroke: "var(--color-water)", op: 0.62, dash: undefined, w: 1.45 };
  if (typeZh === "六合") return { stroke: "var(--color-air)", op: 0.42, dash: "3 4", w: 1.1 };
  return { stroke: "var(--color-ink)", op: 0.5, dash: undefined, w: 1.35 };
}

export type WheelStyle = "wheel" | "north" | "square" | "south" | "greek" | "east";

export function NatalWheel({
  chart,
  outer,
  modern = true,
  style = "wheel",
  minors = true,
  onSelect,
}: {
  chart: NatalChart;
  outer?: NatalChart;
  modern?: boolean;
  style?: WheelStyle;
  minors?: boolean;
  onSelect?: (key: PlanetKey) => void;
}) {
  if (style === "north") return <NorthIndian chart={chart} modern={modern} minors={minors} onSelect={onSelect} />;
  if (style === "square") return <SquareChart chart={chart} modern={modern} minors={minors} onSelect={onSelect} />;
  if (style === "south") return <SouthIndian chart={chart} modern={modern} minors={minors} onSelect={onSelect} />;
  if (style === "greek") return <Hellenistic chart={chart} modern={modern} minors={minors} onSelect={onSelect} />;
  if (style === "east") return <EastIndian chart={chart} modern={modern} minors={minors} onSelect={onSelect} />;
  return <RoundWheel chart={chart} outer={outer} modern={modern} minors={minors} onSelect={onSelect} />;
}

function RoundWheel({
  chart,
  outer,
  modern,
  minors = true,
  onSelect,
}: {
  chart: NatalChart;
  outer?: NatalChart;
  modern: boolean;
  minors?: boolean;
  onSelect?: (key: PlanetKey) => void;
}) {
  const size = 1000;
  const cx = 500;
  const cy = 500;
  const hasOuter = Boolean(outer);

  const R_TICK = 458;
  const R_SIGN_OUT = 454;
  const R_SIGN_IN = 372;
  const R_PLANET = hasOuter ? 292 : 318;
  const R_OUTER_P = 352;
  const R_HOUSE_OUT = hasOuter ? 188 : 198;
  const R_HOUSE_IN = 160;
  const R_ASP = 154;
  const R_LABEL = 484;

  const toScreen = (lon: number) => norm360(chart.asc - lon);
  const planets = visiblePlanets(chart, modern, minors);
  const outerPlanets = outer ? visiblePlanets(outer, modern, minors) : [];
  const minGap = 14;
  const disp = decluster(
    planets.map((p) => p.lon),
    minGap,
  );
  const outerDisp = outerPlanets.length
    ? decluster(
        outerPlanets.map((p) => p.lon),
        7,
      )
    : [];

  const aspects = chart.aspects.filter(
    (a) => planets.some((p) => p.key === a.a) && planets.some((p) => p.key === a.b),
  );

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="chart-svg natal-wheel" aria-label="本命星盘">
      <circle cx={cx} cy={cy} r={R_TICK} className="wh-face" />

      {SIGNS.map((s, i) => {
        const start = toScreen(i * 30);
        const mid = polar(cx, cy, (R_SIGN_OUT + R_SIGN_IN) / 2, start + 15);
        return (
          <g key={s.en}>
            <path d={arc(cx, cy, R_SIGN_IN, R_SIGN_OUT, start, start + 30)} className={`sign-fill-${s.element}`} />
            <text x={mid.x} y={mid.y - 11} textAnchor="middle" dominantBaseline="middle" className={`sign-glyph sign-ink-${s.element}`}>
              {s.glyph}
            </text>
            <text x={mid.x} y={mid.y + 18} textAnchor="middle" dominantBaseline="middle" className={`sign-name sign-ink-${s.element}`}>
              {s.name}
            </text>
          </g>
        );
      })}

      {Array.from({ length: 360 }, (_, i) => {
        const a = toScreen(i);
        const major = i % 30 === 0;
        const mid = i % 5 === 0;
        const p1 = polar(cx, cy, R_TICK, a);
        const p2 = polar(cx, cy, R_TICK - (major ? 14 : mid ? 8 : 4), a);
        return (
          <line
            key={i}
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            className={major ? "tick-major" : mid ? "tick-mid" : "tick-minor"}
          />
        );
      })}

      <circle cx={cx} cy={cy} r={R_SIGN_IN} className="wh-ring" />
      <circle cx={cx} cy={cy} r={R_HOUSE_OUT} className="wh-ring-soft" />
      <circle cx={cx} cy={cy} r={R_HOUSE_IN} className="wh-inner" />

      {chart.houses.map((h, i) => {
        const a = toScreen(h);
        const p1 = polar(cx, cy, R_HOUSE_OUT, a);
        const p2 = polar(cx, cy, R_HOUSE_IN, a);
        const next = chart.houses[(i + 1) % 12];
        const span = ((next - h + 360) % 360) || 30;
        const mid = polar(cx, cy, (R_HOUSE_OUT + R_HOUSE_IN) / 2, toScreen(h + span / 2));
        const axis = i === 0 || i === 3 || i === 6 || i === 9;
        return (
          <g key={i}>
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} className={axis ? "house-axis" : "house-cusp"} />
            <text x={mid.x} y={mid.y} textAnchor="middle" dominantBaseline="middle" className="house-num">
              {i + 1}
            </text>
          </g>
        );
      })}

      {[
        { lon: chart.asc, cls: "axis-asc" },
        { lon: chart.dsc, cls: "axis-asc" },
        { lon: chart.mc, cls: "axis-mc" },
        { lon: chart.ic, cls: "axis-mc" },
      ].map((x, i) => {
        const a = toScreen(x.lon);
        const p1 = polar(cx, cy, R_SIGN_IN, a);
        const p2 = polar(cx, cy, R_HOUSE_IN, a);
        return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} className={x.cls} />;
      })}

      {aspects.map((a, i) => {
        const pa = planets.find((p) => p.key === a.a);
        const pb = planets.find((p) => p.key === a.b);
        if (!pa || !pb) return null;
        const A = polar(cx, cy, R_ASP - 4, toScreen(pa.lon));
        const B = polar(cx, cy, R_ASP - 4, toScreen(pb.lon));
        const st = aspectStyle(a.typeZh);
        return (
          <line
            key={i}
            x1={A.x}
            y1={A.y}
            x2={B.x}
            y2={B.y}
            stroke={st.stroke}
            strokeOpacity={st.op}
            strokeDasharray={st.dash}
            strokeWidth={st.w}
          />
        );
      })}

      {planets.map((p, i) => (
        <PlanetMark
          key={p.key}
          p={p}
          trueAng={toScreen(p.lon)}
          dispAng={toScreen(disp[i])}
          cx={cx}
          cy={cy}
          rGlyph={R_PLANET}
          rTick={R_SIGN_IN}
          onSelect={onSelect}
        />
      ))}

      {outerPlanets.map((p, i) => {
        const ang = toScreen(outerDisp[i] ?? p.lon);
        const pt = polar(cx, cy, R_OUTER_P, ang);
        return (
          <text key={`o-${p.key}`} x={pt.x} y={pt.y} textAnchor="middle" dominantBaseline="middle" className={`p-glyph ${P_CLASS[p.key] ?? ""}`} opacity={0.78}>
            {p.glyph}
          </text>
        );
      })}

      {[
        { lon: chart.asc, label: "ASC" },
        { lon: chart.dsc, label: "DSC" },
        { lon: chart.mc, label: "MC" },
        { lon: chart.ic, label: "IC" },
      ].map((x) => {
        const pt = polar(cx, cy, R_LABEL, toScreen(x.lon));
        return (
          <text key={x.label} x={pt.x} y={pt.y} textAnchor="middle" dominantBaseline="middle" className="angle-lbl">
            {x.label}
          </text>
        );
      })}
    </svg>
  );
}

function PlanetMark({
  p,
  trueAng,
  dispAng,
  cx,
  cy,
  rGlyph,
  rTick,
  onSelect,
}: {
  p: PlanetPos;
  trueAng: number;
  dispAng: number;
  cx: number;
  cy: number;
  rGlyph: number;
  rTick: number;
  onSelect?: (key: PlanetKey) => void;
}) {
  const shifted = Math.abs(((dispAng - trueAng + 540) % 360) - 180) > 1.8;
  const tickIn = polar(cx, cy, rTick, trueAng);
  const tickOut = polar(cx, cy, rTick - 11, trueAng);
  const g = polar(cx, cy, rGlyph, dispAng);
  const degPt = polar(cx, cy, rGlyph - 40, dispAng);
  const within = ((p.lon % 360) + 360) % 360 % 30;
  const d = Math.floor(within);
  const lead = shifted ? polar(cx, cy, rGlyph + 18, dispAng) : null;
  const cls = P_CLASS[p.key] ?? "";

  return (
    <g onClick={() => onSelect?.(p.key)} style={{ cursor: onSelect ? "pointer" : undefined }}>
      <line x1={tickIn.x} y1={tickIn.y} x2={tickOut.x} y2={tickOut.y} className="planet-tick" />
      {lead ? <line x1={tickOut.x} y1={tickOut.y} x2={lead.x} y2={lead.y} className="planet-lead" /> : null}
      <circle cx={g.x} cy={g.y} r={26} className={`p-disc ${cls}`} />
      <text x={g.x} y={g.y + 1} textAnchor="middle" dominantBaseline="middle" className={`p-glyph ${cls}`}>
        {p.glyph}
      </text>
      <text x={degPt.x} y={degPt.y} textAnchor="middle" dominantBaseline="middle" className="p-deg">
        {d}°{p.retro ? "R" : ""}
      </text>
    </g>
  );
}

function houseOfWhole(lon: number, asc: number) {
  const start = Math.floor(asc / 30);
  const sign = Math.floor(norm360(lon) / 30);
  return ((sign - start + 12) % 12) + 1;
}

function NorthIndian({
  chart,
  modern,
  minors = true,
  onSelect,
}: {
  chart: NatalChart;
  modern: boolean;
  minors?: boolean;
  onSelect?: (key: PlanetKey) => void;
}) {
  const planets = visiblePlanets(chart, modern, minors);
  const byHouse: PlanetPos[][] = Array.from({ length: 12 }, () => []);
  planets.forEach((p) => {
    byHouse[houseOfWhole(p.lon, chart.asc) - 1].push(p);
  });
  const ascSign = Math.floor(chart.asc / 30);
  const N: [number, number] = [500, 40];
  const E: [number, number] = [960, 500];
  const S: [number, number] = [500, 960];
  const W: [number, number] = [40, 500];
  const NE: [number, number] = [960, 40];
  const SE: [number, number] = [960, 960];
  const SW: [number, number] = [40, 960];
  const NW: [number, number] = [40, 40];

  const centers = [
    { h: 1, x: 500, y: 250 },
    { h: 2, x: 780, y: 140 },
    { h: 3, x: 860, y: 360 },
    { h: 4, x: 740, y: 500 },
    { h: 5, x: 860, y: 640 },
    { h: 6, x: 780, y: 860 },
    { h: 7, x: 500, y: 750 },
    { h: 8, x: 220, y: 860 },
    { h: 9, x: 140, y: 640 },
    { h: 10, x: 260, y: 500 },
    { h: 11, x: 140, y: 360 },
    { h: 12, x: 220, y: 140 },
  ];

  return (
    <svg viewBox="0 0 1000 1000" className="chart-svg natal-wheel" aria-label="北印度盘">
      <rect x={40} y={40} width={920} height={920} className="wh-face" />
      <polygon points={`${N.join(",")} ${E.join(",")} ${S.join(",")} ${W.join(",")}`} className="ni-diamond" />
      <line x1={NW[0]} y1={NW[1]} x2={SE[0]} y2={SE[1]} className="house-cusp" />
      <line x1={NE[0]} y1={NE[1]} x2={SW[0]} y2={SW[1]} className="house-cusp" />
      {centers.map((c) => {
        const sign = SIGNS[(ascSign + c.h - 1) % 12];
        const list = byHouse[c.h - 1];
        return (
          <g key={c.h} onClick={() => list[0] && onSelect?.(list[0].key)} style={{ cursor: onSelect ? "pointer" : undefined }}>
            <text x={c.x} y={c.y - 18} textAnchor="middle" className="house-num">
              {c.h} {sign.glyph}
            </text>
            {list.map((p, i) => (
              <text key={p.key} x={c.x} y={c.y + 6 + i * 22} textAnchor="middle" className={`p-glyph ${P_CLASS[p.key] ?? ""}`}>
                {p.glyph}
                {p.retro ? "R" : ""}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

function SquareChart({
  chart,
  modern,
  minors = true,
  onSelect,
}: {
  chart: NatalChart;
  modern: boolean;
  minors?: boolean;
  onSelect?: (key: PlanetKey) => void;
}) {
  const planets = visiblePlanets(chart, modern, minors);
  const byHouse: PlanetPos[][] = Array.from({ length: 12 }, () => []);
  planets.forEach((p) => {
    byHouse[p.house - 1].push(p);
  });
  const pos: { h: number; x: number; y: number }[] = [
    { h: 1, x: 90, y: 500 },
    { h: 2, x: 90, y: 760 },
    { h: 3, x: 260, y: 910 },
    { h: 4, x: 500, y: 910 },
    { h: 5, x: 740, y: 910 },
    { h: 6, x: 910, y: 760 },
    { h: 7, x: 910, y: 500 },
    { h: 8, x: 910, y: 240 },
    { h: 9, x: 740, y: 90 },
    { h: 10, x: 500, y: 90 },
    { h: 11, x: 260, y: 90 },
    { h: 12, x: 90, y: 240 },
  ];
  return (
    <svg viewBox="0 0 1000 1000" className="chart-svg natal-wheel" aria-label="中世纪方盘">
      <rect x={40} y={40} width={920} height={920} className="wh-face" />
      <polygon points="500,40 960,500 500,960 40,500" className="ni-diamond" />
      <line x1={40} y1={40} x2={960} y2={960} className="tick-mid" />
      <line x1={960} y1={40} x2={40} y2={960} className="tick-mid" />
      {pos.map((c) => {
        const list = byHouse[c.h - 1];
        const cusp = chart.houses[c.h - 1];
        const sign = SIGNS[Math.floor(norm360(cusp) / 30)];
        return (
          <g key={c.h} onClick={() => list[0] && onSelect?.(list[0].key)} style={{ cursor: onSelect ? "pointer" : undefined }}>
            <text x={c.x} y={c.y - 22} textAnchor="middle" className="house-num">
              {c.h} {sign.glyph} {sign.name}
            </text>
            {list.map((p, i) => (
              <text key={p.key} x={c.x} y={c.y + 8 + i * 24} textAnchor="middle" className={`p-glyph ${P_CLASS[p.key] ?? ""}`}>
                {p.glyph} {Math.floor(norm360(p.lon) % 30)}°
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

function planetsByWhole(chart: NatalChart, modern: boolean, minors: boolean) {
  const planets = visiblePlanets(chart, modern, minors);
  const byHouse: PlanetPos[][] = Array.from({ length: 12 }, () => []);
  planets.forEach((p) => byHouse[houseOfWhole(p.lon, chart.asc) - 1].push(p));
  return { planets, byHouse, ascSign: Math.floor(chart.asc / 30) };
}

function SouthIndian({
  chart,
  modern,
  minors = true,
}: {
  chart: NatalChart;
  modern: boolean;
  minors?: boolean;
  onSelect?: (key: PlanetKey) => void;
}) {
  const { byHouse, ascSign } = planetsByWhole(chart, modern, minors);
  const cells: { sign: number; col: number; row: number }[] = [
    { sign: 11, col: 1, row: 1 },
    { sign: 0, col: 2, row: 1 },
    { sign: 1, col: 3, row: 1 },
    { sign: 2, col: 4, row: 1 },
    { sign: 10, col: 1, row: 2 },
    { sign: 3, col: 4, row: 2 },
    { sign: 9, col: 1, row: 3 },
    { sign: 4, col: 4, row: 3 },
    { sign: 8, col: 1, row: 4 },
    { sign: 7, col: 2, row: 4 },
    { sign: 6, col: 3, row: 4 },
    { sign: 5, col: 4, row: 4 },
  ];
  return (
    <div className="chart-stage">
      <div className="si-board" aria-label="南印度盘">
        {cells.map((c) => {
          const house = ((c.sign - ascSign + 12) % 12) + 1;
          const s = SIGNS[c.sign];
          const list = byHouse[house - 1];
          return (
            <div
              key={c.sign}
              className={cn("si-cell", house === 1 && "is-lagna")}
              style={{ gridColumn: c.col, gridRow: c.row }}
            >
              <div className="si-head">
                <span>
                  {s.glyph} {s.name}
                </span>
                <span>{house}</span>
              </div>
              <div className="si-body">
                {list.map((p) => (
                  <span key={p.key}>
                    {p.glyph}
                    {p.retro ? "R" : ""}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
        <div className="si-center">
          <p className="font-display text-xl">南印</p>
          <p className="mt-1 text-xs text-muted">星座固定 · 宫随升</p>
        </div>
      </div>
    </div>
  );
}

function EastIndian({
  chart,
  modern,
  minors = true,
}: {
  chart: NatalChart;
  modern: boolean;
  minors?: boolean;
  onSelect?: (key: PlanetKey) => void;
}) {
  const { byHouse, ascSign } = planetsByWhole(chart, modern, minors);
  const cells: { house: number; col: number; row: number }[] = [
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
      <div className="si-board" aria-label="东印度盘">
        {cells.map((c) => {
          const sign = (ascSign + c.house - 1) % 12;
          const s = SIGNS[sign];
          const list = byHouse[c.house - 1];
          return (
            <div
              key={c.house}
              className={cn("si-cell", c.house === 1 && "is-lagna")}
              style={{ gridColumn: c.col, gridRow: c.row }}
            >
              <div className="si-head">
                <span>{c.house}宫</span>
                <span>
                  {s.glyph} {s.name}
                </span>
              </div>
              <div className="si-body">
                {list.map((p) => (
                  <span key={p.key}>
                    {p.glyph}
                    {p.retro ? "R" : ""}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
        <div className="si-center">
          <p className="font-display text-xl">东印</p>
          <p className="mt-1 text-xs text-muted">宫位固定 · 星座随升</p>
        </div>
      </div>
    </div>
  );
}

function Hellenistic({
  chart,
  modern,
  minors = true,
}: {
  chart: NatalChart;
  modern: boolean;
  minors?: boolean;
  onSelect?: (key: PlanetKey) => void;
}) {
  const planets = visiblePlanets(chart, modern, minors);
  const byHouse: PlanetPos[][] = Array.from({ length: 12 }, () => []);
  planets.forEach((p) => byHouse[p.house - 1].push(p));
  const cells: { h: number; col: string; row: string }[] = [
    { h: 12, col: "1", row: "1" },
    { h: 11, col: "2", row: "1" },
    { h: 10, col: "3", row: "1" },
    { h: 9, col: "4", row: "1" },
    { h: 1, col: "1", row: "2" },
    { h: 8, col: "4", row: "2" },
    { h: 2, col: "1", row: "3" },
    { h: 7, col: "4", row: "3" },
    { h: 3, col: "1", row: "4" },
    { h: 4, col: "2", row: "4" },
    { h: 5, col: "3", row: "4" },
    { h: 6, col: "4", row: "4" },
  ];
  return (
    <div className="chart-stage">
      <div className="gr-board" aria-label="希腊盘">
        {cells.map((c) => {
          const list = byHouse[c.h - 1];
          const cusp = chart.houses[c.h - 1];
          const sign = SIGNS[Math.floor(norm360(cusp) / 30)];
          const axis = c.h === 1 || c.h === 4 || c.h === 7 || c.h === 10;
          return (
            <div
              key={c.h}
              className={cn("gr-cell", c.h === 1 && "is-asc", axis && "is-axis")}
              style={{ gridColumn: c.col, gridRow: c.row }}
            >
              <div className="gr-head">
                <span>
                  {c.h} {sign.glyph}
                </span>
                <span>{sign.name}</span>
              </div>
              <div className="gr-body">
                {list.map((p) => (
                  <span key={p.key}>
                    {p.glyph}
                    {p.retro ? "R" : ""} {Math.floor(norm360(p.lon) % 30)}°
                  </span>
                ))}
              </div>
            </div>
          );
        })}
        <div className="gr-center">
          <p className="font-display text-xl">希腊</p>
          <p className="mt-1 text-xs text-muted">1 宫居左</p>
        </div>
      </div>
    </div>
  );
}

export function AspectGrid({ chart, modern = true, minors = true }: { chart: NatalChart; modern?: boolean; minors?: boolean }) {
  const list = visiblePlanets(chart, modern, minors);
  const map = new Map<string, string>();
  chart.aspects.forEach((a) => {
    map.set(`${a.a}|${a.b}`, a.typeZh);
    map.set(`${a.b}|${a.a}`, a.typeZh);
  });
  const glyph = (k: PlanetKey) => list.find((p) => p.key === k)?.glyph ?? "";
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-center text-[11px]">
        <thead>
          <tr>
            <th className="w-7" />
            {list.map((p) => (
              <th key={p.key} className="px-0.5 py-1 font-normal text-muted">
                {p.glyph}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {list.map((row, i) => (
            <tr key={row.key}>
              <th className="py-1 text-left font-normal text-muted">{row.glyph}</th>
              {list.map((col, j) => {
                if (j > i) return <td key={col.key} />;
                if (j === i)
                  return (
                    <td key={col.key} className="text-faint">
                      ·
                    </td>
                  );
                const t = map.get(`${row.key}|${col.key}`) ?? "";
                const hard = t === "刑" || t === "冲";
                return (
                  <td key={col.key} className={hard ? "text-cinnabar" : "text-muted"} title={`${glyph(row.key)} ${t} ${glyph(col.key)}`}>
                    {t}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
