# QueueLess AI

QueueLess AI helps people prepare for in-person services and plan errands with sourced information. Queue estimates are only displayed when credible, recent data supports them; otherwise the wait is unknown.

## First prerequisite: Nemotron API call

1. Follow [the API key setup guide](docs/nebius-api-key.md).
2. Configure `.env.local` with `NEBIUS_API_KEY` and an exact `NEBIUS_MODEL` ID from the Token Factory catalog.
3. Run `python scripts/nebius_smoke.py`.

The smoke script uses the OpenAI Python SDK and sends one chat completion to Nebius Token Factory. The Nemotron 3 Nano 30B A3B call has been confirmed against the configured endpoint; the script allows enough completion tokens for this reasoning model and prints only its user-facing answer.

## Pilot scope and research

The initial pilot is Lagos, Nigeria, with standard passport renewal and national driver's licence renewal. Checked official sources and their check dates are recorded in [sources.json](data/sources.json); the sourced service corpus is [services.json](data/services.json). Driver's licence renewal fees are omitted because the checked FRSC fee table only states new-licence prices.

The response contract is [visit-plan.schema.json](schemas/visit-plan.schema.json). The 14 pre-agent evaluation scenarios and answer key are in [scenarios.json](eval/scenarios.json).

## Web app

The home page includes an OSM map, a Lagos service-location directory, browser-only location selection, and the renewal planner. Each location opens a queue/progress tracker, and users can submit a visit report. The 12 supplied locations are unverified and have no coordinates; the map intentionally shows no office pins and nearest-office distances remain unavailable until locations and coordinates are verified. Browser coordinates are not sent to the plan API or Nebius.

Run `npm install` then `npm run dev`. Nebius secrets stay server-side and must not use a `NEXT_PUBLIC_` variable prefix. The optional `NEXT_PUBLIC_SHOW_UNVERIFIED=true` flag can display grey pins only after coordinates are manually added; never geocode locations in the app.

The map uses Leaflet/React Leaflet with OpenStreetMap tiles and attribution. Standard OSM tile service use is best-effort and must follow its [tile usage policy](https://operations.osmfoundation.org/policies/tiles/). The MVP uses Google Maps deep links for reported addresses when a usable address exists; there is no in-app driving route or ORS integration.

See [Vercel deployment notes](docs/deployment.md) for account setup, deploy commands, and required server-side environment variables.

## Supplied design material

- [Home](assets/ui/1.%20Home.png)
- [Queue plan tracker](assets/ui/2.%20Queue%20plan%20tracker.png)
- [Visit report](assets/ui/3.%20Visit%20report.png)
- [Architecture](assets/architecture.png)
- [MVP PRD](docs/PRD.md)
- [Original supplied PRD/build plan](docs/source-prd-and-build-plan.pdf)
- [Lagos location directory](data/locations.json)
