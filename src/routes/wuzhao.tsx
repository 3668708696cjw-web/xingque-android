import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { BirthPanel } from "@/components/birth-form";
import { Interpret, Meta, Screen, Workbench } from "@/components/kit";
import { computeWuZhao } from "@/lib/horosa/modules";
import { useChartStore } from "@/lib/horosa/store";

export const Route = createFileRoute("/wuzhao")({ component: Page });

function Page() {
  const draft = useChartStore((s) => s.draft);
  const data = useMemo(() => computeWuZhao(draft), [draft]);
  return (
    <Screen title="五兆">
      <Workbench
        params={<BirthPanel submitLabel="起兆" />}
        canvas={
          <div>
            <Meta>{data.method}</Meta>
            <p className="mt-8 font-display text-6xl">{data.name}</p>
            <p className="mt-6 max-w-md text-[15px] leading-7 text-muted">{data.note}</p>
          </div>
        }
        panel={<Interpret kind="五兆" summary={`${data.name} ${data.note}`} />}
      />
    </Screen>
  );
}
