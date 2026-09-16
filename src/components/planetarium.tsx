import { useEffect, useRef } from "react";
import * as Astronomy from "astronomy-engine";
import { getCity } from "@/lib/horosa/cities";
import { STARS, XIU28 } from "@/lib/horosa/stars";

const PLANETS: { key: string; body: Astronomy.Body; glyph: string }[] = [
  { key: "Sun", body: Astronomy.Body.Sun, glyph: "☉" },
  { key: "Moon", body: Astronomy.Body.Moon, glyph: "☽" },
  { key: "Mercury", body: Astronomy.Body.Mercury, glyph: "☿" },
  { key: "Venus", body: Astronomy.Body.Venus, glyph: "♀" },
  { key: "Mars", body: Astronomy.Body.Mars, glyph: "♂" },
  { key: "Jupiter", body: Astronomy.Body.Jupiter, glyph: "♃" },
  { key: "Saturn", body: Astronomy.Body.Saturn, glyph: "♄" },
];

export function Planetarium({ cityId = "taipei" }: { cityId?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let raf = 0;
    const draw = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#1a1612";
      ctx.fillRect(0, 0, w, h);

      const city = getCity(cityId);
      const date = new Date();
      const observer = new Astronomy.Observer(city.lat, city.lon, 0);
      const cx = w / 2;
      const cy = h / 2 + 4;
      const R = Math.min(w, h) * 0.46;

      const project = (az: number, alt: number) => {
        const r = ((90 - alt) / 90) * R;
        const a = ((az - 180) * Math.PI) / 180;
        return { x: cx + Math.sin(a) * r, y: cy + Math.cos(a) * r };
      };

      ctx.strokeStyle = "rgba(250,247,240,0.12)";
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.5, 0, Math.PI * 2);
      ctx.stroke();

      const pos = new Map<string, { x: number; y: number; alt: number; mag: number; name: string }>();
      for (const s of STARS) {
        const hor = Astronomy.Horizon(date, observer, s.ra, s.dec, "normal");
        if (hor.altitude < -1) continue;
        const { x, y } = project(hor.azimuth, hor.altitude);
        pos.set(s.name, { x, y, alt: hor.altitude, mag: s.mag, name: s.name });
        const rad = Math.max(0.6, 2.6 - s.mag * 0.45);
        ctx.fillStyle = `rgba(250,247,240,${Math.min(0.95, 0.35 + (2 - Math.min(s.mag, 2)) * 0.25)})`;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.strokeStyle = "rgba(250,247,240,0.18)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      let first = true;
      for (const xiu of XIU28) {
        const star = [...pos.values()].find((p) => p.name.includes(xiu.name + "宿") || p.name.startsWith(xiu.name));
        if (!star) continue;
        if (first) {
          ctx.moveTo(star.x, star.y);
          first = false;
        } else ctx.lineTo(star.x, star.y);
      }
      ctx.stroke();

      ctx.fillStyle = "rgba(250,247,240,0.55)";
      ctx.font = "10px sans-serif";
      for (const s of pos.values()) {
        if (s.mag > 1.2) continue;
        ctx.fillText(s.name.split(" ")[0], s.x + 6, s.y + 3);
      }

      for (const p of PLANETS) {
        const eq = Astronomy.Equator(p.body, date, observer, true, true);
        const hor = Astronomy.Horizon(date, observer, eq.ra, eq.dec, "normal");
        if (hor.altitude < -2) continue;
        const { x, y } = project(hor.azimuth, hor.altitude);
        ctx.fillStyle = "#faf7f0";
        ctx.beginPath();
        ctx.arc(x, y, p.key === "Sun" ? 4.5 : 2.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(250,247,240,0.85)";
        ctx.font = "12px sans-serif";
        ctx.fillText(p.glyph, x + 6, y + 4);
      }

      ctx.fillStyle = "rgba(250,247,240,0.4)";
      ctx.font = "11px sans-serif";
      ctx.fillText("北", cx - 6, cy - R + 14);
      ctx.fillText("南", cx - 6, cy + R - 6);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [cityId]);

  return <canvas ref={ref} className="h-80 w-full md:h-[32rem] lg:h-[40rem]" />;
}
