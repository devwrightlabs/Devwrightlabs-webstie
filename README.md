# DevWright Labs — Website

Premium, 3D scroll-driven marketing site for **DevWright Labs** — a studio
specializing in **Pi Network apps**, **Web3 cross-chain interoperability**, and
**FinTech solutions** for private and government sectors.

The site is shipped as a zero-build static bundle so it can be hosted on GitHub
Pages, Netlify, Cloudflare Pages, or any static host with no toolchain.

---

## ✨ Features

- **Fixed 3D background** — a glowing cross-chain network rendered with
  Three.js, overlaid with a subtle silhouette of two people shaking hands.
- **Scroll-driven scene animation** — the 3D network rotates and dollies forward
  as you scroll down, and reverses as you scroll up, via
  GSAP `ScrollTrigger` with `scrub`.
- **40% slower scroll pacing** — the global scrub value is `1.4s` so motion
  feels deliberate rather than rushed.
- **Subtle parallax** — hero copy and every section header drift vertically as
  they enter/leave the viewport.
- **Sticky header + quick-jump dropdown** — instantly anchor to any section,
  bypassing the scroll mechanics.
- **Sleek green & white palette** with modern, futuristic typography
  (Space Grotesk + Inter).
- **8-project portfolio** with interactive cards linking to dedicated sub-pages
  pre-wired with video + image placeholders.
- **Testimonials carousel**, **fully functional contact form**, and an embedded
  contact section on the homepage.

---

## 📁 File Structure

```
.
├── index.html              # Homepage: Hero, About, Portfolio (8), Testimonials, Contact
├── contact.html            # Standalone contact page
├── styles.css              # Full design system (green & white)
├── script.js               # Three.js scene + GSAP ScrollTrigger + carousel + form
├── README.md
├── projects/               # 8 portfolio sub-pages — drop your media here
│   ├── pi-pay.html
│   ├── cross-chain-hub.html
│   ├── defi-orbit.html
│   ├── sovereign-id.html
│   ├── treasury-link.html
│   ├── bridge-sentinel.html
│   ├── civic-ledger.html
│   └── studio-grid.html
└── vendor/                 # Locally vendored libraries (no CDN at runtime)
    ├── three.min.js        # three r160
    ├── gsap.min.js         # gsap 3.12.5
    ├── ScrollTrigger.min.js
    ├── three.LICENSE
    └── gsap.LICENSE
```

---

## 📦 Dependencies

All dependencies are **vendored locally under `vendor/`** so there is no build
step, no `npm install`, and no third-party CDN at runtime — good for
Subresource Integrity, offline preview, and air-gapped enterprise / government
environments.

| Package          | Version | Purpose                                           |
| ---------------- | ------- | ------------------------------------------------- |
| `three`          | r160    | 3D cross-chain network background scene           |
| `gsap`           | 3.12.5  | Animation engine                                  |
| `gsap/ScrollTrigger` | 3.12.5 | Scroll-driven scrubbing + parallax            |
| Google Fonts     | latest  | Space Grotesk (display) + Inter (body)            |

If you later want to migrate to a React + Vite stack, the equivalent install is:

```bash
npm install three @react-three/fiber @react-three/drei gsap
```

The component boundaries in `index.html` (`<section id="…">`) and the named
hooks in `script.js` (`initThreeScene`, `initScrollTriggers`, `initCarousel`,
`initContactForm`) are designed to port cleanly into a React component tree.

---

## 🚀 Run locally

Any static server works. From the repository root:

```bash
# Python
python3 -m http.server 8000

# Node
npx serve .
```

Then open <http://localhost:8000>.

---

## 🎨 Dropping in real media (for GitHub Copilot or you)

Every portfolio sub-page in `projects/` ships with a media gallery using
`.placeholder-media` blocks. Each is annotated with the expected filename, e.g.:

```html
<figure>
  <div class="placeholder-media">Hero Video · drop pi-pay-hero.mp4</div>
  <figcaption>Project hero reel</figcaption>
</figure>
```

To wire in real assets, create a `projects/media/` directory and replace the
placeholder div with a real `<video>` or `<img>` element:

```html
<figure>
  <video controls preload="metadata" poster="media/pi-pay-poster.jpg">
    <source src="media/pi-pay-hero.mp4" type="video/mp4" />
  </video>
  <figcaption>Project hero reel</figcaption>
</figure>
```

The portfolio cards on the homepage carry `data-thumb="<slug>"` hooks on
`.card-media` — swap the decorative CSS background for a real `<img>` if you
want photographic thumbnails.

---

## 🧩 Customization quick-reference

| Want to change…                | Edit                                                     |
| ------------------------------ | -------------------------------------------------------- |
| Palette (greens, ink, white)   | `:root` at the top of `styles.css`                       |
| Scroll pacing                  | `SCRUB` constant in `script.js` (currently `1.4`)        |
| Number / placement of 3D nodes | `NODE_COUNT` / `radius` in `initThreeScene` (`script.js`)|
| Portfolio cards                | `#portfolio .portfolio-grid` block in `index.html`       |
| Testimonials                   | `[data-carousel-track]` list in `index.html`             |
| Contact form backend           | `initContactForm` in `script.js`                         |

---

## ♿ Accessibility & performance

- Respects `prefers-reduced-motion` — the 3D scene renders a single static frame
  and CSS transitions/animations are disabled.
- Sticky nav has visible focus styles; all interactive controls are reachable
  via keyboard.
- WebGL renderer is created with `powerPreference: "high-performance"` and a
  capped `devicePixelRatio` of 2 to keep mobile GPUs happy.
