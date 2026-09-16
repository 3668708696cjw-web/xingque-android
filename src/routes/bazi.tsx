import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { BirthPanel } from "@/components/birth-form";
import { BaziBoard } from "@/components/boards";
import { Interpret, Meta, PanelSections, Screen, Workbench } from "@/components/kit";
import { computeBazi } from "@/lib/horosa/bazi";
import { useChartStore } from "@/lib/horosa/store";
import { shiShen, wxClass } from "@/lib/horosa/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/bazi")({ component: Page });

function Page() {
  const draft = useChartStore((s) => s.draft);
  const data = useMemo(() => computeBazi(draft), [draft]);
  return (
    <Screen title="八字">
      <Workbench
        params={<BirthPanel />}
        canvas={
          <div>
            <Meta>
              {data.lunar} · {data.animal} · {data.dayMaster} · {data.strength} · {data.geju}
            </Meta>
            <p className="mt-1 text-xs text-faint">
              胎元 {data.taiyuan} · 命宫 {data.minggong} · 身宫 {data.shengong} · 用神{data.yongshen} 喜{data.xishen}{" "}
              忌{data.jishen}
            </p>
            <div className="mt-5">
              <BaziBoard data={data} />
            </div>
          </div>
        }
        panel={
          <div>
            <PanelSections
              sections={[
                {
                  id: "流年",
                  content: (
                    <ul>
                      {data.liunian.map((y) => (
                        <li
                          key={y.year}
                          className={cn("flex justify-between border-b border-line py-2 text-sm", y.current && "text-ink")}
                        >
                          <span>
                            <span className={y.current ? "font-display" : ""}>
                              {y.year} {y.ganzhi}
                            </span>
                            <span className={cn("ml-2 text-xs", wxClass(""))}>
                              {shiShen(data.pillars[2].gan, y.ganzhi[0] ?? "")}
                            </span>
                          </span>
                          <span className="tabular-nums text-muted">{y.age}岁</span>
                        </li>
                      ))}
                    </ul>
                  ),
                },
                {
                  id: "神煞",
                  content: data.shensha.length ? (
                    <ul className="text-sm">
                      {data.shensha.map((s, i) => (
                        <li key={i} className="flex justify-between border-b border-line py-2">
                          <span>{s.name}</span>
                          <span className="text-muted">{s.at}柱</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted">常见神煞未入四柱。</p>
                  ),
                },
                {
                  id: "用神",
                  content: (
                    <div className="space-y-2 text-sm leading-7 text-muted">
                      <p>
                        日主 {data.dayMaster}，五行得分以{data.dayWx}为自身，判为{data.strength}。
                      </p>
                      <p>
                        用神取 <span className={wxClass(data.yongshen)}>{data.yongshen}</span>，喜{" "}
                        <span className={wxClass(data.xishen)}>{data.xishen}</span>，忌{" "}
                        <span className={wxClass(data.jishen)}>{data.jishen}</span>。月令定格 {data.geju}。
                      </p>
                      {data.relations.length ? (
                        <p>四柱关系：{data.relations.map((r) => r.label).join("、")}。</p>
                      ) : (
                        <p>四柱无明显刑冲合害。</p>
                      )}
                    </div>
                  ),
                },
              ]}
            />
            <Interpret
              kind="八字"
              summary={
                data.pillars.map((p) => `${p.label}${p.gan}${p.zhi} ${p.shishenGan}`).join(" ") +
                ` ${data.geju} ${data.strength} 用${data.yongshen}`
              }
            />
          </div>
        }
      />
    </Screen>
  );
}
