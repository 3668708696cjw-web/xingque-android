import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BirthPanel } from "@/components/birth-form";
import { ViewBar } from "@/components/chart-kit";
import { TaiyiJinian, TaiyiPalaceBoard } from "@/components/tech-boards";
import { Fold, Interpret, Meta, Screen, Workbench } from "@/components/kit";
import { viewsOf } from "@/lib/horosa/catalog";
import { computeTaiyi } from "@/lib/horosa/taiyi";
import { useChartStore } from "@/lib/horosa/store";

export const Route = createFileRoute("/taiyi")({ component: Page });

const VIEWS = viewsOf("/taiyi");

function Page() {
  const draft = useChartStore((s) => s.draft);
  const data = useMemo(() => computeTaiyi(draft), [draft]);
  const [view, setView] = useState(VIEWS[0] ?? "九宫");
  return (
    <Screen title="太乙">
      <Workbench
        params={<BirthPanel submitLabel="入局" />}
        canvas={
          <div>
            <ViewBar views={VIEWS} value={view} onChange={setView} />
            {view === "十六神" ? (
              <TaiyiPalaceBoard data={data} mode="sixteen" />
            ) : view === "积年" ? (
              <TaiyiJinian data={data} />
            ) : (
              <TaiyiPalaceBoard data={data} mode="key" />
            )}
          </div>
        }
        panel={
          <div>
            <Meta>{data.note}</Meta>
            <Fold title="九宫" defaultOpen>
              <ul className="text-sm leading-7 text-muted">
                {data.cells.map((c) => (
                  <li key={c.palace} className="flex justify-between gap-2 border-b border-line py-2">
                    <span>
                      {c.name}
                      <span className="ml-2 text-[11px] text-faint">{c.men}</span>
                    </span>
                    <span className="max-w-[60%] text-right">{c.stars.slice(0, 3).join(" ") || "—"}</span>
                  </li>
                ))}
              </ul>
            </Fold>
            <Fold title="入局">
              <p className="text-sm leading-7">
                积年 {data.jinian} · {data.yang ? "阳" : "阴"}
                {data.ju}局 · {data.yuan}
                <br />
                天乙宫 {data.tianyimu} · 计神 {data.jishen} · 文昌 {data.wenchang} · 始击 {data.shiji}
                <br />
                合神 {data.heshen}
              </p>
            </Fold>
            <Interpret kind="太乙" summary={data.note} />
          </div>
        }
      />
    </Screen>
  );
}
