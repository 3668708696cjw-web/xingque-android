import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Screen, Workbench } from "@/components/kit";
import { computeZeri } from "@/lib/horosa/modules";
import { useChartStore } from "@/lib/horosa/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/zeri")({ component: Page });

function Page() {
  const cityId = useChartStore((s) => s.draft.cityId);
  const days = useMemo(() => computeZeri(cityId), [cityId]);
  return (
    <Screen title="择日">
      <Workbench
        canvas={
          <div>
            <p className="text-sm text-muted">从今日起二十一日，按建除、宜忌打分。本机，不连网。</p>
            <ul className="mt-4">
              {days.map((d) => (
                <li key={d.ymd} className="flex items-start justify-between gap-3 border-b border-line py-3">
                  <div>
                    <div className="font-display text-lg">
                      {d.ymd.slice(5)} 周{d.week}
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {d.zhixing}日 · 宜 {d.yi || "—"}
                    </p>
                  </div>
                  <span className={cn("shrink-0 text-sm", d.score >= 3 ? "text-cinnabar" : "text-muted")}>{d.note}</span>
                </li>
              ))}
            </ul>
          </div>
        }
        panel={
          <p className="text-sm leading-7 text-muted">
            宜择：建除为除、开、成、定，且宜中含嫁娶、出行、开市、入宅。黄道日加分。具体用事仍看本命与三式。
          </p>
        }
      />
    </Screen>
  );
}
