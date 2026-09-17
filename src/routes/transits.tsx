import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BirthPanel } from "@/components/birth-form";
import { NatalWheel } from "@/components/natal-wheel";
import { DecennialStrip, FirdariaStrip, ReleasingRing, ViewBar } from "@/components/chart-kit";
import { Interpret, Meta, PanelSections, Screen, Workbench, useHydrated } from "@/components/kit";
import { ProfectionWheel } from "@/components/tech-boards";
import { viewsOf } from "@/lib/horosa/catalog";
import { computeTransits, solarArcChart } from "@/lib/horosa/transits";
import { useChartStore } from "@/lib/horosa/store";
import { formatDMS } from "@/lib/horosa/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/transits")({ component: Page });

const VIEWS = viewsOf("/transits");

function Page() {
  const ready = useHydrated();
  const draft = useChartStore((s) => s.draft);
  const data = useMemo(() => (ready ? computeTransits(draft) : null), [draft, ready]);
  const [view, setView] = useState(VIEWS[0] ?? "过运双轮");
  const zr1 = data?.releasing.filter((r) => r.level === 1) ?? [];
  const zr2 = data?.releasing.filter((r) => r.level === 2) ?? [];
  const arc = useMemo(
    () => (data ? solarArcChart(data.natal, data.solarArc) : null),
    [data],
  );
  if (!data) {
    return (
      <Screen title="星运">
        <Workbench params={<BirthPanel />} canvas={<p className="text-sm text-muted">载入…</p>} panel={null} />
      </Screen>
    );
  }
  return (
    <Screen title="星运">
      <Workbench
        params={<BirthPanel />}
        canvas={
          <div>
            <ViewBar views={VIEWS} value={view} onChange={setView} />
            <Meta>
              {view === "过运双轮"
                ? `内轮本命 · 外轮此刻 · ${data.age} 岁 · 小限 ${data.profection}`
                : view === "日返"
                  ? "今年太阳返照"
                  : view === "月返"
                    ? "本月太阴返照"
                    : view === "推进"
                      ? `日换年推进，第 ${data.age} 日`
                      : view === "小限"
                        ? `岁次宫 ${data.profection}`
                        : view === "法达"
                          ? "波斯法达，日生/夜生序列"
                          : view === "十年"
                            ? "十年主，十年一换"
                            : view === "黄道星释"
                              ? "黄道星释一级"
                              : `太阳弧 ${data.age}°`}
            </Meta>
            <div className="mt-3">
              {view === "过运双轮" ? <NatalWheel chart={data.natal} outer={data.now} /> : null}
              {view === "日返" ? <NatalWheel chart={data.solarReturn} modern={false} /> : null}
              {view === "月返" ? <NatalWheel chart={data.lunarReturn} modern={false} /> : null}
              {view === "推进" ? <NatalWheel chart={data.progressed} outer={data.natal} modern={false} /> : null}
              {view === "小限" ? <ProfectionWheel age={data.age} current={data.profection} /> : null}
              {view === "法达" ? <FirdariaStrip items={data.firdaria} /> : null}
              {view === "十年" ? <DecennialStrip items={data.decennials} /> : null}
              {view === "黄道星释" ? <ReleasingRing items={data.releasing} /> : null}
              {view === "太阳弧" && arc ? <NatalWheel chart={data.natal} outer={arc} modern={false} /> : null}
            </div>
          </div>
        }
        panel={
          <div>
            <PanelSections
              sections={[
                {
                  id: "过运",
                  content: data.hits.length === 0 ? (
                    <p className="text-sm text-muted">没有 2.5° 内的大相位。</p>
                  ) : (
                    <ul>
                      {data.hits.map((h, i) => (
                        <li key={i} className="border-b border-line py-2 text-sm">
                          流{h.trans} {h.type} 本{h.natal}
                          <span className="ml-2 tabular-nums text-muted">{h.orb}°</span>
                        </li>
                      ))}
                    </ul>
                  ),
                },
                {
                  id: "法达",
                  content: (
                    <ul>
                      {data.firdaria.map((f) => (
                        <li key={f.lord} className={cn("flex justify-between py-1.5 text-sm", f.current ? "text-ink" : "text-muted")}>
                          <span>{f.lord}{f.current ? " · 当前" : ""}</span>
                          <span className="tabular-nums">
                            {f.fromAge}–{f.toAge}岁
                          </span>
                        </li>
                      ))}
                    </ul>
                  ),
                },
                {
                  id: "十年",
                  content: (
                    <ul>
                      {data.decennials.map((f) => (
                        <li key={f.lord + f.fromAge} className={cn("flex justify-between py-1.5 text-sm", f.current ? "text-ink" : "text-muted")}>
                          <span>{f.lord}{f.current ? " · 当前" : ""}</span>
                          <span className="tabular-nums">
                            {f.fromAge}–{f.toAge}岁
                          </span>
                        </li>
                      ))}
                    </ul>
                  ),
                },
                {
                  id: "黄道星释",
                  content: (
                    <div>
                      <ul>
                        {zr1.map((r) => (
                          <li key={r.sign + r.fromAge} className={cn("flex justify-between py-1.5 text-sm", r.current ? "text-ink" : "text-muted")}>
                            <span>
                              {r.sign}
                              {r.peak ? " 峰" : ""}
                              {r.current ? " · 当前" : ""}
                            </span>
                            <span className="tabular-nums">
                              {r.fromAge}–{r.toAge}岁
                            </span>
                          </li>
                        ))}
                      </ul>
                      {zr2.length ? (
                        <div className="mt-4">
                          <p className="mb-1 text-[11px] text-faint">当前期二级</p>
                          <ul>
                            {zr2.map((r) => (
                              <li key={"2" + r.sign + r.fromAge} className={cn("flex justify-between py-1 text-sm", r.current ? "text-ink" : "text-muted")}>
                                <span>{r.sign}</span>
                                <span className="tabular-nums text-xs">
                                  {r.fromAge}–{r.toAge}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  ),
                },
                {
                  id: "太阳弧",
                  content: (
                    <ul>
                      {data.solarArc.map((p) => (
                        <li key={p.name} className="flex justify-between py-1.5 text-sm text-muted">
                          <span>{p.name}</span>
                          <span className="tabular-nums">{p.dms}</span>
                        </li>
                      ))}
                    </ul>
                  ),
                },
                {
                  id: "日返",
                  content: (
                    <ul>
                      {data.solarReturn.planets.filter((p) => !p.modern).map((p) => (
                        <li key={p.key} className="flex justify-between py-1 text-sm text-muted">
                          <span>
                            {p.glyph} {p.name}
                          </span>
                          <span className="tabular-nums">{formatDMS(p.lon)}</span>
                        </li>
                      ))}
                    </ul>
                  ),
                },
                {
                  id: "月返",
                  content: (
                    <ul>
                      {data.lunarReturn.planets.filter((p) => !p.modern).map((p) => (
                        <li key={p.key} className="flex justify-between py-1 text-sm text-muted">
                          <span>
                            {p.glyph} {p.name}
                          </span>
                          <span className="tabular-nums">{formatDMS(p.lon)}</span>
                        </li>
                      ))}
                    </ul>
                  ),
                },
                {
                  id: "推进",
                  content: (
                    <ul>
                      {data.progressed.planets.filter((p) => !p.modern).map((p) => (
                        <li key={p.key} className="flex justify-between py-1 text-sm text-muted">
                          <span>
                            {p.glyph} {p.name}
                            {p.retro ? " R" : ""}
                          </span>
                          <span className="tabular-nums">{formatDMS(p.lon)}</span>
                        </li>
                      ))}
                    </ul>
                  ),
                },
                {
                  id: "月历",
                  content: (
                    <ul>
                      {data.ephemeris.map((e) => (
                        <li key={e.day} className="flex justify-between gap-2 border-b border-line py-1.5 text-xs tabular-nums text-muted">
                          <span>{e.day}日</span>
                          <span>日 {e.sun}</span>
                          <span>月 {e.moon}</span>
                        </li>
                      ))}
                    </ul>
                  ),
                },
                {
                  id: "小限",
                  content: (
                    <p className="text-sm leading-7">
                      {data.age} 岁，岁次宫 {data.profection}。日换年的推进盘已按出生后第 {data.age} 日排好。
                    </p>
                  ),
                },
              ]}
            />
            <Interpret
              kind="推运"
              summary={`年龄${data.age} 法达${data.firdaria.find((f) => f.current)?.lord ?? ""} 小限${data.profection} 十年${data.decennials.find((d) => d.current)?.lord ?? ""} 星释${zr1.find((r) => r.current)?.sign ?? ""} ${data.hits.map((h) => h.trans + h.type + h.natal).join(" ")}`}
            />
          </div>
        }
      />
    </Screen>
  );
}
