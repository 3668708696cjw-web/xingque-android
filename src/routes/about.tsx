import { createFileRoute } from "@tanstack/react-router";
import { Screen } from "@/components/kit";

export const Route = createFileRoute("/about")({ component: About });

function About() {
  return (
    <Screen title="关于">
      <p className="font-display text-[28px] leading-snug">星阙 · 本地离线 5.0</p>
      <p className="mt-6 text-[15px] leading-7 text-ink">
        命、卜、工具与玄学史收在同一处。排盘、解盘、黄历全部在这台设备上完成。没有账号，没有云，断网也能用。
      </p>
      <p className="mt-6 text-[14px] leading-7 text-muted">
        本包带世纪星历（行星、月球、谷神族），本命与过运可直接起盘。编号小行星按需导入星历包，在「小行星」页从文件装入本机。不要再下那个 1.8 GB 的整包——文件太多，下到最后一秒会卡住。
      </p>
      <p className="mt-6 text-[14px] leading-7 text-muted">
        命例只写进本机存储。解盘用内置规则，不把四柱、盘面或摘要送到任何服务器。
      </p>
      <p className="mt-6 text-[14px] leading-7 text-muted">
        源流：郑大哥创建星阙，荀爽（Herakleios）公开 App 与 Web。Windows
        整合版见 Horace-Maxwell 仓库。历法用 lunar-javascript，紫微用 iztro，行星优先 Swiss
        Ephemeris，缺文件时回落 astronomy-engine。奇门、六壬、太乙等为时家常法的精简实现，不作专业鉴定。不含
        AI、3D、直播、管理。
      </p>
      <p className="mt-6 text-[13px] text-faint">版本 5.0 · 世纪星历随包 · 编号星走星历包。开源许可以原项目为准。</p>
    </Screen>
  );
}
