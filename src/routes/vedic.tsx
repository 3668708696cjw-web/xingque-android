import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { BirthPanel } from "@/components/birth-form";
import { NatalWheel } from "@/components/natal-wheel";
import { Interpret, Meta, PanelSections, Screen, Workbench } from "@/components/kit";
import { computeNatal, visiblePlanets } from "@/lib/horosa/natal";
import { useChartStore } from "@/lib/horosa/store";

export const Route = createFileRoute("/vedic")({ component: Page });

function Page() {
  const draft = useChartStore((s) => s.draft);
  const chart = useMemo(() => computeNatal(draft, true, "whole"), [draft]);
  const planets = visiblePlanets(chart, false);
  return (
    <Screen title="印占">
      <Workbench
        params={<BirthPanel />}
        canvas={
          <div>
            <Meta>Lahiri 岁差 {chart.ayanamsa.toFixed(3)}° · 整宫 · 北印钻石盘</Meta>
            <div className="mt-3">
              <NatalWheel chart={chart} modern={false} style="north" />
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
                      {planets.map((p) => (
                        <li key={p.key} className="flex justify-between border-b border-line py-2 text-sm">
                          <span>
                            {p.glyph} {p.name} {p.retro ? "R" : ""}
                          </span>
                          <span className="text-muted">
                            {p.dms} · 第{p.house}室
                          </span>
                        </li>
                      ))}
                    </ul>
                  ),
                },
                {
                  id: "圆盘",
                  content: <NatalWheel chart={chart} modern={false} />,
                },
              ]}
            />
            <Interpret kind="吠陀占星" summary={planets.map((p) => `${p.name}${p.sign}${p.house}`).join(" ")} />
          </div>
        }
      />
    </Screen>
  );
}
