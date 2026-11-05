# Arnav Giri — Portfolio

Portfolio and independent web tools published at https://arnavgiri.github.io/

## Node.js site generator

GitHub Pages is a static host: **`index.js` runs at build time, not on visitors' browsers**.

- `projects.json` is the source of truth for featured projects and RSS metadata.
- `index.js` discovers additional folders containing an `index.html` file.
- `npm run build` regenerates homepage project rows, `feed.xml` and `sitemap.xml`.
- `npm run check` verifies that generated files are up-to-date.
- `npm test` checks generator syntax and the age calculator's date logic.
- `.github/workflows/build-and-deploy.yml` builds and publishes the static site via GitHub Actions.

### Add a new tool

1. Create a folder such as `new-tool/index.html` with its own CSS and JS.
2. Add an entry to `projects.json` with `slug`, `title`, `summary`, `category`, `published`, and optional `feedTitle`/`feedDescription`. This controls ordering and dates. Or let the build discover the folder automatically from its HTML title and description.
3. Run `npm run build`; homepage listing, RSS and sitemap update together.
4. Commit and push. The Pages workflow rebuilds the site.

Do not put BiharKalyan.in links inside tool pages. The external profile entry remains homepage-only, and all homepage projects open in a new tab.

### Deployment

Go to **Repository Settings → Pages → Build and deployment → Source: GitHub Actions**.
The workflow builds and uploads the generated static site. Keep the existing static pages in the repository as a fallback until GitHub Pages is switched over.

## URLs

- [Homepage](https://arnavgiri.github.io/)
- [Study Focus Timer](https://arnavgiri.github.io/study-focus-timer/)
- [Study Ambient Sounds](https://arnavgiri.github.io/study-ambient-sounds/)
- [Typing Speed Test](https://arnavgiri.github.io/typing-speed-test/)
- [Age Calculator](https://arnavgiri.github.io/age-calculator/)
- [RSS](https://arnavgiri.github.io/feed.xml)
- [Sitemap](https://arnavgiri.github.io/sitemap.xml)

## Contact

Email: arnavgiri@biharkalyan.in · [GitHub](https://github.com/arnavgiri)
