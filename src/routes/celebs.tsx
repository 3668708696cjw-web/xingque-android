import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Screen } from "@/components/kit";
import { CELEBS, type PackedCeleb, loadPackedCelebs } from "@/lib/horosa/celebs";
import { useChartStore } from "@/lib/horosa/store";
import { birthLabel } from "@/lib/horosa/types";

export const Route = createFileRoute("/celebs")({ component: Page });

function Page() {
  const setDraft = useChartStore((s) => s.setDraft);
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [packed, setPacked] = useState<PackedCeleb[] | null>(null);
  useEffect(() => {
    void loadPackedCelebs().then(setPacked);
  }, []);
  const deferred = useDeferredValue(q);
  const local = useMemo(() => {
    const s = deferred.trim();
    if (!s) return CELEBS;
    return CELEBS.filter((c) => c.name.includes(s) || c.who.includes(s) || c.note.includes(s));
  }, [deferred]);
  const remote = useMemo(() => {
    if (!packed) return [];
    const s = deferred.trim().toLowerCase();
    const src = s ? packed.filter((c) => c.name.toLowerCase().includes(s) || c.place.toLowerCase().includes(s)) : packed;
    return src.slice(0, s ? 80 : 40);
  }, [packed, deferred]);

  return (
    <Screen title="数据库">
      <p className="mb-4 text-[13px] text-muted">
        本机 {CELEBS.length} 条华人谱录
        {packed ? ` · 另载 Rodden AA ${packed.length.toLocaleString()} 条` : " · 正在读星表"}
        。点选后进入占星。
      </p>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="姓名、身份、城市"
        className="mb-4 h-11 w-full border-0 border-b border-line bg-transparent text-[15px] outline-none placeholder:text-faint focus:border-ink"
      />
      {local.map((c) => (
        <button
          key={c.name}
          type="button"
          className="flex w-full items-baseline justify-between gap-3 border-b border-line py-4 text-left [content-visibility:auto] [contain-intrinsic-size:56px]"
          onClick={() => {
            setDraft({
              name: c.name,
              gender: c.gender,
              year: c.year,
              month: c.month,
              day: c.day,
              hour: c.hour,
              minute: c.minute,
              cityId: c.cityId,
              lat: undefined,
              lon: undefined,
              tz: undefined,
              place: undefined,
            });
            nav({ to: "/natal" });
          }}
        >
          <span>
            <span className="font-display text-[17px]">{c.name}</span>
            <span className="ml-2 text-[12px] text-muted">{c.who}</span>
          </span>
          <span className="text-[12px] text-faint">{birthLabel(c)}</span>
        </button>
      ))}
      {remote.map((c) => (
        <button
          key={`${c.name}-${c.year}-${c.lat}`}
          type="button"
          className="flex w-full items-baseline justify-between gap-3 border-b border-line py-4 text-left [content-visibility:auto] [contain-intrinsic-size:56px]"
          onClick={() => {
            setDraft({
              name: c.name,
              gender: c.gender,
              year: c.year,
              month: c.month,
              day: c.day,
              hour: c.hour,
              minute: c.minute,
              cityId: "custom",
              lat: c.lat,
              lon: c.lon,
              tz: c.tz,
              place: c.place,
            });
            nav({ to: "/natal" });
          }}
        >
          <span>
            <span className="font-display text-[17px]">{c.name}</span>
            <span className="ml-2 text-[12px] text-muted">
              {c.place} · {c.rodden}
            </span>
          </span>
          <span className="text-[12px] text-faint">
            {c.year}-{String(c.month).padStart(2, "0")}-{String(c.day).padStart(2, "0")}
          </span>
        </button>
      ))}
    </Screen>
  );
}

