import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
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
  const nav = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("");

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
    <main className="mx-auto max-w-3xl px-6 pb-8 pt-10 md:px-8">
      <h1 className="font-display text-[32px] font-medium tracking-tight">我</h1>
      <p className="mt-2 text-[13px] text-muted">本地离线版。无账号，命例不离机。</p>

      <section className="mt-10">
        <h2 className="text-[11px] tracking-wide text-muted">命例</h2>
        {charts.length === 0 ? (
          <p className="mt-4 text-[15px] text-muted">还没有保存的盘。在排盘页起盘即保存。</p>
        ) : (
          charts.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3 border-b border-line py-4">
              <button
                type="button"
                className="text-left"
                onClick={() => {
                  loadChart(c.id);
                  nav({ to: "/natal" });
                }}
              >
                <div className="font-display text-[17px]">{c.name || "未名"}</div>
                <div className="text-[12px] text-muted">
                  {birthLabel(c)} · {cityOf(c).name}
                </div>
              </button>
              <button type="button" className="text-[12px] text-faint" onClick={() => removeChart(c.id)}>
                删除
              </button>
            </div>
          ))
        )}
      </section>

      <section className="mt-10 flex gap-3">
        <button
          type="button"
          className="h-11 flex-1 border border-line text-[14px]"
          onClick={exportCharts}
          disabled={!charts.length}
        >
          导出命例
        </button>
        <button type="button" className="h-11 flex-1 border border-line text-[14px]" onClick={() => fileRef.current?.click()}>
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
      {msg ? <p className="mt-3 text-[12px] text-muted">{msg}</p> : null}

      <nav className="mt-12 space-y-4 text-[15px]">
        <Link to="/about" className="block">
          关于星阙
        </Link>
        <Link to="/celebs" className="block">
          名人库
        </Link>
        <a href="?install=1" className="block">
          安装到主屏幕
        </a>
      </nav>
    </main>
  );
}
