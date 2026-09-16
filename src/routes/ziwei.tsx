import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { BirthPanel } from "@/components/birth-form";
import { ZiweiBoard } from "@/components/boards";
import { Interpret, Meta, PanelSections, Screen, Workbench } from "@/components/kit";
import { computeZiwei } from "@/lib/horosa/ziwei";
import { useChartStore } from "@/lib/horosa/store";

export const Route = createFileRoute("/ziwei")({ component: Page });

function Page() {
  const draft = useChartStore((s) => s.draft);
  const data = useMemo(() => computeZiwei(draft), [draft]);
  return (
    <Screen title="紫微">
      <Workbench
        params={<BirthPanel />}
        canvas={
          <div>
            <Meta>
              {data.lunar} {data.time} · {data.five} · 命主{data.soul} 身主{data.body} · {data.zodiac}
            </Meta>
            <div className="mt-3">
              <ZiweiBoard data={data} />
            </div>
          </div>
        }
        panel={
          <div>
            <PanelSections
              sections={[
                {
                  id: "十二宫",
                  content: (
                    <ul>
                      {data.palaces.map((p) => (
                        <li key={p.branch} className="border-b border-line py-2.5">
                          <div className="flex justify-between text-sm">
                            <span>
                              {p.name}
                              {p.isBody ? " · 身" : ""}
                            </span>
                            <span className="text-muted">
                              {p.stem}
                              {p.branch}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-muted">
                            {p.majors.map((s) => s.name + (s.mutagen ?? "")).join(" ")} {p.minors.slice(0, 6).join(" ")}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ),
                },
                {
                  id: "流年",
                  content: (
                    <div>
                      <p className="text-sm">
                        {data.yearly.stem}
                        {data.yearly.branch}年
                      </p>
                      <p className="mt-2 text-sm text-muted">四化 {data.yearly.mutagen.join(" · ") || "—"}</p>
                    </div>
                  ),
                },
                {
                  id: "大限",
                  content: (
                    <ul>
                      {data.palaces.map((p) => (
                        <li key={p.branch} className="flex justify-between border-b border-line py-2 text-sm">
                          <span>{p.name}</span>
                          <span className="tabular-nums text-muted">
                            {p.decadal.range[0]}–{p.decadal.range[1]} · {p.decadal.heavenlyStem}
                            {p.decadal.earthlyBranch}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ),
                },
              ]}
            />
            <Interpret
              kind="紫微斗数"
              summary={`${data.five} 命${data.soul} 身${data.body} ` + data.palaces.map((p) => `${p.name}:${p.majors.map((s) => s.name).join("")}`).join(" ")}
            />
          </div>
        }
      />
    </Screen>
  );
}
