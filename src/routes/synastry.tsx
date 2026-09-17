import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BirthPanel } from "@/components/birth-form";
import { NatalWheel } from "@/components/natal-wheel";
import { InfluenceGrid, ViewBar } from "@/components/chart-kit";
import { Meta, PanelSections, Screen, Workbench } from "@/components/kit";
import { viewsOf } from "@/lib/horosa/catalog";
import { computeNatal } from "@/lib/horosa/natal";
import { computeComposite, computeDavison, influenceHouses, marcusHits, synastryHits } from "@/lib/horosa/synastry";
import { useChartStore } from "@/lib/horosa/store";
import { formatDMS } from "@/lib/horosa/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/synastry")({ component: Page });

const VIEWS = viewsOf("/synastry");

function Page() {
  const charts = useChartStore((s) => s.charts);
  const partnerId = useChartStore((s) => s.partnerId);
  const setPartner = useChartStore((s) => s.setPartner);
  const draft = useChartStore((s) => s.draft);
  const [view, setView] = useState(VIEWS[0] ?? "比较");
  const partner = charts.find((c) => c.id === partnerId);
  const a = useMemo(() => computeNatal(draft), [draft]);
  const b = useMemo(() => (partner ? computeNatal(partner) : null), [partner]);
  const hits = useMemo(() => (b ? synastryHits(a, b) : []), [a, b]);
  const composite = useMemo(() => (b ? computeComposite(a, b) : null), [a, b]);
  const davison = useMemo(() => (partner ? computeDavison(draft, partner) : null), [draft, partner]);
  const influence = useMemo(() => (b ? influenceHouses(a, b) : []), [a, b]);
  const marcus = useMemo(() => (b ? marcusHits(a, b) : []), [a, b]);
  const wheel = view === "组合" ? composite : view === "时空中点" ? davison : a;

  return (
    <Screen title="合盘">
      <Workbench
        params={
          <div>
            <BirthPanel />
            <label className="mt-6 block">
              <span className="mb-1.5 block text-xs tracking-wide text-muted">乙盘</span>
              <select
                className="h-12 w-full border-0 border-b border-line bg-transparent text-[15px] outline-none"
                value={partnerId ?? ""}
                onChange={(e) => setPartner(e.target.value || null)}
              >
                <option value="">选择乙盘</option>
                {charts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name || "未名"}
                  </option>
                ))}
              </select>
            </label>
            <Meta>甲盘为当前命例。乙盘从已存命例中选。比较看双轮；组合取中点；时空中点用两人时间地点的中点再排一盘。</Meta>
          </div>
        }
        canvas={
          b && wheel ? (
            <div>
              <ViewBar views={VIEWS} value={view} onChange={setView} />
              <Meta>
                {view === "比较"
                  ? "内轮甲盘 · 外轮乙盘"
                  : view === "组合"
                    ? "行星中点组合盘"
                    : view === "时空中点"
                      ? "时空中点 Davison"
                      : view === "影响盘"
                        ? "乙星落入甲盘十二宫"
                        : "马克斯：甲乙互入宫，四角加分"}
              </Meta>
              <div className="mt-3">
                {view === "影响盘" ? (
                  <InfluenceGrid cells={influence} />
                ) : view === "马克斯" ? (
                  <div>
                    <InfluenceGrid cells={influence} />
                    <ul className="mt-4">
                      {marcus.map((m) => (
                        <li key={m.t} className={cn("flex justify-between border-b border-line py-2 text-sm", m.angular && "text-cinnabar")}>
                          <span>{m.t}</span>
                          <span className="text-muted">{m.angular ? "角宫" : `${m.house}宫`}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <NatalWheel chart={wheel} outer={view === "比较" ? b : undefined} modern={false} />
                )}
              </div>
            </div>
          ) : (
            <p className="mt-8 text-sm leading-7 text-muted">先保存两份命例，再选乙盘。比较、组合、时空中点、影响盘、马克斯会画在中间。</p>
          )
        }
        panel={
          b ? (
            <PanelSections
              sections={[
                {
                  id: "相位",
                  content: hits.length === 0 ? (
                    <p className="text-sm text-muted">4° 内无主要相位。</p>
                  ) : (
                    <ul>
                      {hits.map((h) => (
                        <li key={h.t} className={`flex justify-between border-b border-line py-2 text-sm ${h.hard ? "text-cinnabar" : "text-ink"}`}>
                          <span>{h.t}</span>
                          <span className="tabular-nums text-muted">{h.orb}°</span>
                        </li>
                      ))}
                    </ul>
                  ),
                },
                {
                  id: "组合轴",
                  content: composite ? (
                    <p className="text-sm leading-7 text-muted">
                      组合 ASC {formatDMS(composite.asc)} · MC {formatDMS(composite.mc)}
                    </p>
                  ) : null,
                },
                {
                  id: "时空中点",
                  content: davison ? (
                    <p className="text-sm leading-7 text-muted">
                      {davison.city} · ASC {formatDMS(davison.asc)} · MC {formatDMS(davison.mc)}
                    </p>
                  ) : null,
                },
                {
                  id: "马克斯",
                  content: marcus.length ? (
                    <ul>
                      {marcus.filter((m) => m.angular).map((m) => (
                        <li key={m.t} className="border-b border-line py-2 text-sm">
                          {m.t}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted">无角宫互入。</p>
                  ),
                },
              ]}
            />
          ) : (
            <p className="text-sm text-muted">比较相位会列在这里。</p>
          )
        }
      />
    </Screen>
  );
}
