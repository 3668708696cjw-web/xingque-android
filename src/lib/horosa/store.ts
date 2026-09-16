import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nowAsBirth } from "./cities";
import type { BirthInput, SavedChart } from "./types";

const EMPTY: BirthInput = {
  name: "",
  gender: "male",
  year: 1990,
  month: 1,
  day: 1,
  hour: 12,
  minute: 0,
  cityId: "taipei",
};

type State = {
  draft: BirthInput;
  charts: SavedChart[];
  activeId: string | null;
  partnerId: string | null;
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  setDraft: (p: Partial<BirthInput>) => void;
  setNow: () => void;
  loadChart: (id: string) => void;
  saveDraft: () => string;
  removeChart: (id: string) => void;
  setPartner: (id: string | null) => void;
  importCharts: (incoming: SavedChart[]) => number;
};

export const useChartStore = create<State>()(
  persist(
    (set, get) => ({
      draft: EMPTY,
      charts: [],
      activeId: null,
      partnerId: null,
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
      setDraft: (p) => set({ draft: { ...get().draft, ...p } }),
      setNow: () => {
        const cur = get().draft;
        const n = nowAsBirth(cur.cityId);
        set({
          draft: {
            ...cur,
            year: n.year,
            month: n.month,
            day: n.day,
            hour: n.hour,
            minute: n.minute,
          },
        });
      },
      loadChart: (id) => {
        const c = get().charts.find((x) => x.id === id);
        if (!c) return;
        const { id: _id, createdAt: _c, ...draft } = c;
        set({ draft, activeId: id });
      },
      saveDraft: () => {
        const { draft, charts, activeId } = get();
        const existing = charts.find((c) => c.id === activeId);
        if (existing && existing.name === draft.name) {
          set({
            charts: charts.map((c) => (c.id === existing.id ? { ...c, ...draft } : c)),
          });
          return existing.id;
        }
        const id = crypto.randomUUID();
        const saved: SavedChart = { ...draft, id, createdAt: Date.now() };
        set({ charts: [saved, ...charts], activeId: id });
        return id;
      },
      removeChart: (id) =>
        set({
          charts: get().charts.filter((c) => c.id !== id),
          activeId: get().activeId === id ? null : get().activeId,
          partnerId: get().partnerId === id ? null : get().partnerId,
        }),
      setPartner: (id) => set({ partnerId: id }),
      importCharts: (incoming) => {
        const { charts } = get();
        const ids = new Set(charts.map((c) => c.id));
        const extra: SavedChart[] = [];
        for (const c of incoming) {
          if (ids.has(c.id)) {
            extra.push({ ...c, id: crypto.randomUUID(), createdAt: c.createdAt || Date.now() });
          } else {
            extra.push({ ...c, createdAt: c.createdAt || Date.now() });
            ids.add(c.id);
          }
        }
        set({ charts: [...extra, ...charts] });
        return extra.length;
      },
    }),
    {
      name: "horosa-v1",
      partialize: (s) => ({
        draft: s.draft,
        charts: s.charts,
        activeId: s.activeId,
        partnerId: s.partnerId,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (!state.charts.length && !state.draft.name && state.draft.year === 1990) {
          useChartStore.setState({ draft: nowAsBirth("taipei"), hydrated: true });
        } else {
          state.setHydrated(true);
        }
      },
    },
  ),
);
