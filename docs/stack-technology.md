# Stack and Technology Recommendation

## Executive recommendation
Build the MVP as a conventional web application with a relational core:

- frontend: `Next.js` with `TypeScript`
- backend: `Next.js` server routes or a small service layer in the same codebase
- database: `PostgreSQL`
- ORM / SQL layer: `Drizzle ORM`
- validation: `Zod`
- UI primitives: `React`, `Tailwind CSS`, `shadcn/ui` or equivalent headless primitives
- search for MVP: PostgreSQL indexes and full-text search

Do not use a graph database, microservices, or Elasticsearch in MVP.

## Why this stack fits roadmap A and B
Roadmap A and B are CRUD-plus-links problems, not distributed systems problems.

This stack is a good fit because it gives:

- fast delivery for form-heavy product work
- one language across UI, validation, and server logic
- a stable relational model for statements, parents, and relations
- easy evolution toward search, validation views, and Git integration later

## Recommended architecture
### Application style
Start as a modular monolith.

One deployable application is enough for:

- statement CRUD
- relationship management
- search
- validation overviews
- import/export helpers

Split services only when scaling pain is real. There is no evidence of that need yet.

### High-level modules
- `statements`: CRUD, cloning, lifecycle changes
- `relationships`: parent and semantic relation management
- `search`: indexed lookup and full-text search
- `validation`: missing parents, invalid relations, empty required fields, orphans
- `glossary`: allowed statement types and relation types from config or YAML
- `import`: sample CSV or YAML ingestion later

## Frontend recommendation
### `Next.js` + `TypeScript`
Use Next.js because it supports:

- fast development for an internal tool
- server-rendered list/detail pages where useful
- simple API routes if you keep the backend in-process
- easy deployment without extra orchestration

### UI pattern
Prefer a list-detail application rather than a dashboard homepage.

Main screens:

- statement list + editor
- relationship tab in statement detail
- validation overview
- filtered working views

### Form stack
- `React Hook Form`
- `Zod`

This combination is productive for structured forms and shared client/server validation.

## Backend recommendation
### Keep it in the same TypeScript codebase
For MVP, avoid a separate Python or Java backend unless there is a strong team constraint.

Reasons:

- fewer moving parts
- one domain model definition
- simpler developer onboarding
- easier validation reuse

### API style
Use REST-style JSON endpoints. They are boring, debuggable, and enough for this product.

Suggested endpoint groups:

- `/api/statements`
- `/api/relations`
- `/api/search`
- `/api/validation`

## Database recommendation
### `PostgreSQL`
Use PostgreSQL as the source of truth.

Reasons:

- statements, parent edges, and relation edges map cleanly to relational tables
- recursive CTEs support ancestry checks and future tree/path views
- full-text search is available without extra infrastructure
- constraints help protect traceability integrity

### Why not a graph database now
Do not start with Neo4j or similar. For this roadmap phase it adds complexity without enough gain.

You do not yet need:

- graph query specialists
- graph-specific infrastructure
- dual persistence models

The product risk is semantic inconsistency, not query expressiveness.

For a direct comparison with a graph-first alternative, see `docs/postgresql-vs-neo4j.md`.

### Suggested initial tables
- `statements`
- `statement_parents`
- `statement_relations`
- `sources`
- `glossary_terms` or config-backed glossary loading
- `audit_log`

## Search recommendation
### MVP
Use PostgreSQL indexes and full-text search for:

- title
- source title
- text
- notes

This satisfies roadmap D well enough for initial scale.

### Later threshold
Move to Elasticsearch or OpenSearch only if:

- the corpus becomes large enough that PostgreSQL search is measurably inadequate
- ranking quality becomes a product problem
- cross-document analytics becomes a real requirement

## Validation recommendation
Run validation in the application layer backed by SQL queries.

Examples:

- missing parents
- invalid relation types
- empty required fields
- orphan statements

Do not introduce a separate rule engine in MVP.

## Configuration and glossary
The existing YAML glossary is valuable. Use it deliberately.

Recommended approach:

- keep YAML as the authoring source initially
- load allowed `statement_type` and `relation_type` values into the app at startup
- fail fast if the glossary is invalid

Later, if the glossary becomes editable in the product, persist it in PostgreSQL and generate YAML exports if needed.

## Deployment recommendation
### MVP environment
- application: one web deployment
- database: managed PostgreSQL
- file assets: local repo or object storage only if needed later

### Local development
- `Docker Compose` for PostgreSQL
- application runs with `npm` or `pnpm`

## Developer tooling
- package manager: `pnpm`
- linting: `ESLint`
- formatting: `Prettier`
- tests: `Vitest` for unit tests, `Playwright` for core UI flows
- database migrations: `Drizzle Kit`

## Technology decisions to avoid
- graph database in MVP
- event-driven architecture
- microservices
- CQRS split with separate read store
- custom design system before product fit
- premature Git integration inside the first release

## Decision summary
If you want the fastest path to a solid MVP for A and B, the strongest default is:

1. Next.js + TypeScript
2. PostgreSQL + Drizzle
3. React Hook Form + Zod
4. Tailwind + headless UI primitives
5. Modular monolith deployment

That stack is boring in the right way. It supports the current roadmap without forcing early infrastructure bets you are unlikely to need yet.
