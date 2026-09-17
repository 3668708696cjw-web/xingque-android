import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { BirthPanel } from "@/components/birth-form";
import { LiurenBoard, QimenBoard, TaiyiBoard } from "@/components/boards";
import { Block, Meta, Screen, Workbench } from "@/components/kit";
import { computeLiuren } from "@/lib/horosa/liuren";
import { computeQimen } from "@/lib/horosa/qimen";
import { computeTaiyi } from "@/lib/horosa/taiyi";
import { useChartStore } from "@/lib/horosa/store";

export const Route = createFileRoute("/tongshe")({ component: Page });

function Page() {
  const draft = useChartStore((s) => s.draft);
  const data = useMemo(() => {
    const q = computeQimen(draft);
    const l = computeLiuren(draft);
    const t = computeTaiyi(draft);
    const qimenJi = ["开门", "生门", "休门"].includes(q.zhishi);
    const taiyiJi = t.ju <= 4;
    const liurenJi = /青龙|六合|太常|天后/.test(Object.values(l.generals).join(""));
    const votes = Number(qimenJi) + Number(taiyiJi) + Number(liurenJi);
    const verdict = votes >= 2 ? "三式同吉，事体可成。" : votes === 1 ? "一吉两平，宜缓图。" : "三式不和，宜守。";
    return { q, l, t, votes, verdict, qimenJi, taiyiJi, liurenJi };
  }, [draft]);

  return (
    <Screen title="统摄">
      <Workbench
        params={<BirthPanel />}
        canvas={
          <div>
            <p className="font-display text-3xl leading-snug">{data.verdict}</p>
            <Meta>
              奇门值使 {data.q.zhishi}
              {data.qimenJi ? "吉" : ""} · 六壬 {data.l.method}
              {data.liurenJi ? "吉" : ""} · 太乙 {data.t.ju}局
              {data.taiyiJi ? "吉" : ""} · 同吉 {data.votes}/3
            </Meta>
            <div className="mt-8 grid gap-8 lg:grid-cols-3">
              <div>
                <p className="mb-2 text-[11px] text-muted">遁甲</p>
                <QimenBoard data={data.q} />
              </div>
              <div>
                <p className="mb-2 text-[11px] text-muted">六壬</p>
                <LiurenBoard data={data.l} />
              </div>
              <div>
                <p className="mb-2 text-[11px] text-muted">太乙</p>
                <TaiyiBoard data={data.t} />
              </div>
            </div>
          </div>
        }
        panel={
          <div>
            <Block title="三式断">
              <p className="text-sm leading-7 text-muted">
                把奇门值使、六壬三传、太乙文昌放在同一判断里。两式以上同吉才动。不作专业鉴定。
              </p>
              <p className="mt-4 text-sm">
                奇门 {data.q.yang ? "阳" : "阴"}
                {data.q.ju}局 值符{data.q.zhifu} 值使{data.q.zhishi}
              </p>
              <p className="mt-2 text-sm">六壬三传 {data.l.san.join(" ")} · {data.l.method}</p>
              <p className="mt-2 text-sm">
                太乙文昌{data.t.wenchang}宫 · {data.t.yang ? "阳" : "阴"}
                {data.t.ju}局
              </p>
            </Block>
          </div>
        }
      />
    </Screen>
  );
}
