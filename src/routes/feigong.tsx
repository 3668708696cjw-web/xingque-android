import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { BirthPanel } from "@/components/birth-form";
import { Interpret, Meta, Screen, Workbench } from "@/components/kit";
import { FeiGongBoard } from "@/components/tech-boards";
import { computeFeiGong } from "@/lib/horosa/modules";
import { useChartStore } from "@/lib/horosa/store";

export const Route = createFileRoute("/feigong")({ component: Page });

function Page() {
  const draft = useChartStore((s) => s.draft);
  const data = useMemo(() => computeFeiGong(draft), [draft]);
  return (
    <Screen title="飞宫">
      <Workbench
        params={<BirthPanel submitLabel="排盘" />}
        canvas={
          <div>
            <Meta>
              {data.ju} · 值使 {data.zhiShi}
            </Meta>
            <div className="mt-4">
              <FeiGongBoard data={data} />
            </div>
          </div>
        }
        panel={<Interpret kind="飞宫小奇门" summary={`${data.ju} 值使${data.zhiShi}`} />}
      />
    </Screen>
  );
}