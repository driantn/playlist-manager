# Playlist manager

Load an M3U playlist (file or URL), pick groups or single channels, export a trimmed `channels.m3u`.
Runs fully in the browser; the loaded playlist is kept in IndexedDB until you press **New file**.

```sh
npm install
npm run dev    # http://localhost:3000
npm test       # logic tests (node:test)
npm run build
```

Deployed to GitHub Pages by `.github/workflows/deploy.yaml` (`VITE_BASE=/playlist-manager/`).
