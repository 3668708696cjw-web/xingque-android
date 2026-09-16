import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Chip, Ghost, Interpret, Screen, Workbench } from "@/components/kit";
import { drawSpread, type Drawn } from "@/lib/horosa/tarot";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tarot")({ component: Page });

function CardFace({ c }: { c: Drawn }) {
  return (
    <article className="min-w-0">
      <p className="mb-2 text-[11px] tracking-wide text-muted">{c.pos}</p>
      <div
        className={cn(
          "aspect-[2/3] border border-line bg-surface p-4",
          c.flipped && "rotate-180",
        )}
      >
        <p className="text-[10px] tracking-widest text-faint">{c.suit}</p>
        <p className="mt-6 font-display text-[22px] leading-tight">{c.name}</p>
        <div className="mt-6 h-px bg-line" />
        <p className="mt-4 text-xs leading-5 text-muted">{c.flipped ? c.meaningR : c.meaningU}</p>
      </div>
    </article>
  );
}

function Page() {
  const [kind, setKind] = useState<"three" | "five">("three");
  const [cards, setCards] = useState<Drawn[]>([]);
  return (
    <Screen title="塔罗">
      <Workbench
        params={
          <div>
            <div className="-ml-3 flex">
              <Chip active={kind === "three"} onClick={() => setKind("three")}>
                三张
              </Chip>
              <Chip active={kind === "five"} onClick={() => setKind("five")}>
                五张
              </Chip>
            </div>
            <Ghost type="button" className="mt-4" onClick={() => setCards(drawSpread(kind))}>
              抽牌
            </Ghost>
          </div>
        }
        canvas={
          cards.length ? (
            <div
              className={cn(
                "grid gap-4",
                cards.length === 5 ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" : "grid-cols-3",
              )}
            >
              {cards.map((c) => (
                <CardFace key={c.pos} c={c} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">抽牌后牌阵铺在中间。正逆与牌义写在右侧。</p>
          )
        }
        panel={
          cards.length ? (
            <div className="space-y-4">
              {cards.map((c) => (
                <p key={c.pos} className="text-sm leading-7">
                  <span className="text-muted">{c.pos} · </span>
                  {c.name}
                  {c.flipped ? "（逆）" : ""}：{c.flipped ? c.meaningR : c.meaningU}
                </p>
              ))}
              <Interpret
                kind="塔罗"
                summary={cards.map((c) => `${c.pos}:${c.name}${c.flipped ? "逆" : "正"}`).join(" ")}
              />
            </div>
          ) : (
            <p className="text-sm text-muted">伟特牌义，本机抽牌，不上传。</p>
          )
        }
      />
    </Screen>
  );
}
