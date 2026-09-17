import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BirthPanel } from "@/components/birth-form";
import { ViewBar } from "@/components/chart-kit";
import { LingqiStones } from "@/components/tech-boards";
import { Meta, Screen, Workbench } from "@/components/kit";
import { viewsOf } from "@/lib/horosa/catalog";
import { computeTaixuan } from "@/lib/horosa/taixuan";
import { useChartStore } from "@/lib/horosa/store";

export const Route = createFileRoute("/taixuan")({ component: Page });

const VIEWS = viewsOf("/taixuan");

function Page() {
  const draft = useChartStore((s) => s.draft);
  const data = useMemo(() => computeTaixuan(draft), [draft]);
  const [view, setView] = useState(VIEWS[0] ?? "四画");
  const lingqi = {
    upper: data.lingqi.casts[0] > 4 ? 4 : data.lingqi.casts[0],
    mid: data.lingqi.casts[1] > 4 ? 4 : data.lingqi.casts[1],
    lower: data.lingqi.casts[2] > 4 ? 4 : data.lingqi.casts[2],
    name: data.lingqi.name,
    ci: data.lingqi.note,
  };
  return (
    <Screen title="太玄">
      <Workbench
        params={<BirthPanel />}
        canvas={
          <div>
            <ViewBar views={VIEWS} value={view} onChange={setView} />
            {view === "赞" ? (
              <div>
                <p className="font-display text-5xl">{data.name}</p>
                <p className="mt-8 max-w-md font-display text-2xl leading-10">{data.praise}</p>
              </div>
            ) : view === "灵棋" ? (
              <LingqiStones data={lingqi} />
            ) : (
              <div>
                <p className="font-display text-4xl">{data.name}</p>
                <Meta>
                  第 {data.index + 1} 首 · 画 {data.lines.join(" · ")}
                </Meta>
                <div className="mt-10 space-y-4">
                  {[...data.lines].reverse().map((n, i) => (
                    <div key={i} className="flex justify-center gap-1.5">
                      {Array.from({ length: n }).map((_, j) => (
                        <div key={j} className="h-[3px] w-24 bg-ink md:w-32" />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        }
        panel={
          <div>
            <p className="text-[15px] leading-7">{data.praise}</p>
            <p className="mt-10 text-[11px] tracking-wide text-muted">灵棋</p>
            <p className="mt-2 font-display text-xl">{data.lingqi.name}</p>
            <p className="mt-1 text-sm text-muted">
              上{data.lingqi.casts[0]} 中{data.lingqi.casts[1]} 下{data.lingqi.casts[2]} · {data.lingqi.note}
            </p>
          </div>
        }
      />
    </Screen>
  );
}
