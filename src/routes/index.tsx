import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { almanacOf } from "@/lib/horosa/almanac";
import { computeNatal } from "@/lib/horosa/natal";
import { nowAsBirth } from "@/lib/horosa/cities";
import { useChartStore } from "@/lib/horosa/store";
import { NatalWheel } from "@/components/natal-wheel";
import { Primary, useHydrated } from "@/components/kit";
import { dailyPick } from "@/lib/horosa/xuanshi";
import { birthLabel } from "@/lib/horosa/types";
import { useMemo } from "react";

export const Route = createFileRoute("/")({ component: Home });

const QUICK = [
  { to: "/natal", name: "占星" },
  { to: "/bazi", name: "八字" },
  { to: "/ziwei", name: "紫微" },
  { to: "/qimen", name: "奇门" },
  { to: "/liuyao", name: "六爻" },
  { to: "/almanac", name: "黄历" },
] as const;

function Home() {
  const ready = useHydrated();
  const draft = useChartStore((s) => s.draft);
  const setNow = useChartStore((s) => s.setNow);
  const saveDraft = useChartStore((s) => s.saveDraft);
  const loadChart = useChartStore((s) => s.loadChart);
  const charts = useChartStore((s) => s.charts);
  const nav = useNavigate();
  const now = ready ? new Date() : new Date(2026, 8, 17, 12, 0, 0);
  const a = almanacOf(now.getFullYear(), now.getMonth() + 1, now.getDate(), now.getHours(), now.getMinutes());
  const sky = useMemo(() => (ready ? computeNatal(nowAsBirth(draft.cityId)) : null), [draft.cityId, ready]);
  const daily = dailyPick(now);

  function goNow(to: "/natal" | "/bazi" | "/ziwei" | "/qimen") {
    setNow();
    saveDraft();
    nav({ to });
  }

  return (
    <main className="mx-auto max-w-5xl px-5 pb-16 pt-8 md:px-8 md:pt-12">
      <p className="text-xs tracking-wide text-muted">星阙 · 本地离线</p>
      <h1 className="mt-2 font-display text-4xl font-medium tracking-tight md:text-5xl">
        {now.getMonth() + 1} 月 {now.getDate()} 日
      </h1>
      <p className="mt-3 text-[15px] leading-7 text-muted">
        星期{a.week} · {a.lunar}
        <br />
        {a.ganzhi} · {a.zhixing}日
      </p>
      <p className="mt-2 text-sm text-muted">
        宜 {a.yi.slice(0, 3).join("、") || "—"} · 忌 {a.ji.slice(0, 2).join("、") || "—"}
      </p>

      <div className="mt-8 space-y-3">
        <Primary type="button" onClick={() => goNow("/natal")}>
          看此刻的盘
        </Primary>
        <div className="grid grid-cols-3 gap-2">
          {QUICK.map((q) => (
            <Link
              key={q.to}
              to={q.to}
              className="flex h-12 items-center justify-center rounded-md text-sm text-ink"
            >
              {q.name}
            </Link>
          ))}
        </div>
      </div>

      {charts.length ? (
        <section className="mt-12">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-xs tracking-wide text-muted">最近命例</h2>
            <Link to="/me" className="text-xs text-cinnabar">
              全部
            </Link>
          </div>
          <ul>
            {charts.slice(0, 6).map((c) => (
              <li key={c.id} className="border-b border-line">
                <button
                  type="button"
                  className="flex min-h-14 w-full items-baseline justify-between gap-3 py-3 text-left"
                  onClick={() => {
                    loadChart(c.id);
                    nav({ to: "/natal" });
                  }}
                >
                  <span className="font-display text-lg">{c.name || "未名"}</span>
                  <span className="text-sm tabular-nums text-faint">{birthLabel(c)}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="mt-10 text-sm leading-7 text-muted">还没有保存的命例。点「看此刻的盘」，或到排盘里填出生时间。</p>
      )}

      <div className="mt-12 grid gap-3 sm:grid-cols-2">
        <Link to="/almanac" className="rounded-lg border border-line p-5">
          <p className="text-xs tracking-wide text-muted">通书</p>
          <p className="mt-2 font-display text-xl">黄历</p>
          <p className="mt-2 text-sm text-muted">
            {a.zhixing}日 · 宜 {a.yi[0]}
          </p>
        </Link>
        <Link to="/history" className="rounded-lg border border-line p-5">
          <p className="text-xs tracking-wide text-muted">馆</p>
          <p className="mt-2 font-display text-xl">玄学史</p>
          <p className="mt-2 text-sm leading-6 text-muted">{daily.name}</p>
        </Link>
      </div>

      {sky ? (
        <section className="mt-12">
          <p className="mb-4 text-xs tracking-wide text-muted">此刻天象</p>
          <div className="chart-stage">
            <NatalWheel chart={sky} modern={false} />
          </div>
        </section>
      ) : null}
    </main>
  );
}
