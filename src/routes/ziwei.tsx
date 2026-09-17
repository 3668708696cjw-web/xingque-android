import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BirthPanel } from "@/components/birth-form";
import { ZiweiBoard } from "@/components/boards";
import { EraStrip, Palace12, ViewBar } from "@/components/chart-kit";
import { Interpret, Meta, PanelSections, Screen, Workbench } from "@/components/kit";
import { viewsOf } from "@/lib/horosa/catalog";
import { computeZiwei } from "@/lib/horosa/ziwei";
import { useChartStore } from "@/lib/horosa/store";

export const Route = createFileRoute("/ziwei")({ component: Page });

const VIEWS = viewsOf("/ziwei");

function Page() {
  const draft = useChartStore((s) => s.draft);
  const data = useMemo(() => computeZiwei(draft), [draft]);
  const [view, setView] = useState(VIEWS[0] ?? "本命方盘");
  const now = new Date();
  let age = now.getFullYear() - draft.year;
  if (now.getMonth() + 1 < draft.month || (now.getMonth() + 1 === draft.month && now.getDate() < draft.day)) age -= 1;
  age = Math.max(0, age);
  const yearlyPalace = data.palaces.find((p) => p.branch === data.yearly.branch);
  return (
    <Screen title="紫微">
      <Workbench
        params={<BirthPanel />}
        canvas={
          <div>
            <Meta>
              {data.lunar} {data.time} · {data.five} · 命主{data.soul} 身主{data.body} · {data.zodiac}
            </Meta>
            <ViewBar views={VIEWS} value={view} onChange={setView} />
            <div className="mt-3">
              {view === "大限" ? (
                <EraStrip
                  items={data.palaces.map((p) => ({
                    lord: p.name,
                    fromAge: p.decadal.range[0],
                    toAge: p.decadal.range[1],
                    current: age >= p.decadal.range[0] && age < p.decadal.range[1],
                  }))}
                />
              ) : view === "流年宫" ? (
                <Palace12
                  cells={data.palaces.map((p) => ({
                    branch: p.branch,
                    title: p.name,
                    kicker: p.branch,
                    lines: p.majors.map((s) => s.name + (s.mutagen ?? "")),
                    active: p.branch === data.yearly.branch,
                  }))}
                  center={
                    <div>
                      <p className="font-display text-xl">流年</p>
                      <p className="mt-1 text-sm text-muted">
                        {data.yearly.stem}
                        {data.yearly.branch}
                        {yearlyPalace ? ` · ${yearlyPalace.name}` : ""}
                      </p>
                    </div>
                  }
                />
              ) : view === "四化" ? (
                <Palace12
                  cells={data.palaces.map((p) => ({
                    branch: p.branch,
                    title: p.name,
                    kicker: p.branch,
                    lines: p.majors.filter((s) => s.mutagen).map((s) => `${s.name}${s.mutagen}`),
                    active: p.majors.some((s) => s.mutagen),
                  }))}
                  center={
                    <div>
                      <p className="font-display text-xl">四化</p>
                    </div>
                  }
                />
              ) : view === "辅星" ? (
                <Palace12
                  cells={data.palaces.map((p) => ({
                    branch: p.branch,
                    title: p.name,
                    kicker: p.branch,
                    lines: p.minors.slice(0, 6),
                    active: p.isBody,
                  }))}
                  center={
                    <div>
                      <p className="font-display text-xl">辅星</p>
                    </div>
                  }
                />
              ) : (
                <ZiweiBoard data={data} />
              )}
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
              kind="紫微"
              summary={`${data.five} 命主${data.soul} 身主${data.body} ${data.palaces
                .filter((p) => p.isOrigin || p.isBody)
                .map((p) => p.name + p.majors.map((s) => s.name).join(""))
                .join(" ")}`}
            />
          </div>
        }
      />
    </Screen>
  );
}
