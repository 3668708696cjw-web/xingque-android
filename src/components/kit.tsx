import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { interpretLocal } from "@/lib/horosa/interpret";
import { useChartStore } from "@/lib/horosa/store";
import { SECTIONS } from "@/lib/horosa/catalog";
import { cityOf } from "@/lib/horosa/cities";
import { birthLabel } from "@/lib/horosa/types";

export function Screen({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  const [jump, setJump] = useState(false);
  return (
    <div className="mx-auto w-full px-5 pb-16 pt-3 md:px-8 md:pt-6">
      <header className="mb-1 flex items-center gap-1">
        <button
          type="button"
          className="flex size-11 shrink-0 items-center justify-center text-ink transition-transform duration-150 ease-out active:scale-[0.96] md:hidden"
          aria-label="返回"
          onClick={() => {
            if (window.history.length > 1) window.history.back();
            else window.location.hash = "#/catalog";
          }}
        >
          <ChevronLeft className="size-6" strokeWidth={1.5} />
        </button>
        <h1 className="font-display text-[1.25rem] font-medium leading-tight tracking-tight md:text-[1.75rem]">{title}</h1>
        <div className="ml-auto flex shrink-0 items-center">
          <button
            type="button"
            className="h-11 px-2 text-sm text-muted lg:hidden"
            onClick={() => setJump(true)}
          >
            技法
          </button>
          {action ?? <SaveChartButton />}
        </div>
      </header>
      <DraftStrip />
      {children}
      {jump ? <TechniqueSheet onClose={() => setJump(false)} /> : null}
    </div>
  );
}

function DraftStrip() {
  const draft = useChartStore((s) => s.draft);
  const setNow = useChartStore((s) => s.setNow);
  return (
    <div className="mb-6 flex h-10 items-center justify-between gap-3 border-b border-line">
      <p className="min-w-0 truncate text-sm">
        <span className="font-display">{draft.name || cityOf(draft).name}</span>
        <span className="ml-2 tabular-nums text-muted">{birthLabel(draft)}</span>
        <span className="ml-2 hidden text-faint sm:inline">{cityOf(draft).name}</span>
      </p>
      <button type="button" className="h-10 shrink-0 px-2 text-sm text-cinnabar" onClick={setNow}>
        此刻
      </button>
    </div>
  );
}

function TechniqueSheet({ onClose }: { onClose: () => void }) {
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
    <div className="fixed inset-0 z-50 flex flex-col bg-bg/80" role="dialog" aria-label="换技法">
      <button type="button" className="h-16 shrink-0" onClick={onClose} aria-label="关闭" />
      <div className="mt-auto max-h-[82dvh] overflow-y-auto rounded-t-xl bg-surface px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4 shadow-card">
        <div className="mb-3 flex items-center">
          <p className="font-display text-lg">换技法</p>
          <button type="button" className="ml-auto h-11 px-2 text-sm text-muted" onClick={onClose}>
            关闭
          </button>
        </div>
        <p className="mb-3 text-xs text-muted">出生时间跟着走，只换盘式。</p>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索技法"
          className="mb-4 h-12 w-full border-0 border-b border-line bg-transparent text-base outline-none placeholder:text-faint focus:border-ink"
        />
        {sections.map((sec) => (
          <section key={sec.key} className="mb-5">
            <h3 className="mb-1 text-[11px] tracking-[0.2em] text-faint">{sec.title}</h3>
            {sec.items.map((i) => (
              <Link
                key={i.path}
                to={i.path as never}
                onClick={onClose}
                className="flex min-h-14 items-center justify-between gap-3 border-b border-line py-3"
              >
                <span className="font-display text-[17px]">{i.name}</span>
                <span className="max-w-[55%] text-right text-xs leading-snug text-muted">{i.blurb}</span>
              </Link>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}

export function SaveChartButton() {
  const saveDraft = useChartStore((s) => s.saveDraft);
  const saveAsNew = useChartStore((s) => s.saveAsNew);
  const [msg, setMsg] = useState("");
  return (
    <div className="flex items-center">
      <button
        type="button"
        className="h-11 min-w-11 px-2 text-sm text-muted"
        onClick={() => {
          saveAsNew();
          setMsg("另存");
          window.setTimeout(() => setMsg(""), 1600);
        }}
      >
        另存
      </button>
      <button
        type="button"
        className="h-11 min-w-11 px-3 text-sm text-cinnabar transition-transform duration-150 ease-out active:scale-[0.96]"
        onClick={() => {
          saveDraft();
          setMsg("已存");
          window.setTimeout(() => setMsg(""), 1600);
        }}
      >
        {msg || "保存"}
      </button>
    </div>
  );
}

export function Workbench({
  params,
  canvas,
  panel,
  labels,
}: {
  params?: React.ReactNode;
  canvas: React.ReactNode;
  panel: React.ReactNode;
  labels?: { canvas?: string; params?: string; panel?: string };
}) {
  const [tab, setTab] = useState<"canvas" | "params" | "panel">("canvas");
  const tabs: { id: "canvas" | "params" | "panel"; label: string }[] = [
    { id: "canvas", label: labels?.canvas ?? "盘面" },
    ...(params ? [{ id: "params" as const, label: labels?.params ?? "出生" }] : []),
    { id: "panel", label: labels?.panel ?? "详解" },
  ];
  return (
    <div>
      <div className="wb-mobile-tabs" role="tablist" aria-label="盘面分区">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={cn("wb-tab", tab === t.id && "is-on")}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className={cn("workbench", !params && "workbench-noparams")}>
        {params ? <div className={cn("wb-params", tab !== "params" && "wb-hide-sm")}>{params}</div> : null}
        <div className={cn("wb-canvas", tab !== "canvas" && "wb-hide-sm")}>{canvas}</div>
        <div className={cn("wb-panel", tab !== "panel" && "wb-hide-sm")}>{panel}</div>
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium tracking-wide text-muted">{label}</span>
      {children}
    </label>
  );
}

export function FieldInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-12 w-full rounded-sm border-0 border-b border-line bg-transparent px-0 text-base text-ink outline-none",
        "placeholder:text-faint focus:border-ink",
        props.className,
      )}
    />
  );
}

export function FieldSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "h-12 w-full appearance-none rounded-sm border-0 border-b border-line bg-transparent px-0 text-base text-ink outline-none focus:border-ink",
        props.className,
      )}
    />
  );
}

export function Primary({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "h-12 w-full rounded-md bg-ink text-[15px] font-medium text-bg transition-transform duration-150 ease-out active:scale-[0.98] disabled:opacity-40",
        props.className,
      )}
    >
      {children}
    </button>
  );
}

export function Ghost({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "h-12 w-full rounded-md text-[15px] font-medium text-ink transition-transform duration-150 ease-out active:scale-[0.98]",
        props.className,
      )}
    >
      {children}
    </button>
  );
}

export function Meta({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-relaxed text-muted">{children}</p>;
}

export function Block({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="mb-7">
      {title ? (
        <h2 className="mb-3 font-display text-xs font-medium tracking-wide text-muted">{title}</h2>
      ) : null}
      {children}
    </section>
  );
}

export function Row({
  to,
  title,
  blurb,
}: {
  to: string;
  title: string;
  blurb: string;
}) {
  return (
    <Link
      to={to as never}
      className="flex min-h-14 items-center justify-between gap-4 border-b border-line py-3.5 last:border-0"
    >
      <span className="font-display text-[17px]">{title}</span>
      <span className="max-w-[58%] text-right text-xs leading-snug text-muted">{blurb}</span>
    </Link>
  );
}

export function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-11 shrink-0 rounded-sm px-3.5 text-sm transition-colors duration-150 md:h-10",
        active ? "bg-ink text-bg" : "text-muted hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

export function QuietTabs({
  tabs,
  value,
  onChange,
}: {
  tabs: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="view-bar" role="tablist">
      {tabs.map((t) => (
        <button
          key={t}
          type="button"
          role="tab"
          aria-selected={value === t}
          onClick={() => onChange(t)}
          className={cn(
            "h-11 shrink-0 border-b px-3.5 text-sm",
            value === t ? "border-ink text-ink" : "border-transparent text-muted",
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

export function Fold({
  title,
  children,
  defaultOpen = false,
  badge,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-b border-line">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-12 w-full items-center justify-between gap-3 py-2.5 text-left"
      >
        <span className="text-xs tracking-wide text-muted">{title}</span>
        <span className="shrink-0 text-xs text-faint">
          {badge ? `${badge} · ` : ""}
          {open ? "收起" : "展开"}
        </span>
      </button>
      {open ? <div className="pb-4">{children}</div> : null}
    </section>
  );
}

export function PanelSections({
  sections,
  defaultId,
}: {
  sections: { id: string; content: React.ReactNode }[];
  defaultId?: string;
}) {
  const first = defaultId ?? sections[0]?.id ?? "";
  return (
    <div>
      {sections.map((s) => (
        <Fold key={s.id} title={s.id} defaultOpen={s.id === first}>
          {s.content}
        </Fold>
      ))}
    </div>
  );
}

export function ChartSplit({ chart, children }: { chart: React.ReactNode; children: React.ReactNode }) {
  return <Workbench canvas={chart} panel={children} />;
}

export function Interpret({ kind, summary }: { kind: string; summary: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setOpen(false);
  }, [kind, summary]);
  const paras = useMemo(() => (open ? interpretLocal(kind, summary) : []), [open, kind, summary]);

  return (
    <div className="mt-8 border-t border-line pt-6">
      {!open ? (
        <Ghost type="button" onClick={() => setOpen(true)}>
          本机解盘
        </Ghost>
      ) : (
        <div>
          <p className="mb-4 text-xs tracking-wide text-muted">本机规则 · 不联网 · 不上传</p>
          <div className="space-y-3 text-[15px] leading-7 text-ink">
            {paras.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}

export function Bar({ value, max = 1, label }: { value: number; max?: number; label: string }) {
  const w = max <= 0 ? 0 : Math.min(100, (value / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="w-8 text-xs text-muted">{label}</span>
      <div className="h-1.5 flex-1 bg-line">
        <div className="h-1.5 bg-ink" style={{ width: `${w}%` }} />
      </div>
      <span className="w-6 text-right text-xs tabular-nums text-faint">{value}</span>
    </div>
  );
}
