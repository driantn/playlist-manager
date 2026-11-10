import { FormEvent, useState } from "react";
import { parseM3U } from "@iptv/playlist";
import { Navigate } from "@tanstack/react-router";
import { storeActions, usePlaylist } from "../../store";

const fetchText = async (url: string) => {
  let res: Response;
  try {
    res = await fetch(url);
  } catch {
    throw new Error(
      "Could not download. The server may block browser requests; download the file and load it above instead.",
    );
  }
  if (!res.ok) throw new Error(`Download failed (${res.status})`);
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
      const parsed = parseM3U(await getText());
      if (!parsed.channels.length) throw new Error("No channels found in this playlist");
      load(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const onUrlSubmit = (e: FormEvent) => {
    e.preventDefault();
    loadFrom(() => fetchText(url));
  };

  if (playlist) return <Navigate to="/editor" />;

  return (
    <div className="size-full flex flex-col items-center justify-center gap-6 p-4">
      <h1 className="text-2xl font-semibold">Playlist manager</h1>
      <label className="block">
        <span className="sr-only">Choose a playlist file</span>
        <input
          type="file"
          accept=".m3u,.m3u8"
          disabled={loading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = ""; // lets the same file be picked again after an error
            if (file) loadFrom(() => file.text());
          }}
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold"
        />
      </label>
      <span className="text-slate-500">or</span>
      <form onSubmit={onUrlSubmit} className="flex w-full max-w-lg gap-2">
        <input
          type="url"
          required
          aria-label="Playlist URL"
          placeholder="https://example.com/playlist.m3u"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="grow rounded-md border border-slate-300 p-2"
        />
        <button
          disabled={loading}
          className="rounded-md bg-slate-500 px-4 text-white disabled:opacity-50"
        >
          Load
        </button>
      </form>
      {loading && <p>Loading…</p>}
      {error && (
        <p role="alert" className="max-w-lg text-center text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};
