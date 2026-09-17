import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BirthPanel } from "@/components/birth-form";
import { NatalWheel } from "@/components/natal-wheel";
import { ViewBar } from "@/components/chart-kit";
import { Meta, Screen, Workbench } from "@/components/kit";
import { viewsOf } from "@/lib/horosa/catalog";
import { computeJieqi } from "@/lib/horosa/modules";
import { useChartStore } from "@/lib/horosa/store";

export const Route = createFileRoute("/jieqi")({ component: Page });

const VIEWS = viewsOf("/jieqi");

function Page() {
  const draft = useChartStore((s) => s.draft);
  const charts = useMemo(() => computeJieqi(draft), [draft]);
  const [view, setView] = useState(VIEWS[0] ?? "春分");
  const cur = charts.find((c) => c.name === view) ?? charts[0];
  return (
    <Screen title="分至">
      <Workbench
        params={<BirthPanel />}
        canvas={
          cur ? (
            <div>
              <ViewBar views={VIEWS} value={view} onChange={setView} />
              <Meta>
                {cur.name} {cur.date} 午时
              </Meta>
              <div className="mt-3">
                <NatalWheel chart={cur.natal} modern={false} />
              </div>
            </div>
          ) : null
        }
        panel={
          <ul className="text-sm">
            {charts.map((c) => (
              <li key={c.name} className="flex justify-between border-b border-line py-2">
                <span>{c.name}</span>
                <span className="text-muted">{c.date}</span>
              </li>
            ))}
          </ul>
        }
      />
    </Screen>
  );
}
