# Jason Gil — Technical Lead Portfolio

A responsive, recruiter-first portfolio for **Jason Gil**, focused on technical leadership across Linux infrastructure, enterprise networking, SaaS/MSP operations, automation, and applied AI systems.

## What changed

This redesign prioritizes credibility, clarity, and fast scanning:

- outcome-oriented hero positioning and clear GitHub calls to action
- four evidence-based project case studies derived from active repositories
- career progression from service desk roles to Technical Lead / IT Manager
- structured expertise, operating principles, and credentials
- accessible keyboard navigation, visible focus states, and a skip link
- responsive mobile navigation and reduced-motion support
- persistent dark/light theme with system-aware initial preference
- semantic metadata and Person structured data for search engines
- no frameworks, build tooling, analytics, or external runtime dependencies

## Project case studies

1. **ANTlabs Local AI Knowledge Base** — private on-premise RAG and support knowledge retrieval
2. **ANTlabs Operations Dashboard** — React/TypeScript NOC, site, authentication, session, and revenue visibility
3. **PAWI Expense Companion** — iOS and Android local-first group expense and debt tracking
4. **ASP Upgrade Health Check Automation** — Playwright evidence collection and Excel workbook updates

## Structure

```text
.
├── index.html
├── README.md
├── .nojekyll
├── css/
│   ├── style.css       # Ordered imports
│   ├── style-1.css     # Tokens, reset, header, hero foundation
│   ├── style-2.css     # Hero panel, proof, project system
│   ├── style-3.css     # Timeline, expertise, credentials, contact
│   └── style-4.css     # Responsive behavior and motion preferences
└── js/
    └── site.js         # Theme, navigation, reveal, and active-section behavior
```

The former interactive JavaScript modules are retained in the repository for comparison but are no longer loaded by `index.html`.

## Run locally

Because the site is static, any local HTTP server works:

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`.

## Deploy

The repository includes `.nojekyll` and can be served directly with GitHub Pages from the repository root.

## Content notes

Project descriptions intentionally avoid exposing private source code or internal credentials. Replace or extend the GitHub-only contact call to action when a public email, LinkedIn profile, résumé file, or custom domain is ready.

© 2026 Jason Gil
