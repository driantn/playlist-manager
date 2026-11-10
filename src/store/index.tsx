import type { M3uPlaylist } from "@iptv/playlist";
import { del, delMany, get, set as idbSet } from "idb-keyval";
import { create } from "zustand";
import { persist, type PersistStorage } from "zustand/middleware";
import { applySelection } from "../playlist";

type StoreState = {
  playlist?: M3uPlaylist;
  selected: Set<number>;
  actions: {
    load: (playlist: M3uPlaylist) => void;
    setSelected: (ids: number[], chosen: "all" | ReadonlySet<unknown>) => void;
    reset: () => void;
  };
};

type Saved = Pick<StoreState, "playlist" | "selected">;

let savedPlaylist: M3uPlaylist | undefined;
const storage: PersistStorage<Saved> = {
  getItem: async (name) => {
    const [value, playlist] = await Promise.all([get(name), get(`${name}:playlist`)]);
    if (!value) return null;
    savedPlaylist = playlist;
    return { ...value, state: { ...value.state, playlist: playlist ?? value.state.playlist } };
  },
  setItem: async (name, { state, version }) => {
    const writes = [];
    if (state.playlist !== savedPlaylist) {
      savedPlaylist = state.playlist;
      writes.push(state.playlist ? idbSet(`${name}:playlist`, state.playlist) : del(`${name}:playlist`));
    }
    writes.push(idbSet(name, { state: { selected: state.selected }, version }));
    await Promise.all(writes);
  },
  removeItem: (name) => delMany([name, `${name}:playlist`]),
};

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      selected: new Set(),
      actions: {
        load: (playlist) => set({ playlist, selected: new Set() }),
        setSelected: (ids, chosen) =>
          set((s) => ({ selected: applySelection(s.selected, ids, chosen) })),
        reset: () => set({ playlist: undefined, selected: new Set() }),
      },
    }),
    {
      name: "m3u-editor",
      storage,
      partialize: ({ playlist, selected }) => ({ playlist, selected }),
      skipHydration: true,
    },
  ),
);

export const storeActions = () => useStore.getState().actions;
export const usePlaylist = () => useStore((s) => s.playlist);
export const useSelected = () => useStore((s) => s.selected);
