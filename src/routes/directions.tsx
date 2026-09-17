import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BirthPanel } from "@/components/birth-form";
import { NatalWheel } from "@/components/natal-wheel";
import { ViewBar } from "@/components/chart-kit";
import { Meta, PanelSections, Screen, Workbench } from "@/components/kit";
import { viewsOf } from "@/lib/horosa/catalog";
import { computeDirections } from "@/lib/horosa/directions";
import { useChartStore } from "@/lib/horosa/store";
import type { NatalChart } from "@/lib/horosa/natal";

export const Route = createFileRoute("/directions")({ component: Page });

const VIEWS = viewsOf("/directions");

function directedChart(natal: NatalChart, list: { name: string; lon: number; dms: string }[]): NatalChart {
  const map = Object.fromEntries(list.map((x) => [x.name, x]));
  return {
    ...natal,
    asc: map["升"]?.lon ?? natal.asc,
    mc: map["顶"]?.lon ?? natal.mc,
    planets: natal.planets.map((p) => {
      const hit = map[p.name];
      return hit ? { ...p, lon: hit.lon, dms: hit.dms } : p;
    }),
  };
}

function Page() {
  const draft = useChartStore((s) => s.draft);
  const d = useMemo(() => computeDirections(draft), [draft]);
  const [view, setView] = useState(VIEWS[0] ?? "奈博");
  const list = view === "托勒密" ? d.ptolemy : d.naibod;
  const moving = useMemo(() => directedChart(d.natal, list), [d.natal, list]);

  return (
    <Screen title="主限">
      <Workbench
        params={<BirthPanel />}
        canvas={
          <div>
            <ViewBar views={VIEWS} value={view} onChange={setView} />
            {view === "近限" ? (
              d.hits.length ? (
                <ul className="mt-2">
                  {d.hits.map((h, i) => (
                    <li key={i} className="flex items-baseline justify-between border-b border-line py-3">
                      <div>
                        <p className="font-display text-xl">{h.age}岁</p>
                        <p className="mt-1 text-sm text-muted">
                          {h.moved} {h.type} {h.natal}
                        </p>
                      </div>
                      <span className="tabular-nums text-muted">{h.year}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-6 text-sm text-muted">前后十二年无紧限。</p>
              )
            ) : (
              <>
                <NatalWheel chart={d.natal} outer={moving} modern={false} />
                <Meta>
                  内轮本命 · 外轮{view}主限。现年 {d.age}。奈博键 {(d.age * 0.985647).toFixed(2)}°；托勒密 1°=1 年。
                </Meta>
              </>
            )}
          </div>
        }
        panel={
          <PanelSections
            sections={[
              {
                id: view === "托勒密" ? "托勒密推运" : "奈博推运",
                content: (
                  <ul>
                    {list.slice(0, 16).map((p) => (
                      <li key={p.name} className="flex justify-between border-b border-line py-2 text-sm">
                        <span>{p.name}</span>
                        <span className="tabular-nums text-muted">{p.dms}</span>
                      </li>
                    ))}
                  </ul>
                ),
              },
              {
                id: "近限",
                content: d.hits.length ? (
                  <ul>
                    {d.hits.map((h, i) => (
                      <li key={i} className="flex justify-between py-1.5 text-sm text-muted">
                        <span>
                          {h.age}岁 {h.moved} {h.type} {h.natal}
                        </span>
                        <span className="tabular-nums">{h.year}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted">前后十二年无紧限。</p>
                ),
              },
            ]}
          />
        }
      />
    </Screen>
  );
}
