import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BirthPanel } from "@/components/birth-form";
import { ViewBar } from "@/components/chart-kit";
import { GeomancyPyramid } from "@/components/tech-boards";
import { Ghost, Screen, Workbench } from "@/components/kit";
import { viewsOf } from "@/lib/horosa/catalog";
import { computeGeomancy } from "@/lib/horosa/geomancy";
import { useChartStore } from "@/lib/horosa/store";

export const Route = createFileRoute("/geomancy")({ component: Page });

const VIEWS = viewsOf("/geomancy");

function Page() {
  const draft = useChartStore((s) => s.draft);
  const [nudge, setNudge] = useState(0);
  const [view, setView] = useState(VIEWS[0] ?? "四母");
  const seed = draft.year * 10000 + draft.month * 100 + draft.day + draft.hour * 60 + draft.minute + nudge * 17;
  const data = useMemo(() => computeGeomancy(seed), [seed]);
  return (
    <Screen title="地占">
      <Workbench
        params={
          <div>
            <BirthPanel submitLabel="记下时间" />
            <Ghost type="button" className="mt-6" onClick={() => setNudge((n) => n + 1)}>
              再起盾牌
            </Ghost>
          </div>
        }
        canvas={
          <div>
            <ViewBar views={VIEWS} value={view} onChange={setView} />
            <GeomancyPyramid data={data} view={view} />
          </div>
        }
        panel={
          <div className="text-sm leading-7">
            <p className="font-display text-xl">{data.judge.name}</p>
            <p className="mt-2 text-muted">
              {data.judge.planet} · {data.judge.house}
            </p>
            <p className="mt-4 text-muted">
              证人 {data.witnesses.map((w) => w.name.split(" ")[0]).join(" / ")}
              <br />
              调和 {data.recon.name.split(" ")[0]}
            </p>
          </div>
        }
      />
    </Screen>
  );
}
