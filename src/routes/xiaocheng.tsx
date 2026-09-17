import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { BirthPanel } from "@/components/birth-form";
import { Interpret, Meta, Screen, Workbench } from "@/components/kit";
import { computeXiaoCheng } from "@/lib/horosa/modules";
import { useChartStore } from "@/lib/horosa/store";

export const Route = createFileRoute("/xiaocheng")({ component: Page });

function Page() {
  const draft = useChartStore((s) => s.draft);
  const data = useMemo(() => computeXiaoCheng(draft), [draft]);
  return (
    <Screen title="小成图">
      <Workbench
        params={<BirthPanel submitLabel="排盘" />}
        canvas={
          <div>
            <Meta>{data.note}</Meta>
            <div className="mt-10 grid grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-[11px] text-muted">体</p>
                <p className="mt-2 font-display text-5xl">{data.ti}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted">用</p>
                <p className="mt-2 font-display text-5xl">{data.yong}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted">互</p>
                <p className="mt-2 font-display text-5xl text-muted">{data.hu}</p>
              </div>
            </div>
            <p className="mt-10 text-sm text-muted">动爻 第 {data.dong}</p>
          </div>
        }
        panel={<Interpret kind="小成图" summary={data.note} />}
      />
    </Screen>
  );
}
