import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { BirthPanel } from "@/components/birth-form";
import { FengshuiLuopan } from "@/components/boards";
import { Fold, Meta, Screen, Workbench } from "@/components/kit";
import { computeFengshui } from "@/lib/horosa/fengshui";
import { useChartStore } from "@/lib/horosa/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/fengshui")({ component: Page });

function Page() {
  const draft = useChartStore((s) => s.draft);
  const data = useMemo(() => computeFengshui(draft), [draft]);
  return (
    <Screen title="风水">
      <Workbench
        params={<BirthPanel />}
        canvas={
          <div>
            <Meta>
              {data.mingGua}卦 · {data.group} · {data.yuan}
            </Meta>
            <FengshuiLuopan data={data} />
          </div>
        }
        panel={
          <div>
            <Fold title="大游年" defaultOpen>
              {data.sitting.map((s) => (
                <div key={s.name} className="flex justify-between border-b border-line py-2 text-sm">
                  <span className={cn(data.lucky.includes(s.name) && "text-cinnabar")}>
                    {s.name} · {s.kind}
                  </span>
                  <span className="max-w-[50%] text-right text-xs text-muted">{s.note}</span>
                </div>
              ))}
            </Fold>
            <Fold title="紫白飞星" badge={`${data.yun}运`}>
              <div className="grid grid-cols-3 gap-px bg-line text-center text-sm">
                {data.feixing.map((f) => (
                  <div key={f.palace} className="bg-bg py-3">
                    <div className="text-[11px] text-muted">{f.palace}</div>
                    <div className="font-display text-lg">{f.star}</div>
                  </div>
                ))}
              </div>
            </Fold>
            <Fold title="三合">
              <p className="text-sm leading-7 text-muted">{data.sanhe.note}</p>
            </Fold>
            <Fold title="门派">
              {data.schools.map((s) => (
                <div key={s.name} className="border-b border-line py-2">
                  <div className="flex justify-between text-sm">
                    <span>{s.name}</span>
                    <span className="text-muted">{s.kind}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted">{s.note}</p>
                </div>
              ))}
            </Fold>
          </div>
        }
      />
    </Screen>
  );
}
