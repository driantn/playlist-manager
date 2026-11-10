import type { M3uChannel, M3uPlaylist } from "@iptv/playlist";

// A channel's id is its index in playlist.channels, so duplicate names never collide.
export const NO_GROUP = "OTHER";

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

export const toggle = (selected: Set<number>, ids: number[], on: boolean) => {
  const next = new Set(selected);
  ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
  return next;
};

// Keeps headers and original channel order.
// @iptv/playlist parses x-tvg-url as xTvgUrl but writes it back camelCase, which players ignore.
export const exportPlaylist = (
  playlist: M3uPlaylist,
  selected: Set<number>,
): M3uPlaylist => ({
  headers: Object.fromEntries(
    Object.entries(playlist.headers ?? {}).map(([k, v]) => [
      k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`),
      v,
    ]),
  ),
  channels: playlist.channels.filter((_, id) => selected.has(id)),
});
