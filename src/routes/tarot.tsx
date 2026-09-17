import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ViewBar } from "@/components/chart-kit";
import { Ghost, Interpret, Screen, Workbench } from "@/components/kit";
import { TarotFace } from "@/components/tech-boards";
import { viewsOf } from "@/lib/horosa/catalog";
import { drawLenormand, drawSpread } from "@/lib/horosa/tarot";
import { useChartStore } from "@/lib/horosa/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tarot")({ component: Page });

const VIEWS = viewsOf("/tarot");

function Page() {
  const draft = useChartStore((s) => s.draft);
  const [view, setView] = useState(VIEWS[0] ?? "伟特");
  const [nudge, setNudge] = useState(0);
  const seed = draft.year * 10000 + draft.month * 100 + draft.day + draft.hour + nudge * 41;
  const cards = useMemo(() => {
    if (view === "雷诺曼") return drawLenormand(seed);
    if (view === "五张") return drawSpread("five", seed);
    return drawSpread("three", seed);
  }, [view, seed]);
  const deck = view === "雷诺曼" ? "雷诺曼" : "塔罗";
  return (
    <Screen title="塔罗">
      <Workbench
        params={
          <div>
            <p className="text-sm leading-7 text-muted">
              {view === "雷诺曼" ? "三十六张雷诺曼。过去、现在、出路。" : view === "五张" ? "伟特五张：现状到出路。" : "伟特七十八张。本机抽牌，不上传。"}
            </p>
            <Ghost type="button" className="mt-6" onClick={() => setNudge((n) => n + 1)}>
              再抽
            </Ghost>
          </div>
        }
        canvas={
          <div>
            <ViewBar views={VIEWS} value={view} onChange={setView} />
            <div
              className={cn(
                "grid gap-4",
                cards.length === 5 ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" : "grid-cols-3",
              )}
            >
              {cards.map((c) => (
                <TarotFace key={c.pos + c.id} c={c} />
              ))}
            </div>
          </div>
        }
        panel={
          <div className="space-y-4">
            {cards.map((c) => (
              <p key={c.pos} className="text-sm leading-7">
                <span className="text-muted">{c.pos} · </span>
                {c.name}
                {c.flipped ? "（逆）" : ""}：{c.flipped ? c.meaningR : c.meaningU}
              </p>
            ))}
            <Interpret kind={deck} summary={cards.map((c) => `${c.pos}:${c.name}${c.flipped ? "逆" : "正"}`).join(" ")} />
          </div>
        }
      />
    </Screen>
  );
}
