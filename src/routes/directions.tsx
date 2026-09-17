import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BirthPanel } from "@/components/birth-form";
import { NatalWheel } from "@/components/natal-wheel";
import { Chip, Meta, PanelSections, Screen, Workbench } from "@/components/kit";
import { computeDirections } from "@/lib/horosa/directions";
import { useChartStore } from "@/lib/horosa/store";

export const Route = createFileRoute("/directions")({ component: Page });

function Page() {
  const draft = useChartStore((s) => s.draft);
  const d = useMemo(() => computeDirections(draft), [draft]);
  const [key, setKey] = useState<"naibod" | "ptolemy">("naibod");
  const list = key === "naibod" ? d.naibod : d.ptolemy;

  return (
    <Screen title="主限">
      <Workbench
        params={<BirthPanel />}
        canvas={
          <div>
            <div className="-ml-3 mb-2 flex flex-wrap">
              <Chip active={key === "naibod"} onClick={() => setKey("naibod")}>奈博</Chip>
              <Chip active={key === "ptolemy"} onClick={() => setKey("ptolemy")}>托勒密</Chip>
            </div>
            <NatalWheel chart={d.natal} modern={false} />
            <Meta>
              现年 {d.age}。奈博键 {(d.age * 0.985647).toFixed(2)}°；托勒密 1°=1 年。
            </Meta>
          </div>
        }
        panel={
          <PanelSections
            sections={[
              {
                id: key === "naibod" ? "奈博推运" : "托勒密推运",
                content: (
                  <ul>
                    {list.slice(0, 16).map((p) => (
                      <li key={p.name} className="flex justify-between border-b border-line py-2 text-sm">
                        <span>{p.name}</span>
                        <span className="tabular-nums text-muted">{p.dms}</span>
                      </li>
                    ))}
                  </ul>
                ),
              },
              {
                id: "近限",
                content: d.hits.length ? (
                  <ul>
                    {d.hits.map((h, i) => (
                      <li key={i} className="flex justify-between py-1.5 text-sm text-muted">
                        <span>
                          {h.age}岁 {h.moved} {h.type} {h.natal}
                        </span>
                        <span className="tabular-nums">{h.year}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted">前后十二年无紧限。</p>
                ),
              },
            ]}
          />
        }
      />
    </Screen>
  );
}
