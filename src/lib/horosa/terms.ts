import { SIGNS } from "./types";

/** Egyptian terms (bounds): [lord, end-degree-in-sign] */
const EGYPTIAN: [string, number][][] = [
  [["木", 6], ["金", 12], ["水", 20], ["火", 25], ["土", 30]],
  [["金", 8], ["水", 14], ["木", 22], ["土", 27], ["火", 30]],
  [["水", 6], ["木", 12], ["金", 17], ["火", 24], ["土", 30]],
  [["火", 7], ["金", 13], ["水", 19], ["木", 26], ["土", 30]],
  [["木", 6], ["金", 11], ["土", 18], ["水", 24], ["火", 30]],
  [["水", 7], ["金", 17], ["木", 21], ["火", 28], ["土", 30]],
  [["土", 6], ["水", 14], ["木", 21], ["金", 28], ["火", 30]],
  [["火", 7], ["金", 11], ["水", 19], ["木", 24], ["土", 30]],
  [["木", 12], ["金", 17], ["水", 21], ["土", 26], ["火", 30]],
  [["水", 7], ["木", 14], ["金", 22], ["土", 26], ["火", 30]],
  [["水", 7], ["金", 13], ["木", 20], ["火", 25], ["土", 30]],
  [["金", 12], ["木", 16], ["水", 19], ["火", 28], ["土", 30]],
];

export type TermSpan = {
  sign: string;
  lord: string;
  from: number;
  to: number;
  lon0: number;
  lon1: number;
};

export function termsOfSign(signIndex: number): TermSpan[] {
  const rows = EGYPTIAN[signIndex] ?? EGYPTIAN[0];
  let prev = 0;
  return rows.map(([lord, to]) => {
    const span: TermSpan = {
      sign: SIGNS[signIndex].name,
      lord,
      from: prev,
      to,
      lon0: signIndex * 30 + prev,
      lon1: signIndex * 30 + to,
    };
    prev = to;
    return span;
  });
}

export function allTerms(): TermSpan[] {
  return Array.from({ length: 12 }, (_, i) => termsOfSign(i)).flat();
}

export function termAt(lon: number): TermSpan {
  const n = ((lon % 360) + 360) % 360;
  const s = Math.floor(n / 30);
  const d = n % 30;
  const spans = termsOfSign(s);
  return spans.find((t) => d < t.to) ?? spans[spans.length - 1];
}
