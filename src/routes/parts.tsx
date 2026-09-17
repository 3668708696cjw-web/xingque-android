import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BirthPanel } from "@/components/birth-form";
import { NatalWheel } from "@/components/natal-wheel";
import { Block, Chip, Ghost, Meta, Screen, Workbench } from "@/components/kit";
import { computeParts } from "@/lib/horosa/parts";
import { computeAcg, computeDraconic, computeHarmonic, throwDice, type DiceResult } from "@/lib/horosa/modules";
import { computeNatal } from "@/lib/horosa/natal";
import { nowAsBirth } from "@/lib/horosa/cities";
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
  const horary = useMemo(() => computeNatal(nowAsBirth(draft.cityId)), [draft.cityId]);
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
        <Meta>此刻为问事时刻</Meta>
        <div className="mt-3">
          <NatalWheel chart={horary} modern={false} />
        </div>
      </div>
    ) : tab === "ACG" ? (
      <ul className="text-sm">
        {acg.map((l) => (
          <li key={l.planet} className="flex justify-between border-b border-line py-2">
            <span>{l.planet}</span>
            <span className="tabular-nums text-muted">{l.lon}°</span>
          </li>
        ))}
      </ul>
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
          ) : (
            <p className="text-sm leading-7 text-muted">
              辅盘对应 Windows「卜卦、谐波、龙盘、中点、ACG、骰子」。三维地图与汉堡 90° 盘仍需桌面端。
            </p>
          )
        }
      />
    </Screen>
  );
}
