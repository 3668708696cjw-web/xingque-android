import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { BirthPanel } from "@/components/birth-form";
import { Block, Screen, Workbench } from "@/components/kit";
import { computeShushu } from "@/lib/horosa/shushu";
import { useChartStore } from "@/lib/horosa/store";

export const Route = createFileRoute("/shushu")({ component: Page });

function Page() {
  const draft = useChartStore((s) => s.draft);
  const data = useMemo(() => computeShushu(draft), [draft]);
  return (
    <Screen title="数算">
      <Workbench
        params={<BirthPanel />}
        canvas={
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="border-b border-line pb-6">
              <p className="text-[11px] tracking-wide text-muted">皇极经世</p>
              <p className="mt-3 font-display text-2xl">
                {data.huangji.yuan} {data.huangji.hui}
              </p>
              <p className="mt-1 font-display text-xl text-muted">
                {data.huangji.yun} {data.huangji.shi}
              </p>
              <p className="mt-3 text-sm text-muted">当运卦气 {data.huangji.gua}</p>
            </div>
            <div className="border-b border-line pb-6">
              <p className="text-[11px] tracking-wide text-muted">梅花</p>
              <p className="mt-3 font-display text-2xl">{data.meihua.name}</p>
              <p className="mt-1 text-muted">→ {data.meihua.changeName}</p>
            </div>
            <div className="border-b border-line pb-6">
              <p className="text-[11px] tracking-wide text-muted">河洛</p>
              <p className="mt-3 font-display text-xl">
                先天 {data.heluo.xiantian}
              </p>
              <p className="mt-1 font-display text-xl">后天 {data.heluo.houtian}</p>
              <p className="mt-2 text-sm text-muted">{data.heluo.he}</p>
              <p className="mt-1 text-sm text-muted">{data.heluo.note}</p>
            </div>
            <div className="border-b border-line pb-6">
              <p className="text-[11px] tracking-wide text-muted">铁板</p>
              <p className="mt-3 font-display text-3xl">第 {data.tieban.no} 数</p>
              <p className="mt-2 text-sm text-muted">{data.tieban.ci}</p>
            </div>
            <div className="border-b border-line pb-6">
              <p className="text-[11px] tracking-wide text-muted">神易数</p>
              <p className="mt-3 font-display text-2xl">{data.shenyi.gua}</p>
              <p className="mt-2 text-sm text-muted">
                第 {data.shenyi.number} 卦 · {data.shenyi.note}
              </p>
            </div>
          </div>
        }
        panel={
          <div>
            <Block title="演禽">
              <p className="text-sm">
                年{data.yanqin.year} 月{data.yanqin.month} 日{data.yanqin.day} 时{data.yanqin.hour}
              </p>
            </Block>
            <Block title="一掌经">
              <p className="font-display text-xl">{data.yizhang.palm}宫</p>
              <p className="mt-2 text-sm text-muted">{data.yizhang.note}</p>
            </Block>
          </div>
        }
      />
    </Screen>
  );
}
