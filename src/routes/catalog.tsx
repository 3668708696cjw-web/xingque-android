import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SECTIONS } from "@/lib/horosa/catalog";

export const Route = createFileRoute("/catalog")({ component: Catalog });

function Catalog() {
  const [q, setQ] = useState("");
  const sections = useMemo(() => {
    const s = q.trim();
    if (!s) return SECTIONS;
    return SECTIONS.map((sec) => ({
      ...sec,
      items: sec.items.filter((i) => i.name.includes(s) || i.blurb.includes(s)),
    })).filter((sec) => sec.items.length);
  }, [q]);

  return (
    <main className="mx-auto px-5 pb-8 pt-8 md:px-8 md:pt-10">
      <h1 className="font-display text-3xl font-medium tracking-tight md:text-4xl">排盘</h1>
      <p className="mt-2 text-sm text-muted">命、卜、工具全部在本机起盘。电脑左侧栏一次切入；平板用顶栏；手机从这里进盘。</p>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="搜索技法"
        className="mt-6 h-11 w-full max-w-md border-0 border-b border-line bg-transparent text-[15px] outline-none placeholder:text-faint focus:border-ink"
      />
      <div className="mt-10 space-y-12">
        {sections.map((sec) => (
          <section key={sec.key}>
            <h2 className="mb-4 text-[11px] tracking-[0.22em] text-muted">{sec.title}</h2>
            <div className="grid grid-cols-2 gap-px bg-line sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {sec.items.map((i) => (
                <Link
                  key={i.path}
                  to={i.path as never}
                  className="flex min-h-[6.75rem] flex-col justify-between bg-bg p-3.5 transition-colors hover:bg-surface md:min-h-[9.5rem] md:p-4"
                >
                  <span className="font-display text-2xl text-cinnabar md:text-3xl">{i.mark}</span>
                  <span>
                    <span className="block font-display text-lg">{i.name}</span>
                    <span className="mt-1 block text-xs leading-5 text-muted">{i.blurb}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
