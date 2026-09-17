import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { BirthPanel } from "@/components/birth-form";
import { Interpret, Meta, Screen, Workbench } from "@/components/kit";
import { computeFeiGong } from "@/lib/horosa/modules";
import { useChartStore } from "@/lib/horosa/store";

export const Route = createFileRoute("/feigong")({ component: Page });

function Page() {
  const draft = useChartStore((s) => s.draft);
  const data = useMemo(() => computeFeiGong(draft), [draft]);
  return (
    <Screen title="飞宫">
      <Workbench
        params={<BirthPanel submitLabel="排盘" />}
        canvas={
          <div>
            <Meta>
              {data.ju} · 值使 {data.zhiShi}
            </Meta>
            <div className="mt-6 grid grid-cols-3 gap-px bg-line">
              {[8, 4, 3, 9, 5, 1, 2, 7, 6].map((p) => {
                const c = data.cells.find((x) => x.palace === p);
                return (
                  <div key={p} className="min-h-24 bg-bg p-3">
                    <p className="text-[11px] text-muted">{c?.name ?? "中"}</p>
                    <p className="mt-1 font-display text-lg">{c?.men || "寄"}</p>
                    <p className="text-xs text-faint">{c?.star}</p>
                  </div>
                );
              })}
            </div>
          </div>
        }
        panel={<Interpret kind="飞宫小奇门" summary={`${data.ju} 值使${data.zhiShi}`} />}
      />
    </Screen>
  );
}
