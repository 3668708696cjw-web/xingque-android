import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BirthPanel } from "@/components/birth-form";
import { NatalWheel } from "@/components/natal-wheel";
import { Chip, Meta, PanelSections, Screen, Workbench } from "@/components/kit";
import { computeNatal } from "@/lib/horosa/natal";
import { computeComposite, computeDavison, synastryHits } from "@/lib/horosa/synastry";
import { useChartStore } from "@/lib/horosa/store";
import { formatDMS } from "@/lib/horosa/types";

export const Route = createFileRoute("/synastry")({ component: Page });

type Mode = "比较" | "组合" | "时空中点";

function Page() {
  const charts = useChartStore((s) => s.charts);
  const partnerId = useChartStore((s) => s.partnerId);
  const setPartner = useChartStore((s) => s.setPartner);
  const draft = useChartStore((s) => s.draft);
  const [mode, setMode] = useState<Mode>("比较");
  const partner = charts.find((c) => c.id === partnerId);
  const a = useMemo(() => computeNatal(draft), [draft]);
  const b = useMemo(() => (partner ? computeNatal(partner) : null), [partner]);
  const hits = useMemo(() => (b ? synastryHits(a, b) : []), [a, b]);
  const composite = useMemo(() => (b ? computeComposite(a, b) : null), [a, b]);
  const davison = useMemo(() => (partner ? computeDavison(draft, partner) : null), [draft, partner]);
  const view = mode === "组合" ? composite : mode === "时空中点" ? davison : a;

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
          b && view ? (
            <div>
              <div className="-ml-3 mb-2 flex flex-wrap">
                {(["比较", "组合", "时空中点"] as Mode[]).map((m) => (
                  <Chip key={m} active={mode === m} onClick={() => setMode(m)}>
                    {m}
                  </Chip>
                ))}
              </div>
              <Meta>
                {mode === "比较" ? "内轮甲盘 · 外轮乙盘" : mode === "组合" ? "行星中点组合盘" : "时空中点 Davison"}
              </Meta>
              <div className="mt-3">
                <NatalWheel chart={view} outer={mode === "比较" ? b : undefined} modern={false} />
              </div>
            </div>
          ) : (
            <p className="mt-8 text-sm leading-7 text-muted">先保存两份命例，再选乙盘。比较、组合、时空中点会画在中间。</p>
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
