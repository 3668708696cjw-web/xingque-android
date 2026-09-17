import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BirthPanel } from "@/components/birth-form";
import { LiurenBoard, QimenBoard } from "@/components/boards";
import { ViewBar } from "@/components/chart-kit";
import { TaiyiPalaceBoard } from "@/components/tech-boards";
import { Meta, Screen, Workbench } from "@/components/kit";
import { viewsOf } from "@/lib/horosa/catalog";
import { computeQimen } from "@/lib/horosa/qimen";
import { computeLiuren } from "@/lib/horosa/liuren";
import { computeTaiyi } from "@/lib/horosa/taiyi";
import { useChartStore } from "@/lib/horosa/store";

export const Route = createFileRoute("/sanshi")({ component: Page });

const VIEWS = viewsOf("/sanshi");

function Page() {
  const draft = useChartStore((s) => s.draft);
  const q = useMemo(() => computeQimen(draft), [draft]);
  const r = useMemo(() => computeLiuren(draft), [draft]);
  const t = useMemo(() => computeTaiyi(draft), [draft]);
  const [view, setView] = useState(VIEWS[0] ?? "太乙");
  return (
    <Screen title="三式">
      <Workbench
        params={<BirthPanel submitLabel="同参" />}
        canvas={
          <div>
            <ViewBar views={VIEWS} value={view} onChange={setView} />
            {view === "六壬" ? (
              <div>
                <Meta>
                  {r.method} · {r.ganzhi}
                </Meta>
                <div className="mt-4">
                  <LiurenBoard data={r} />
                </div>
              </div>
            ) : view === "遁甲" ? (
              <div>
                <Meta>
                  {q.yang ? "阳" : "阴"}
                  {q.ju}局 · {q.zhifu} / {q.zhishi} · 空{q.kongwang}
                </Meta>
                <div className="mt-4">
                  <QimenBoard data={q} />
                </div>
              </div>
            ) : (
              <div>
                <Meta>{t.note}</Meta>
                <div className="mt-4">
                  <TaiyiPalaceBoard data={t} />
                </div>
              </div>
            )}
          </div>
        }
        panel={
          <div className="text-sm leading-7 text-muted">
            <p>太乙 {t.yang ? "阳" : "阴"}{t.ju}局 · 文昌{t.wenchang}</p>
            <p className="mt-2">六壬 {r.method} · 三传 {r.san.join(" ")}</p>
            <p className="mt-2">
              遁甲 值符{q.zhifu} 值使{q.zhishi} · 空{q.kongwang}
            </p>
          </div>
        }
      />
    </Screen>
  );
}
