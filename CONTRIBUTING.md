# Contributing to PerlinDOM

Thanks for helping. Bug reports, fixes, docs and showcase entries are all welcome.

## Setup

```bash
git clone https://github.com/andresclua/PerlinDOM.git
cd PerlinDOM
npm ci
npm run dev        # site at http://localhost:5173
npm test           # library and site logic (node --test)
```

Node 20 or newer. The library (`src/js/PerlinDom.js`) has zero dependencies and must stay that way; `gsap` is a dev dependency used only by the site.

## Where things live

| Path | What |
|---|---|
| `src/js/PerlinDom.js` | The library |
| `src/js/site/`, `src/scss/` | The website (landing, API, examples, showcase) |
| `src/showcase.json`, `src/public/showcase/` | Showcase entries and their screenshots |
| `tests/` | `node --test` suites |

`npm run build:lib` builds `dist/`, `npm run build:site` builds the site into `dist-site/`.

## Fixing a bug or adding a feature

1. Open an issue first for anything bigger than a small fix.
2. Branch from `main`, keep the change focused.
3. Add or update a test in `tests/`. Behavior that existed before must stay bit-identical unless the change says otherwise and is noted in the changelog.
4. Update `readme.md`, `src/api.html` (if the public API changed) and `CHANGELOG.md` under `[Unreleased]`.
5. Run `npm test` and `npm run build:site`, then open a pull request.

Commit messages follow `type: summary` (`feat:`, `fix:`, `docs:`, `chore:`).

## Add your project to the showcase

1. Add an entry at the end of `src/showcase.json`:

   ```json
   {
     "title": "My project",
     "url": "https://example.com",
     "by": "Your name",
     "description": "One sentence, up to 220 characters.",
     "image": "showcase/my-project.jpg"
   }
   ```

2. Upload a 16:9 screenshot (about 1200×675, under 300 KB, `.jpg`, `.png` or `.webp`) to `src/public/showcase/` with the same file name.
3. Links must be `https`. Open the pull request; entries are reviewed before they appear.

You can do all of it from the GitHub web editor, no clone needed.

## Reporting a bug

Open an issue with the browser, the options you pass to `new PerlinDOM({...})`, and a minimal page or CodePen that reproduces it.

## License

By contributing you agree that your work is released under the project's MIT license.
