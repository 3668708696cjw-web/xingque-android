import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Planetarium } from "@/components/planetarium";
import { Block, Screen, Workbench } from "@/components/kit";
import { computeNatal, visiblePlanets } from "@/lib/horosa/natal";
import { nowAsBirth } from "@/lib/horosa/cities";
import { useChartStore } from "@/lib/horosa/store";
import { XIU28 } from "@/lib/horosa/stars";

export const Route = createFileRoute("/sky")({ component: Page });

function Page() {
  const cityId = useChartStore((s) => s.draft.cityId);
  const chart = useMemo(() => computeNatal(nowAsBirth(cityId)), [cityId]);
  const planets = visiblePlanets(chart, false);
  const [stars, setStars] = useState<{ name: string; mag: string }[]>([]);
  useEffect(() => {
    void fetch("/ephe/sefstars.txt")
      .then((r) => (r.ok ? r.text() : ""))
      .then((t) => {
        const rows = t
          .split("\n")
          .filter((l) => l && !l.startsWith("#") && !l.startsWith(","))
          .slice(0, 48)
          .map((l) => {
            const parts = l.split(",");
            return { name: (parts[0] || "").trim(), mag: (parts[13] || "").trim() };
          })
          .filter((s) => s.name);
        setStars(rows);
      })
      .catch(() => undefined);
  }, []);
  return (
    <Screen title="天文馆">
      <Workbench
        canvas={
          <div>
            <Planetarium cityId={cityId} />
            <p className="mt-3 text-xs text-faint">地平坐标，亮星与二十八宿距星按此刻此地高度绘出。南在下。</p>
          </div>
        }
        panel={
          <div>
            <Block title="行星">
              <ul>
                {planets.map((p) => (
                  <li key={p.key} className="flex justify-between border-b border-line py-2 text-sm">
                    <span>
                      {p.glyph} {p.name}
                    </span>
                    <span className="text-muted">{p.dms}</span>
                  </li>
                ))}
              </ul>
            </Block>
            <Block title="二十八宿">
              {XIU28.map((x) => (
                <p key={x.name} className="flex justify-between border-b border-line py-2 text-xs">
                  <span>
                    {x.name} · {x.animal}
                  </span>
                  <span className="text-muted">{x.palace.replace("苍龙", "").replace("玄武", "").replace("白虎", "").replace("朱雀", "")}</span>
                </p>
              ))}
            </Block>
            {stars.length ? (
              <Block title="Swiss 恒星">
                {stars.map((s) => (
                  <p key={s.name} className="flex justify-between border-b border-line py-1.5 text-xs">
                    <span>{s.name}</span>
                    <span className="text-muted">{s.mag}</span>
                  </p>
                ))}
              </Block>
            ) : null}
          </div>
        }
      />
    </Screen>
  );
}
