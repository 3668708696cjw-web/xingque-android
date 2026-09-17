import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { BirthPanel } from "@/components/birth-form";
import { Interpret, Meta, Screen, Workbench } from "@/components/kit";
import { computeXiaoLiuren } from "@/lib/horosa/modules";
import { useChartStore } from "@/lib/horosa/store";

export const Route = createFileRoute("/xiaoliuren")({ component: Page });

function Page() {
  const draft = useChartStore((s) => s.draft);
  const data = useMemo(() => computeXiaoLiuren(draft), [draft]);
  const pal = [
    { k: "月", v: data.month },
    { k: "日", v: data.day },
    { k: "时", v: data.hour },
  ];
  return (
    <Screen title="小六壬">
      <Workbench
        params={<BirthPanel submitLabel="排盘" />}
        canvas={
          <div>
            <Meta>{data.ganzhi}</Meta>
            <div className="mt-8 grid grid-cols-3 gap-3">
              {pal.map((p) => (
                <div key={p.k} className="border-b border-line pb-4 text-center">
                  <p className="text-[11px] text-muted">{p.k}</p>
                  <p className="mt-2 font-display text-3xl">{p.v}</p>
                </div>
              ))}
            </div>
            <p className="mt-8 text-sm leading-7 text-muted">{data.note}</p>
          </div>
        }
        panel={<Interpret kind="小六壬" summary={`月${data.month} 日${data.day} 时${data.hour}`} />}
      />
    </Screen>
  );
}
