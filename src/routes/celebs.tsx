import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useDeferredValue, useMemo, useState } from "react";
import { Screen } from "@/components/kit";
import { CELEBS } from "@/lib/horosa/celebs";
import { useChartStore } from "@/lib/horosa/store";
import { birthLabel } from "@/lib/horosa/types";

export const Route = createFileRoute("/celebs")({ component: Page });

function Page() {
  const setDraft = useChartStore((s) => s.setDraft);
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const deferred = useDeferredValue(q);
  const list = useMemo(() => {
    const s = deferred.trim();
    if (!s) return CELEBS;
    return CELEBS.filter((c) => c.name.includes(s) || c.who.includes(s) || c.note.includes(s));
  }, [deferred]);
  return (
    <Screen title="名人">
      <p className="mb-4 text-[13px] text-muted">公开出生数据，时地或为谱录近似。点选后进入占星。</p>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="姓名、身份"
        className="mb-4 h-11 w-full border-0 border-b border-line bg-transparent text-[15px] outline-none placeholder:text-faint focus:border-ink"
      />
      {list.map((c) => (
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
    </Screen>
  );
}
