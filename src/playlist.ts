import { parseM3U, writeM3U, type M3uChannel, type M3uPlaylist } from "@iptv/playlist";

type Channel = M3uChannel & { vlcOpts?: string[] };

export const parsePlaylist = (text: string): M3uPlaylist => {
  const playlist = parseM3U(text);
  const channels = playlist.channels as Channel[];
  let next = 0;
  let pending: { opts: string[]; group?: string } | undefined;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (line.startsWith("#EXTINF")) pending = { opts: [] };
    else if (!pending || !line) continue;
    else if (line.startsWith("#EXTVLCOPT:")) pending.opts.push(line);
    else if (line.startsWith("#EXTGRP:")) pending.group = line.slice(8).trim();
    else if (!line.startsWith("#")) {
      const c = channels[next++];
      if (c && pending.opts.length) c.vlcOpts = pending.opts;
      if (c && !c.groupTitle && pending.group) c.groupTitle = pending.group;
      pending = undefined;
    }
  }
  return playlist;
};

export const NO_GROUP = "No group";

export const groupChannels = (channels: M3uChannel[]) => {
  const groups = new Map<string, number[]>();
  channels.forEach((c, id) => {
    const key = c.groupTitle || NO_GROUP;
    const ids = groups.get(key);
    if (ids) ids.push(id);
    else groups.set(key, [id]);
  });
  return new Map([...groups].sort(([a], [b]) => a.localeCompare(b)));
};

export const searchChannels = (channels: M3uChannel[], query: string) => {
  const q = query.trim().toLowerCase();
  return channels.flatMap((c, id) =>
    c.name?.toLowerCase().includes(q) ? [id] : [],
  );
};

export const applySelection = (
  selected: Set<number>,
  ids: number[],
  chosen: "all" | ReadonlySet<unknown>,
) => {
  const next = new Set(selected);
  ids.forEach((id) =>
    chosen === "all" || chosen.has(id) ? next.add(id) : next.delete(id),
  );
  return next;
};

export const exportPlaylist = (playlist: M3uPlaylist, selected: Set<number>) => {
  const channels = (playlist.channels as Channel[]).filter((_, id) => selected.has(id));
  const headers = Object.fromEntries(
    Object.entries(playlist.headers ?? {}).map(([k, v]) => [
      k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`),
      v,
    ]),
  );
  const lines = writeM3U({ headers, channels }).split("\n");
  return [
    lines[0],
    ...channels.flatMap((c, i) => [lines[1 + 2 * i], ...(c.vlcOpts ?? []), lines[2 + 2 * i]]),
  ].join("\n");
};

export const initials = (name = "") =>
  (name.match(/[\p{L}\p{N}]+/gu) ?? [])
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "?";
