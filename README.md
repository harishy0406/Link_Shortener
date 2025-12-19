# URL Mini — Link Shortener (Local)

A small client-side URL shortener UI that uses a public shortener API when available and falls back to a local pseudo-short link when the API or network is unavailable.

Features
- Shorten URLs via the public shrtco.de API
- Fallback local short link when network/API fails
- Copy to clipboard with fallback
- Generate QR codes (uses CDN `qrcode` library)
- Basic analytics stored in `localStorage` (clicks, created at, source)

How it works
1. Enter a long URL (protocol optional) and an optional custom alias.
2. Click "Shorten URL". The app will:
   - Normalize the URL (prepends `https://` if missing).
   - Try the public API: `https://api.shrtco.de/v2/shorten?url=`.
   - If the API succeeds, the API's short link is used.
   - If the API fails (network or API error), a local fallback short link like `https://url.mini/abcd12` is generated and stored locally.
3. The shortened link, QR code, and analytics are available in the UI. Analytics are stored in `localStorage`.

Notes and limitations
- Local fallback links (https://url.mini/...) are not real redirects — they are placeholders for offline/local use. Clicking them opens the original long URL instead.
- For full redirect functionality you need a backend service to resolve short aliases.
- When testing locally via the file system (file://) some browser features (like `navigator.clipboard`) may be restricted; the app includes fallback copying that uses `document.execCommand`.

Development / Usage
- Open `index.html` in a browser. Prefer serving via a local static server (e.g., `npx http-server .` or `python -m http.server`) for best compatibility.
- The project uses a small CDN for QR generation; no build step is required.

Files
- `index.html` — main UI
- `style.css` — styles
- `app.js` — application logic
- `README.md` — this file

License
- Public domain / use as you wish.
