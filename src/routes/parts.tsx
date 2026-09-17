import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BirthPanel } from "@/components/birth-form";
import { NatalWheel } from "@/components/natal-wheel";
import { Block, Chip, Ghost, Meta, Screen, Workbench } from "@/components/kit";
import { computeParts } from "@/lib/horosa/parts";
import { computeAcg, computeDraconic, computeHarmonic, throwDice, type DiceResult } from "@/lib/horosa/modules";
import { computeHorary } from "@/lib/horosa/horary";
import { useChartStore } from "@/lib/horosa/store";

export const Route = createFileRoute("/parts")({ component: Page });

const TABS = ["点", "谐波", "龙盘", "卜卦", "ACG", "骰子"] as const;

function Page() {
  const draft = useChartStore((s) => s.draft);
  const [tab, setTab] = useState<(typeof TABS)[number]>("点");
  const [harm, setHarm] = useState(2);
  const [dice, setDice] = useState<DiceResult | null>(null);
  const parts = useMemo(() => computeParts(draft), [draft]);
  const harmonic = useMemo(() => computeHarmonic(draft, harm), [draft, harm]);
  const draconic = useMemo(() => computeDraconic(draft), [draft]);
  const horary = useMemo(() => computeHorary(draft.cityId, 7), [draft.cityId]);
  const acg = useMemo(() => computeAcg(draft), [draft]);

  const canvas =
    tab === "点" ? (
      <NatalWheel chart={parts.natal} modern={false} />
    ) : tab === "谐波" ? (
      <div>
        <div className="-ml-3 mb-2 flex flex-wrap">
          {[2, 3, 4, 5, 7, 9].map((n) => (
            <Chip key={n} active={harm === n} onClick={() => setHarm(n)}>
              H{n}
            </Chip>
          ))}
        </div>
        <NatalWheel chart={harmonic} modern={false} />
      </div>
    ) : tab === "龙盘" ? (
      <div>
        <Meta>以北交为零点重排黄道</Meta>
        <div className="mt-3">
          <NatalWheel chart={draconic} modern={false} />
        </div>
      </div>
    ) : tab === "卜卦" ? (
      <div>
        <Meta>
          {horary.radical ? "可看" : "慎看"} · 问家 {horary.querent} · 时主 {horary.hourLord}
        </Meta>
        <div className="mt-3">
          <NatalWheel chart={horary.natal} modern={false} />
        </div>
      </div>
    ) : tab === "ACG" ? (
      <div>
        <Meta>行星 MC 线地理经度（赤经近似）</Meta>
        <svg viewBox="0 0 360 80" className="mt-4 w-full text-ink" aria-label="ACG 经线">
          <rect x="0" y="20" width="360" height="40" fill="currentColor" opacity="0.06" />
          {[-180, -90, 0, 90, 180].map((x) => (
            <g key={x}>
              <line x1={x + 180} y1="20" x2={x + 180} y2="60" stroke="currentColor" strokeWidth="0.6" opacity="0.35" />
              <text x={x + 180} y="74" textAnchor="middle" fill="currentColor" fontSize="7" opacity="0.6">
                {x}°
              </text>
            </g>
          ))}
          {acg.map((l, i) => {
            const x = ((l.lon + 180) % 360 + 360) % 360;
            return (
              <g key={l.planet}>
                <line x1={x} y1="18" x2={x} y2="62" stroke="currentColor" strokeWidth="1.2" className="text-cinnabar" />
                <text x={x} y={12 + (i % 2) * 6} textAnchor="middle" fill="currentColor" fontSize="7">
                  {l.planet}
                </text>
              </g>
            );
          })}
        </svg>
        <ul className="mt-4 text-sm">
          {acg.map((l) => (
            <li key={l.planet} className="flex justify-between border-b border-line py-2">
              <span>{l.planet}</span>
              <span className="tabular-nums text-muted">{l.lon}°</span>
            </li>
          ))}
        </ul>
      </div>
    ) : (
      <div>
        <Ghost type="button" onClick={() => setDice(throwDice())}>
          掷骰
        </Ghost>
        {dice ? (
          <p className="mt-8 font-display text-4xl">
            {dice.a} · {dice.b}
          </p>
        ) : null}
        {dice ? <p className="mt-3 text-muted">{dice.note}</p> : null}
      </div>
    );

  return (
    <Screen title="辅盘">
      <Workbench
        params={<BirthPanel />}
        canvas={
          <div>
            <div className="-ml-3 mb-3 flex flex-wrap">
              {TABS.map((t) => (
                <Chip key={t} active={tab === t} onClick={() => setTab(t)}>
                  {t}
                </Chip>
              ))}
            </div>
            {canvas}
          </div>
        }
        panel={
          tab === "点" ? (
            <div>
              <Block title="阿拉伯点">
                {parts.lots.map((l) => (
                  <div key={l.name} className="flex justify-between border-b border-line py-2 text-sm">
                    <span>{l.name}</span>
                    <span className="text-muted">{l.dms}</span>
                  </div>
                ))}
              </Block>
              <Block title="中点">
                {parts.mids.slice(0, 14).map((m) => (
                  <div key={m.pair} className="flex justify-between py-1.5 text-xs text-muted">
                    <span>{m.pair}</span>
                    <span>{m.dms}</span>
                  </div>
                ))}
              </Block>
            </div>
          ) : tab === "卜卦" ? (
            <div>
              <Block title="慎重条件">
                <p className="text-sm leading-7">{horary.radicalNote}</p>
                <p className="mt-2 text-sm text-muted">
                  月 {horary.vocNote} · 下一相 {horary.moonNext}
                </p>
              </Block>
              <Block title="论断">
                {horary.considerations.map((c) => (
                  <p key={c} className="border-b border-line py-2 text-sm leading-6">
                    {c}
                  </p>
                ))}
              </Block>
            </div>
          ) : (
            <p className="text-sm leading-7 text-muted">
              辅盘对应 Windows「卜卦、谐波、龙盘、中点、ACG」。汉堡九十度盘见「汉堡」。
            </p>
          )
        }
      />
    </Screen>
  );
}
