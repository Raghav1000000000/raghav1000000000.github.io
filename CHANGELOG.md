# Changelog

Every update to the site is logged here and published as a [GitHub Release](https://github.com/Raghav1000000000/raghav1000000000.github.io/releases).
Versions follow [semantic versioning](https://semver.org/): **major** for a redesign, **minor** for new features or sections, **patch** for fixes.

## [2.1.1] - 2026-11-11

### Changed
- **Lead sheet connected.** The contact form now saves every SEND IT to the Google Sheet (and emails a copy), as well as opening WhatsApp.

## [2.1.0] - 2026-11-11

### Added
- **Google Sheets backend for leads.** `backend/google-apps-script.gs` is a free Google Apps Script that saves every SEND IT to a "Leads" sheet (time in IST, project, email, quick pick, page, referrer, device, language) and emails you about it. Once its web-app URL is pasted into `<meta name="sheet-endpoint">`, the form saves each lead there as well as opening WhatsApp; until then the form works exactly as before. Setup steps are in the README.
- **Spam protection:** a hidden trap field drops bot submissions, and the script stores anything that looks like a spreadsheet formula as plain text.

### Changed
- **Contact box placeholder:** "what are we building?" now hints *you imagine, I build…*
- **Clearer `$ whoami` intro in the footer.** It now says in plain words what Raghav does and who it's for: "I'm a developer who sorts out the tech side of businesses, so you can get on with running yours", then the common problems (dated website, software that keeps breaking, hours lost to copy-paste work), what gets done about them, and "You deal with me directly, in plain language… Based in India."

### Fixed
- **Desktop SEND IT no longer leaves your site.** It opened WhatsApp in a new tab and then also sent the site's own tab to WhatsApp. Now only the new tab opens.

## [2.0.1] - 2026-11-11

### Changed
- **New address:** the site moved from `raghav1000000000.github.io/root-directory-project/` to **https://raghav1000000000.github.io/** (no folder at the end). The repo is now `Raghav1000000000/raghav1000000000.github.io`.
- **Old links still work:** a small `root-directory-project` repo now only forwards visitors to the new address, keeping any `#section` in the link.
- Link previews, the README and this changelog point at the new address.

## [2.0.0] - 2026-11-11

Rebrand: the site is now **Raghav Mittal**, your personal brand, instead of "Root Directory Project".

### Changed
- **Hero title:** the giant ROOT/ DIRECTORY/ PROJECT. is now **RAGHAV/ MITTAL.**, two taller lines.
- **Browser tab, link previews, logo (`~/raghav`), terminal prompt (`raghav@india`), footer wordmark and copyright** use the new name.
- **WhatsApp and Gmail messages** open with "Hey Raghav 👋" / "Hi Raghav,"; the Gmail subject ends "via raghavmittal site".
- **Footer intro** reads "Hi, I'm Raghav Mittal. I help Indian businesses get tech that actually works…"
- **README and LICENSE** use the new name. The repo name and web address stay the same for now.
- **LinkedIn** added to the footer's social links, next to GitHub.
- **Faster headline:** the rotating line under the name changes every ~3.4 seconds (was ~5).

### Fixed
- **Phone work carousel now auto-swipes on real phones.** It paused whenever a finger touched the cards, including just scrolling the page past them, so it rarely started. Now only a sideways swipe pauses it. It's also faster: first move ~1 second after it comes into view, then every ~2.6 seconds, carrying on 3.5 seconds after you swipe.

## [1.3.2] - 2026-11-10

### Added
- **Intro cursor on the title.** On every visit and reload, a cursor glides across ROOT/ DIRECTORY/ PROJECT. so the letters dodge it. It hands over the moment the real mouse moves; on phones it plays once and fades.

### Changed
- **Always land on the title:** every visit and reload starts at the top of the page (unless a link points to a section).

## [1.3.1] - 2026-11-10

### Changed
- **Contact email** is now raghavmittal.founder@gmail.com: the Gmail buttons on every service card and the copy-email tile in the contact section.

## [1.3.0] - 2026-11-10

### Added
- **Service cards.** Each of the seven services (remake & redesign, fix bugs & speed, websites, cloud software, automation, consulting, startup collabs) has a card explaining it in plain, professional language: what it is, what you get, who it's a good fit for, and how to start. Each card has WhatsApp and Gmail buttons with a ready-written message, "or use the form", and a link to see it in action. Browse with ←/→, close with Esc or by clicking outside. On desktop it's a centred card; on phones it's a bottom sheet you can drag down to close, with the buttons always in reach.
- **Nav:** **works · collab · consult · say hi**. "works" opens a list of all seven services; "collab" and "consult" open their cards. "works" also shows in the phone nav.
- **Footer:** a short intro ("Hi, I'm Raghav…"), a services list that opens each service's card, contact links and social links (GitHub for now; LinkedIn, Instagram and X appear once their URLs are added to `SOCIALS` in `script.js`).

### Changed
- **Phones: no more scroll hijack.** The work section is a normal swipe carousel; the page scrolls freely and each panel snaps into place sideways. It also swipes itself every ~4 seconds while it's on screen, pauses when you touch it (carrying on 6 seconds after you let go), loops back to the start, and stops while a service card is open.
- **Plainer words:** the boot screen now reads like a quick check of an old site, and "how fast" became "From hello to live. No jargon." with four plain steps.
- **The ↓ badge** lists every service (remake, fix, web, cloud, automate) instead of only redesign.

## [1.2.0] - 2026-11-10

Performance and smoothness pass, plus friendlier WhatsApp messages.

Measured with a 12-second scripted scroll in headless Chrome (software rendering, so real devices with a GPU do better than these numbers). Results vary run to run; ranges are from two runs after the change.

| | Before | After |
|---|---|---|
| Desktop frame rate | ~12 fps | ~23–31 fps |
| Desktop time frozen in long tasks | 4.7 s | 0.8–5.5 s (noisy) |
| Phone (CPU slowed 4×) frame rate | ~16 fps | ~27–33 fps |
| First paint, desktop | 4.4 s | 1.3–1.8 s |

### Changed
- **Mouse effects no longer re-style the whole page.** The motion values behind the parallax and tilt are now written only to sections on screen; writing them at the page root forced every element to be re-checked on every mouse move.
- **Letters that dodge the cursor** use positions measured once, instead of re-measuring the page on every mouse move.
- **Looping animations pause** when their section is off screen (banners, badge, work scenes, process pills).
- **Work panels:** only the panel in view animates its scene; the blur on the other panels is gone (expensive while sliding).
- **Fonts load without blocking** the first paint; the boot screen covers the swap.
- **Phones:** the film-grain overlay is static instead of animated, which saves battery.
- **WhatsApp messages read like a real hello.** The tile opens with "Hey Root Directory Project 👋 Just came across your website and I'd love to chat about a project." The contact form writes the idea and email into a friendly message. The greeting and the mention of the website still make them easy to spot in your chats.

## [1.1.0] - 2026-11-10

Phone pass, based on testing on a Samsung Galaxy S23 FE.

### Changed
- **Work section locks onto each panel.** Each panel now holds still for the first half of its scroll, then glides to the next, and the page snaps onto every panel. Touch scrolling follows your finger directly instead of easing behind it.
- **Contact form sends to WhatsApp.** SEND IT opens WhatsApp with the project and email filled in. Every message from the site starts with `🟠 [Root Directory Project · website]` so it stands out in chats.
- **WhatsApp tile** now points at the real number, with the same tag.
- **Phones get their own layouts where needed:**
  - Header fades to solid instead of blending, so it no longer muddles content scrolling under it.
  - Hero ends right under its content, so there's no gap before the banners.
  - Choose-path: labels sit under each strip instead of overlapping, and the OR badge is smaller.
  - Quick picks become a two-row swipeable strip with a "(swipe →)" hint.
  - Tighter spacing from SEND IT to the contact tiles (desktop too).

### Fixed
- **Judder on phones:** the address bar showing or hiding no longer re-measures the page mid-scroll.
- **Rotating headline:** reserves exactly the space of its longest message, so it never jumps and never leaves dead space.

## [1.0.0] - 2026-11-10

First public release.

### Added
- Boot screen, rotating headline, typed terminal prompt and a giant three-line title.
- Work section: five full-screen panels (remake, fix, web, cloud, automate) that scroll sideways, each with its own CSS scene.
- Process strip: Say hi → Free scan → Fixed price → Shipped.
- Squash-the-bugs mini game with Web Audio toy-pistol sounds, POW stickers, recoil and a crosshair cursor.
- Consult / collab strips that slide with scroll, with an OR badge.
- Contact form with quick picks, an email field and a big SEND IT button.
- Scroll reveals, desktop hover effects, phone tilt and shake.
- Real-mouse detection for touchscreen laptops; reduced-motion support.
- GitHub Pages deploy, README with screenshots, all-rights-reserved license.

[2.1.1]: https://github.com/Raghav1000000000/raghav1000000000.github.io/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/Raghav1000000000/raghav1000000000.github.io/compare/v2.0.1...v2.1.0
[2.0.1]: https://github.com/Raghav1000000000/raghav1000000000.github.io/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/Raghav1000000000/raghav1000000000.github.io/compare/v1.3.2...v2.0.0
[1.3.2]: https://github.com/Raghav1000000000/raghav1000000000.github.io/compare/v1.3.1...v1.3.2
[1.3.1]: https://github.com/Raghav1000000000/raghav1000000000.github.io/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/Raghav1000000000/raghav1000000000.github.io/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/Raghav1000000000/raghav1000000000.github.io/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/Raghav1000000000/raghav1000000000.github.io/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/Raghav1000000000/raghav1000000000.github.io/releases/tag/v1.0.0
