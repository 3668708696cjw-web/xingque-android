import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { BirthPanel } from "@/components/birth-form";
import { NatalWheel } from "@/components/natal-wheel";
import { Fold, Meta, Screen, Workbench } from "@/components/kit";
import { computeQizheng } from "@/lib/horosa/qizheng";
import { useChartStore } from "@/lib/horosa/store";

export const Route = createFileRoute("/qizheng")({ component: Page });

function Page() {
  const draft = useChartStore((s) => s.draft);
  const data = useMemo(() => computeQizheng(draft), [draft]);
  return (
    <Screen title="七政">
      <Workbench
        params={<BirthPanel />}
        canvas={
          <div>
            <Meta>
              七政四余 · 命度 {data.mingdu.xiu} · 身度 {data.shendu.xiu}
            </Meta>
            <NatalWheel chart={data.natal} modern={false} />
          </div>
        }
        panel={
          <div>
            <Fold title="七政" defaultOpen>
              {data.list
                .filter((e) => !["罗睺", "计都", "紫气", "月孛"].includes(e.name))
                .map((p) => (
                  <div key={p.name} className="flex justify-between border-b border-line py-2 text-sm">
                    <span>
                      {p.glyph} {p.name}
                    </span>
                    <span className="text-muted">
                      {p.xiu} · {p.dms}
                    </span>
                  </div>
                ))}
            </Fold>
            <Fold title="四余" defaultOpen>
              {data.extras.map((e) => (
                <div key={e.name} className="flex justify-between border-b border-line py-2 text-sm">
                  <span>
                    {e.glyph} {e.name}
                  </span>
                  <span className="text-muted">
                    {e.xiu} · {e.dms}
                  </span>
                </div>
              ))}
            </Fold>
            <Fold title="命身">
              <p className="text-sm">
                命度 {data.mingdu.dms} {data.mingdu.xiu}
              </p>
              <p className="mt-2 text-sm">
                身度 {data.shendu.dms} {data.shendu.xiu}
              </p>
            </Fold>
          </div>
        }
      />
    </Screen>
  );
}
