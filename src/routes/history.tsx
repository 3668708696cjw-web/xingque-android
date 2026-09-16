import { createFileRoute, Link, Outlet, useChildMatches } from "@tanstack/react-router";
import { useDeferredValue, useMemo, useState } from "react";
import { DYNASTIES, EVENTS, PEOPLE, STORIES, searchHistory, yearLabel } from "@/lib/horosa/history";
import { CLASSICS } from "@/lib/horosa/classics";
import {
  CAPITALS,
  CELESTIAL_TERMS,
  EXTRA_TECHS,
  XS_PAGES,
  dailyPick,
  encyclopedia,
  featured,
  featuredFigures,
  listBookmarks,
  listSearches,
  personGraph,
  pushSearch,
  timelineSeries,
  xsStats,
  type XsPage,
} from "@/lib/horosa/xuanshi";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/history")({ component: HistoryLayout });

function HistoryLayout() {
  const child = useChildMatches();
  if (child.length) return <Outlet />;
  return <HistoryPage />;
}

function HistoryPage() {
  const [page, setPage] = useState<XsPage>("overview");
  const [q, setQ] = useState("");
  const go = (k: XsPage, query?: string) => {
    setPage(k);
    if (query) {
      setQ(query);
      pushSearch(query);
    }
  };

  return (
    <div className="xs-app">
      <aside className="xs-side">
        <div className="xs-brand">
          <span className="xs-seal">玄</span>
          <span className="xs-brand-name">玄学史</span>
        </div>
        {XS_PAGES.map((s) => (
          <button key={s.key} type="button" className={cn("xs-nav", page === s.key && "is-on")} onClick={() => go(s.key)}>
            {s.label}
          </button>
        ))}
      </aside>
      <div className="xs-stage">
        <div className="xs-inner">
          {page === "overview" && <Overview onGo={go} />}
          {page === "events" && <EventList kind="chronicle" />}
          {page === "celestial" && <EventList kind="sky" />}
          {page === "figures" && <Figures q={q} setQ={setQ} />}
          {page === "stories" && <Stories />}
          {page === "timeline" && <Timeline onGo={go} />}
          {page === "encyclopedia" && <Encyclopedia />}
          {page === "map" && <GeoMap />}
          {page === "persons" && <Relations />}
          {page === "desk" && <Desk onGo={go} />}
        </div>
      </div>
    </div>
  );
}

function Overview({ onGo }: { onGo: (k: XsPage, q?: string) => void }) {
  const s = xsStats();
  const figs = featuredFigures(6);
  const picks = featured(6);
  const daily = dailyPick();
  return (
    <div>
      <p className="xs-eye">二十四史 · 太平广记 · 原典</p>
      <h1 className="xs-hero">中国玄学史</h1>
      <div className="xs-rule" />
      <p className="mt-4 font-display text-[17px] tracking-[0.08em]">卜筮 · 占梦 · 相术 · 道术 · 风水 · 天象</p>
      <p className="mt-2 text-sm text-muted">三千载玄虚之学 · 正史野载兼收 · 本机离线馆藏</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" className="xs-btn-solid" onClick={() => onGo("events")}>
          玄学万象
        </button>
        <button type="button" className="xs-btn" onClick={() => onGo("celestial")}>
          星象大典
        </button>
        <button type="button" className="xs-btn" onClick={() => onGo("figures")}>
          名家列传
        </button>
      </div>

      <SearchBox onGo={onGo} />

      <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)]">
        <section>
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="xs-h2">玄典甄选</h2>
            <button type="button" className="xs-link" onClick={() => onGo("events")}>
              看更多
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {picks.map((e) => (
              <Link key={e.id} to="/history/$id" params={{ id: e.id }} className="xs-card">
                <div className="flex gap-2 text-[11px] text-muted">
                  <span>{yearLabel(e.year)}</span>
                  <span>{DYNASTIES.find((d) => d.id === e.dynasty)?.name}</span>
                </div>
                <div className="mt-3 font-display text-[17px] leading-snug">{e.title}</div>
                <p className="mt-2 line-clamp-2 text-[13px] leading-6 text-muted">{e.body}</p>
              </Link>
            ))}
          </div>
        </section>
        <aside>
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="xs-h2">玄学名家</h2>
            <button type="button" className="xs-link" onClick={() => onGo("figures")}>
              全部
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {figs.map((p) => (
              <Link key={p.id} to="/history/$id" params={{ id: p.id }} className="xs-card xs-card-tight">
                <div className="flex items-start gap-3">
                  <span className="xs-seal">{p.name.slice(0, 1)}</span>
                  <div>
                    <div className="font-display text-[15px]">{p.name}</div>
                    <div className="mt-0.5 text-[11px] text-muted">{p.years}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <Link to="/history/$id" params={{ id: daily.id }} className="xs-card mt-5 block">
            <p className="xs-eye">今日馆藏</p>
            <div className="mt-2 font-display text-lg">{daily.name}</div>
            <p className="mt-2 text-[13px] leading-6 text-muted">{daily.summary}</p>
          </Link>
        </aside>
      </div>

      <h2 className="xs-h2 mt-16">图谱工具</h2>
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {(
          [
            ["celestial", "星象大典", "客星、彗孛、日食"],
            ["timeline", "朝代时间轴", "三千年分布"],
            ["map", "地理地图", "都城与分野"],
            ["persons", "人物关系", "师承共现"],
            ["encyclopedia", "词条百科", "术数 / 朝代 / 天象"],
          ] as const
        ).map(([k, n, sub]) => (
          <button key={k} type="button" className="xs-tool" onClick={() => onGo(k)}>
            <div className="font-display text-[16px]">{n}</div>
            <div className="mt-1 text-[12px] text-muted">{sub}</div>
          </button>
        ))}
      </div>

      <h2 className="xs-h2 mt-16">馆藏</h2>
      <div className="xs-coll">
        {[
          [s.people, "名家列传"],
          [s.events, "编年事件"],
          [s.sky, "天象记录"],
          [s.classics, "索引古籍"],
          [s.terms, "词条"],
        ].map(([n, l]) => (
          <div key={String(l)} className="xs-coll-cell">
            <div className="xs-coll-num">{n}</div>
            <div className="text-[12px] text-muted">{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SearchBox({ onGo }: { onGo: (k: XsPage, q?: string) => void }) {
  const [v, setV] = useState("");
  const submit = () => {
    const s = v.trim();
    if (!s) return;
    onGo("figures", s);
  };
  return (
    <div className="mt-12">
      <div className="xs-deco" />
      <form
        className="mt-6 flex max-w-xl items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <label className="flex-1">
          <span className="xs-eye">检索</span>
          <input
            value={v}
            onChange={(e) => setV(e.target.value)}
            placeholder="人物、技法、朝代、书名"
            className="mt-2 h-12 w-full border-0 border-b border-line bg-transparent text-[16px] outline-none placeholder:text-faint focus:border-ink"
          />
        </label>
        <button type="submit" className="xs-btn-solid h-12 px-5">
          寻
        </button>
      </form>
    </div>
  );
}

function EventList({ kind }: { kind: "chronicle" | "sky" }) {
  const [dyn, setDyn] = useState("all");
  const list = EVENTS.filter((e) => e.kind === kind)
    .filter((e) => dyn === "all" || e.dynasty === dyn)
    .sort((a, b) => a.year - b.year);
  return (
    <div>
      <Crumb title={kind === "sky" ? "星象大典" : "玄学事件"} />
      <DynChips value={dyn} onChange={setDyn} />
      <div className="mt-8 space-y-3">
        {list.map((e) => (
          <Link key={e.id} to="/history/$id" params={{ id: e.id }} className="xs-row">
            <span className="w-16 shrink-0 text-[12px] tabular-nums text-muted">{yearLabel(e.year)}</span>
            <span>
              <span className="font-display text-[18px]">{e.title}</span>
              <span className="mt-1 block text-[13px] leading-6 text-muted">{e.body.slice(0, 72)}…</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Figures({ q, setQ }: { q: string; setQ: (s: string) => void }) {
  const [dyn, setDyn] = useState("all");
  const dq = useDeferredValue(q);
  const found = useMemo(() => searchHistory(dq).people, [dq]);
  const list = found.filter((p) => dyn === "all" || p.dynasty === dyn);
  return (
    <div>
      <Crumb title="人物列传" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="搜人名、技法"
        className="mt-6 h-12 w-full max-w-md border-0 border-b border-line bg-transparent text-[16px] outline-none placeholder:text-faint focus:border-ink"
      />
      <DynChips value={dyn} onChange={setDyn} />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <Link key={p.id} to="/history/$id" params={{ id: p.id }} className="xs-card">
            <div className="flex items-start gap-3">
              <span className="xs-seal">{p.name.slice(0, 1)}</span>
              <div className="min-w-0">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-display text-[18px]">{p.name}</span>
                  <span className="shrink-0 text-[11px] text-muted">{p.years}</span>
                </div>
                <p className="mt-2 text-[13px] leading-6 text-muted">{p.summary}</p>
                <p className="mt-2 text-[11px] text-faint">{p.tags.join(" · ")}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Stories() {
  return (
    <div>
      <Crumb title="故事专题" />
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {STORIES.map((s) => (
          <Link key={s.id} to="/history/$id" params={{ id: s.id }} className="xs-card">
            <p className="text-[11px] text-muted">{s.source}</p>
            <div className="mt-2 font-display text-xl">{s.title}</div>
            <p className="mt-3 line-clamp-3 text-[14px] leading-7 text-muted">{s.body}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Timeline({ onGo }: { onGo: (k: XsPage) => void }) {
  const series = timelineSeries();
  const max = Math.max(...series.map((s) => s.total), 1);
  return (
    <div>
      <Crumb title="朝代时间轴" />
      <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
        {EVENTS.length} 条事件、{PEOPLE.length} 位人物，归入 {series.length} 个大朝代。点一段看该朝人物。
      </p>
      <div className="xs-card mt-8 overflow-x-auto p-6">
        <div className="flex h-56 min-w-[40rem] items-end gap-2">
          {series.map((s) => (
            <button
              key={s.id}
              type="button"
              className="group flex min-w-0 flex-1 flex-col items-center"
              onClick={() => onGo("figures")}
            >
              <span className="mb-2 text-[11px] tabular-nums text-muted">{s.total}</span>
              <span
                className="w-full rounded-t bg-cinnabar/80 group-hover:bg-cinnabar"
                style={{ height: `${Math.max(12, (s.total / max) * 160)}px` }}
              />
              <span className="mt-2 text-[12px]">{s.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Encyclopedia() {
  const [cat, setCat] = useState<"technique" | "dynasty" | "celestial">("technique");
  const all = encyclopedia();
  const list = all.filter((t) => t.cat === cat);
  return (
    <div>
      <Crumb title="词条百科" />
      <div className="mt-6 flex gap-2">
        {(
          [
            ["technique", "术数词条"],
            ["dynasty", "朝代词条"],
            ["celestial", "天象词条"],
          ] as const
        ).map(([k, n]) => (
          <button key={k} type="button" className={cn("xs-btn", cat === k && "xs-btn-solid")} onClick={() => setCat(k)}>
            {n}
          </button>
        ))}
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((t) => (
          <Link key={t.id} to="/history/$id" params={{ id: t.id }} className="xs-card">
            <span className="xs-seal">{t.name.slice(0, 1)}</span>
            <div className="mt-3 font-display text-lg">{t.name}</div>
            <p className="mt-1 text-[12px] text-muted">{t.sub}</p>
            <p className="mt-3 text-[13px] leading-6 text-muted">{t.one}</p>
          </Link>
        ))}
      </div>
      <p className="mt-8 text-[12px] text-faint">
        另收 {CLASSICS.length} 篇原典节文、{EXTRA_TECHS.length} 条旁支技法、{CELESTIAL_TERMS.length} 条天象词。
      </p>
    </div>
  );
}

function GeoMap() {
  const [sel, setSel] = useState(CAPITALS[2]);
  return (
    <div>
      <Crumb title="玄学地图" />
      <p className="mt-3 max-w-xl text-sm leading-7 text-muted">都城随朝代迁移。点一处，看那里的太史、司天与术数。</p>
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)]">
        <div className="xs-card p-0">
          <svg viewBox="0 0 100 80" className="w-full" aria-label="都城示意图">
            <rect x="0" y="0" width="100" height="80" fill="var(--color-surface-2)" />
            <path d="M12 58 C 22 40, 30 28, 48 22 C 62 18, 74 26, 86 38 C 90 48, 84 62, 70 68 C 52 74, 28 70, 12 58 Z" fill="var(--color-surface)" stroke="var(--color-line)" />
            {CAPITALS.map((c) => (
              <g key={c.id} onClick={() => setSel(c)} style={{ cursor: "pointer" }}>
                <circle cx={c.x} cy={c.y} r={sel.id === c.id ? 2.4 : 1.6} fill={sel.id === c.id ? "var(--color-cinnabar)" : "var(--color-ink)"} />
                <text x={c.x + 2.2} y={c.y + 1.2} fontSize="3.2" fill="var(--color-ink)">
                  {c.name}
                </text>
              </g>
            ))}
          </svg>
        </div>
        <div>
          <p className="xs-eye">{sel.dynasty}</p>
          <h2 className="mt-2 font-display text-2xl">{sel.name}</h2>
          <p className="mt-4 text-[15px] leading-7 text-muted">{sel.note}</p>
        </div>
      </div>
    </div>
  );
}

function Relations() {
  const { nodes, edges } = personGraph(24);
  const pos = Object.fromEntries(nodes.map((n) => [n.id, n]));
  return (
    <div>
      <Crumb title="人物关系" />
      <p className="mt-3 max-w-xl text-sm leading-7 text-muted">师承、合撰、同见一卷。连线来自本馆互见，不是全史社交图。</p>
      <div className="xs-card mt-8 p-0">
        <svg viewBox="0 0 100 100" className="w-full" aria-label="人物关系">
          {edges.map((e) => {
            const a = pos[e.a];
            const b = pos[e.b];
            if (!a || !b) return null;
            return <line key={e.a + e.b} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--color-line)" strokeWidth="0.25" />;
          })}
          {nodes.map((n) => (
            <g key={n.id}>
              <circle cx={n.x} cy={n.y} r="1.6" fill="var(--color-cinnabar)" />
              <text x={n.x} y={n.y - 2.2} textAnchor="middle" fontSize="2.4" fill="var(--color-ink)">
                {n.name}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        {nodes.slice(0, 12).map((n) => (
          <Link key={n.id} to="/history/$id" params={{ id: n.id }} className="text-muted hover:text-ink">
            {n.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

function Desk({ onGo }: { onGo: (k: XsPage, q?: string) => void }) {
  const daily = dailyPick();
  const bms = typeof document === "undefined" ? [] : listBookmarks();
  const hist = typeof document === "undefined" ? [] : listSearches();
  return (
    <div>
      <Crumb title="案头" />
      <p className="mt-2 text-sm text-muted">私藏 · 检索 · 今日所遇</p>
      <Link to="/history/$id" params={{ id: daily.id }} className="xs-card mt-8 block">
        <p className="xs-eye">今日精选</p>
        <div className="mt-2 font-display text-xl">{daily.name}</div>
        <p className="mt-2 text-[14px] leading-7 text-muted">{daily.summary}</p>
      </Link>
      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <section>
          <h2 className="xs-h2">私藏</h2>
          {bms.length ? (
            <ul className="mt-4 space-y-2">
              {bms.map((b) => (
                <li key={b.kind + b.id}>
                  <Link to="/history/$id" params={{ id: b.id }} className="text-[15px]">
                    {b.title}
                  </Link>
                  <span className="ml-2 text-[11px] text-faint">{b.kind}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted">打开一篇，点星收藏。</p>
          )}
        </section>
        <section>
          <h2 className="xs-h2">近探</h2>
          {hist.length ? (
            <ul className="mt-4 space-y-2">
              {hist.map((h) => (
                <li key={h.ts}>
                  <button type="button" className="text-[15px]" onClick={() => onGo("figures", h.q)}>
                    {h.q}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted">检索会出现在这里。</p>
          )}
          <div className="mt-8 flex flex-wrap gap-2">
            {XS_PAGES.slice(0, 6).map((p) => (
              <button key={p.key} type="button" className="xs-btn" onClick={() => onGo(p.key)}>
                {p.label}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Crumb({ title }: { title: string }) {
  return (
    <div>
      <p className="text-[12px] text-muted">首页 / {title}</p>
      <h1 className="mt-3 font-display text-3xl font-medium tracking-tight md:text-4xl">{title}</h1>
    </div>
  );
}

function DynChips({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="-mx-1 mt-6 flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <button type="button" className={cn("h-10 shrink-0 px-3 text-sm", value === "all" ? "text-ink" : "text-muted")} onClick={() => onChange("all")}>
        全部
      </button>
      {DYNASTIES.map((d) => (
        <button key={d.id} type="button" className={cn("h-10 shrink-0 px-3 text-sm", value === d.id ? "text-ink" : "text-muted")} onClick={() => onChange(d.id)}>
          {d.name}
        </button>
      ))}
    </div>
  );
}
