import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { BirthPanel } from "@/components/birth-form";
import { QimenBoard } from "@/components/boards";
import { Interpret, Meta, PanelSections, Screen, Workbench } from "@/components/kit";
import { computeQimen } from "@/lib/horosa/qimen";
import { useChartStore } from "@/lib/horosa/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/qimen")({ component: Page });

function Page() {
  const draft = useChartStore((s) => s.draft);
  const data = useMemo(() => computeQimen(draft), [draft]);
  return (
    <Screen title="奇门">
      <Workbench
        params={<BirthPanel submitLabel="排盘" />}
        canvas={
          <div>
            <Meta>
              {data.jieqi} · {data.yang ? "阳" : "阴"}
              {data.ju}局 {data.yuan} · 值符{data.zhifu} 值使{data.zhishi}
            </Meta>
            <p className="mt-1 text-xs text-faint">
              {data.ganzhi} · 旬首{data.xunshou} · 空亡{data.kongwang}
            </p>
            <div className="mt-3">
              <QimenBoard data={data} />
            </div>
          </div>
        }
        panel={
          <div>
            <PanelSections
              sections={[
                {
                  id: "九宫",
                  content: (
                    <ul className="text-sm leading-7">
                      {data.cells
                        .filter((c) => c.palace !== 5)
                        .map((c) => (
                          <li key={c.palace} className="flex justify-between gap-2 border-b border-line py-2">
                            <span>
                              {c.name} {c.god} {c.star}
                              {c.kong ? <span className="ml-1 text-cinnabar">空</span> : null}
                              {c.ma ? <span className="ml-1 text-cinnabar">马</span> : null}
                            </span>
                            <span className={cn("shrink-0 text-muted", c.menpo && "text-cinnabar")}>
                              {c.door} {c.tianGan}/{c.diGan}
                            </span>
                          </li>
                        ))}
                    </ul>
                  ),
                },
                {
                  id: "格局",
                  content: data.patterns.length ? (
                    <ul className="text-sm">
                      {data.patterns.map((p, i) => (
                        <li key={i} className="border-b border-line py-2">
                          <div className="flex justify-between">
                            <span className="text-cinnabar">{p.name}</span>
                            <span className="text-muted">{p.palaceName}宫</span>
                          </div>
                          <p className="mt-0.5 text-xs text-faint">{p.note}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm leading-7 text-muted">
                      值符 {data.zhifu}，值使 {data.zhishi}。旬空 {data.kongwang}。驿马在
                      {data.cells.find((c) => c.ma)?.name ?? "—"}宫。
                    </p>
                  ),
                },
              ]}
            />
            <Interpret
              kind="奇门遁甲"
              summary={`${data.yang ? "阳" : "阴"}${data.ju}局 值符${data.zhifu} 值使${data.zhishi} 空${data.kongwang} ${data.patterns.map((p) => p.name).join(" ")}`}
            />
          </div>
        }
      />
    </Screen>
  );
}
