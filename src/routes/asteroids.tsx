import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BirthPanel } from "@/components/birth-form";
import { Block, Chip, Field, FieldInput, Meta, Screen, Workbench } from "@/components/kit";
import {
  computeFamousAsteroids,
  computeOneAsteroid,
  displayName,
  loadAsteroidCatalog,
  type AsteroidCatalog,
  type AsteroidRow,
} from "@/lib/horosa/asteroids";
import { useChartStore } from "@/lib/horosa/store";

export const Route = createFileRoute("/asteroids")({ component: Page });

function Page() {
  const draft = useChartStore((s) => s.draft);
  const [rows, setRows] = useState<AsteroidRow[]>([]);
  const [cat, setCat] = useState<AsteroidCatalog | null>(null);
  const [q, setQ] = useState("");
  const [extra, setExtra] = useState<AsteroidRow | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void loadAsteroidCatalog().then(setCat);
  }, []);

  useEffect(() => {
    let live = true;
    setBusy(true);
    void computeFamousAsteroids(draft).then((r) => {
      if (live) {
        setRows(r);
        setBusy(false);
      }
    });
    return () => {
      live = false;
    };
  }, [draft]);

  const packedPreview = useMemo(() => {
    if (!cat) return [];
    const names = cat.names;
    const ql = q.trim().toLowerCase();
    return cat.packed
      .map((n) => ({ n, name: displayName(n, names) }))
      .filter((x) => !ql || x.name.toLowerCase().includes(ql) || String(x.n).includes(ql))
      .slice(0, 80);
  }, [cat, q]);

  async function pick(n: number) {
    setBusy(true);
    const hit = await computeOneAsteroid(draft, n);
    setExtra(hit);
    setBusy(false);
  }

  return (
    <Screen title="小行星">
      <Workbench
        params={<BirthPanel />}
        canvas={
          <div>
            <Meta>
              {cat
                ? `本机星历 ${(cat.bytes / 1_000_000_000).toFixed(2)} GB · 编号文件 ${cat.count} 颗`
                : "载入星历目录…"}
              {busy ? " · 计算中" : ""}
            </Meta>
            <ul className="mt-6">
              {rows.map((r) => (
                <li key={r.n} className="flex justify-between gap-3 border-b border-line py-2.5 text-sm">
                  <span>
                    {r.name}
                    {r.retro ? " R" : ""}
                  </span>
                  <span className="tabular-nums text-muted">
                    {r.sign} {r.dms}
                  </span>
                </li>
              ))}
            </ul>
            {extra ? (
              <p className="mt-6 font-display text-xl">
                {extra.name} · {extra.sign} {extra.dms}
                {extra.retro ? " R" : ""}
              </p>
            ) : null}
          </div>
        }
        panel={
          <div>
            <Block title="编号检索">
              <Field label="名称或编号">
                <FieldInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Psyche / 16" />
              </Field>
              <div className="mt-3 flex flex-wrap gap-1">
                {packedPreview.slice(0, 24).map((x) => (
                  <Chip key={x.n} active={extra?.n === x.n} onClick={() => void pick(x.n)}>
                    {x.n} {x.name.split(" ")[0]}
                  </Chip>
                ))}
              </div>
            </Block>
            <Block title="说明">
              <p className="text-sm leading-6 text-muted">
                谷神、智神、婚神、灶神走主星历 seas；其余编号按需载入 ast0/ast1 的 seNNNNN.se1。JPL
                de200/de406e 随包装入，WebView 不整包灌进内存。
              </p>
            </Block>
          </div>
        }
      />
    </Screen>
  );
}