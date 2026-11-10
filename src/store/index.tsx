import type { M3uPlaylist } from "@iptv/playlist";
import { del, get, set as idbSet } from "idb-keyval";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { toggle } from "../playlist";

type StoreState = {
  playlist?: M3uPlaylist;
  selected: Set<number>;
  actions: {
    load: (playlist: M3uPlaylist) => void;
    setSelected: (ids: number[], on: boolean) => void;
    reset: () => void;
  };
};

export const useStore = create<StoreState>()(
  devtools(
    persist(
      (set) => ({
        selected: new Set(),
        actions: {
          load: (playlist) => set({ playlist, selected: new Set() }),
          setSelected: (ids, on) =>
            set((s) => ({ selected: toggle(s.selected, ids, on) })),
          reset: () => set({ playlist: undefined, selected: new Set() }),
        },
      }),
      {
        name: "m3u-editor",
        // IndexedDB stores the Set as-is and has no 5MB cap like sessionStorage.
        // shortcut: the whole playlist is rewritten on every toggle, store it under its own key if huge playlists lag.
        storage: { getItem: async (k) => (await get(k)) ?? null, setItem: idbSet, removeItem: del },
        partialize: ({ playlist, selected }) => ({ playlist, selected }),
        skipHydration: true, // main.tsx rehydrates before the first render
      },
    ),
  ),
);

export const storeActions = () => useStore.getState().actions;
export const usePlaylist = () => useStore((s) => s.playlist);
export const useSelected = () => useStore((s) => s.selected);
