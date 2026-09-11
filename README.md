# shaofeng.page

A static personal site: travelogues, technical writing and links to the small
tools, each of which lives in its own repo and is served by GitHub Pages under
`shaofeng.page/<repo>/`.

No analytics, no comments, no cookies, no third-party requests — the fonts are
self-hosted with everything else.

## Stack

Astro, built by GitHub Actions and published to GitHub Pages.
`public/CNAME` pins the custom domain so it survives every deploy.

## Design system

The visual language is the personal design system (v1.6): warm paper and
near-black ink, one rust accent used **only** as an interaction or state signal,
square corners, hairlines, no shadows, light plus Espresso dark taken from the
OS. Long-form pages with photographs use the v1.6 photo-essay pattern — a
reading column plus a margin column for figures.

`src/styles/site.css` and `src/styles/essay.css` reference `var(--token)` only;
no value is ever hard-coded. Tokens and fonts are vendored in `public/design-system/`.

## Photos

Travel photos are resized and stripped of every EXIF and ICC tag before they
are committed.

## Develop

```sh
npm install
npm run dev
npm run build && npm run preview
```

## Content

| collection | where | what |
|---|---|---|
| `travel` | `src/content/travel/*.md` | photo essays; body is raw HTML using the v1.6 essay classes |
| `writing` | `src/content/writing/*.md` | articles in the serif reading register |
| `projects` | `src/content/projects/*.yaml` | one file per project |

Schemas live in `src/content.config.ts`. Anything with `draft: true` is left
out of the build.
