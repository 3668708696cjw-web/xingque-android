import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BOARD_LABEL, SECTIONS } from "@/lib/horosa/catalog";
import { cityOf } from "@/lib/horosa/cities";
import { useChartStore } from "@/lib/horosa/store";
import { birthLabel } from "@/lib/horosa/types";

export const Route = createFileRoute("/catalog")({ component: Catalog });

function Catalog() {
  const [q, setQ] = useState("");
  const draft = useChartStore((s) => s.draft);
  const setNow = useChartStore((s) => s.setNow);
  const sections = useMemo(() => {
    const s = q.trim();
    if (!s) return SECTIONS;
    return SECTIONS.map((sec) => ({
      ...sec,
      items: sec.items.filter((i) => i.name.includes(s) || i.blurb.includes(s)),
    })).filter((sec) => sec.items.length);
  }, [q]);

  return (
    <main className="mx-auto max-w-2xl px-6 pb-16 pt-12 md:px-8 md:pt-16">
      <h1 className="font-display text-4xl font-medium tracking-tight">排盘</h1>
      <p className="mt-3 max-w-md text-sm leading-7 text-muted">先定出生，再点技法。时间跟着走，不必重填。</p>

      <div className="mt-8 flex min-h-14 items-center justify-between gap-3 border-y border-line py-4">
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

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="搜索技法，如 奇门、八字、主限"
        className="mt-10 h-12 w-full border-0 border-b border-line bg-transparent text-[15px] outline-none placeholder:text-faint focus:border-ink"
      />
      <div className="mt-10 space-y-12">
        {sections.map((sec) => (
          <section key={sec.key}>
            <h2 className="mb-2 text-[11px] tracking-[0.22em] text-muted">{sec.title}</h2>
            {sec.items.map((i) => (
              <Link
                key={i.path}
                to={i.path as never}
                className="flex min-h-[4.25rem] items-center gap-4 border-b border-line py-4"
              >
                <span className="w-7 shrink-0 font-display text-lg text-cinnabar">{i.mark}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-lg leading-tight">{i.name}</span>
                  <span className="mt-1 block text-xs leading-5 text-muted">{i.blurb}</span>
                </span>
                <span className="shrink-0 text-[11px] tracking-wide text-faint">{BOARD_LABEL[i.board]}</span>
              </Link>
            ))}
          </section>
        ))}
      </div>
    </main>
  );
}
