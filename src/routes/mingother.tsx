import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { BirthPanel } from "@/components/birth-form";
import { Block, Screen, Workbench } from "@/components/kit";
import { Kv } from "@/components/ops";
import { computeMingOther } from "@/lib/horosa/modules";
import { useChartStore } from "@/lib/horosa/store";

export const Route = createFileRoute("/mingother")({ component: Page });

function Page() {
  const draft = useChartStore((s) => s.draft);
  const data = useMemo(() => computeMingOther(draft), [draft]);
  return (
    <Screen title="演禽">
      <Workbench
        params={<BirthPanel />}
        canvas={
          <div className="grid grid-cols-4 gap-3 text-center">
            {[
              ["年禽", data.yanqin.year],
              ["月禽", data.yanqin.month],
              ["日禽", data.yanqin.day],
              ["时禽", data.yanqin.hour],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-[11px] text-muted">{k}</p>
                <p className="mt-2 font-display text-5xl">{v}</p>
              </div>
            ))}
          </div>
        }
        panel={
          <div>
            <Block title="一掌经">
              <p className="font-display text-2xl">{data.yizhang.palace}宫</p>
              <p className="mt-2 text-sm leading-7 text-muted">{data.yizhang.note}</p>
              <div className="mt-3">
                <Kv k="年干" v={data.yizhang.gan} />
                <Kv k="落宫" v={data.yizhang.palace} />
              </div>
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
