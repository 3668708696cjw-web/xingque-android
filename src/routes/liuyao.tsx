import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BirthPanel } from "@/components/birth-form";
import { LiuyaoBoard } from "@/components/boards";
import { Ghost, Interpret, Meta, PanelSections, Primary, Screen, Workbench } from "@/components/kit";
import { guaText } from "@/lib/horosa/iching";
import { computeLiuyaoFromCoins, computeLiuyaoTime, throwCoins, type LiuYaoResult } from "@/lib/horosa/liuyao";
import { useChartStore } from "@/lib/horosa/store";

export const Route = createFileRoute("/liuyao")({ component: Page });

function Page() {
  const draft = useChartStore((s) => s.draft);
  const [data, setData] = useState<LiuYaoResult | null>(null);
  return (
    <Screen title="六爻">
      <Workbench
        params={
          <div>
            <BirthPanel submitLabel="记下时间" />
            <div className="mt-6 space-y-3">
              <Primary type="button" onClick={() => setData(computeLiuyaoFromCoins(throwCoins(), draft))}>
                摇卦
              </Primary>
              <Ghost type="button" onClick={() => setData(computeLiuyaoTime(draft))}>
                时间卦
              </Ghost>
            </div>
          </div>
        }
        canvas={
          data ? (
            <div>
              <p className="font-display text-2xl">{data.name}</p>
              <Meta>
                {data.method} · 之 {data.changeName} · 互 {data.huName} · {data.day}日
              </Meta>
              {guaText(data.name) ? (
                <p className="mt-3 text-sm leading-7 text-muted">{guaText(data.name)!.ci}</p>
              ) : null}
              <div className="mt-6">
                <LiuyaoBoard data={data} />
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted">摇铜钱或用出生时间起卦。本卦、变卦、互卦会画在中间。</p>
          )
        }
        panel={
          data ? (
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
          ) : (
            <p className="text-sm text-muted">纳甲、六亲、六神、世应列在右侧；电脑端一次摊开。</p>
          )
        }
      />
    </Screen>
  );
}
