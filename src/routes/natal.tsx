import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BirthPanel } from "@/components/birth-form";
import { AspectGrid, NatalWheel, type WheelStyle } from "@/components/natal-wheel";
import { Bar, Block, Chip, Fold, Interpret, Meta, PanelSections, Screen, Workbench, useHydrated } from "@/components/kit";
import { computeNatal, computeNatalAsync, visiblePlanets, type HouseSystem, type NatalChart } from "@/lib/horosa/natal";
import { useChartStore } from "@/lib/horosa/store";
import { formatDMS } from "@/lib/horosa/types";

export const Route = createFileRoute("/natal")({ component: Page });

function Page() {
  const ready = useHydrated();
  const draft = useChartStore((s) => s.draft);
  const [sidereal, setSidereal] = useState(false);
  const [houses, setHouses] = useState<HouseSystem>("placidus");
  const [modern, setModern] = useState(true);
  const [style, setStyle] = useState<WheelStyle>("wheel");
  const [minors, setMinors] = useState(false);
  const fallback = useMemo(
    () => (ready ? computeNatal(draft, sidereal, houses) : null),
    [draft, sidereal, houses, ready],
  );
  const [swiss, setSwiss] = useState<NatalChart | null>(null);
  useEffect(() => {
    if (!ready) return;
    let live = true;
    setSwiss(null);
    void computeNatalAsync(draft, sidereal, houses).then((c) => {
      if (live && c.engine === "swiss") setSwiss(c);
    });
    return () => {
      live = false;
    };
  }, [draft, sidereal, houses, ready]);
  const chart = swiss ?? fallback;
  const planets = chart
    ? visiblePlanets(chart, modern).filter((p) => minors || !["Ceres", "Pallas", "Juno", "Vesta", "Pholus"].includes(p.key))
    : [];
  const view = chart ? { ...chart, planets } : null;
  const aspects = view
    ? view.aspects.filter((a) => planets.some((p) => p.key === a.a) && planets.some((p) => p.key === a.b))
    : [];

  return (
    <Screen title="占星">
      <Workbench
        params={<BirthPanel />}
        canvas={
          chart ? (
            <div>
              <Fold title="盘式" defaultOpen={false} badge={`${sidereal ? "恒星" : "热带"} · ${style === "wheel" ? "圆" : style === "square" ? "方" : "印"}`}>
                <p className="mb-1 text-xs text-faint">黄道</p>
                <div className="-ml-3 mb-2 flex flex-wrap">
                  <Chip active={!sidereal} onClick={() => setSidereal(false)}>热带</Chip>
                  <Chip active={sidereal} onClick={() => setSidereal(true)}>恒星</Chip>
                </div>
                <p className="mb-1 text-xs text-faint">宫制</p>
                <div className="-ml-3 mb-2 flex flex-wrap">
                  <Chip active={houses === "placidus"} onClick={() => setHouses("placidus")}>Placidus</Chip>
                  <Chip active={houses === "koch"} onClick={() => setHouses("koch")}>Koch</Chip>
                  <Chip active={houses === "regio"} onClick={() => setHouses("regio")}>Regio</Chip>
                  <Chip active={houses === "campanus"} onClick={() => setHouses("campanus")}>Campanus</Chip>
                  <Chip active={houses === "equal"} onClick={() => setHouses("equal")}>等宫</Chip>
                  <Chip active={houses === "whole"} onClick={() => setHouses("whole")}>整宫</Chip>
                  <Chip active={houses === "alcabitius"} onClick={() => setHouses("alcabitius")}>Alcabitius</Chip>
                </div>
                <p className="mb-1 text-xs text-faint">行星</p>
                <div className="-ml-3 mb-2 flex flex-wrap">
                  <Chip active={!modern} onClick={() => setModern(false)}>古典</Chip>
                  <Chip active={modern} onClick={() => setModern(true)}>现代</Chip>
                  <Chip active={minors} onClick={() => setMinors((v) => !v)}>小行星</Chip>
                </div>
                <p className="mb-1 text-xs text-faint">盘貌</p>
                <div className="-ml-3 flex flex-wrap">
                  <Chip active={style === "wheel"} onClick={() => setStyle("wheel")}>圆盘</Chip>
                  <Chip active={style === "square"} onClick={() => setStyle("square")}>中世纪</Chip>
                  <Chip active={style === "north"} onClick={() => setStyle("north")}>北印</Chip>
                </div>
              </Fold>
              <div className="chart-stage mt-3">
                <NatalWheel chart={chart} modern={modern} style={style} minors={minors} />
              </div>
              <Meta>
                ASC {formatDMS(chart.asc)} · MC {formatDMS(chart.mc)} · {chart.city} · {chart.houseSystem}
                {chart.sidereal ? ` · 岁差 ${chart.ayanamsa.toFixed(2)}°` : ""}
                {` · ${chart.engine === "swiss" ? "Swiss" : "AE"}`}
              </Meta>
            </div>
          ) : (
            <p className="text-sm text-muted">载入…</p>
          )
        }
        panel={
          chart ? (
            <div>
              <PanelSections
                sections={[
                  {
                    id: "行星",
                    content: (
                      <ul>
                        {planets.map((p) => (
                          <li key={p.key} className="flex justify-between gap-3 border-b border-line py-2 text-sm">
                            <span>
                              {p.glyph} {p.name}
                              {p.retro ? " R" : ""}
                              {p.dignity ? <span className="ml-1 text-[11px] text-cinnabar">{p.dignity}</span> : null}
                            </span>
                            <span className="tabular-nums text-muted">
                              {p.dms} · {p.house}宫
                            </span>
                          </li>
                        ))}
                      </ul>
                    ),
                  },
                  {
                    id: "相位",
                    content: aspects.length ? (
                      <ul>
                        {aspects.map((a, i) => (
                          <li key={i} className="flex justify-between py-1.5 text-sm text-muted">
                            <span>
                              {planets.find((p) => p.key === a.a)?.name} {a.typeZh}{" "}
                              {planets.find((p) => p.key === a.b)?.name}
                              {a.applying ? " 入" : " 出"}
                            </span>
                            <span className="tabular-nums">{a.orb}°</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted">无入相。</p>
                    ),
                  },
                  {
                    id: "格局",
                    content: (
                      <div>
                        <Block title="元素">
                          <div className="space-y-2">
                            {Object.entries(chart.elements).map(([k, v]) => (
                              <Bar key={k} label={k} value={v} max={6} />
                            ))}
                          </div>
                        </Block>
                        <Block title="模式">
                          <div className="space-y-2">
                            {Object.entries(chart.modes).map(([k, v]) => (
                              <Bar key={k} label={k} value={v} max={6} />
                            ))}
                          </div>
                        </Block>
                        <Meta>
                          黄赤交角 {chart.obliquity.toFixed(4)}°
                          {chart.sidereal ? ` · 岁差 ${chart.ayanamsa.toFixed(4)}°` : ""}
                          {` · ${chart.engine === "swiss" ? "Swiss Ephemeris" : "astronomy-engine"}`}
                        </Meta>
                      </div>
                    ),
                  },
                  {
                    id: "宫位",
                    content: (
                      <ul>
                        {["命", "财", "兄", "家", "子", "病", "偶", "危", "迁", "业", "福", "隐"].map((name, i) => (
                          <li key={name} className="flex justify-between border-b border-line py-2 text-sm">
                            <span>
                              {i + 1} {name}
                            </span>
                            <span className="tabular-nums text-muted">{formatDMS(chart.houses[i] ?? 0)}</span>
                          </li>
                        ))}
                      </ul>
                    ),
                  },
                  {
                    id: "网格",
                    content: <AspectGrid chart={chart} modern={modern} minors={minors} />,
                  },
                ]}
              />
              <Interpret
                kind="西洋本命"
                summary={`ASC ${formatDMS(chart.asc)}；` + planets.map((p) => `${p.name} ${p.dms} ${p.house}宫${p.retro ? " R" : ""}${p.dignity}`).join("；")}
              />
            </div>
          ) : null
        }
      />
    </Screen>
  );
}