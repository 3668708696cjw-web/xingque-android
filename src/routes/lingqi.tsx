import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Ghost, Interpret, Meta, Primary, Screen, Workbench } from "@/components/kit";
import { throwLingqi, type LingqiResult } from "@/lib/horosa/modules";

export const Route = createFileRoute("/lingqi")({ component: Page });

function Page() {
  const [data, setData] = useState<LingqiResult | null>(null);
  return (
    <Screen title="灵棋">
      <Workbench
        params={
          <div className="space-y-3">
            <Primary type="button" onClick={() => setData(throwLingqi())}>
              掷棋
            </Primary>
            <Ghost type="button" onClick={() => setData(throwLingqi(Date.now()))}>
              再掷
            </Ghost>
          </div>
        }
        canvas={
          data ? (
            <div>
              <p className="font-display text-4xl">{data.name}</p>
              <Meta>
                上{data.upper} 中{data.mid} 下{data.lower}
              </Meta>
              <p className="mt-6 max-w-md text-[15px] leading-7 text-muted">{data.ci}</p>
            </div>
          ) : (
            <p className="text-sm text-muted">十二棋分上中下，掷出阳数成卦。本机随机，不连网。</p>
          )
        }
        panel={data ? <Interpret kind="灵棋经" summary={`${data.name} ${data.ci}`} /> : null}
      />
    </Screen>
  );
}
