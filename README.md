# Emergent Knowledge Group — website

A three-page static site: **Home**, **Work**, **About**. No build step, no framework, no
external requests at runtime — fonts and libraries are self-hosted.

```
index.html          Home   (hero heartbeat, philosophy, project index)
work.html           Work   (interactive dossier for each public project)
about.html          About  (mission, four habits, maturity ledger)
assets/
  css/site.css      All styling (design tokens at the top)
  js/               main.js · pulse.js (hero) · explorer.js (Work) · motifs.js (project art)
  fonts/            Newsreader · Hanken Grotesk · Martian Mono (variable, OFL)
  vendor/           GSAP + ScrollTrigger + Lenis (see THIRD_PARTY_NOTICES.txt)
  img/              logo.svg · favicon.svg · og-image.png · apple-touch-icon.png
```

## Preview

Double-click `index.html`, or serve the folder for the most accurate result:

```
python -m http.server 8000      # then open http://localhost:8000
```

## Deploy

Upload the folder as-is to any static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages,
S3 …). There is nothing to compile.

**Current hosting:** GitHub Pages, from the `main` branch of
`EmergentKnowledgeGroup/EmergentKnowledgeGroup.github.io`, served at
<https://emergentknowledgegroup.github.io/>. Push to `main` to update the site.

**When a custom domain is chosen:** in the `<head>` of each page, change the two social-preview
tags from `https://emergentknowledgegroup.github.io/assets/img/og-image.png` to
`https://your-domain/assets/img/og-image.png`, and add a
`<link rel="canonical" href="https://your-domain/…">` per page. Then set the domain under
the repo's Settings → Pages (this adds a `CNAME` file), and point DNS at GitHub Pages.

## Content policy

Only public projects from <https://github.com/EmergentKnowledgeGroup> are linked or described.
Every project statement on the Work and About pages is taken from that project's own README or
GitHub description. If a project changes, update its dossier in `work.html`, its row in
`index.html`, and its row in the ledger in `about.html`.

## Editing

| To change…                         | Edit…                                                    |
| ---------------------------------- | -------------------------------------------------------- |
| Colours, fonts, spacing            | tokens at the top of `assets/css/site.css`               |
| A project's text                   | its `<div class="dossier">` in `work.html`               |
| Contact email                      | `mailto:` links in `about.html` and each page footer     |
| Hero heartbeat speed / size        | `SWEEP`, `HOLD`, `amp` in `assets/js/pulse.js`           |
| A project's animated illustration  | its function in `assets/js/motifs.js`                    |

## Behaviour notes

- **Light / dark:** follows the visitor's system setting until they use the toggle; the choice is
  remembered per browser.
- **Reduced motion:** with `prefers-reduced-motion`, smooth scrolling, reveals, the sweeping
  heartbeat and the illustrations' motion are all switched off and everything is shown statically.
- **No JavaScript:** all content is still readable; every project dossier is shown stacked.
- **Accessibility:** audited with axe-core (WCAG 2.2 AA + best practices) in both themes at
  desktop and phone widths with no violations; the project list is a keyboard-operable tab
  pattern (arrow keys, Home, End).
