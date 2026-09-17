import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BirthPanel } from "@/components/birth-form";
import { SiXiangBoard, ViewBar } from "@/components/chart-kit";
import { Fold, Meta, Screen, Workbench } from "@/components/kit";
import { XiuRing } from "@/components/tech-boards";
import { viewsOf } from "@/lib/horosa/catalog";
import { computeQizheng } from "@/lib/horosa/qizheng";
import { XIU28 } from "@/lib/horosa/stars";
import { useChartStore } from "@/lib/horosa/store";

export const Route = createFileRoute("/xiu")({ component: Page });

const VIEWS = viewsOf("/xiu");
const SIXIANG = ["东方苍龙", "北方玄武", "西方白虎", "南方朱雀"];

function Page() {
  const draft = useChartStore((s) => s.draft);
  const data = useMemo(() => computeQizheng(draft), [draft]);
  const [view, setView] = useState(VIEWS[0] ?? "二十八宿环");
  const groups = SIXIANG.map((name) => ({
    name,
    items: XIU28.filter((x) => x.palace === name).map((x) => ({ name: x.name, animal: x.animal })),
  }));
  const moonXiu = data.list.find((x) => x.name === "月亮")?.xiu ?? data.mingdu.xiu;
  return (
    <Screen title="宿盘">
      <Workbench
        params={<BirthPanel />}
        canvas={
          <div>
            <Meta>
              命度 {data.mingdu.xiu} · 身度 {data.shendu.xiu} · 日 {data.list.find((x) => x.name === "太阳")?.xiu}
            </Meta>
            <ViewBar views={VIEWS} value={view} onChange={setView} />
            <div className="mt-3">
              {view === "四象" ? (
                <SiXiangBoard groups={groups} current={moonXiu} />
              ) : view === "入宿" ? (
                <ul>
                  {data.list.map((p) => (
                    <li key={p.name} className="flex justify-between border-b border-line py-3 text-sm">
                      <span>
                        {p.glyph} {p.name}
                      </span>
                      <span className="font-display text-lg">{p.xiu}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <XiuRing items={data.list} />
              )}
            </div>
          </div>
        }
        panel={
          <div>
            <Fold title="入宿" defaultOpen>
              {data.list.map((p) => (
                <div key={p.name} className="flex justify-between border-b border-line py-2 text-sm">
                  <span>
                    {p.glyph} {p.name}
                  </span>
                  <span className="text-muted">{p.xiu}</span>
                </div>
              ))}
            </Fold>
            <Fold title="二十八宿">
              {XIU28.map((x) => (
                <p key={x.name} className="flex justify-between border-b border-line py-2 text-xs">
                  <span>
                    {x.name} · {x.animal}
                  </span>
                  <span className="text-muted">{x.palace.replace("东方", "").replace("北方", "").replace("西方", "").replace("南方", "")}</span>
                </p>
              ))}
            </Fold>
          </div>
        }
      />
    </Screen>
  );
}
