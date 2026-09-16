import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { BirthPanel } from "@/components/birth-form";
import { LiurenBoard } from "@/components/boards";
import { Interpret, Meta, PanelSections, Screen, Workbench } from "@/components/kit";
import { computeLiuren } from "@/lib/horosa/liuren";
import { useChartStore } from "@/lib/horosa/store";
import { ZHI } from "@/lib/horosa/types";

export const Route = createFileRoute("/liuren")({ component: Page });

function Page() {
  const draft = useChartStore((s) => s.draft);
  const data = useMemo(() => computeLiuren(draft), [draft]);
  return (
    <Screen title="六壬">
      <Workbench
        params={<BirthPanel submitLabel="排盘" />}
        canvas={
          <div>
            <Meta>
              {data.ganzhi} · 月将{data.yuejiang} · {data.jieqi} · {data.method}
            </Meta>
            <div className="mt-4">
              <LiurenBoard data={data} />
            </div>
          </div>
        }
        panel={
          <div>
            <PanelSections
              sections={[
                {
                  id: "天盘",
                  content: (
                    <ul className="text-sm">
                      {ZHI.map((z) => (
                        <li key={z} className="flex justify-between border-b border-line py-1.5">
                          <span>
                            {z} → {data.tianpan[z]}
                          </span>
                          <span className="text-muted">{data.generals[z]}</span>
                        </li>
                      ))}
                    </ul>
                  ),
                },
                {
                  id: "三传",
                  content: (
                    <div className="text-sm leading-7">
                      <p className="font-display text-2xl tracking-[0.3em]">{data.san.join(" ")}</p>
                      <p className="mt-3 text-muted">{data.method}</p>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        {data.sik.map((k) => (
                          <p key={k.name}>
                            {k.name} {k.upper} / {k.lower}
                          </p>
                        ))}
                      </div>
                    </div>
                  ),
                },
              ]}
            />
            <Interpret kind="大六壬" summary={`${data.method} 三传${data.san.join("")} 月将${data.yuejiang}`} />
          </div>
        }
      />
    </Screen>
  );
}
