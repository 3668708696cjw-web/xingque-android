import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { BirthPanel } from "@/components/birth-form";
import { NatalWheel } from "@/components/natal-wheel";
import { Meta, Screen, Workbench } from "@/components/kit";
import { computeNatal, visiblePlanets } from "@/lib/horosa/natal";
import { useChartStore } from "@/lib/horosa/store";

export const Route = createFileRoute("/synastry")({ component: Page });

function Page() {
  const charts = useChartStore((s) => s.charts);
  const partnerId = useChartStore((s) => s.partnerId);
  const setPartner = useChartStore((s) => s.setPartner);
  const draft = useChartStore((s) => s.draft);
  const partner = charts.find((c) => c.id === partnerId);
  const a = useMemo(() => computeNatal(draft), [draft]);
  const b = useMemo(() => (partner ? computeNatal(partner) : null), [partner]);
  const hits = useMemo(() => {
    if (!b) return [];
    const out: { t: string; hard: boolean }[] = [];
    const pa = visiblePlanets(a, false);
    const pb = visiblePlanets(b, false);
    pa.forEach((p1) => {
      pb.forEach((p2) => {
        const d = Math.abs(p1.lon - p2.lon);
        const sep = Math.min(d, 360 - d);
        for (const [ang, name, hard] of [
          [0, "合", false],
          [60, "六合", false],
          [90, "刑", true],
          [120, "三合", false],
          [180, "冲", true],
        ] as const) {
          if (Math.abs(sep - ang) < 4) out.push({ t: `${p1.name} ${name} ${p2.name}`, hard });
        }
      });
    });
    return out.slice(0, 24);
  }, [a, b]);

  return (
    <Screen title="合盘">
      <Workbench
        params={
          <div>
            <BirthPanel />
            <label className="mt-6 block">
              <span className="mb-1.5 block text-xs tracking-wide text-muted">乙盘</span>
              <select
                className="h-11 w-full border-0 border-b border-line bg-transparent text-[15px] outline-none"
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
            <Meta>甲盘为当前命例。乙盘从已存命例中选。</Meta>
          </div>
        }
        canvas={
          b ? (
            <div>
              <Meta>内轮甲盘 · 外轮乙盘</Meta>
              <NatalWheel chart={a} outer={b} modern={false} />
            </div>
          ) : (
            <p className="mt-8 text-sm text-muted">先保存两份命例，再选乙盘。双轮会画在中间。</p>
          )
        }
        panel={
          b ? (
            <ul>
              {hits.length === 0 ? (
                <p className="text-sm text-muted">4° 内无主要相位。</p>
              ) : (
                hits.map((h) => (
                  <li key={h.t} className={`border-b border-line py-2 text-sm ${h.hard ? "text-cinnabar" : "text-ink"}`}>
                    {h.t}
                  </li>
                ))
              )}
            </ul>
          ) : (
            <p className="text-sm text-muted">比较相位会列在这里。</p>
          )
        }
      />
    </Screen>
  );
}
