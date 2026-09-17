import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BirthPanel } from "@/components/birth-form";
import { NatalWheel } from "@/components/natal-wheel";
import { Chip, Meta, Screen, Workbench } from "@/components/kit";
import { computeJieqi } from "@/lib/horosa/modules";
import { useChartStore } from "@/lib/horosa/store";

export const Route = createFileRoute("/jieqi")({ component: Page });

function Page() {
  const draft = useChartStore((s) => s.draft);
  const charts = useMemo(() => computeJieqi(draft), [draft]);
  const [i, setI] = useState(0);
  const cur = charts[i] ?? charts[0];
  return (
    <Screen title="分至">
      <Workbench
        params={<BirthPanel />}
        canvas={
          cur ? (
            <div>
              <div className="-ml-3 mb-2 flex flex-wrap">
                {charts.map((c, n) => (
                  <Chip key={c.name} active={n === i} onClick={() => setI(n)}>
                    {c.name}
                  </Chip>
                ))}
              </div>
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
