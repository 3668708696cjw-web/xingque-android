import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { BirthPanel } from "@/components/birth-form";
import { Meta, Screen, Workbench } from "@/components/kit";
import { computeTaixuan } from "@/lib/horosa/taixuan";
import { useChartStore } from "@/lib/horosa/store";

export const Route = createFileRoute("/taixuan")({ component: Page });

function Page() {
  const draft = useChartStore((s) => s.draft);
  const data = useMemo(() => computeTaixuan(draft), [draft]);
  return (
    <Screen title="太玄">
      <Workbench
        params={<BirthPanel />}
        canvas={
          <div>
            <p className="font-display text-4xl">{data.name}</p>
            <Meta>
              第 {data.index + 1} 首 · 画 {data.lines.join(" · ")}
            </Meta>
            <div className="mt-8 space-y-3">
              {[...data.lines].reverse().map((n, i) => (
                <div key={i} className="flex justify-center gap-1">
                  {Array.from({ length: n }).map((_, j) => (
                    <div key={j} className="h-[3px] w-20 bg-ink md:w-28" />
                  ))}
                </div>
              ))}
            </div>
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
