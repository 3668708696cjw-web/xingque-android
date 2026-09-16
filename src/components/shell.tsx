import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, Circle, Layers, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { nowAsBirth } from "@/lib/horosa/cities";
import { BU, MING, TOOLS } from "@/lib/horosa/catalog";
import { useChartStore } from "@/lib/horosa/store";

const TABS = [
  { to: "/", label: "今日", icon: Circle },
  { to: "/catalog", label: "排盘", icon: Layers },
  { to: "/history", label: "史", icon: BookOpen },
  { to: "/me", label: "我", icon: User },
] as const;

const TAB_PATHS = new Set(["/", "/catalog", "/history", "/me"]);

const GROUPS = [
  { key: "ming", title: "命", items: MING },
  { key: "bu", title: "卜", items: BU },
  { key: "tools", title: "工具", items: TOOLS },
] as const;

function groupOf(path: string) {
  if (path.startsWith("/history")) return "history";
  if (path === "/me" || path === "/about") return "me";
  if (path === "/") return "today";
  if (MING.some((i) => i.path === path)) return "ming";
  if (BU.some((i) => i.path === path)) return "bu";
  if (TOOLS.some((i) => i.path === path) || path === "/catalog") return "tools";
  return "";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const setHydrated = useChartStore((s) => s.setHydrated);
  const setDraft = useChartStore((s) => s.setDraft);
  const [tabletGroup, setTabletGroup] = useState<string>("");

  useEffect(() => {
    setHydrated(true);
    const s = useChartStore.getState();
    if (!s.charts.length && !s.draft.name && s.draft.year === 1990 && s.draft.month === 1 && s.draft.day === 1) {
      setDraft(nowAsBirth("taipei"));
    }
  }, [setHydrated, setDraft]);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  useEffect(() => {
    const g = groupOf(pathname);
    if (g === "ming" || g === "bu" || g === "tools") setTabletGroup(g);
    else if (pathname === "/catalog") setTabletGroup("ming");
  }, [pathname]);

  const activeGroup = useMemo(() => groupOf(pathname), [pathname]);
  const tabletItems = GROUPS.find((g) => g.key === tabletGroup)?.items ?? MING;

  return (
    <div className="min-h-dvh bg-bg text-ink lg:flex">
      <aside className="sticky top-0 hidden h-dvh w-52 shrink-0 flex-col border-r border-line lg:flex">
        <Link to="/" className="px-5 pt-6 font-display text-sm tracking-wide">
          星阙
        </Link>
        <p className="px-5 pt-1 text-[11px] text-faint">本地离线工作台</p>
        <nav className="mt-6 flex-1 overflow-y-auto px-2 pb-8">
          <SideLink to="/" active={pathname === "/"} label="今日" />
          {GROUPS.map((g) => (
            <div key={g.key} className="mt-5">
              <p className="px-3 pb-1 text-[10px] tracking-[0.2em] text-faint">{g.title}</p>
              {g.items.map((i) => (
                <SideLink key={i.path} to={i.path} active={pathname === i.path} label={i.name} mark={i.mark} />
              ))}
            </div>
          ))}
          <div className="mt-5">
            <p className="px-3 pb-1 text-[10px] tracking-[0.2em] text-faint">册</p>
            <SideLink to="/history" active={pathname.startsWith("/history")} label="玄学史" />
            <SideLink to="/me" active={pathname === "/me" || pathname === "/about"} label="命例" />
          </div>
        </nav>
      </aside>

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-20 hidden border-b border-line bg-bg/95 backdrop-blur-sm md:block lg:hidden">
          <div className="flex items-center gap-1 overflow-x-auto px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Link to="/" className="px-2 py-3 font-display text-sm">
              星阙
            </Link>
            {(
              [
                ["ming", "命"],
                ["bu", "卜"],
                ["tools", "工具"],
                ["history", "史"],
                ["me", "我"],
              ] as const
            ).map(([k, lab]) =>
              k === "history" ? (
                <Link
                  key={k}
                  to="/history"
                  className={cn("h-11 shrink-0 px-3 text-sm", activeGroup === "history" ? "text-ink" : "text-muted")}
                >
                  {lab}
                </Link>
              ) : k === "me" ? (
                <Link
                  key={k}
                  to="/me"
                  className={cn("h-11 shrink-0 px-3 text-sm", activeGroup === "me" ? "text-ink" : "text-muted")}
                >
                  {lab}
                </Link>
              ) : (
                <button
                  key={k}
                  type="button"
                  onClick={() => setTabletGroup(k)}
                  className={cn("h-11 shrink-0 px-3 text-sm", tabletGroup === k || activeGroup === k ? "text-ink" : "text-muted")}
                >
                  {lab}
                </button>
              ),
            )}
          </div>
          {tabletGroup === "ming" || tabletGroup === "bu" || tabletGroup === "tools" ? (
            <div className="flex flex-wrap gap-x-1 border-t border-line px-2 py-1">
              {tabletItems.map((i) => (
                <Link
                  key={i.path}
                  to={i.path}
                  className={cn(
                    "h-9 px-2.5 text-sm",
                    pathname === i.path ? "bg-ink text-bg" : "text-muted",
                  )}
                >
                  {i.name}
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        <div className={cn("mx-auto w-full max-w-[1680px] flex-1 pb-[calc(4.75rem+env(safe-area-inset-bottom))] md:pb-0")}>{children}</div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="border-t border-line bg-bg/95 backdrop-blur-sm">
          <div className="mx-auto grid max-w-lg grid-cols-4">
            {TABS.map((t) => {
              const on =
                t.to === "/catalog"
                  ? pathname === "/catalog" || (!TAB_PATHS.has(pathname) && pathname !== "/about")
                  : t.to === "/history"
                    ? pathname.startsWith("/history")
                    : pathname === t.to;
              const Icon = t.icon;
              return (
                <Link key={t.to} to={t.to} className="flex h-14 flex-col items-center justify-center gap-0.5">
                  <Icon className="size-4" strokeWidth={on ? 2 : 1.5} />
                  <span className={cn("text-[10px] tracking-wide", on ? "text-ink" : "text-muted")}>{t.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}

function SideLink({
  to,
  active,
  label,
  mark,
}: {
  to: string;
  active: boolean;
  label: string;
  mark?: string;
}) {
  return (
    <Link
      to={to as never}
      className={cn(
        "flex h-9 items-center gap-2 px-3 text-sm transition-colors",
        active ? "bg-ink text-bg" : "text-muted hover:text-ink",
      )}
    >
      {mark ? <span className="w-4 text-center font-display text-xs opacity-70">{mark}</span> : null}
      <span>{label}</span>
    </Link>
  );
}
