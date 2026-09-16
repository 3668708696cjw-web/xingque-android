import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Screen, Workbench } from "@/components/kit";
import { almanacOf, monthGrid } from "@/lib/horosa/almanac";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/almanac")({ component: Page });

function Page() {
  const now = new Date();
  const [y, setY] = useState(now.getFullYear());
  const [m, setM] = useState(now.getMonth() + 1);
  const [d, setD] = useState(now.getDate());
  const a = useMemo(() => almanacOf(y, m, d, 12, 0), [y, m, d]);
  const cells = useMemo(() => monthGrid(y, m), [y, m]);
  return (
    <Screen title="黄历">
      <Workbench
        canvas={
          <div>
            <div className="flex items-center justify-between">
              <button
                type="button"
                className="h-11 px-2 text-muted"
                onClick={() => {
                  if (m === 1) {
                    setY(y - 1);
                    setM(12);
                  } else setM(m - 1);
                }}
              >
                上月
              </button>
              <span className="font-display text-lg">
                {y} · {m}月
              </span>
              <button
                type="button"
                className="h-11 px-2 text-muted"
                onClick={() => {
                  if (m === 12) {
                    setY(y + 1);
                    setM(1);
                  } else setM(m + 1);
                }}
              >
                下月
              </button>
            </div>
            <div className="mt-4 grid grid-cols-7 text-center text-xs">
              {["日", "一", "二", "三", "四", "五", "六"].map((w) => (
                <div key={w} className="py-2 text-faint">
                  {w}
                </div>
              ))}
              {cells.map((c, i) =>
                c ? (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setD(c.day)}
                    className={cn("min-h-14 border-b border-line py-1.5", c.day === d && "bg-ink text-bg")}
                  >
                    <div className="text-sm">{c.day}</div>
                    <div className={cn("text-[10px]", c.day === d ? "text-bg/70" : "text-faint")}>{c.lunarDay}</div>
                    <div className={cn("text-[10px]", c.day === d ? "text-bg/70" : "text-muted")}>{c.yi0}</div>
                  </button>
                ) : (
                  <div key={i} className="min-h-14 border-b border-line" />
                ),
              )}
            </div>
          </div>
        }
        panel={
          <div>
            <p className="font-display text-2xl">{a.lunar}</p>
            <p className="mt-1 text-sm text-muted">{a.ganzhi}</p>
            {a.festivals.length ? <p className="mt-2 text-sm text-cinnabar">{a.festivals.join(" · ")}</p> : null}
            <div className="mt-6 grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-[11px] text-muted">宜</h3>
                <p className="mt-2 text-sm leading-7">{a.yi.join("  ")}</p>
              </div>
              <div>
                <h3 className="text-[11px] text-muted">忌</h3>
                <p className="mt-2 text-sm leading-7 text-muted">{a.ji.join("  ")}</p>
              </div>
            </div>
            <p className="mt-6 text-sm leading-7 text-muted">
              {a.zhixing}日 · {a.tianshen}
              <br />
              冲 {a.chong} · 煞 {a.sha}
              <br />
              {a.xiu}
              <br />
              喜神{a.xi} 福神{a.fu} 财神{a.cai}
              <br />
              胎神 {a.tai}
              <br />
              彭祖 {a.pengzu}
              <br />
              {a.xingzuo}座 · 下节 {a.nextJie}
            </p>
          </div>
        }
      />
    </Screen>
  );
}
