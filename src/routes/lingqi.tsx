import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BirthPanel } from "@/components/birth-form";
import { Ghost, Interpret, Primary, Screen, Workbench } from "@/components/kit";
import { LingqiStones } from "@/components/tech-boards";
import { throwLingqi } from "@/lib/horosa/modules";
import { useChartStore } from "@/lib/horosa/store";

export const Route = createFileRoute("/lingqi")({ component: Page });

function Page() {
  const draft = useChartStore((s) => s.draft);
  const [nudge, setNudge] = useState(0);
  const seed = draft.year * 10000 + draft.month * 100 + draft.day + draft.hour + nudge * 29;
  const data = useMemo(() => throwLingqi(seed), [seed]);
  return (
    <Screen title="灵棋">
      <Workbench
        params={
          <div className="space-y-3">
            <BirthPanel submitLabel="记下时间" />
            <Primary type="button" onClick={() => setNudge((n) => n + 1)}>
              掷棋
            </Primary>
            <Ghost type="button" onClick={() => setNudge(0)}>
              时间棋
            </Ghost>
          </div>
        }
        canvas={<LingqiStones data={data} />}
        panel={<Interpret kind="灵棋经" summary={`${data.name} ${data.ci}`} />}
      />
    </Screen>
  );
}
