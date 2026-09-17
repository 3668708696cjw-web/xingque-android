import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { BirthPanel } from "@/components/birth-form";
import { NatalWheel } from "@/components/natal-wheel";
import { Block, Meta, Screen, Workbench } from "@/components/kit";
import { computeUranian } from "@/lib/horosa/uranian";
import { useChartStore } from "@/lib/horosa/store";

export const Route = createFileRoute("/uranian")({ component: Page });

function Page() {
  const draft = useChartStore((s) => s.draft);
  const u = useMemo(() => computeUranian(draft), [draft]);

  return (
    <Screen title="汉堡">
      <Workbench
        params={<BirthPanel />}
        canvas={
          <div>
            <NatalWheel chart={u.natal} modern />
            <Meta>九十度盘：黄经模 90。中点与本命、升顶、八颗天王星同盘。</Meta>
          </div>
        }
        panel={
          <div>
            <Block title="天王星">
              <ul>
                {u.bodies
                  .filter((b) => ["Cupido", "Hades", "Zeus", "Kronos", "Apollon", "Admetos", "Vulkanus", "Poseidon"].includes(b.key))
                  .map((b) => (
                    <li key={b.key} className="flex justify-between border-b border-line py-2 text-sm">
                      <span>{b.name}</span>
                      <span className="tabular-nums text-muted">
                        {b.dms} · {b.dial.toFixed(1)}°
                      </span>
                    </li>
                  ))}
              </ul>
            </Block>
            <Block title="中点">
              {u.midpoints.length ? (
                <ul>
                  {u.midpoints.slice(0, 18).map((m, i) => (
                    <li key={i} className="flex justify-between py-1.5 text-sm text-muted">
                      <span>
                        {m.a}/{m.b} = {m.hit}
                      </span>
                      <span className="tabular-nums">{m.orb}°</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">当前无紧中点。</p>
              )}
            </Block>
          </div>
        }
      />
    </Screen>
  );
}