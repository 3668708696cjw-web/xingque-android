import { createFileRoute } from "@tanstack/react-router";
import { Block, Screen } from "@/components/kit";
import { BAGUA, HOUSES, NAYIN, QIMEN_HINTS, SHISHEN, WUXING_RULES } from "@/lib/horosa/reference";
import { XIU28 } from "@/lib/horosa/stars";
import { I_CHING } from "@/lib/horosa/iching";

export const Route = createFileRoute("/reference")({ component: Page });

function Page() {
  return (
    <Screen title="辅助">
      <Block title="八卦">
        {BAGUA.map((b) => (
          <div key={b.name} className="border-b border-line py-3">
            <span className="font-display text-[18px]">{b.name}</span>
            <span className="ml-2 text-[13px] text-muted">
              {b.nature} · {b.person}
            </span>
            <p className="mt-1 text-[13px] text-muted">
              {b.body} · {b.image}
            </p>
          </div>
        ))}
      </Block>
      <Block title="十神">
        {SHISHEN.map((s) => (
          <p key={s.name} className="border-b border-line py-2 text-[14px]">
            <span className="text-ink">{s.name}</span>
            <span className="ml-2 text-muted">{s.note}</span>
          </p>
        ))}
      </Block>
      <Block title="十二宫">
        {HOUSES.map((h) => (
          <p key={h} className="py-1.5 text-[14px]">
            {h}
          </p>
        ))}
      </Block>
      <Block title="二十八宿">
        {XIU28.map((x) => (
          <p key={x.name} className="border-b border-line py-2 text-[14px]">
            <span className="text-ink">
              {x.name}宿 · {x.wx} · {x.animal}
            </span>
            <span className="mt-0.5 block text-[13px] text-muted">
              {x.palace}。{x.note}
            </span>
          </p>
        ))}
      </Block>
      <Block title="纳音">
        <div className="columns-2 gap-3 text-[13px] text-muted">
          {NAYIN.map((n) => (
            <p key={n} className="py-0.5">
              {n}
            </p>
          ))}
        </div>
      </Block>
      <Block title="五行十神口诀">
        {WUXING_RULES.map((w) => (
          <p key={w} className="py-1 text-[14px] text-muted">
            {w}
          </p>
        ))}
      </Block>
      <Block title="奇门速记">
        {QIMEN_HINTS.map((w) => (
          <p key={w} className="py-1 text-[14px] text-muted">
            {w}
          </p>
        ))}
      </Block>
      <details className="mt-8">
        <summary className="cursor-pointer text-[11px] tracking-wide text-muted">六十四卦卦辞</summary>
        <div className="mt-3">
          {I_CHING.map((g) => (
            <div key={g.name} className="border-b border-line py-3 [content-visibility:auto] [contain-intrinsic-size:64px]">
              <p className="font-display text-[16px]">{g.name}</p>
              <p className="mt-1 text-[13px] leading-6 text-muted">{g.ci}</p>
            </div>
          ))}
        </div>
      </details>
    </Screen>
  );
}
