import { useState } from "react";
import { Navigate } from "@tanstack/react-router";
import { storeActions, usePlaylist } from "../../store";
import { parsePlaylist } from "../../playlist";

const fetchText = async (url: string) => {
  let res: Response;
  try {
    res = await fetch(url);
  } catch {
    throw new Error(
      "That link can't be opened from the browser. Download the file and open it here instead.",
    );
  }
  if (!res.ok)
    throw new Error(
      `The link returned an error (${res.status}). Check the address and try again.`,
    );
  return res.text();
};

export const Homepage = () => {
  const { load } = storeActions();
  const playlist = usePlaylist();
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadFrom = async (getText: () => Promise<string>) => {
    setError("");
    setLoading(true);
    try {
      const parsed = parsePlaylist(await getText());
      if (!parsed.channels.length)
        throw new Error("No channels found. Check that this is an M3U playlist.");
      load(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  if (playlist) return <Navigate to="/editor" />;

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-8 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Trim your IPTV playlist</h1>
        <p className="text-lg text-muted">
          Open an M3U playlist, tick the channels you watch and export a smaller file for your
          player. Everything stays in this browser.
        </p>
      </div>

      <label className="relative flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-line bg-surface px-6 py-10 text-center focus-within:border-tuned hover:border-tuned">
        <span className="btn-primary">{loading ? "Opening…" : "Open playlist file"}</span>
        <span className="text-sm text-muted">or drop an .m3u or .m3u8 file here</span>
        <input
          type="file"
          accept=".m3u,.m3u8"
          disabled={loading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) loadFrom(() => file.text());
          }}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          loadFrom(() => fetchText(url));
        }}
        className="space-y-2"
      >
        <label htmlFor="playlist-url" className="text-sm font-semibold">
          Or load it from a link
        </label>
        <div className="flex gap-2">
          <input
            id="playlist-url"
            type="url"
            required
            placeholder="https://example.com/playlist.m3u"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="min-w-0 grow rounded-md border border-line bg-surface p-2"
          />
          <button type="submit" disabled={loading} className="btn-quiet">
            Load link
          </button>
        </div>
      </form>

      {error && (
        <p role="alert" className="rounded-md bg-red-50 p-3 text-red-800">
          {error}
        </p>
      )}
    </main>
  );
};
