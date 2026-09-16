import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { BirthPanel } from "@/components/birth-form";
import { LiurenBoard, QimenBoard, TaiyiBoard } from "@/components/boards";
import { Block, Meta, Screen } from "@/components/kit";
import { computeQimen } from "@/lib/horosa/qimen";
import { computeLiuren } from "@/lib/horosa/liuren";
import { computeTaiyi } from "@/lib/horosa/taiyi";
import { useChartStore } from "@/lib/horosa/store";

export const Route = createFileRoute("/sanshi")({ component: Page });

function Page() {
  const draft = useChartStore((s) => s.draft);
  const q = useMemo(() => computeQimen(draft), [draft]);
  const r = useMemo(() => computeLiuren(draft), [draft]);
  const t = useMemo(() => computeTaiyi(draft), [draft]);
  return (
    <Screen title="三式">
      <div className="mb-6 max-w-sm">
        <BirthPanel submitLabel="同参" />
      </div>
      <div className="grid gap-10 lg:grid-cols-3">
        <Block title="太乙">
          <Meta>{t.note}</Meta>
          <div className="mt-3">
            <TaiyiBoard data={t} />
          </div>
        </Block>
        <Block title="六壬">
          <Meta>
            {r.method} · {r.ganzhi}
          </Meta>
          <LiurenBoard data={r} />
        </Block>
        <Block title="遁甲">
          <Meta>
            {q.yang ? "阳" : "阴"}
            {q.ju}局 · {q.zhifu} / {q.zhishi} · 空{q.kongwang}
          </Meta>
          <div className="mt-3">
            <QimenBoard data={q} />
          </div>
        </Block>
      </div>
    </Screen>
  );
}
