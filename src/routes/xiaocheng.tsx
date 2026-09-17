import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { BirthPanel } from "@/components/birth-form";
import { Interpret, Meta, Screen, Workbench } from "@/components/kit";
import { XiaoChengBoard } from "@/components/tech-boards";
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
            <div className="mt-4">
              <XiaoChengBoard data={data} />
            </div>
          </div>
        }
        panel={<Interpret kind="小成图" summary={data.note} />}
      />
    </Screen>
  );
}