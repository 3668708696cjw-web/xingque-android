import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { BirthPanel } from "@/components/birth-form";
import { AsteroidRing } from "@/components/tech-boards";
import { Block, Chip, Field, FieldInput, Meta, Primary, Screen, Workbench } from "@/components/kit";
import { computeNatal } from "@/lib/horosa/natal";
import {
  computeFamousAsteroids,
  computeOneAsteroid,
  displayName,
  loadAsteroidCatalog,
  type AsteroidCatalog,
  type AsteroidRow,
} from "@/lib/horosa/asteroids";
import { importAsteroidZip, listPacks } from "@/lib/horosa/zip-store";
import { useChartStore } from "@/lib/horosa/store";

export const Route = createFileRoute("/asteroids")({ component: Page });

function Page() {
  const draft = useChartStore((s) => s.draft);
  const [rows, setRows] = useState<AsteroidRow[]>([]);
  const [cat, setCat] = useState<AsteroidCatalog | null>(null);
  const [q, setQ] = useState("");
  const [extra, setExtra] = useState<AsteroidRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [packs, setPacks] = useState<{ name: string; size: number; count: number }[]>([]);
  const [msg, setMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void loadAsteroidCatalog().then(setCat);
    void listPacks().then(setPacks);
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
  const natal = useMemo(() => computeNatal(draft), [draft]);

  async function pick(n: number) {
    setBusy(true);
    const hit = await computeOneAsteroid(draft, n);
    setExtra(hit);
    setBusy(false);
    if (!hit) setMsg("这颗星的星历还不在本机。请导入对应星历包。");
  }

  async function onPack(file: File) {
    setBusy(true);
    setMsg("正在装入…");
    try {
      const meta = await importAsteroidZip(file);
      const list = await listPacks();
      setPacks(list);
      setMsg(`已装入 ${meta.name}，${meta.count} 颗。`);
    } catch {
      setMsg("不是星阙星历包，或压缩方式不对。请用发行页上的 Xingque-ephe-ast0/1/2.zip。");
    }
    setBusy(false);
  }

  return (
    <Screen title="小行星">
      <Workbench
        params={<BirthPanel />}
        canvas={
          <div>
            <Meta>
              谷神族随包可用。编号星需导入星历包，装入后断网也能算。
              {busy ? " · 计算中" : ""}
            </Meta>
            <div className="mt-3">
              <AsteroidRing natal={natal} rows={extra ? [...rows, extra] : rows} />
            </div>
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
            <Block title="星历包">
              <p className="text-sm leading-6 text-muted">
                安装包只带世纪主星历。编号小行星分成三个 zip（ast0 / ast1 / ast2），在发行页下载后点下面装入。装进本机后一直可用。
              </p>
              <div className="mt-3">
                <Primary type="button" onClick={() => fileRef.current?.click()} disabled={busy}>
                  从文件装入星历包
                </Primary>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".zip,application/zip"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (f) void onPack(f);
                  }}
                />
              </div>
              {packs.length ? (
                <ul className="mt-3">
                  {packs.map((p) => (
                    <li key={p.name} className="flex justify-between py-2 text-sm">
                      <span>{p.name}</span>
                      <span className="tabular-nums text-muted">{p.count} 颗</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-xs text-faint">还没有装入编号星历包。</p>
              )}
              {msg ? <p className="mt-2 text-xs text-cinnabar">{msg}</p> : null}
            </Block>
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
          </div>
        }
      />
    </Screen>
  );
}
