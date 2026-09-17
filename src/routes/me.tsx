import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { OpenWith } from "@/components/ops";
import { Primary } from "@/components/kit";
import { useChartStore } from "@/lib/horosa/store";
import { birthLabel, type SavedChart } from "@/lib/horosa/types";
import { cityOf } from "@/lib/horosa/cities";

export const Route = createFileRoute("/me")({ component: Me });

function isChart(x: unknown): x is SavedChart {
  if (!x || typeof x !== "object") return false;
  const c = x as Record<string, unknown>;
  return (
    typeof c.id === "string" &&
    typeof c.year === "number" &&
    typeof c.month === "number" &&
    typeof c.day === "number" &&
    typeof c.hour === "number"
  );
}

export function Me() {
  const charts = useChartStore((s) => s.charts);
  const loadChart = useChartStore((s) => s.loadChart);
  const removeChart = useChartStore((s) => s.removeChart);
  const importCharts = useChartStore((s) => s.importCharts);
  const setNow = useChartStore((s) => s.setNow);
  const saveDraft = useChartStore((s) => s.saveDraft);
  const setPartner = useChartStore((s) => s.setPartner);
  const nav = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  function exportCharts() {
    const payload = {
      v: 1,
      app: "星阙-本地离线",
      exportedAt: new Date().toISOString(),
      charts: useChartStore.getState().charts,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "星阙命例.json";
    a.click();
    URL.revokeObjectURL(a.href);
    setMsg("已导出到文件。");
  }

  async function onImport(file: File) {
    try {
      const raw = JSON.parse(await file.text()) as { charts?: unknown };
      const list = Array.isArray(raw) ? raw : raw.charts;
      if (!Array.isArray(list)) throw new Error("格式不对");
      const ok = list.filter(isChart);
      if (!ok.length) throw new Error("没有可导入的命例");
      importCharts(ok);
      setMsg(`已导入 ${ok.length} 条，仍只存在本机。`);
    } catch {
      setMsg("无法读取这个文件。");
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-5 pb-8 pt-8 md:px-8">
      <h1 className="font-display text-3xl font-medium tracking-tight">命例</h1>
      <p className="mt-2 text-sm text-muted">本地离线。点一条，用任一技法打开。无账号。</p>

      <section className="mt-8">
        {charts.length === 0 ? (
          <div>
            <p className="text-[15px] leading-7 text-muted">还没有保存的盘。用此刻起一盘，或到排盘里填出生时间。</p>
            <div className="mt-5">
              <Primary
                type="button"
                onClick={() => {
                  setNow();
                  saveDraft();
                  nav({ to: "/natal" });
                }}
              >
                看此刻的盘
              </Primary>
            </div>
          </div>
        ) : (
          charts.map((c) => (
            <div key={c.id} className="border-b border-line py-4">
              <button
                type="button"
                className="flex w-full items-baseline justify-between gap-3 text-left"
                onClick={() => {
                  loadChart(c.id);
                  setOpenId(openId === c.id ? null : c.id);
                }}
              >
                <span>
                  <span className="block font-display text-[17px]">{c.name || "未名"}</span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {birthLabel(c)} · {cityOf(c).name} · {c.gender === "male" ? "男" : "女"}
                  </span>
                </span>
                <span className="text-xs text-faint">{openId === c.id ? "收起" : "打开"}</span>
              </button>
              {openId === c.id ? (
                <div className="mt-3">
                  <p className="mb-1 text-[11px] tracking-wide text-muted">用此命例排</p>
                  <OpenWith />
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      className="h-11 px-3 text-sm text-muted"
                      onClick={() => {
                        setPartner(c.id);
                        loadChart(c.id);
                        nav({ to: "/synastry" });
                      }}
                    >
                      设为合盘对象
                    </button>
                    <button type="button" className="ml-auto h-11 px-3 text-sm text-faint" onClick={() => removeChart(c.id)}>
                      删除
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ))
        )}
      </section>

      <section className="mt-10 flex gap-3">
        <button
          type="button"
          className="h-12 flex-1 rounded-md border border-line text-[14px]"
          onClick={exportCharts}
          disabled={!charts.length}
        >
          导出命例
        </button>
        <button
          type="button"
          className="h-12 flex-1 rounded-md border border-line text-[14px]"
          onClick={() => fileRef.current?.click()}
        >
          导入
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) void onImport(f);
          }}
        />
      </section>
      {msg ? <p className="mt-3 text-xs text-muted">{msg}</p> : null}

      <nav className="mt-12 space-y-1 text-[15px]">
        <Link to="/about" className="flex h-12 items-center border-b border-line">
          关于星阙
        </Link>
        <Link to="/celebs" className="flex h-12 items-center border-b border-line">
          名人库
        </Link>
        <Link to="/asteroids" className="flex h-12 items-center border-b border-line">
          小行星星历包
        </Link>
      </nav>
    </main>
  );
}
