import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SECTIONS } from "@/lib/horosa/catalog";
import { cityOf, nowAsBirth } from "@/lib/horosa/cities";
import { useChartStore } from "@/lib/horosa/store";
import { birthLabel } from "@/lib/horosa/types";
import { Primary } from "@/components/kit";

export const Route = createFileRoute("/catalog")({ component: Catalog });

function Catalog() {
  const [q, setQ] = useState("");
  const draft = useChartStore((s) => s.draft);
  const setNow = useChartStore((s) => s.setNow);
  const saveDraft = useChartStore((s) => s.saveDraft);
  const nav = useNavigate();
  const sections = useMemo(() => {
    const s = q.trim();
    if (!s) return SECTIONS;
    return SECTIONS.map((sec) => ({
      ...sec,
      items: sec.items.filter((i) => i.name.includes(s) || i.blurb.includes(s)),
    })).filter((sec) => sec.items.length);
  }, [q]);

  return (
    <main className="mx-auto max-w-3xl px-5 pb-8 pt-8 md:px-8 md:pt-10">
      <h1 className="font-display text-3xl font-medium tracking-tight md:text-4xl">排盘</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        先定出生，再点技法。时间跟着走，不必重填。
      </p>

      <div className="mt-6 flex min-h-14 items-center justify-between gap-3 border-y border-line py-3">
        <div className="min-w-0">
          <p className="truncate font-display text-lg">{draft.name || cityOf(draft).name}</p>
          <p className="mt-0.5 text-xs tabular-nums text-muted">
            {birthLabel(draft)} · {cityOf(draft).name}
          </p>
        </div>
        <button type="button" className="h-11 shrink-0 px-3 text-sm text-cinnabar" onClick={setNow}>
          用此刻
        </button>
      </div>
      <div className="mt-3">
        <Primary
          type="button"
          onClick={() => {
            const n = nowAsBirth(draft.cityId);
            useChartStore.getState().setDraft({ ...n, name: draft.name || "此刻", gender: draft.gender });
            saveDraft();
            nav({ to: "/natal" });
          }}
        >
          看此刻的盘
        </Primary>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="搜索技法，如 奇门、八字、主限"
        className="mt-8 h-12 w-full border-0 border-b border-line bg-transparent text-[15px] outline-none placeholder:text-faint focus:border-ink"
      />
      <div className="mt-8 space-y-10">
        {sections.map((sec) => (
          <section key={sec.key}>
            <h2 className="mb-1 text-[11px] tracking-[0.22em] text-muted">{sec.title}</h2>
            {sec.items.map((i) => (
              <Link
                key={i.path}
                to={i.path as never}
                className="flex min-h-16 items-center gap-4 border-b border-line py-3.5"
              >
                <span className="w-7 shrink-0 font-display text-lg text-cinnabar">{i.mark}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-lg leading-tight">{i.name}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-muted">{i.blurb}</span>
                </span>
              </Link>
            ))}
          </section>
        ))}
      </div>
    </main>
  );
}
