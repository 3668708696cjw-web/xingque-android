import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { BirthPanel } from "@/components/birth-form";
import { NatalWheel } from "@/components/natal-wheel";
import { Block, Screen, Workbench } from "@/components/kit";
import { computeParts } from "@/lib/horosa/parts";
import { useChartStore } from "@/lib/horosa/store";

export const Route = createFileRoute("/parts")({ component: Page });

function Page() {
  const draft = useChartStore((s) => s.draft);
  const data = useMemo(() => computeParts(draft), [draft]);
  return (
    <Screen title="辅盘">
      <Workbench
        params={<BirthPanel />}
        canvas={
          <div>
            <NatalWheel chart={data.natal} modern={false} />
          </div>
        }
        panel={
          <div>
            <Block title="阿拉伯点">
              {data.lots.map((l) => (
                <div key={l.name} className="flex justify-between border-b border-line py-2 text-sm">
                  <span>{l.name}</span>
                  <span className="text-muted">{l.dms}</span>
                </div>
              ))}
            </Block>
            <Block title="中点">
              {data.mids.slice(0, 14).map((m) => (
                <div key={m.pair} className="flex justify-between py-1.5 text-xs text-muted">
                  <span>{m.pair}</span>
                  <span>{m.dms}</span>
                </div>
              ))}
            </Block>
          </div>
        }
      />
    </Screen>
  );
}
