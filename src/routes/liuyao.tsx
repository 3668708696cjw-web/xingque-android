import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BirthPanel } from "@/components/birth-form";
import { LiuyaoBoard } from "@/components/boards";
import { ViewBar } from "@/components/chart-kit";
import { Ghost, Interpret, Meta, PanelSections, Primary, Screen, Workbench } from "@/components/kit";
import { viewsOf } from "@/lib/horosa/catalog";
import { guaText } from "@/lib/horosa/iching";
import { computeLiuyaoFromCoins, computeLiuyaoTime, throwCoins, type LiuYaoResult } from "@/lib/horosa/liuyao";
import { useChartStore } from "@/lib/horosa/store";

export const Route = createFileRoute("/liuyao")({ component: Page });

const VIEWS = viewsOf("/liuyao");

function Page() {
  const draft = useChartStore((s) => s.draft);
  const timed = useMemo(() => computeLiuyaoTime(draft), [draft]);
  const [coins, setCoins] = useState<LiuYaoResult | null>(null);
  const [view, setView] = useState(VIEWS[0] ?? "本卦");
  const data = coins ?? timed;
  return (
    <Screen title="六爻">
      <Workbench
        params={
          <div>
            <BirthPanel submitLabel="记下时间" />
            <div className="mt-6 space-y-3">
              <Primary type="button" onClick={() => setCoins(computeLiuyaoFromCoins(throwCoins(), draft))}>
                摇卦
              </Primary>
              <Ghost type="button" onClick={() => setCoins(null)}>
                时间卦
              </Ghost>
            </div>
          </div>
        }
        canvas={
          <div>
            <ViewBar views={VIEWS} value={view} onChange={setView} />
            <p className="font-display text-2xl">{view === "变卦" ? data.changeName : data.name}</p>
            <Meta>
              {data.method} · 之 {data.changeName} · 互 {data.huName} · {data.day}日
            </Meta>
            {guaText(data.name) && view === "本卦" ? (
              <p className="mt-3 text-sm leading-7 text-muted">{guaText(data.name)!.ci}</p>
            ) : null}
            <div className="mt-6">
              <LiuyaoBoard data={data} view={view} />
            </div>
          </div>
        }
        panel={
          <div>
            <PanelSections
              sections={[
                {
                  id: "六爻",
                  content: (
                    <ul className="text-sm">
                      {[...data.lines].reverse().map((l) => (
                        <li key={l.pos} className="flex justify-between border-b border-line py-2">
                          <span>
                            {l.pos}爻 {l.yang ? "阳" : "阴"}
                            {l.changing ? " 动" : ""} {l.shi ? "世" : ""}
                            {l.ying ? "应" : ""}
                          </span>
                          <span className="text-muted">
                            {l.shen} {l.qin} {l.najia}
                            {l.fu ? ` 伏${l.fu}` : ""}
                            {l.yuepo ? " 破" : ""}
                            {l.xunkong ? " 空" : ""}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ),
                },
                {
                  id: "互卦",
                  content: (
                    <p className="text-sm leading-7 text-muted">
                      本卦 {data.name}，之卦 {data.changeName}，互卦 {data.huName}。
                      {data.lines.filter((l) => l.changing).length
                        ? `动爻 ${data.lines.filter((l) => l.changing).map((l) => l.pos).join("、")}。`
                        : "无动爻。"}
                    </p>
                  ),
                },
              ]}
            />
            <Interpret kind="六爻" summary={`${data.name} 之 ${data.changeName} 互${data.huName} ${data.lines.filter((l) => l.changing).map((l) => l.pos + "爻动").join(" ")}`} />
          </div>
        }
      />
    </Screen>
  );
}
