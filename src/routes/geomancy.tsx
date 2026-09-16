import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GeomancyShield } from "@/components/boards";
import { Ghost, Screen, Workbench } from "@/components/kit";
import { computeGeomancy, type GeomancyResult } from "@/lib/horosa/geomancy";

export const Route = createFileRoute("/geomancy")({ component: Page });

function Page() {
  const [data, setData] = useState<GeomancyResult | null>(null);
  return (
    <Screen title="地占">
      <Workbench
        params={
          <Ghost type="button" onClick={() => setData(computeGeomancy())}>
            起盾牌盘
          </Ghost>
        }
        canvas={data ? <GeomancyShield data={data} /> : <p className="text-sm text-muted">起盘后绘出四母、四女、四甥与判官。</p>}
        panel={
          data ? (
            <div className="text-sm leading-7">
              <p className="font-display text-xl">{data.judge.name}</p>
              <p className="mt-2 text-muted">
                {data.judge.planet} · {data.judge.house}
              </p>
              <p className="mt-4 text-muted">
                证人 {data.witnesses.map((w) => w.name.split(" ")[0]).join(" / ")}
                <br />
                调和 {data.recon.name.split(" ")[0]}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted">十六图形按地占盾牌盘排列。</p>
          )
        }
      />
    </Screen>
  );
}
