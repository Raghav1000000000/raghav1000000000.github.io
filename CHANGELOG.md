# Changelog

Every update to the site is logged here and published as a [GitHub Release](https://github.com/Raghav1000000000/root-directory-project/releases).
Versions follow [semantic versioning](https://semver.org/): **major** for a redesign, **minor** for new features or sections, **patch** for fixes.

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

[1.1.0]: https://github.com/Raghav1000000000/root-directory-project/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/Raghav1000000000/root-directory-project/releases/tag/v1.0.0
