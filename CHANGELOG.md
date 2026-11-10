# Changelog

Every update to the site is logged here and published as a [GitHub Release](https://github.com/Raghav1000000000/root-directory-project/releases).
Versions follow [semantic versioning](https://semver.org/): **major** for a redesign, **minor** for new features or sections, **patch** for fixes.

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

[1.2.0]: https://github.com/Raghav1000000000/root-directory-project/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/Raghav1000000000/root-directory-project/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/Raghav1000000000/root-directory-project/releases/tag/v1.0.0
