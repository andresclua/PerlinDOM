# PerlinDOM Showcase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a GSAP/ScrollTrigger storytelling site for PerlinDOM ("Del caos a la forma", estética C) plus API and examples pages, with the library changes the story needs.

**Architecture:** The library gains a shared rAF loop, per-instance `amplitude` and optional `target`, and offscreen pause, all backwards compatible. The site is a multi-page Vite build (`index`, `api`, `examples`) in `src/`; GSAP animates `amplitude` and never writes `transform` on hero elements.

**Tech Stack:** Vanilla JS (ES modules), Vite 5, SCSS, `gsap` + `ScrollTrigger` (site only), `node --test` for library logic.

**Spec:** `docs/superpowers/specs/2026-11-05-perlindom-showcase-design.md`
Visual reference: `.superpowers/brainstorm/65343-1793913339/content/style.html` (card C).

## Global Constraints

- Library stays zero-dependency; `gsap` is a devDependency used only by the site.
- Existing `new PerlinDOM({element, x, y, speed, seed, lerpSpeed, preserveBaseTranslation})`, `play()`, `pause()`, `destroy()`, `refreshBaseTransform()`, `lastX`, `lastY` keep working unchanged.
- Aesthetic C: purple-to-blue gradient, thin tracking-wide type, translucent circles; background color changes per chapter via GSAP scrub.
- Site copy in English. Google Fonts allowed.
- Respect `prefers-reduced-motion`. Mobile uses far fewer hero elements (about 60) than desktop (about 300).
- Performance target: 60 fps on a mid-range laptop with about 300 elements.
- No npm publish and no version bump. Only fix `dist` filename vs `package.json` mismatch.
- Title is real DOM text; the elements only draw it visually.

## Review Focus

- `amplitude` outside 0 to 1, or `NaN`, must clamp rather than throw or fling elements off screen.
- `destroy()` on an instance while the shared loop is iterating must not skip or crash other instances.
- Hero with `target` set on an element whose parent resizes must still land on the title after resize.
- `prefers-reduced-motion: reduce` must show the finished title (converged), not a frozen chaotic hero.
- Page opened scrolled partway (reload mid-page) must render the correct chapter state, not the hero state.

---

### Task 1: Shared loop and offscreen pause

**Files:**
- Modify: `src/js/PerlinDom.js`
- Create: `tests/perlindom.test.mjs`
- Modify: `package.json` (add `"test": "node --test tests/"`)

**Interfaces:**
- Produces: all instances are driven by one module-level `requestAnimationFrame` loop that stops when no instance is active. Instances with `IntersectionObserver` available pause stepping while `isIntersecting === false`; without it they always step. Public API unchanged.

- [ ] **Step 1:** In `tests/perlindom.test.mjs`, stub `window`, `requestAnimationFrame`, `cancelAnimationFrame` and a fake element (`style`, `parentElement`). Write `one rAF callback serves two instances`: after creating two instances and running one stubbed frame, both elements have a `transform` and the stub recorded a single pending callback.
- [ ] **Step 2:** Write `destroy during a frame does not skip others`: instance A destroys itself in a callback while B exists; after the frame B's `transform` still updated.
- [ ] **Step 3:** Run `npm test`. Expected: FAIL.
- [ ] **Step 4:** Refactor `animate` into a per-instance `step()` and a module-level `const active = new Set()` with one `tick()` that iterates a copy of the set; start the loop on first add, stop when empty. `pause`/`play` semantics (lerp) are unchanged.
- [ ] **Step 5:** Add offscreen pause with one shared `IntersectionObserver` (guarded by `typeof IntersectionObserver !== 'undefined'`), toggling an `onScreen` flag that `tick()` checks.
- [ ] **Step 6:** Run `npm test`. Expected: PASS.
- [ ] **Step 7:** Commit `feat: shared rAF loop and offscreen pause`.

### Task 2: `amplitude` and `target`

**Files:**
- Modify: `src/js/PerlinDom.js`, `tests/perlindom.test.mjs`

**Interfaces:**
- Produces: constructor options `amplitude = 1` and `target = null` (`{x: number, y: number}` in px, offset from the element's base position). Property `instance.amplitude` is writable at runtime. Final offset is `target + (noiseOffset - target) * amplitude`, so amplitude 1 gives free drift and 0 gives the target (or `0,0` when no target). Setter clamps to `[0, 1]` and treats `NaN` as 1. Instance method `setTarget({x, y} | null)`.

- [ ] **Step 1:** Tests: `amplitude 0 lands on target`, `amplitude 1 equals previous behavior` (same seed, same `lastX/lastY` as before the change), `amplitude clamps and ignores NaN`, `setTarget(null) returns to origin at amplitude 0`.
- [ ] **Step 2:** Run `npm test`. Expected: the new tests FAIL.
- [ ] **Step 3:** Implement in `step()`; keep the existing `translate3d(...) baseTransform` composition. Define `amplitude` as an accessor so clamping always applies.
- [ ] **Step 4:** Run `npm test`. Expected: PASS.
- [ ] **Step 5:** Commit `feat: amplitude and target`.

### Task 3: Build output and package fix

**Files:**
- Modify: `vite.config.js`, `package.json`, `CHANGELOG.md`

- [ ] **Step 1:** Make `fileName` produce `perlindom.es.js` / `perlindom.umd.js` (lowercase) and point `main`, `module`, `exports` to those exact names.
- [ ] **Step 2:** Add an `[Unreleased]` section to `CHANGELOG.md` listing shared loop, offscreen pause, `amplitude`, `target`, `dist` filenames. No version bump.
- [ ] **Step 3:** Run `npx vite build`. Expected: `dist/perlindom.es.js` and `dist/perlindom.umd.js` exist and match `package.json`.
- [ ] **Step 4:** Commit `chore: align dist filenames`.

### Task 4: Site scaffolding and design tokens

**Files:**
- Modify: `vite.config.js` (separate lib build from site build), `package.json` (`gsap` devDependency, scripts `dev`, `build:lib`, `build:site`)
- Create: `src/api.html`, `src/examples.html`, `src/scss/_tokens.scss`, `src/scss/_base.scss`, `src/js/site/nav.js`
- Modify: `src/index.html` (replace with landing shell), `src/scss/style.scss` (import tokens and base)
- Move: current `src/index.html` content into `src/examples.html` unchanged for now; delete `docs/examples.html`

**Interfaces:**
- Produces: `_tokens.scss` with the C palette and type scale (CSS custom properties `--bg-a`, `--bg-b`, `--ink`, `--glass`); `nav.js` exports `mountNav()`; Vite `build.rollupOptions.input` with the three pages and `base: './'`.

- [ ] **Step 1:** `npm i -D gsap`.
- [ ] **Step 2:** Configure Vite so `npm run build:site` builds the three pages into `dist-site/`, and `npm run build:lib` still builds the library into `dist/`.
- [ ] **Step 3:** Create tokens, base styles and a shared nav linking the three pages.
- [ ] **Step 4:** Run `npm run build:site`. Expected: three HTML files in `dist-site/`, no errors; `npm run dev` serves all three.
- [ ] **Step 5:** Commit `feat: multipage site scaffold`.

### Task 5: Hero (chaos) and convergence into the title

**Files:**
- Create: `src/js/site/hero.js`, `src/js/site/sampleText.js`, `src/scss/_hero.scss`
- Modify: `src/index.html`, `src/js/index.js`

**Interfaces:**
- Consumes: `PerlinDOM` with `amplitude`, `setTarget`.
- Produces: `sampleText(text: string, font: string, width: number, count: number): {x: number, y: number}[]` samples points from a canvas-rendered string; `mountHero(root: HTMLElement): { destroy(): void }` creates N translucent circles (about 300 desktop, about 60 under 768px width), one `PerlinDOM` each with distinct `seed`, assigns each a target from `sampleText`, and builds a ScrollTrigger (pinned, `scrub`) that animates every instance's `amplitude` from 1 to 0. The `<h1>PERLINDOM</h1>` is real text, visually hidden until convergence completes.

- [ ] **Step 1:** Write `sampleText.js` and a `tests/sampleText.test.mjs` asserting it returns exactly `count` points inside the requested width and returns `[]` for an empty string.
- [ ] **Step 2:** Run `npm test`. Expected: PASS after implementing.
- [ ] **Step 3:** Implement `mountHero`; recompute targets on resize (debounced) and call `ScrollTrigger.refresh()`.
- [ ] **Step 4:** Verify in the browser (use the browser-automation skill): at scroll 0 the circles float; at the end of the pin the circles overlay the title; resize the window mid-pin and confirm they still land on the title.
- [ ] **Step 5:** Commit `feat: hero convergence`.

### Task 6: Chapters 3 to 5 (letters, live API, finale)

**Files:**
- Create: `src/js/site/letters.js`, `src/js/site/apiChapters.js`, `src/js/site/finale.js`, `src/scss/_chapters.scss`
- Modify: `src/index.html`, `src/js/index.js`

**Interfaces:**
- Produces: `mountLetters(h1: HTMLElement)` splits the title into spans and gives each a `PerlinDOM` with its own seed on release (pin chapter); `mountApiChapters(root: HTMLElement)` creates one pinned panel per option (`speed`, `seed`, `x/y ranges`, `lerpSpeed`, `pause/play`), each with a live element moving to explain it; `mountFinale(root: HTMLElement)` raises `amplitude` back to 1 and shows `npm install @andresclua/perlindom` with a copy button. Background color shifts between chapters through a single GSAP timeline on `--bg-a`/`--bg-b`.

- [ ] **Step 1:** Implement the three modules, each cleaning up its ScrollTriggers and instances through `destroy()`.
- [ ] **Step 2:** Verify in the browser: scroll top to bottom, no console errors, background colors change per chapter, and the copy button puts the install command on the clipboard.
- [ ] **Step 3:** Verify reload while scrolled to the middle: the page shows that chapter's state, not the hero state.
- [ ] **Step 4:** Commit `feat: story chapters`.

### Task 7: Reduced motion and mobile

**Files:**
- Modify: `src/js/site/hero.js`, `src/js/site/letters.js`, `src/js/site/apiChapters.js`, `src/js/site/finale.js`

- [ ] **Step 1:** With `matchMedia('(prefers-reduced-motion: reduce)')`, skip pins and scrub: render the title converged (`amplitude` 0, static) and show every chapter as static content.
- [ ] **Step 2:** Verify with browser emulation of reduced motion and a 390px viewport: the title is readable, no horizontal scroll, element count is about 60 on mobile.
- [ ] **Step 3:** Run a Lighthouse performance check on desktop and confirm the hero holds 60 fps in a performance trace (record in the PR description).
- [ ] **Step 4:** Commit `feat: reduced motion and mobile`.

### Task 8: API and examples pages

**Files:**
- Modify: `src/api.html`, `src/examples.html`, `src/scss/_docs.scss`
- Create: `src/js/site/examples/*.js` (move code of the 11 existing examples out of inline `<script>`)

**Interfaces:**
- Consumes: the library options table including `amplitude` and `target` from Tasks 1 and 2.

- [ ] **Step 1:** Write `api.html` from the README sections Configuration, API Reference and Troubleshooting, plus `amplitude`, `target`, `setTarget`, with the same nav and tokens.
- [ ] **Step 2:** Restyle the 11 examples to aesthetic C; each example keeps its working code with a copyable snippet.
- [ ] **Step 3:** Verify in the browser: every example moves, links between the three pages work, no console errors.
- [ ] **Step 4:** Run `npm run build:site` and open `dist-site/index.html` via `npm run preview`. Expected: all three pages work with relative paths.
- [ ] **Step 5:** Commit `feat: api and examples pages`.

### Task 9: README update

**Files:**
- Modify: `readme.md`

- [ ] **Step 1:** Document `amplitude`, `target`, `setTarget`, shared loop and offscreen pause, and link the site pages.
- [ ] **Step 2:** Commit `docs: readme for new options`.
