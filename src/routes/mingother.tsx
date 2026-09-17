import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { BirthPanel } from "@/components/birth-form";
import { Block, Screen, Workbench } from "@/components/kit";
import { computeMingOther } from "@/lib/horosa/modules";
import { useChartStore } from "@/lib/horosa/store";

export const Route = createFileRoute("/mingother")({ component: Page });

function Page() {
  const draft = useChartStore((s) => s.draft);
  const data = useMemo(() => computeMingOther(draft), [draft]);
  return (
    <Screen title="演禽">
      <Workbench
        params={<BirthPanel />}
        canvas={
          <div className="grid gap-10 sm:grid-cols-3">
            <div>
              <p className="text-[11px] text-muted">年禽</p>
              <p className="mt-2 font-display text-5xl">{data.yanqin.year}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted">日禽</p>
              <p className="mt-2 font-display text-5xl">{data.yanqin.day}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted">时禽</p>
              <p className="mt-2 font-display text-5xl">{data.yanqin.hour}</p>
            </div>
          </div>
        }
        panel={
          <div>
            <Block title="一掌经">
              <p className="font-display text-2xl">{data.yizhang.palace}宫</p>
              <p className="mt-2 text-sm leading-7 text-muted">{data.yizhang.note}</p>
            </Block>
            <Block title="策天">
              <p className="font-display text-2xl">{data.cetian.star}</p>
              <p className="mt-2 text-sm leading-7 text-muted">{data.cetian.note}</p>
            </Block>
          </div>
        }
      />
    </Screen>
  );
}
