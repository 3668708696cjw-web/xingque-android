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
  { to: "/qimen", name: "遁甲" },
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
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-12 md:px-8 md:pt-16">
      <p className="text-[11px] tracking-[0.28em] text-muted">星阙 · 本地离线</p>
      <h1 className="mt-4 font-display text-5xl font-medium tracking-tight md:text-6xl">
        {now.getMonth() + 1} 月 {now.getDate()} 日
      </h1>
      <p className="mt-5 max-w-md text-[15px] leading-8 text-muted">
        星期{a.week} · {a.lunar}
        <br />
        {a.ganzhi} · {a.zhixing}日
      </p>
      <p className="mt-3 text-sm text-muted">
        宜 {a.yi.slice(0, 3).join("、") || "—"} · 忌 {a.ji.slice(0, 2).join("、") || "—"}
      </p>

      <div className="mt-12 max-w-sm">
        <Primary type="button" onClick={() => goNow("/natal")}>
          看此刻的盘
        </Primary>
        <nav className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
          {QUICK.map((q) => (
            <Link key={q.to} to={q.to} className="text-sm text-ink">
              {q.name}
            </Link>
          ))}
        </nav>
      </div>

      {charts.length ? (
        <section className="mt-16">
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="text-[11px] tracking-[0.2em] text-muted">最近命例</h2>
            <Link to="/me" className="text-xs text-cinnabar">
              全部
            </Link>
          </div>
          <ul>
            {charts.slice(0, 5).map((c) => (
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
        <p className="mt-14 max-w-md text-sm leading-7 text-muted">还没有保存的命例。点「看此刻的盘」，或到排盘里填出生时间。</p>
      )}

      <section className="mt-16 space-y-4 text-sm leading-7">
        <Link to="/almanac" className="block">
          <span className="text-[11px] tracking-[0.2em] text-muted">通书</span>
          <span className="mt-1 block font-display text-xl">黄历 · {a.zhixing}日</span>
        </Link>
        <Link to="/history" className="block">
          <span className="text-[11px] tracking-[0.2em] text-muted">馆</span>
          <span className="mt-1 block font-display text-xl">玄学史 · {daily.name}</span>
        </Link>
      </section>

      {sky ? (
        <section className="mt-16">
          <p className="mb-5 text-[11px] tracking-[0.2em] text-muted">此刻天象</p>
          <div className="chart-stage">
            <NatalWheel chart={sky} modern={false} />
          </div>
        </section>
      ) : null}
    </main>
  );
}
