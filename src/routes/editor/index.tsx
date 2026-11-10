import { memo, useMemo, useRef, useState } from "react";
import type { M3uChannel } from "@iptv/playlist";
import { Navigate, useNavigate, useSearch } from "@tanstack/react-router";
import { Checkbox } from "../../components/Checkbox";
import { SearchField } from "../../components/SearchField";
import { storeActions, usePlaylist, useSelected, useStore } from "../../store";
import {
  exportPlaylist,
  groupChannels,
  initials,
  NO_GROUP,
  searchChannels,
} from "../../playlist";

const channelCount = (n: number) => `${n} channel${n === 1 ? "" : "s"}`;

const GroupName = ({ title }: { title: string }) => {
  const i = title.lastIndexOf("|");
  if (i < 0) return title;
  return (
    <>
      <span className="text-muted">{title.slice(0, i + 1)} </span>
      {title.slice(i + 1).trim()}
    </>
  );
};

const Logo = ({ name, src }: { name?: string; src?: string }) => (
  <span
    aria-hidden
    className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-md bg-ink/85 text-xs font-bold text-white"
  >
    {initials(name)}
    {src?.startsWith("https://") && (
      <img
        src={src}
        alt=""
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={(e) => {
          e.currentTarget.hidden = true;
        }}
        className="absolute inset-0 size-full bg-surface object-contain p-0.5"
      />
    )}
  </span>
);

const GroupRow = ({
  title,
  ids,
  active,
  onOpen,
}: {
  title: string;
  ids: number[];
  active: boolean;
  onOpen: () => void;
}) => {
  const count = useStore((s) => ids.reduce((n, id) => n + (s.selected.has(id) ? 1 : 0), 0));
  const { setSelected } = storeActions();
  return (
    <>
      <Checkbox
        aria-label={`Select all in ${title}`}
        checked={count === ids.length}
        indeterminate={count > 0 && count < ids.length}
        onChange={(on) => setSelected(ids, on ? "all" : new Set())}
      />
      <button
        className="grow truncate text-left"
        aria-current={active || undefined}
        onClick={onOpen}
      >
        <GroupName title={title} />
      </button>
      <span className="text-xs font-normal text-muted tabular-nums">
        {count}/{ids.length}
      </span>
    </>
  );
};

const ChannelRow = memo(function ChannelRow({
  id,
  channel: c,
  showGroup,
}: {
  id: number;
  channel: M3uChannel;
  showGroup: boolean;
}) {
  const checked = useStore((s) => s.selected.has(id));
  const { setSelected } = storeActions();
  return (
    <li>
      <label className="flex cursor-pointer items-center gap-3 px-3 py-2 has-checked:bg-tuned-tint not-has-checked:hover:bg-canvas">
        <Logo name={c.name} src={c.tvgLogo} />
        <span className="min-w-0 grow">
          <span className="block truncate">{c.name}</span>
          {showGroup && (
            <span className="block truncate text-xs text-muted">
              <GroupName title={c.groupTitle || NO_GROUP} />
            </span>
          )}
        </span>
        <Checkbox
          checked={checked}
          onChange={(on) => setSelected([id], on ? "all" : new Set())}
        />
      </label>
    </li>
  );
});

const GroupsNav = memo(function GroupsNav({
  groups,
  activeGroup,
  searching,
  groupPicked,
  hidden,
}: {
  groups: Map<string, number[]>;
  activeGroup: string;
  searching: boolean;
  groupPicked: boolean;
  hidden: boolean;
}) {
  const navigate = useNavigate({ from: "/editor" });
  const [groupFilter, setGroupFilter] = useState("");
  const filter = groupFilter.trim().toLowerCase();
  const shownGroups = useMemo(
    () => [...groups].filter(([title]) => title.toLowerCase().includes(filter)),
    [groups, filter],
  );

  return (
    <nav
      aria-label="Groups"
      className={`${hidden ? "hidden md:flex" : "flex"} w-full shrink-0 flex-col border-r border-line bg-surface md:w-72`}
    >
      <div className="flex border-b border-line p-3">
        <SearchField
          aria-label="Filter groups"
          placeholder="Filter groups"
          value={groupFilter}
          onChange={setGroupFilter}
        />
      </div>
      <ul className="grow overflow-y-auto">
        {shownGroups.map(([title, ids]) => {
          const active = !searching && title === activeGroup;
          const marker = groupPicked
            ? "border-tuned bg-canvas font-semibold"
            : "border-transparent md:border-tuned md:bg-canvas md:font-semibold";
          return (
            <li
              key={title}
              className={`flex items-center gap-3 border-l-4 py-2 pr-3 pl-2 ${active ? marker : "border-transparent hover:bg-canvas"}`}
            >
              <GroupRow
                title={title}
                ids={ids}
                active={active}
                onOpen={() => navigate({ search: { group: title } })}
              />
            </li>
          );
        })}
        {shownGroups.length === 0 && (
          <li className="p-3 text-sm text-muted">No groups match.</li>
        )}
      </ul>
    </nav>
  );
});

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
  const activeGroup = group ?? groups.keys().next().value ?? "";
  const visible = useMemo(
    () =>
      searching
        ? searchChannels(playlist?.channels ?? [], q)
        : (groups.get(activeGroup) ?? []),
    [searching, playlist, q, groups, activeGroup],
  );
  const dialog = useRef<HTMLDialogElement>(null);

  if (!playlist) return <Navigate to="/" />;

  const showChannels = group != null || searching;
  const visibleSelected = visible.filter((id) => selected.has(id)).length;
  const onExport = () => {
    const m3u = exportPlaylist(playlist, selected);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([m3u], { type: "audio/x-mpegurl" }));
    a.download = "channels.m3u";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href));
  };

  return (
    <div className="flex h-dvh flex-col">
      <div className="flex min-h-0 grow">
        <GroupsNav
          groups={groups}
          activeGroup={activeGroup}
          searching={searching}
          groupPicked={group != null}
          hidden={showChannels}
        />

        <main
          className={`${showChannels ? "flex" : "hidden md:flex"} min-w-0 grow flex-col`}
        >
          <div className="space-y-3 border-b border-line bg-canvas p-3">
            <div className="flex gap-2">
              <button
                className="btn-quiet md:hidden"
                onClick={() => navigate({ search: {} })}
              >
                Groups
              </button>
              <SearchField
                aria-label="Search all channels"
                placeholder="Search all channels"
                value={q}
                onChange={(value) =>
                  navigate({
                    search: (old) => ({ ...old, q: value }),
                    replace: true,
                  })
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <h2 className="min-w-0 grow truncate font-semibold">
                {searching ? `Results for “${q.trim()}”` : <GroupName title={activeGroup} />}
                <span className="ml-2 font-normal text-muted">{channelCount(visible.length)}</span>
              </h2>
              <button
                className="btn-quiet"
                disabled={visibleSelected === visible.length}
                onClick={() => setSelected(visible, "all")}
              >
                Select all
              </button>
              <button
                className="btn-quiet"
                disabled={visibleSelected === 0}
                onClick={() => setSelected(visible, new Set())}
              >
                Clear
              </button>
            </div>
          </div>

          <div className="min-h-0 grow overflow-y-auto bg-surface">
            {visible.length === 0 && (
              <p className="p-4 text-muted">
                {searching
                  ? `No channels match “${q.trim()}”. Try a shorter search.`
                  : "This group isn't in the playlist. Pick one from the list."}
              </p>
            )}
            <ul className="divide-y divide-line">
              {visible.map((id) => (
                <ChannelRow
                  key={id}
                  id={id}
                  channel={playlist.channels[id]}
                  showGroup={searching}
                />
              ))}
            </ul>
          </div>
        </main>
      </div>

      <footer className="flex items-center gap-3 border-t border-line bg-surface p-3">
        <p className="grow text-sm" aria-live="polite">
          {selected.size > 0 ? (
            <>
              <strong className="tabular-nums">{selected.size}</strong> of{" "}
              {channelCount(playlist.channels.length)} selected
            </>
          ) : (
            <span className="text-muted">Tick a group or channel to start.</span>
          )}
        </p>
        <button className="btn-quiet" onClick={() => dialog.current?.showModal()}>
          New file
        </button>
        <dialog
          ref={dialog}
          role="alertdialog"
          aria-labelledby="discard-title"
          onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
          className="m-auto w-full max-w-sm rounded-xl bg-surface text-ink shadow-xl backdrop:bg-ink/40"
        >
          <div className="space-y-4 p-5">
            <h2 id="discard-title" className="text-lg font-semibold">
              Open a different playlist?
            </h2>
            <p className="text-muted">
              {selected.size > 0
                ? `This removes the current playlist and the ${channelCount(selected.size)} you selected. Export first if you want to keep them.`
                : "This removes the current playlist."}
            </p>
            <div className="flex justify-end gap-2">
              <button className="btn-quiet" onClick={() => dialog.current?.close()}>
                Keep editing
              </button>
              <button
                className="btn bg-red-700 text-white hover:bg-red-800"
                onClick={() => {
                  dialog.current?.close();
                  reset();
                }}
              >
                Discard playlist
              </button>
            </div>
          </div>
        </dialog>
        <button
          className="btn-primary"
          disabled={selected.size === 0}
          onClick={onExport}
        >
          {selected.size > 0 ? `Export ${channelCount(selected.size)}` : "Export"}
        </button>
      </footer>
    </div>
  );
};
