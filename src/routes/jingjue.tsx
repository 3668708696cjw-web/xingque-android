import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { BirthPanel } from "@/components/birth-form";
import { Interpret, Meta, Screen, Workbench } from "@/components/kit";
import { JingJueBoard } from "@/components/tech-boards";
import { computeJingJue } from "@/lib/horosa/modules";
import { useChartStore } from "@/lib/horosa/store";

export const Route = createFileRoute("/jingjue")({ component: Page });

function Page() {
  const draft = useChartStore((s) => s.draft);
  const data = useMemo(() => computeJingJue(draft), [draft]);
  return (
    <Screen title="荆诀">
      <Workbench
        params={<BirthPanel submitLabel="起卦" />}
        canvas={
          <div>
            <JingJueBoard data={data} />
            <Meta>{data.note}</Meta>
          </div>
        }
        panel={<Interpret kind="荆诀" summary={data.note} />}
      />
    </Screen>
  );
}