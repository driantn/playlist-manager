import { M3uChannel } from "@iptv/playlist";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

type Contents = Array<M3uChannel & { checked: boolean }>;
type StoreState = {
  originalContent?: Contents;
  finalContent?: Record<string, Contents>;

  actions: {
    setOriginalContent: (content: Contents) => void;
    addGroup: (group: string, content: Contents) => void;
    removeGroup: (group: string) => void;
    updateSingleItem: (group: string, name: string, value: boolean) => void;
  };
};

const INITIAL_STORE = {
  originalContent: undefined,
  finalContent: undefined,
};

const store = create<StoreState>()(
  devtools(
    persist(
      (set, get) => ({
        ...INITIAL_STORE,
        actions: {
          setOriginalContent: (content) => set({ originalContent: content }),
          addGroup: (group, content) =>
            set({
              finalContent: {
                ...get().finalContent,
                [group]: content.map((c) => ({ ...c, checked: true })),
              },
            }),
          removeGroup: (group) => {
            const content = { ...get().finalContent };
            if (!content) return;

            delete content[group];

            set({ finalContent: content });
          },
          updateSingleItem: (group, name, value) => {
            const finalContent = { ...get().finalContent };
            const groupContent = finalContent[group];
            if (!groupContent) return;

            set({
              finalContent: {
                ...finalContent,
                [group]: groupContent.map((c) => {
                  if (c.name === name) return { ...c, checked: value };
                  return c;
                }),
              },
            });
          },
        },
      }),
      {
        name: "m3u-editor",
        storage: createJSONStorage(() => sessionStorage),
        partialize: ({ originalContent, finalContent }) => ({
          originalContent,
          finalContent,
        }),
      },
    ),
  ),
);

export const storeActions = () => store.getState().actions;
export const useOriginalContent = () => store((state) => state.originalContent);
export const useFinalContent = () => store((state) => state.finalContent);
