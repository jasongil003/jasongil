# Jason Gil — Technical Lead & Applied AI

[Live portfolio](https://jasongil003.github.io/jasongil/)

Static HTML, CSS, and JavaScript portfolio with light/dark themes, accessible dialog handling, project case studies, and a separate Lab section.

## Content

- Work: SupportOS, Private AI Knowledge Platform, and Smart Document Renamer.
- Experience, grouped expertise, About, education, and Contact.
- Static project pages under `projects/`, compatible with GitHub Pages subpath hosting.
- Lab: curated Portfolio Assistant (no live LLM), typing test, local guestbook demo, and Orbit Impact.
- Responsive phone layouts include scrollable navigation/dialogs, native typing input, and touch controls for Orbit Impact.
- Appearance and sound preferences remain available. The game loads when its panel opens.

## Structure

- `index.html`: portfolio and short detail dialogs.
- `projects/*/index.html`: indexable case studies, with content independent of JavaScript.
- `css/`: shared styles and utilities.
- `js/`: theme, dialogs, and interactive features.
- `assets/`: portrait and favicon. The displayed portrait uses the original color PNG, with its full proportions preserved.

## Development and deployment

Production needs no build or package installation. Serve the repository with a static HTTP server. GitHub Pages should publish the repository root; `.nojekyll` is retained. Each project route uses a directory index.

For local development and browser QA, run `npm ci` and `npm run dev`. Vite is a development-only dependency; the deployed site remains static HTML/CSS/JS.

## Review status

See [enhancement validation](docs/ENHANCEMENT_QA.md) for verified checks and remaining review work. The old random contribution graph has been removed; the site does not claim simulated activity is real GitHub data.
