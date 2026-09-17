import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BirthPanel } from "@/components/birth-form";
import { ViewBar } from "@/components/chart-kit";
import { Fold, Screen, Workbench } from "@/components/kit";
import { JinKouKoujue, JinKouSiwei, JinKouYuejiang } from "@/components/tech-boards";
import { viewsOf } from "@/lib/horosa/catalog";
import { computeJinkou } from "@/lib/horosa/jinkou";
import { useChartStore } from "@/lib/horosa/store";

export const Route = createFileRoute("/jinkou")({ component: Page });

const VIEWS = viewsOf("/jinkou");

function Page() {
  const draft = useChartStore((s) => s.draft);
  const data = useMemo(() => computeJinkou(draft), [draft]);
  const [view, setView] = useState(VIEWS[0] ?? "四位");
  return (
    <Screen title="金口">
      <Workbench
        params={<BirthPanel submitLabel="起四位" />}
        canvas={
          <div>
            <ViewBar views={VIEWS} value={view} onChange={setView} />
            {view === "月将" ? (
              <JinKouYuejiang data={data} />
            ) : view === "口诀" ? (
              <JinKouKoujue data={data} />
            ) : (
              <JinKouSiwei data={data} />
            )}
          </div>
        }
        panel={
          <Fold title="口诀" defaultOpen>
            {data.notes.map((n) => (
              <p key={n} className="py-1.5 text-sm leading-7">
                {n}
              </p>
            ))}
          </Fold>
        }
      />
    </Screen>
  );
}
