import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { BirthPanel } from "@/components/birth-form";
import { Interpret, Meta, Screen, Workbench } from "@/components/kit";
import { XiaoLiurenPalm } from "@/components/tech-boards";
import { computeXiaoLiuren } from "@/lib/horosa/modules";
import { useChartStore } from "@/lib/horosa/store";

export const Route = createFileRoute("/xiaoliuren")({ component: Page });

function Page() {
  const draft = useChartStore((s) => s.draft);
  const data = useMemo(() => computeXiaoLiuren(draft), [draft]);
  return (
    <Screen title="小六壬">
      <Workbench
        params={<BirthPanel submitLabel="排盘" />}
        canvas={
          <div>
            <Meta>{data.ganzhi}</Meta>
            <div className="mt-4">
              <XiaoLiurenPalm data={data} />
            </div>
            <p className="mt-6 text-sm leading-7 text-muted">{data.note}</p>
          </div>
        }
        panel={<Interpret kind="小六壬" summary={`月${data.month} 日${data.day} 时${data.hour}`} />}
      />
    </Screen>
  );
}