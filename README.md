# FRIENDS — Hugo site

Site for **FRIENDS** (Frameworks, Research and applIcations in complEx
Networks with signeD edgeS), a NetSci satellite workshop on signed networks.

## Local development

You need the **extended** Hugo binary (the theme uses no Sass/Pipes features
that require it, but `hugo_extended` is the safe default). This was built
and tested against **Hugo v0.123.7 extended**; any reasonably recent 0.12x+
extended release should work, but if something looks off, check your
installed version against this one first.

```bash
hugo server
```

Then open http://localhost:1313/.

## Editing content

Most of the site is data-driven rather than free-text, so you usually don't
need to touch HTML:

- `data/speakers.yaml` — invited speakers shown on the home page and on `/speakers/`
- `data/committee.yaml` — organizing committee, grouped by edition
- `data/program.yaml` — the agenda for the current edition, shown on `/program/`
- `data/pasteditions.yaml` — talks from past editions, shown on `/pasteditions/`
- `content/submit.md` and `content/review.md` — plain Markdown pages
- `content/_index.md` — the intro paragraph shown in the homepage hero
- `hugo.yaml` — site-wide facts (when/where/deadline/email) under `params:`, and the nav menu

Photos live in `static/images/`.

## Deploying

This repo includes `.github/workflows/hugo.yml`, which builds the site with
Hugo and deploys it to GitHub Pages via GitHub's official Pages Actions. This
is a different deploy mechanism than the old Jekyll site, which GitHub
Pages built for you automatically. To use it:

1. In the repo's **Settings → Pages**, set "Source" to **GitHub Actions**
   (not "Deploy from a branch").
2. Push to `main` — the workflow builds and deploys automatically.

I pinned the workflow to Hugo v0.134.3 and to `actions/configure-pages@v5`,
`actions/upload-pages-artifact@v3`, and `actions/deploy-pages@v4`, which
were current, standard choices for a Hugo+Pages workflow as of my knowledge —
but I'd recommend checking the Actions tab after your first push, and
checking whether newer major versions of those actions exist, since I can't
confirm what's current on GitHub's side right now.
