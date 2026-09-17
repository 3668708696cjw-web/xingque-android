import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BirthPanel } from "@/components/birth-form";
import { NatalWheel, type WheelStyle } from "@/components/natal-wheel";
import { EraStrip, NakshatraBoard, ViewBar } from "@/components/chart-kit";
import { Interpret, Meta, PanelSections, Screen, Workbench } from "@/components/kit";
import { viewsOf } from "@/lib/horosa/catalog";
import { NAK, NAK_EN, computeVedic } from "@/lib/horosa/vedic";
import { useChartStore } from "@/lib/horosa/store";
import { visiblePlanets } from "@/lib/horosa/natal";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/vedic")({ component: Page });

const VIEWS = viewsOf("/vedic");
const STYLE_OF: Record<string, WheelStyle> = { 北印: "north", 南印: "south", 东印: "east" };

function Page() {
  const draft = useChartStore((s) => s.draft);
  const data = useMemo(() => computeVedic(draft), [draft]);
  const planets = visiblePlanets(data.natal, false);
  const [view, setView] = useState(VIEWS[0] ?? "北印");
  const style = STYLE_OF[view] ?? "north";
  const labels = NAK.map((name, i) => ({ name, en: NAK_EN[i] }));
  const placements = planets.map((p) => ({
    glyph: p.glyph,
    name: p.name,
    nak: data.nak[p.key]?.en ?? "",
  }));

  return (
    <Screen title="印占">
      <Workbench
        params={<BirthPanel />}
        canvas={
          <div>
            <Meta>
              Lahiri {data.natal.ayanamsa.toFixed(3)}° · 月宿 {data.moonNak.en} 第{data.moonNak.pada}足
            </Meta>
            <ViewBar views={VIEWS} value={view} onChange={setView} />
            <div className="mt-3">
              {view === "D9 九分" ? (
                <NatalWheel chart={data.navamsa} modern={false} style="south" />
              ) : view === "月宿" ? (
                <NakshatraBoard labels={labels} current={data.moonNak.en} placements={placements} />
              ) : view === "达沙" ? (
                <EraStrip
                  items={data.dasha.map((d) => ({
                    lord: d.lord,
                    fromAge: d.fromAge,
                    toAge: d.toAge,
                    current: d.current,
                  }))}
                />
              ) : (
                <NatalWheel chart={data.natal} modern={false} style={style} />
              )}
            </div>
          </div>
        }
        panel={
          <div>
            <PanelSections
              sections={[
                {
                  id: "行星",
                  content: (
                    <ul>
                      {planets.map((p) => {
                        const n = data.nak[p.key];
                        return (
                          <li key={p.key} className="flex justify-between border-b border-line py-2 text-sm">
                            <span>
                              {p.glyph} {p.name}
                            </span>
                            <span className="text-right text-muted">
                              {n?.en} {n?.pada}足 · 第{p.house}室
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  ),
                },
                {
                  id: "达沙",
                  content: (
                    <ul>
                      {data.dasha.map((d) => (
                        <li key={d.lord + d.fromAge} className={cn("flex justify-between py-1.5 text-sm", d.current ? "text-ink" : "text-muted")}>
                          <span>{d.lord}</span>
                          <span className="tabular-nums">
                            {d.fromAge.toFixed(1)}–{d.toAge.toFixed(1)}岁
                          </span>
                        </li>
                      ))}
                    </ul>
                  ),
                },
              ]}
            />
            <Interpret kind="吠陀占星" summary={`月宿${data.moonNak.en} 达沙${data.dasha.find((d) => d.current)?.lord ?? ""}`} />
          </div>
        }
      />
    </Screen>
  );
}
