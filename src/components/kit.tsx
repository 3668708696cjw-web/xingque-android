import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { interpretLocal } from "@/lib/horosa/interpret";
import { ALL_TECHNIQUES } from "@/lib/horosa/catalog";

export function Screen({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const nearby = ALL_TECHNIQUES.filter((t) => t.path !== "/history");
  return (
    <div className="mx-auto w-full px-4 pb-8 pt-2 md:px-5 md:pb-8 md:pt-3 lg:px-6">
      <header className="mb-3 flex items-center gap-1 lg:mb-6">
        <Link
          to="/catalog"
          className="flex size-11 items-center justify-center text-ink transition-transform duration-150 ease-out active:scale-[0.96] md:hidden"
          aria-label="排盘"
        >
          <ChevronLeft className="size-6" strokeWidth={1.5} />
        </Link>
        <h1 className="font-display text-xl font-medium leading-tight tracking-tight md:text-2xl">{title}</h1>
        <div className="ml-auto">{action}</div>
      </header>
      <div className="-mx-4 mb-4 flex overflow-x-auto border-b border-line px-2 [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden">
        {nearby.map((t) => (
          <Link
            key={t.path}
            to={t.path as never}
            className={cn(
              "h-10 shrink-0 px-3 text-sm",
              pathname === t.path ? "border-b border-ink text-ink" : "text-muted",
            )}
          >
            {t.name}
          </Link>
        ))}
      </div>
      {children}
    </div>
  );
}

export function Workbench({
  params,
  canvas,
  panel,
}: {
  params?: React.ReactNode;
  canvas: React.ReactNode;
  panel: React.ReactNode;
}) {
  return (
    <div className={cn("workbench", !params && "workbench-noparams")}>
      {params ? <div className="wb-params">{params}</div> : null}
      <div className="wb-canvas">{canvas}</div>
      <div className="wb-panel">{panel}</div>
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
        "h-11 w-full border-0 border-b border-line bg-transparent px-0 text-[15px] text-ink outline-none",
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
        "h-11 w-full appearance-none border-0 border-b border-line bg-transparent px-0 text-[15px] text-ink outline-none focus:border-ink",
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
        "h-12 w-full bg-ink text-[15px] font-medium text-bg transition-transform duration-150 ease-out active:scale-[0.96] disabled:opacity-40",
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
        "h-12 w-full text-[15px] font-medium text-ink transition-transform duration-150 ease-out active:scale-[0.96]",
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
        "h-11 shrink-0 px-3 text-sm transition-colors duration-150 md:h-9",
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
    <div className="-mx-1 mb-4 flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={cn(
            "h-10 shrink-0 border-b px-3 text-sm",
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
        className="flex min-h-11 w-full items-center justify-between gap-3 py-2.5 text-left"
      >
        <span className="text-[11px] tracking-[0.18em] text-muted">{title}</span>
        <span className="shrink-0 text-[11px] text-faint">
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
  return (
    <Workbench canvas={chart} panel={children} />
  );
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
