import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BirthPanel } from "@/components/birth-form";
import { Kv, ResultHero } from "@/components/ops";
import { QuietTabs, Screen, Workbench } from "@/components/kit";
import { computeShushu } from "@/lib/horosa/shushu";
import { useChartStore } from "@/lib/horosa/store";

export const Route = createFileRoute("/shushu")({ component: Page });

const TABS = ["皇极", "梅花", "河洛", "铁板", "神易", "演禽"] as const;

function Page() {
  const draft = useChartStore((s) => s.draft);
  const data = useMemo(() => computeShushu(draft), [draft]);
  const [tab, setTab] = useState<(typeof TABS)[number]>("皇极");
  return (
    <Screen title="数算">
      <Workbench
        params={<BirthPanel />}
        canvas={
          <div>
            <QuietTabs tabs={[...TABS]} value={tab} onChange={(v) => setTab(v as (typeof TABS)[number])} />
            {tab === "皇极" ? (
              <div>
                <ResultHero kicker="皇极经世" title={data.huangji.gua} note={`${data.huangji.yuan} ${data.huangji.hui} ${data.huangji.yun} 第${data.huangji.shi.replace("第", "")}`} />
                <div className="mt-8">
                  <Kv k="元" v={data.huangji.yuan} />
                  <Kv k="会" v={data.huangji.hui} />
                  <Kv k="运" v={data.huangji.yun} />
                  <Kv k="世" v={data.huangji.shi} />
                  <Kv k="当运卦气" v={data.huangji.gua} />
                </div>
              </div>
            ) : null}
            {tab === "梅花" ? (
              <ResultHero kicker={data.meihua.method} title={data.meihua.name} note={`变 ${data.meihua.changeName}`} />
            ) : null}
            {tab === "河洛" ? (
              <div>
                <ResultHero kicker="河洛理数" title={String(data.heluo.xiantian)} note={data.heluo.note} />
                <div className="mt-8">
                  <Kv k="先天" v={String(data.heluo.xiantian)} />
                  <Kv k="后天" v={String(data.heluo.houtian)} />
                  <Kv k="合数" v={data.heluo.he} />
                </div>
              </div>
            ) : null}
            {tab === "铁板" ? (
              <ResultHero kicker={`铁板神数 第 ${data.tieban.no} 数`} title={`第 ${data.tieban.no}`} note={data.tieban.ci} />
            ) : null}
            {tab === "神易" ? (
              <ResultHero kicker={`第 ${data.shenyi.number} 卦`} title={data.shenyi.gua} note={data.shenyi.note} />
            ) : null}
            {tab === "演禽" ? (
              <div>
                <div className="grid grid-cols-4 gap-3 text-center">
                  {[
                    ["年", data.yanqin.year],
                    ["月", data.yanqin.month],
                    ["日", data.yanqin.day],
                    ["时", data.yanqin.hour],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <p className="text-[11px] text-muted">{k}</p>
                      <p className="mt-2 font-display text-4xl">{v}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-sm leading-7 text-muted">{data.yanqin.note}</p>
                <p className="mt-4 text-sm text-muted">一掌经 {data.yizhang.palm}宫 · {data.yizhang.note}</p>
              </div>
            ) : null}
          </div>
        }
        panel={
          <p className="text-sm leading-7 text-muted">
            皇极看元会运世，梅花用时间起卦，河洛用先天后天合数，铁板一百二十数，神易积数入六十四卦。演禽与一掌经同参。全部本机推演。
          </p>
        }
      />
    </Screen>
  );
}
