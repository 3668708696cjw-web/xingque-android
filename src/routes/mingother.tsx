import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BirthPanel } from "@/components/birth-form";
import { CetianBoard, ViewBar } from "@/components/chart-kit";
import { Block, Screen, Workbench } from "@/components/kit";
import { Kv } from "@/components/ops";
import { YanqinWheel, YizhangPalm } from "@/components/tech-boards";
import { viewsOf } from "@/lib/horosa/catalog";
import { computeMingOther } from "@/lib/horosa/modules";
import { useChartStore } from "@/lib/horosa/store";

export const Route = createFileRoute("/mingother")({ component: Page });

const VIEWS = viewsOf("/mingother");

function Page() {
  const draft = useChartStore((s) => s.draft);
  const data = useMemo(() => computeMingOther(draft), [draft]);
  const [view, setView] = useState(VIEWS[0] ?? "十二禽");
  return (
    <Screen title="演禽">
      <Workbench
        params={<BirthPanel />}
        canvas={
          <div>
            <ViewBar views={VIEWS} value={view} onChange={setView} />
            {view === "一掌经" ? (
              <div>
                <YizhangPalm palace={data.yizhang.palace} />
                <p className="mt-4 text-center font-display text-3xl">{data.yizhang.palace}宫</p>
                <p className="mt-2 text-center text-sm text-muted">{data.yizhang.note}</p>
              </div>
            ) : view === "策天十二宫" ? (
              <CetianBoard palaces={data.cetian.palaces} star={data.cetian.star} />
            ) : (
              <div>
                <YanqinWheel year={data.yanqin.year} month={data.yanqin.month} day={data.yanqin.day} hour={data.yanqin.hour} label={data.cetian.star} />
                <div className="mt-6 grid grid-cols-4 gap-3 text-center">
                  {[
                    ["年禽", data.yanqin.year],
                    ["月禽", data.yanqin.month],
                    ["日禽", data.yanqin.day],
                    ["时禽", data.yanqin.hour],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <p className="text-[11px] text-muted">{k}</p>
                      <p className="mt-1 font-display text-2xl">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        }
        panel={
          <div>
            <Block title="一掌经">
              <Kv k="年干" v={data.yizhang.gan} />
              <Kv k="落宫" v={data.yizhang.palace} />
              <p className="mt-2 text-sm leading-7 text-muted">{data.yizhang.note}</p>
            </Block>
            <Block title="策天">
              <p className="font-display text-2xl">{data.cetian.star}</p>
              <p className="mt-2 text-sm leading-7 text-muted">{data.cetian.note}</p>
            </Block>
          </div>
        }
      />
    </Screen>
  );
}
