# Hasan Haider — Personal Portfolio

Interactive portfolio for [Hasan Haider](https://hhaider3.github.io): a **Windows 7–style desktop shell** built with React and Vite. Sections open as apps in resizable windows. Standout demos include a **3D time globe** and **Motion Lab** (phone sensors → live 3D sword scene).

**Live site:** [https://hhaider3.github.io](https://hhaider3.github.io)

---

## Contents

- [Branches](#branches)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Quick start](#quick-start-source-branch)
- [Motion Lab](#motion-lab)
- [Deploy](#deploy)
- [Development notes](#development-notes)

---

## Branches

This repository uses two branches with different jobs:

| Branch | Purpose | What you will find |
|--------|---------|--------------------|
| **[`source`](https://github.com/hhaider3/hhaider3.github.io/tree/source)** | Development | React/Vite app, server code, configs — **edit and PR here** |
| **[`main`](https://github.com/hhaider3/hhaider3.github.io/tree/main)** | GitHub Pages | Built static files only (`index.html`, assets, etc.) |

GitHub Pages serves **`main`**. CI (and `npm run deploy`) build from **`source`** and publish the `dist/` output to **`main`**.

If you opened the repo on `main` and expected source code: switch to [`source`](https://github.com/hhaider3/hhaider3.github.io/tree/source).

---

## Features

- **Desktop OS UI** — wallpaper, icons, multi-window management, taskbar, widgets, layout persistence, light/dark theme
- **Portfolio apps** — About, Experience, Projects, Skills, Publications, Contact, Resume
- **3D Globe** — Three.js Earth with time zones, sunlight, and interactive controls
- **Motion Lab** — QR phone pairing, sensor streaming (WebSocket / HTTP + SSE), calibrated sword control, block-cutting minigame
- **Mobile path** — single-app full-screen flow on small viewports
- **Deploy pipeline** — Vite build → `main` via GitHub Actions or local `gh-pages`

---

## Tech stack

| Layer | Stack |
|-------|--------|
| UI | React 19, Vite 8 |
| 3D | Three.js |
| Icons | lucide-react, react-icons |
| Motion relay | Dependency-free Node HTTP + WebSocket helpers |
| Hosting | GitHub Pages (`main`) |
| Optional relay host | Render / Railway / Fly / any Node HTTP host |

---

## Project structure

```text
.
├── public/                 # Static assets copied into dist (includes main-branch README)
├── server/
│   ├── motion-relay-server.mjs   # Production motion relay
│   └── websocket-relay.mjs       # Shared WS framing helpers
├── src/
│   ├── App.jsx             # Theme + /motion-phone routing
│   ├── components/
│   │   ├── DesktopShell.jsx
│   │   ├── desktop/        # Icons, windows, taskbar, widgets
│   │   ├── GlobeViewer.jsx
│   │   ├── MotionLab.jsx   # Desktop lab + phone sensor client
│   │   └── …               # About, Projects, Experience, etc.
│   └── main.jsx
├── vite.config.js          # React plugin + local motion-relay middleware
└── package.json
```

---

## Quick start (source branch)

### Requirements

- Node.js `^20.19.0` or `>=22.12.0` (CI uses 22)
- npm

### Install and run

```bash
git checkout source
npm ci
npm run dev
```

Open the printed local URL (Vite binds `0.0.0.0` so phones on the same LAN can join Motion Lab).

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server + **local motion relay** (Vite middleware) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint |
| `npm run relay` | Standalone motion relay (default `http://localhost:8787`) |
| `npm run deploy` | Build and publish `dist/` to branch `main` (gh-pages) |

---

## Motion Lab

Motion Lab pairs a **phone** (sensor publisher) with the **desktop viewport** (SSE subscriber) through a small relay keyed by a session ID.

```text
Phone (DeviceMotion / DeviceOrientation)
        │  WebSocket preferred, HTTP POST fallback
        ▼
   Motion relay  ──session id──►  Desktop EventSource (SSE)
        │
        └── Three.js sword scene + telemetry
```

### Local development

1. Run `npm run dev`.
2. Open Motion Lab on desktop; scan the QR (or open the link) on your phone.
3. Prefer **HTTPS** on the phone path when testing real devices (many browsers require a secure context for sensors). Optional local certs live under `.cert/` if present:
   - `.cert/motion-lab-local-key.pem`
   - `.cert/motion-lab-local-cert.pem`

Phone route shapes:

- Hash: `#/motion-phone/<sessionId>`
- Path: `/motion-phone/<sessionId>`
- Optional relay override: `?relay=https://your-relay.example` (query or hash)

### Production relay

GitHub Pages is static, so production Motion Lab needs a separate Node process.

```bash
# Terminal 1 — relay
PUBLIC_RELAY_ORIGIN=https://your-relay.example \
MOTION_ALLOWED_ORIGINS=https://hhaider3.github.io,http://localhost:5173,https://localhost:5173 \
npm run relay
```

Useful environment variables (see also `server/README.md`):

| Variable | Purpose |
|----------|---------|
| `PORT` | Listen port (default `8787`) |
| `PUBLIC_RELAY_ORIGIN` | Public origin reported by `/api/motion/config` |
| `MOTION_ALLOWED_ORIGINS` | CORS allowlist (comma-separated, or `*`) |
| `MOTION_SESSION_TTL_MS` | Idle session cleanup |
| `MOTION_MAX_PAYLOAD_BYTES` | Max publish body size |

Relay endpoints:

- `GET /health`
- `GET /api/motion/config`
- `GET /api/motion/events?s=<session>` — Server-Sent Events for the desktop
- `POST /api/motion/publish` — HTTP sensor packets
- `WS  /api/motion/socket?s=<session>` — preferred phone stream

Point the frontend at the relay when building or deploying:

```bash
VITE_MOTION_RELAY_URL=https://your-relay.example npm run build
# or
VITE_MOTION_RELAY_URL=https://your-relay.example npm run deploy
```

Without rebuilding, you can override at runtime:

```text
https://hhaider3.github.io/?relay=https%3A%2F%2Fyour-relay.example
```

Default hosted relay used in CI: `https://motion-lab-relay.onrender.com`.

---

## Deploy

### Automatic (recommended)

Push to **`source`**. The workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):

1. Installs dependencies
2. Builds with `VITE_MOTION_RELAY_URL` set for production
3. Publishes `./dist` to **`main`** (GitHub Pages)

You can also run the workflow manually via **Actions → Deploy to GitHub Pages → Run workflow**.

### Manual

```bash
git checkout source
npm ci
VITE_MOTION_RELAY_URL=https://motion-lab-relay.onrender.com npm run deploy
```

`predeploy` runs `npm run build`; `deploy` pushes `dist/` to `main` with `gh-pages`.

---

## Development notes

- **Default branch for work:** always `source`.
- **Do not hand-edit `main`** for app changes — it is overwritten on deploy.
- **PRs / issues:** target `source`.
- The `public/README.md` file is copied into `dist/` so the **`main`** branch still explains that source lives on `source`.

---

## About

Software engineer focused on frontend performance, interactive web experiences, AI tooling, and cybersecurity. M.S. Software Engineering (Cybersecurity), Arizona State University.

- Portfolio: [hhaider3.github.io](https://hhaider3.github.io)
- GitHub: [github.com/hhaider3](https://github.com/hhaider3)
- LinkedIn: [linkedin.com/in/hasan-haider-52026a67](https://www.linkedin.com/in/hasan-haider-52026a67/)

---

## License

Private portfolio project (`"private": true` in `package.json`). Contact the author if you want to reuse substantial parts.
