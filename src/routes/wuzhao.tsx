import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { BirthPanel } from "@/components/birth-form";
import { Interpret, Meta, Screen, Workbench } from "@/components/kit";
import { ResultHero } from "@/components/ops";
import { computeWuZhao } from "@/lib/horosa/modules";
import { useChartStore } from "@/lib/horosa/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/wuzhao")({ component: Page });

const ALL: { name: string; note: string }[] = [
  { name: "雨", note: "阴盛、湿滞、事体未明，宜缓。" },
  { name: "霁", note: "阴开、事明、宜决。" },
  { name: "蒙", note: "雾覆、信息不真，防欺。" },
  { name: "济", note: "得渡、有援、事可成。" },
  { name: "中", note: "得中、勿过、守常则吉。" },
];

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
            <div className="mt-6 grid grid-cols-5 gap-px bg-line">
              {ALL.map((z) => (
                <div
                  key={z.name}
                  className={cn("bg-bg py-6 text-center", z.name === data.name && "outline outline-1 outline-ink outline-offset-[-1px]")}
                >
                  <p className="font-display text-3xl">{z.name}</p>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <ResultHero title={data.name} note={data.note} />
            </div>
          </div>
        }
        panel={
          <div>
            <ul>
              {ALL.map((z) => (
                <li key={z.name} className={cn("border-b border-line py-3 text-sm", z.name === data.name ? "text-ink" : "text-muted")}>
                  <span className="font-display">{z.name}</span>
                  <span className="ml-3">{z.note}</span>
                </li>
              ))}
            </ul>
            <Interpret kind="五兆" summary={`${data.name} ${data.note}`} />
          </div>
        }
      />
    </Screen>
  );
}
