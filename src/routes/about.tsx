import { createFileRoute } from "@tanstack/react-router";
import { Screen } from "@/components/kit";

export const Route = createFileRoute("/about")({ component: About });

function About() {
  return (
    <Screen title="关于">
      <p className="font-display text-[28px] leading-snug">星阙 · 本地离线版</p>
      <p className="mt-6 text-[15px] leading-7 text-ink">
        命、卜、工具与玄学史收在同一处。排盘、解盘、黄历全部在这台设备上完成。没有账号，没有云，断网也能用。
      </p>
      <p className="mt-6 text-[14px] leading-7 text-muted">
        命例只写进本机存储。解盘用内置规则，不把四柱、盘面或摘要送到任何服务器。第一次打开后，再访可走本地缓存。
      </p>
      <p className="mt-6 text-[14px] leading-7 text-muted">
        源流：郑大哥创建星阙，荀爽（Herakleios）公开 App 与 Web。Windows
        整合版见 Horace-Maxwell 仓库。历法用 lunar-javascript，紫微用 iztro，行星用 astronomy-engine。奇门、六壬、太乙等为时家常法的精简实现，不作专业鉴定。
      </p>
      <p className="mt-6 text-[13px] text-faint">开源许可以原项目为准。本应用为学习与查阅用途。</p>
    </Screen>
  );
}
