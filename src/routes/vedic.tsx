import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { BirthPanel } from "@/components/birth-form";
import { NatalWheel } from "@/components/natal-wheel";
import { Interpret, Meta, PanelSections, Screen, Workbench } from "@/components/kit";
import { computeVedic } from "@/lib/horosa/vedic";
import { useChartStore } from "@/lib/horosa/store";
import { visiblePlanets } from "@/lib/horosa/natal";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/vedic")({ component: Page });

function Page() {
  const draft = useChartStore((s) => s.draft);
  const data = useMemo(() => computeVedic(draft), [draft]);
  const planets = visiblePlanets(data.natal, false);
  return (
    <Screen title="印占">
      <Workbench
        params={<BirthPanel />}
        canvas={
          <div>
            <Meta>
              Lahiri {data.natal.ayanamsa.toFixed(3)}° · 月宿 {data.moonNak.en} 第{data.moonNak.pada}足
            </Meta>
            <div className="mt-3">
              <NatalWheel chart={data.natal} modern={false} style="north" />
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
