# hhaider3.github.io (`main` branch)

This branch is the **GitHub Pages deployment** of my portfolio.

It contains **built static assets only** (`index.html`, JS/CSS bundles, images, resume PDF). It is generated automatically from the development branch and should not be edited by hand.

**Live site:** [https://hhaider3.github.io](https://hhaider3.github.io)

---

## Looking for the source code?

All editable React / Vite source, the Motion Lab relay server, docs, and issues belong on the **`source`** branch:

**→ [github.com/hhaider3/hhaider3.github.io/tree/source](https://github.com/hhaider3/hhaider3.github.io/tree/source)**

| Branch | Role |
|--------|------|
| [`source`](https://github.com/hhaider3/hhaider3.github.io/tree/source) | Development — open PRs and issues here |
| `main` (this branch) | Production build served by GitHub Pages |

---

## How this branch is updated

1. Changes land on **`source`**.
2. GitHub Actions (or `npm run deploy` from `source`) runs `vite build`.
3. The contents of `dist/` are published to **`main`**.

Pushing commits directly to `main` is not the intended workflow; the next deploy will overwrite them.

---

## What the site is

An interactive **Windows 7–style desktop portfolio**: apps for About, Experience, Projects, Skills, Publications, Contact, Resume, a **3D globe**, and **Motion Lab** (phone motion sensors driving a 3D sword scene via a separate realtime relay).

Motion Lab’s production relay is hosted separately from Pages (static hosting cannot keep long-lived sensor streams by itself). Details and local setup are documented on **`source`** — see the root [README](https://github.com/hhaider3/hhaider3.github.io/blob/source/README.md) and [`server/README.md`](https://github.com/hhaider3/hhaider3.github.io/blob/source/server/README.md).

---

## Contact

- Site: [hhaider3.github.io](https://hhaider3.github.io)
- GitHub: [hhaider3](https://github.com/hhaider3)
- LinkedIn: [hasan-haider-52026a67](https://www.linkedin.com/in/hasan-haider-52026a67/)
