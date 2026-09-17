import { createFileRoute, Link } from "@tanstack/react-router";
import { almanacOf } from "@/lib/horosa/almanac";
import { computeNatal } from "@/lib/horosa/natal";
import { nowAsBirth } from "@/lib/horosa/cities";
import { useChartStore } from "@/lib/horosa/store";
import { NatalWheel } from "@/components/natal-wheel";
import { useHydrated } from "@/components/kit";
import { dailyPick } from "@/lib/horosa/xuanshi";
import { useMemo } from "react";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const ready = useHydrated();
  const draftCity = useChartStore((s) => s.draft.cityId);
  const charts = useChartStore((s) => s.charts);
  const now = ready ? new Date() : new Date(2026, 8, 16, 12, 0, 0);
  const a = almanacOf(now.getFullYear(), now.getMonth() + 1, now.getDate(), now.getHours(), now.getMinutes());
  const sky = useMemo(() => (ready ? computeNatal(nowAsBirth(draftCity)) : null), [draftCity, ready]);
  const daily = dailyPick(now);

  return (
    <main className="mx-auto max-w-6xl px-5 pb-16 pt-10 md:px-8 md:pt-14">
      <p className="xs-eye">星阙 · 本地离线</p>
      <h1 className="xs-hero">
        {now.getMonth() + 1} 月 {now.getDate()} 日
      </h1>
      <p className="mt-4 text-[15px] text-muted">
        星期{a.week} · {a.lunar} · {a.ganzhi}
      </p>

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        <Link to="/catalog" className="xs-card min-h-[9.5rem]">
          <p className="xs-eye">命 · 卜</p>
          <div className="mt-3 font-display text-2xl">排盘</div>
          <p className="mt-2 text-sm leading-6 text-muted">三十七门技法，本机起盘。</p>
        </Link>
        <Link to="/history" className="xs-card min-h-[9.5rem]">
          <p className="xs-eye">馆</p>
          <div className="mt-3 font-display text-2xl">玄学史</div>
          <p className="mt-2 text-sm leading-6 text-muted">人物、编年、天象、词条、地图。</p>
        </Link>
        <Link to="/almanac" className="xs-card min-h-[9.5rem]">
          <p className="xs-eye">通书</p>
          <div className="mt-3 font-display text-2xl">黄历</div>
          <p className="mt-2 text-sm leading-6 text-muted">
            {a.zhixing}日 · 宜 {a.yi[0]} · 忌 {a.ji[0]}
          </p>
        </Link>
      </div>

      <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:items-start">
        <div>
          <p className="xs-eye">今日馆藏</p>
          <Link to="/history/$id" params={{ id: daily.id }} className="mt-4 block">
            <div className="flex items-start gap-4">
              <span className="xs-seal mt-1">{daily.name.slice(0, 1)}</span>
              <div>
                <div className="font-display text-2xl">{daily.name}</div>
                <p className="mt-1 text-sm text-muted">{daily.years}</p>
                <p className="mt-3 max-w-md text-[15px] leading-7 text-muted">{daily.summary}</p>
              </div>
            </div>
          </Link>
          {charts.length ? (
            <div className="mt-12">
              <p className="xs-eye">命例</p>
              <ul className="mt-4 space-y-3">
                {charts.slice(0, 4).map((c) => (
                  <li key={c.id}>
                    <Link to="/natal" className="font-display text-lg">
                      {c.name || "未名"}
                    </Link>
                    <span className="ml-3 text-sm text-faint">
                      {c.year}.{c.month}.{c.day}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
        <aside>
          {sky ? (
            <div>
              <p className="mb-4 xs-eye">此刻天象</p>
              <div className="chart-stage">
                <NatalWheel chart={sky} modern={false} />
              </div>
            </div>
          ) : null}
          <p className="mt-4 text-xs text-faint">本机演算 · 不必登录 · 断网可用</p>
        </aside>
      </div>
    </main>
  );
}
