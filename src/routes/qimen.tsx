import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BirthPanel } from "@/components/birth-form";
import { QimenBoard } from "@/components/boards";
import { ViewBar } from "@/components/chart-kit";
import { Chip, Interpret, Meta, PanelSections, Screen, Workbench } from "@/components/kit";
import { viewsOf } from "@/lib/horosa/catalog";
import { computeQimen } from "@/lib/horosa/qimen";
import { useChartStore } from "@/lib/horosa/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/qimen")({ component: Page });

const VIEWS = viewsOf("/qimen");

function Page() {
  const draft = useChartStore((s) => s.draft);
  const [mode, setMode] = useState<"转盘" | "飞盘">("转盘");
  const [dingju, setDingju] = useState<"拆补" | "置闰">("拆补");
  const [view, setView] = useState(VIEWS[0] ?? "九宫");
  const data = useMemo(() => computeQimen(draft, { mode, dingju }), [draft, mode, dingju]);
  const fu = data.cells.find((c) => c.zhifu);
  const shi = data.cells.find((c) => c.zhishi);
  return (
    <Screen title="遁甲">
      <Workbench
        params={
          <div>
            <BirthPanel submitLabel="排盘" />
            <div className="-ml-3 mt-4 flex flex-wrap">
              <Chip active={mode === "转盘"} onClick={() => setMode("转盘")}>转盘</Chip>
              <Chip active={mode === "飞盘"} onClick={() => setMode("飞盘")}>飞盘</Chip>
              <Chip active={dingju === "拆补"} onClick={() => setDingju("拆补")}>拆补</Chip>
              <Chip active={dingju === "置闰"} onClick={() => setDingju("置闰")}>置闰</Chip>
            </div>
          </div>
        }
        canvas={
          <div>
            <ViewBar views={VIEWS} value={view} onChange={setView} />
            {view === "值符值使" ? (
              <div>
                <div className="mb-6 grid grid-cols-2 gap-2 bg-line">
                  <div className="bg-bg py-6 text-center">
                    <p className="text-[11px] tracking-wide text-muted">值符</p>
                    <p className="mt-2 font-display text-4xl">{data.zhifu}</p>
                    <p className="mt-2 text-sm text-muted">{fu?.name}宫</p>
                  </div>
                  <div className="bg-bg py-6 text-center">
                    <p className="text-[11px] tracking-wide text-muted">值使</p>
                    <p className="mt-2 font-display text-4xl">{data.zhishi}</p>
                    <p className="mt-2 text-sm text-muted">{shi?.name}宫</p>
                  </div>
                </div>
                <QimenBoard data={data} />
              </div>
            ) : view === "格局" ? (
              <div>
                <QimenBoard data={data} showGeju />
                {data.patterns.length ? (
                  <ul className="mt-6 grid gap-px bg-line sm:grid-cols-2">
                    {data.patterns.map((p, i) => (
                      <li key={p.name + p.palace + i} className="bg-bg px-4 py-4">
                        <p className="font-display text-lg text-cinnabar">{p.name}</p>
                        <p className="mt-1 text-xs text-muted">{p.palaceName}宫 · {p.note}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-6 text-sm text-muted">本局未见青龙返首、飞鸟跌穴等显格。</p>
                )}
              </div>
            ) : (
              <QimenBoard data={data} />
            )}
          </div>
        }
        panel={
          <div>
            <Meta>
              {data.jieqi} · {data.yang ? "阳" : "阴"}
              {data.ju}局 {data.yuan} · 值符{data.zhifu} 值使{data.zhishi}
            </Meta>
            <p className="mt-1 text-xs text-faint">
              {data.ganzhi} · 旬首{data.xunshou} · 空亡{data.kongwang} · {data.mode}
              {data.dingju}
            </p>
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
                      值符 {data.zhifu}，值使 {data.zhishi}。旬空 {data.kongwang}。
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
