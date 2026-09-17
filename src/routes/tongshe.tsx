import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { BirthPanel } from "@/components/birth-form";
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
    return { q, l, t, votes, verdict };
  }, [draft]);

  return (
    <Screen title="统摄">
      <Workbench
        params={<BirthPanel />}
        canvas={
          <div>
            <p className="font-display text-3xl leading-snug">{data.verdict}</p>
            <Meta>
              奇门值使 {data.q.zhishi} · 六壬 {data.l.method} · 太乙 {data.t.ju}局 · 同吉 {data.votes}/3
            </Meta>
            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              <div>
                <p className="text-[11px] text-muted">奇门</p>
                <p className="mt-2 font-display text-2xl">{data.q.zhishi}</p>
                <p className="mt-1 text-sm text-muted">
                  {data.q.yang ? "阳" : "阴"}
                  {data.q.ju}局 {data.q.zhifu}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-muted">六壬三传</p>
                <p className="mt-2 font-display text-2xl">{data.l.san.join(" ")}</p>
                <p className="mt-1 text-sm text-muted">{data.l.method}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted">太乙文昌</p>
                <p className="mt-2 font-display text-2xl">{data.t.wenchang}宫</p>
                <p className="mt-1 text-sm text-muted">
                  {data.t.yang ? "阳" : "阴"}
                  {data.t.ju}局
                </p>
              </div>
            </div>
          </div>
        }
        panel={
          <div>
            <Block title="统摄">
              <p className="text-sm leading-7 text-muted">
                把奇门值使、六壬三传、太乙文昌放在同一判断里。两式以上同吉才动。不作专业鉴定。
              </p>
            </Block>
          </div>
        }
      />
    </Screen>
  );
}
