import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { BirthPanel } from "@/components/birth-form";
import { NatalWheel } from "@/components/natal-wheel";
import { Interpret, Meta, PanelSections, Screen, Workbench } from "@/components/kit";
import { computeTransits } from "@/lib/horosa/transits";
import { useChartStore } from "@/lib/horosa/store";
import { formatDMS } from "@/lib/horosa/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/transits")({ component: Page });

function Page() {
  const draft = useChartStore((s) => s.draft);
  const data = useMemo(() => computeTransits(draft), [draft]);
  return (
    <Screen title="星运">
      <Workbench
        params={<BirthPanel />}
        canvas={
          <div>
            <Meta>
              内轮本命 · 外轮此刻 · {data.age} 岁 · 小限 {data.profection}
            </Meta>
            <div className="mt-3">
              <NatalWheel chart={data.natal} outer={data.now} />
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
                          <span>{f.lord}</span>
                          <span className="tabular-nums">
                            {f.fromAge}–{f.toAge}岁
                          </span>
                        </li>
                      ))}
                    </ul>
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
                  id: "返照",
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
                  id: "小限",
                  content: (
                    <p className="text-sm leading-7">
                      {data.age} 岁，岁次宫 {data.profection}。日换年的推进盘已按出生后第 {data.age} 日排好，见太阳弧与外轮。
                    </p>
                  ),
                },
              ]}
            />
            <Interpret
              kind="推运"
              summary={`年龄${data.age} 法达${data.firdaria.find((f) => f.current)?.lord ?? ""} 小限${data.profection} ${data.hits.map((h) => h.trans + h.type + h.natal).join(" ")}`}
            />
          </div>
        }
      />
    </Screen>
  );
}
