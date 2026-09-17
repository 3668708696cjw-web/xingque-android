import { useEffect, useState } from "react";
import { cityOf, wallClock } from "@/lib/horosa/cities";
import { useChartStore } from "@/lib/horosa/store";
import { birthLabel, type Gender } from "@/lib/horosa/types";
import { Chip, Field, FieldInput, Fold, Primary, useHydrated } from "./kit";
import { CityPicker, TimeStepper } from "./ops";

function useBirthFields() {
  const draft = useChartStore((s) => s.draft);
  const setDraft = useChartStore((s) => s.setDraft);
  const setNow = useChartStore((s) => s.setNow);
  const saveDraft = useChartStore((s) => s.saveDraft);
  const charts = useChartStore((s) => s.charts);
  const loadChart = useChartStore((s) => s.loadChart);
  return { draft, setDraft, setNow, saveDraft, charts, loadChart };
}

function Clock() {
  const [t, setT] = useState(() => wallClock());
  useEffect(() => {
    const id = window.setInterval(() => setT(wallClock()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return <span className="tabular-nums text-[12px] text-faint">{t}</span>;
}

function SavedList({
  charts,
  loadChart,
}: {
  charts: ReturnType<typeof useBirthFields>["charts"];
  loadChart: (id: string) => void;
}) {
  if (!charts.length) return <p className="text-xs text-muted">起盘后会留在本机。点保存即可。</p>;
  return (
    <ul>
      {charts.slice(0, 8).map((c) => (
        <li key={c.id}>
          <button
            type="button"
            className="flex min-h-11 w-full items-baseline justify-between gap-2 py-2 text-left text-sm"
            onClick={() => loadChart(c.id)}
          >
            <span className="truncate">{c.name || "未名"}</span>
            <span className="shrink-0 text-[11px] tabular-nums text-muted">{birthLabel(c)}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function BirthFields({
  submitLabel,
  onSubmit,
  onDone,
}: {
  submitLabel: string;
  onSubmit?: () => void;
  onDone?: () => void;
}) {
  const { draft, setDraft, saveDraft, charts, loadChart } = useBirthFields();
  const [saved, setSaved] = useState("");
  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        saveDraft();
        setSaved("已保存到本机");
        onSubmit?.();
        onDone?.();
      }}
    >
      <div className="flex items-center">
        <Clock />
      </div>
      <Field label="姓名">
        <FieldInput value={draft.name} onChange={(e) => setDraft({ name: e.target.value })} placeholder="称呼" />
      </Field>
      <Field label="性别">
        <div className="-ml-3 flex">
          {(["male", "female"] as Gender[]).map((g) => (
            <Chip key={g} active={draft.gender === g} onClick={() => setDraft({ gender: g })}>
              {g === "male" ? "男" : "女"}
            </Chip>
          ))}
        </div>
      </Field>
      <TimeStepper />
      <CityPicker />
      <Primary type="submit">{submitLabel}并保存</Primary>
      {saved ? <p className="text-xs text-cinnabar">{saved}</p> : null}
      <Fold title="本机命例" defaultOpen={false} badge={charts.length ? String(charts.length) : undefined}>
        <SavedList charts={charts} loadChart={loadChart} />
      </Fold>
    </form>
  );
}

export function BirthForm({
  onSubmit,
  submitLabel = "起盘",
  variant = "auto",
}: {
  onSubmit?: () => void;
  submitLabel?: string;
  variant?: "auto" | "panel";
}) {
  const ready = useHydrated();
  const { draft } = useBirthFields();
  const [open, setOpen] = useState(variant === "panel");
  if (!ready) return <p className="text-sm text-muted">载入…</p>;
  if (variant === "panel") return <BirthFields submitLabel={submitLabel} onSubmit={onSubmit} />;
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-12 w-full items-baseline justify-between gap-3 border-b border-line py-3 text-left"
      >
        <span className="font-display text-base">{draft.name || cityOf(draft).name}</span>
        <span className="shrink-0 text-xs text-muted">{birthLabel(draft)} · 改</span>
      </button>
    );
  }
  return <BirthFields submitLabel={submitLabel} onSubmit={onSubmit} onDone={() => setOpen(false)} />;
}

function BirthToolbar({ submitLabel, onSubmit }: { submitLabel: string; onSubmit?: () => void }) {
  const { draft, setDraft, setNow, saveDraft, shiftDraft } = {
    ...useBirthFields(),
    shiftDraft: useChartStore((s) => s.shiftDraft),
  };
  return (
    <form
      className="border-b border-line pb-3"
      onSubmit={(e) => {
        e.preventDefault();
        saveDraft();
        onSubmit?.();
      }}
    >
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-[7rem] flex-1">
          <span className="mb-1 block text-[11px] text-muted">姓名</span>
          <input
            value={draft.name}
            onChange={(e) => setDraft({ name: e.target.value })}
            className="h-11 w-full border-0 border-b border-line bg-transparent text-sm outline-none focus:border-ink"
            placeholder="称呼"
          />
        </label>
        <div className="flex gap-1 pb-1">
          {(["male", "female"] as Gender[]).map((g) => (
            <Chip key={g} active={draft.gender === g} onClick={() => setDraft({ gender: g })}>
              {g === "male" ? "男" : "女"}
            </Chip>
          ))}
        </div>
        <button type="submit" className="h-11 bg-ink px-4 text-sm text-bg">
          {submitLabel}
        </button>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1">
        {(
          [
            ["−年", { years: -1 }],
            ["+年", { years: 1 }],
            ["−月", { months: -1 }],
            ["+月", { months: 1 }],
            ["−日", { days: -1 }],
            ["+日", { days: 1 }],
            ["−时", { hours: -1 }],
            ["+时", { hours: 1 }],
          ] as const
        ).map(([lab, d]) => (
          <button
            key={lab}
            type="button"
            className="h-11 min-w-11 px-2 text-sm text-muted"
            onClick={() => shiftDraft(d)}
          >
            {lab}
          </button>
        ))}
        <button type="button" onClick={setNow} className="h-11 px-3 text-sm text-cinnabar">
          此刻
        </button>
      </div>
      <p className="mt-1 text-xs tabular-nums text-faint">
        {birthLabel(draft)} · {cityOf(draft).name}
      </p>
    </form>
  );
}

function MobileBirthSheet({ submitLabel, onSubmit }: { submitLabel: string; onSubmit?: () => void }) {
  const ready = useHydrated();
  const { draft, setNow, shiftDraft } = {
    ...useBirthFields(),
    shiftDraft: useChartStore((s) => s.shiftDraft),
  };
  const [open, setOpen] = useState(false);
  if (!ready) return <p className="text-sm text-muted">载入…</p>;
  return (
    <>
      <div className="border-b border-line py-2">
        <div className="flex min-h-12 items-center justify-between gap-2">
          <button type="button" onClick={() => setOpen(true)} className="min-w-0 flex-1 text-left">
            <span className="block truncate font-display text-base">{draft.name || cityOf(draft).name}</span>
            <span className="mt-0.5 block text-[11px] text-muted">
              {birthLabel(draft)} · {cityOf(draft).name} · {draft.gender === "male" ? "男" : "女"}
            </span>
          </button>
          <button type="button" className="h-11 shrink-0 px-2 text-[13px] text-cinnabar" onClick={setNow}>
            此刻
          </button>
          <button type="button" className="h-11 shrink-0 px-2 text-xs text-muted" onClick={() => setOpen(true)}>
            改
          </button>
        </div>
        <div className="-mx-1 mt-1 flex">
          {(
            [
              ["−日", { days: -1 }],
              ["+日", { days: 1 }],
              ["−时", { hours: -1 }],
              ["+时", { hours: 1 }],
            ] as const
          ).map(([lab, d]) => (
            <button key={lab} type="button" className="h-11 flex-1 text-sm text-muted" onClick={() => shiftDraft(d)}>
              {lab}
            </button>
          ))}
        </div>
      </div>
      {open ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-bg px-5 pb-10 pt-4">
          <div className="mb-5 flex items-center">
            <h2 className="font-display text-xl">起盘</h2>
            <button type="button" className="ml-auto h-11 px-2 text-sm text-muted" onClick={() => setOpen(false)}>
              关闭
            </button>
          </div>
          <BirthFields submitLabel={submitLabel} onSubmit={onSubmit} onDone={() => setOpen(false)} />
        </div>
      ) : null}
    </>
  );
}

export function BirthPanel({ submitLabel = "起盘", onSubmit }: { submitLabel?: string; onSubmit?: () => void }) {
  const ready = useHydrated();
  if (!ready) return <p className="text-sm text-muted">载入…</p>;
  return (
    <div>
      <div className="md:hidden">
        <MobileBirthSheet submitLabel={submitLabel} onSubmit={onSubmit} />
      </div>
      <div className="hidden md:block lg:hidden">
        <BirthToolbar submitLabel={submitLabel} onSubmit={onSubmit} />
      </div>
      <div className="hidden lg:block">
        <p className="mb-4 text-[11px] tracking-[0.22em] text-muted">起盘</p>
        <BirthFields submitLabel={submitLabel} onSubmit={onSubmit} />
      </div>
    </div>
  );
}
