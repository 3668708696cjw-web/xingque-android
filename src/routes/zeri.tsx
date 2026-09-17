import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Chip, Screen, Workbench } from "@/components/kit";
import { ZERI_TECHS, computeZeriDesk, type ZeriTech } from "@/lib/horosa/zeri";
import { useChartStore } from "@/lib/horosa/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/zeri")({ component: Page });

function Page() {
  const draft = useChartStore((s) => s.draft);
  const [tech, setTech] = useState<ZeriTech>("黄历");
  const days = useMemo(() => computeZeriDesk(draft, tech), [draft, tech]);
  return (
    <Screen title="择日">
      <Workbench
        canvas={
          <div>
            <p className="text-sm text-muted">从今日起二十一日，十技法各算一套。本机，不连网。</p>
            <div className="-ml-3 mt-3 flex flex-wrap">
              {ZERI_TECHS.map((t) => (
                <Chip key={t} active={tech === t} onClick={() => setTech(t)}>
                  {t}
                </Chip>
              ))}
            </div>
            <ul className="mt-4">
              {days.map((d) => (
                <li key={d.ymd} className="flex items-start justify-between gap-3 border-b border-line py-3">
                  <div>
                    <div className="font-display text-lg">
                      {d.ymd.slice(5)} 周{d.week}
                    </div>
                    <p className="mt-1 text-xs text-muted">{d.detail}</p>
                  </div>
                  <span className={cn("shrink-0 text-sm", d.score >= 3 ? "text-cinnabar" : "text-muted")}>{d.note}</span>
                </li>
              ))}
            </ul>
          </div>
        }
        panel={
          <p className="text-sm leading-7 text-muted">
            对照 Windows 择日十技法：黄历、天星、奇门、八字、太乙、紫微、六壬、三式、七政、印占。条件树与方案存档仍以桌面端为准。
          </p>
        }
      />
    </Screen>
  );
}
