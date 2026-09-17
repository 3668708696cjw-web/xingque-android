import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { BirthPanel } from "@/components/birth-form";
import { Interpret, Meta, Screen, Workbench } from "@/components/kit";
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
            <p className="font-display text-4xl">{data.name}</p>
            <Meta>{data.note}</Meta>
            <ol className="mt-8 space-y-2 font-display text-xl">
              {[...data.lines].reverse().map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ol>
          </div>
        }
        panel={<Interpret kind="荆诀" summary={data.note} />}
      />
    </Screen>
  );
}
