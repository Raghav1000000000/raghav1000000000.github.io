<div align="center">

# Root Directory

**We fix, rebuild and build software for growing businesses.**<br>
Websites, apps and the tools that run behind them. Raghav Mittal & Aaditya Satam, Bengaluru.

[**→ Open the live site**](https://raghav1000000000.github.io/) &nbsp;·&nbsp; [What's inside](#whats-inside) &nbsp;·&nbsp; [Run it](#run-it)

![No build step](https://img.shields.io/badge/build-none-eba25a?style=flat-square&labelColor=0b0907)
![Zero dependencies](https://img.shields.io/badge/dependencies-0-eba25a?style=flat-square&labelColor=0b0907)
![HTML CSS JS](https://img.shields.io/badge/HTML%20·%20CSS%20·%20JS-vanilla-efe8dc?style=flat-square&labelColor=0b0907)
![Deploy](https://img.shields.io/github/actions/workflow/status/Raghav1000000000/raghav1000000000.github.io/pages.yml?branch=main&label=deploy&style=flat-square&labelColor=0b0907)

</div>

---

## What's inside

- **A moonlit night that stays behind the page.** A tree on a hill under an amber moon, distant ridges with town and data-centre lights, stone ROOT letters and glowing roots in the soil, all painted in canvas when the page loads (and again only if the width changes). Fireflies, falling leaves and light running down the roots are the only things animated each frame. As you scroll, the page slides up over the scene and it dims to a faint backdrop.
- **One root down the page.** The tree's root leaves the hero, bends to the left edge and draws itself as you scroll, branching to each section heading.
- **Short sections:** what we do, how we work (four steps that light up along the root), recent work and contact.
- **Work picker.** Eight projects in a short list (chips on phones). Pick one to see its screenshot, a one-line description and a link to the full case study on `/work/`.
- **Made to convert.** "Start a project" in the top bar, a free-call strip after the process, a rotating "Taking new projects" badge, and on phones a Start a project + WhatsApp bar that follows you until you reach the form.
- **Phones get their own layout,** not a squeezed desktop: the scene is reframed, the copy sits on top, and the picker turns into swipeable chips.
- **Works on touchscreen laptops:** mouse parallax switches on when a real mouse moves, not from CSS media queries.
- **Respects reduced motion,** and has no tracking, cookies or framework.

## Run it

There's nothing to install or build. Serve the folder with any static server:

```bash
npx serve .
```

Then open `http://localhost:3000`.

## Files

```text
.
├── index.html          # all the content
├── style.css           # colours at the top: --accent (amber), --ink, --panel
├── main.js             # scroll dimming, the root line, work picker, menu, contact form
├── scene.js            # the night scene (canvas layers + fireflies, leaves, root light)
├── favicon.svg
├── work/               # case studies page: index.html, device/ (phone + desktop screenshots)
├── backend/            # Google Apps Script that stores contact-form leads in a Sheet
└── .github/workflows/
    └── pages.yml       # deploys to GitHub Pages on every push to main
```

| Want to change… | Look for |
|---|---|
| Accent colour | `--accent` at the top of `style.css` |
| Projects in the work picker | `work` in `main.js` |
| Moon position and size | `MX`, `MY`, `MR` at the top of `scene.js` |
| How many fireflies and falling leaves | `nF` and `falls` in `initFx()` in `scene.js` |
| How dark the scene gets behind the page | `--dim` in `frame()` in `main.js` |
| WhatsApp number | `wa.me/…` links in `index.html` and `main.js` |
| Google Sheet for leads | `<meta name="sheet-endpoint">` in `index.html` |

## Google Sheets backend

Every contact form message lands as a row in a Google Sheet (and emails you). It's free and has no server: a small Google Apps Script, [`backend/google-apps-script.gs`](backend/google-apps-script.gs), receives the form. If the Sheet isn't set up, the form opens WhatsApp with the message ready to send.

**Set it up once (about 5 minutes):**

1. Create a new Google Sheet (e.g. "Website leads").
2. In the sheet: **Extensions → Apps Script**. Delete what's there, paste the whole of `backend/google-apps-script.gs`, and **Save**.
3. Pick `setup` in the function dropdown and press **Run ▶**. Allow the permissions it asks for. This creates the **Leads** tab and sets the time zone to IST.
4. **Deploy → New deployment →** type **Web app**. *Execute as:* **Me**. *Who has access:* **Anyone**. Press **Deploy** and copy the **Web app URL** (it ends in `/exec`).
5. In `index.html`, paste it into `<meta name="sheet-endpoint" content="…">` and push.

Each lead row has: time (IST), project, email, which option they picked, source, page, referrer, device and language. A hidden spam-trap field drops bot submissions. If you change the script later, use **Deploy → Manage deployments → Edit → New version** so the URL stays the same.

## Deploy

Every push to `main` deploys to **GitHub Pages** through [`.github/workflows/pages.yml`](.github/workflows/pages.yml). Every update is listed in [CHANGELOG.md](CHANGELOG.md) and published as a [GitHub Release](https://github.com/Raghav1000000000/raghav1000000000.github.io/releases).

---

<div align="center">
<sub>© 2026 Root Directory. The code is public to show how it's made; please don't reuse the site, brand or copy. See <a href="LICENSE">LICENSE</a>.</sub>
</div>
