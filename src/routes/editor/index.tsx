import { useMemo } from "react";
import { writeM3U } from "@iptv/playlist";
import { Navigate, useNavigate, useSearch } from "@tanstack/react-router";
import { storeActions, usePlaylist, useSelected } from "../../store";
import {
  exportPlaylist,
  groupChannels,
  NO_GROUP,
  searchChannels,
} from "../../playlist";

const button =
  "rounded-md bg-slate-500 px-3 py-2 text-white disabled:opacity-50";

export const Editor = () => {
  const navigate = useNavigate({ from: "/editor" });
  const { group, q = "" } = useSearch({ from: "/editor" });
  const playlist = usePlaylist();
  const selected = useSelected();
  const { setSelected, reset } = storeActions();

  const groups = useMemo(
    () => groupChannels(playlist?.channels ?? []),
    [playlist],
  );
  const searching = q.trim() !== "";
  const visible = useMemo(
    () =>
      searching
        ? searchChannels(playlist?.channels ?? [], q)
        : (groups.get(group ?? "") ?? []),
    [searching, playlist, q, groups, group],
  );

  if (!playlist) return <Navigate to="/" />;

  const visibleSelected = visible.filter((id) => selected.has(id)).length;

  const onExport = () => {
    const m3u = writeM3U(exportPlaylist(playlist, selected));
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([m3u], { type: "audio/x-mpegurl" }));
    a.download = "channels.m3u";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href));
  };

  const onReset = () => {
    if (confirm("Discard this playlist and your selection?")) reset();
  };

  return (
    <div className="size-full flex flex-row">
      <ul className="w-1/4 max-w-xs shrink-0 h-screen overflow-y-auto divide-y divide-slate-200">
        {[...groups].map(([title, ids]) => {
          const count = ids.filter((id) => selected.has(id)).length;
          const active = !searching && title === group;
          return (
            <li
              key={title}
              className={`flex items-center gap-2 p-2 hover:bg-slate-300 ${active ? "bg-slate-200" : ""}`}
            >
              <input
                type="checkbox"
                aria-label={`Select all in ${title}`}
                checked={count === ids.length}
                ref={(el) => {
                  if (el) el.indeterminate = count > 0 && count < ids.length;
                }}
                onChange={(e) => setSelected(ids, e.target.checked)}
              />
              <button
                className="grow truncate text-left"
                aria-current={active || undefined}
                onClick={() => navigate({ search: { group: title } })}
              >
                {title}
              </button>
              <span className="text-xs text-slate-500">
                {count}/{ids.length}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="w-full h-screen overflow-y-auto flex flex-col">
        <div className="sticky top-0 flex flex-wrap items-center gap-2 bg-slate-200 p-3">
          <input
            type="search"
            aria-label="Search all channels"
            placeholder="Search all channels…"
            value={q}
            onChange={(e) =>
              navigate({
                search: (old) => ({ ...old, q: e.target.value }),
                replace: true,
              })
            }
            className="grow rounded-md border border-slate-300 p-2"
          />
          <button
            className={button}
            disabled={visibleSelected === visible.length}
            onClick={() => setSelected(visible, true)}
          >
            Select {searching ? "matches" : "all"} ({visible.length})
          </button>
          <button
            className={button}
            disabled={visibleSelected === 0}
            onClick={() => setSelected(visible, false)}
          >
            Deselect
          </button>
          <button
            className={button}
            disabled={selected.size === 0}
            onClick={onExport}
          >
            Export {selected.size}
          </button>
          <button className={button} onClick={onReset}>
            New file
          </button>
        </div>

        {visible.length === 0 && (
          <p className="p-4 text-slate-500">
            {searching ? "No channels match." : "Pick a group on the left."}
          </p>
        )}
        <ul className="divide-y divide-slate-200">
          {visible.map((id) => {
            const c = playlist.channels[id];
            return (
              <li key={id}>
                <label className="flex cursor-pointer items-center gap-4 p-2 hover:bg-slate-300">
                  <input
                    type="checkbox"
                    checked={selected.has(id)}
                    onChange={(e) => setSelected([id], e.target.checked)}
                  />
                  <span className="grow">{c.name}</span>
                  {searching && (
                    <span className="text-xs text-slate-500">
                      {c.groupTitle || NO_GROUP}
                    </span>
                  )}
                </label>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
