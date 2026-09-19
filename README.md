# Sankirt Jasmine — Andheri East

A standalone static landing page for **Sankirt Jasmine** (Mogra Village, Andheri East,
Mumbai 400069), operated by an independent authorised channel partner.

This is a **second, independent site**. It shares no palette, typeface, hero structure,
navigation pattern, icon style or lead-capture UI with sankirtjasmin.com.

---

## Deploying to Cloudflare Pages

`sankirt-jasmine-cloudflare-pages.zip` has `index.html` at its root, which is what
Cloudflare expects.

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
   **Upload assets**.
2. Name the project, drop the ZIP in, **Deploy**.
3. You get a `https://<project>.pages.dev` URL. That's the preview — everything works
   on it, including the WhatsApp links.

`_headers` ships with the site and Cloudflare applies it automatically: a year of
immutable caching on fonts, a month on images and plans, plus `nosniff`,
`Referrer-Policy`, `X-Frame-Options` and a `Permissions-Policy`.

To redeploy later, upload a new ZIP to the same project — or connect the Git repo and
let it build on push (no build command, output directory `/`).

### When the domain is ready

Nothing is hard-coded to a domain. The `canonical` and `og:url` tags are deliberately
commented out, because a canonical pointing at a domain that isn't live yet tells
crawlers the real page is somewhere else. `og:image` is root-relative for now.

From the site root, run:

```bash
./set-domain.sh https://www.your-domain.com
```

That uncomments both tags, makes `og:image` absolute (WhatsApp and most link scrapers
need an absolute URL to render a preview) and removes the placeholder note. Then add
the custom domain in Cloudflare Pages → your project → **Custom domains**, and
re-upload.

---

## Running it locally

No build step, no dependencies. It is plain HTML/CSS/JS — but it must be served over
HTTP, not opened as a `file://` URL, or the browser blocks the self-hosted fonts.

```bash
python3 -m http.server 8000
# → http://127.0.0.1:8000
```

---

## Structure

```
index.html
_headers                   Cloudflare Pages caching + security headers
set-domain.sh              one-shot domain switch, run when DNS is ready
assets/css/styles.css      design tokens, then sections in page order
assets/js/main.js          scrollspy, hero parallax, estimator, lead form, plan gate
assets/fonts/*.woff2       14 self-hosted subsets (224 KB total)
assets/img/*               renders, spec photos, logo, favicon, OG cover
assets/plans/*             10 floor plans (gated)
```

## Design

“The Route” — the page is laid out as a transit map, with the project as the
interchange, playing to its strongest fact: nine connection points, all 5–15 minutes out.

| Token | Value | Use |
|---|---|---|
| `--paper` | `#F3F5F7` | ground |
| `--ink` | `#0E1726` | text, dark bands |
| `--signal` | `#FF4F2E` | fills, route lines, stop rings, accent text on ink |
| `--signal-deep` | `#B82A0C` | small accent **text** on light grounds (see accessibility) |
| `--sky` | `#CFE0F1` | panels |
| `--rule` | `#C9D1DA` | hairlines |

Type: **Bricolage Grotesque** 700/800 (display) · **Instrument Sans** 400/500/600 (body)
· **IBM Plex Mono** 400/500 (data labels, areas, prices, dates, RERA number).

Sections are separated by full-width colour blocks rather than rules. Desktop navigation
is a numbered vertical rail; mobile gets a bottom action bar.

### Fonts — the ₹ problem

`Instrument Sans has no ₹ glyph (U+20B9).` Bricolage and Plex Mono carry it in their
`latin-ext` subsets. So:

* U+20B9 is **cut out of** the Instrument Sans `latin-ext` `unicode-range`, and
* a dedicated `@font-face` maps U+20B9 to IBM Plex Mono.

A ₹ can therefore never fall through to a system font, wherever it appears. All prices
are set in mono by design. Fallback stacks use measured `size-adjust` /
`ascent-override` values taken from the real font files, so swapping in the webfont
shifts no layout.

## Lead capture

No backend. Every form ends in a pre-filled `wa.me` deep link to
**Hitendra B. Solanki, +91 88281 61678**.

* **Sticky WhatsApp button** — bottom-right at all breakpoints, official mark, brand green.
* **Lead form** — `<dialog>` from the hero, price rows and footer. Name, phone,
  configuration chips, honeypot. Pre-selects the configuration you clicked from.
* **Cost estimator** — pick a configuration, enter a down payment, see the balance.
  Plain arithmetic on the published indicative price; it invents no rate, charge or fee.
* **Floor plans** — blurred, unlocked **inline on the plan** with a phone number.
  Unlock persists in `localStorage` and opens all ten at once.
* Honeypot on all 11 forms. Without JavaScript, a `<noscript>` block gives direct
  `tel:` and `wa.me` links.

> **Note on the plan gate:** this is a front-end gate, which is the most a static site
> can do — the image files are still reachable by URL. It captures leads from ordinary
> visitors; it is not access control.

## Content policy

Every fact traces to the live sankirtjasmin.com copy supplied in the brief. The brochure
PDF was used **for images only**. Deliberately excluded: schools and hospitals,
MIDC/Powai/BKC/SEEPZ, metro line numbers, the annotated location map, 2.5 BHK, and the
architect, legal, structural-consultant, financier and marketer credits.

Two content decisions worth flagging:

* **Carpet range is `464–1105 sq.ft`, not `465–1105`.** The brief's own design section
  said 465, but its content section explicitly corrects the live site's 465 to 464 and
  says not to repeat that inconsistency. The content section won.
* **No per-point travel times.** The live-site copy gives a single 5–15 minute band for
  all nine points, so the diagram labels the band once rather than inventing nine
  individual times (the brochure has them; the brochure is not a copy source). Points are
  grouped Rail / Metro / Road / Air, a classification that follows from the names alone.

## Accessibility & performance

* Every text node meets **WCAG AA**, verified with alpha and `opacity` composited against
  the real backdrop. Vermilion on paper is only 3.0:1, which is why `--signal-deep`
  exists for small accent text; CTA buttons use **ink on vermilion** (5.5:1), not white
  (3.3:1).
* One `h1`, no skipped heading levels, descriptive `alt` on all 27 images, every input
  labelled, visible focus rings, `prefers-reduced-motion` respected.
* `width`/`height` on every image and metric-matched font fallbacks — no layout shift.
* 26 below-fold images lazy-loaded. **~529 KB initial load**; ~3.3 MB only if a visitor
  scrolls the entire page and every render and plan loads.
* No horizontal scroll and no console errors at 375 / 768 / 1440 px.
