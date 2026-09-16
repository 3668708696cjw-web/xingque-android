import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { BirthPanel } from "@/components/birth-form";
import { Fold, Screen, Workbench } from "@/components/kit";
import { computeJinkou } from "@/lib/horosa/jinkou";
import { useChartStore } from "@/lib/horosa/store";

export const Route = createFileRoute("/jinkou")({ component: Page });

function Page() {
  const draft = useChartStore((s) => s.draft);
  const data = useMemo(() => computeJinkou(draft), [draft]);
  return (
    <Screen title="金口">
      <Workbench
        params={<BirthPanel submitLabel="起四位" />}
        canvas={
          <div className="grid grid-cols-2 gap-6 text-center sm:grid-cols-5">
            {[
              ["地分", data.difen],
              ["月将", data.yuejiang],
              ["人元", data.renyuan],
              ["贵神", data.guishen],
              ["将", data.jiang],
            ].map(([k, v]) => (
              <div key={k} className="border-b border-line py-5">
                <div className="text-[11px] tracking-wide text-muted">{k}</div>
                <div className="mt-2 font-display text-3xl md:text-4xl">{v}</div>
              </div>
            ))}
          </div>
        }
        panel={
          <Fold title="口诀" defaultOpen>
            {data.notes.map((n) => (
              <p key={n} className="py-1.5 text-sm leading-7">
                {n}
              </p>
            ))}
          </Fold>
        }
      />
    </Screen>
  );
}
