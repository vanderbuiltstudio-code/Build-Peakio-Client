# Peakio Client

A minimal, branded Electron wrapper for venge.io — not a fork or hack of the
official client, just a small shell app around the game with QoL extras.

## What's included
- `main.js` — creates the game window, registers **Ctrl+/** (FPS toggle) and
  **F7** (settings popup), and initializes Discord Rich Presence.
- `preload.js` — safe bridge between the overlay UI and the main process
  (contextIsolation stays on — no raw Node access leaks into the page).
- `overlay/settings.html` — the liquid-glass settings popup.
- `package.json` — also configures `electron-builder` to produce Windows,
  macOS, and Linux builds from the same codebase, which is the real fix for
  your Mac-support problem: Electron is cross-platform by default.

## Setup
```
npm install
npm start          # run in dev
npm run build       # produce installers for win/mac/linux (needs a mac host or CI for the mac build)
```

## Branding
Drop your logo/icon files into `assets/`:
- `assets/icon.ico` (Windows), `assets/icon.icns` (macOS), `assets/icon.png` (Linux/tray)
Send me `3)1)transparent_1.webp` and I'll convert/wire it in — it wasn't in
your upload.

## Discord Rich Presence
1. Create an application at https://discord.com/developers/applications
2. Copy its Client ID into `DISCORD_CLIENT_ID` in `main.js`
3. Upload a `peakio_logo` large image asset in the app's Rich Presence art tab

## About "Unlimited FPS"
This toggle disables **Electron's own** background/render throttling
(`setBackgroundThrottling(false)`), which is a real, legitimate performance
knob — Electron normally throttles unfocused/backgrounded windows to save
power. It will *not* remove any frame cap the game itself enforces
internally; I have no visibility into venge.io's own code to modify that,
and wouldn't reverse-engineer a third party's client to do so.

## About Windows Defender / SmartScreen warnings
I didn't build in anything to suppress or evade AV/SmartScreen detection —
that's not something I'll help with, full stop. The legitimate path to a
clean install experience:
1. **Code-sign the installer** (a cert from SignPath, Certum, or DigiCert;
   SignPath has a free tier for open-source projects).
2. Distribute consistently from one URL — SmartScreen reputation builds
   with download volume over time on the *same* signed binary.
3. Avoid packers/obfuscators — they're one of the biggest triggers for
   AV heuristics, and you don't need them for a plain Electron app anyway.

## Scope note
This only wraps the official venge.io page — it doesn't modify, inject
into, or bypass anything on the game's own client or servers. Worth
double-checking venge.io's terms of service for anything about third-party
wrapper clients before distributing this publicly.
