import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Screen, Workbench, useHydrated } from "@/components/kit";
import { ViewBar, ZeriCalendar } from "@/components/chart-kit";
import { viewsOf } from "@/lib/horosa/catalog";
import { computeZeriDesk, type ZeriTech } from "@/lib/horosa/zeri";
import { useChartStore } from "@/lib/horosa/store";

export const Route = createFileRoute("/zeri")({ component: Page });

const VIEWS = viewsOf("/zeri") as ZeriTech[];

function Page() {
  const ready = useHydrated();
  const draft = useChartStore((s) => s.draft);
  const [tech, setTech] = useState<ZeriTech>(VIEWS[0] ?? "黄历");
  const days = useMemo(() => (ready ? computeZeriDesk(draft, tech) : []), [draft, tech, ready]);
  return (
    <Screen title="择日">
      <Workbench
        canvas={
          <div>
            <p className="text-sm text-muted">从今日起二十一日，十技法各算一套。本机，不连网。</p>
            <ViewBar views={VIEWS} value={tech} onChange={(v) => setTech(v as ZeriTech)} />
            <div className="mt-4">
              <ZeriCalendar days={days} />
            </div>
          </div>
        }
        panel={
          <ul className="text-sm">
            {days.map((d) => (
              <li key={d.ymd} className="border-b border-line py-2.5">
                <div className="flex justify-between">
                  <span className="font-display">
                    {d.ymd.slice(5)} 周{d.week}
                  </span>
                  <span className={d.score >= 3 ? "text-cinnabar" : "text-muted"}>{d.note}</span>
                </div>
                <p className="mt-1 text-xs text-muted">{d.detail}</p>
              </li>
            ))}
          </ul>
        }
      />
    </Screen>
  );
}
