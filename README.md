# reqTrace

## Purpose
`reqTrace` is a working repository for modelling traceable statements from source requirements into a consistent statement network. It captures source material, a proposed data model, a DDD-style ubiquitous language for the NCPeH / MyHealth@EU domain, and now the first runnable MVP slices for roadmap items A and B.

## Quick Start
Install dependencies and start the local Statement Manager:

```sh
cd /Users/joostokkinga/Code/reqTrace
npm install
npm run dev
```

Open `http://localhost:3000`, then inspect the seeded statements, links, and the local storage file:

```sh
cd /Users/joostokkinga/Code/reqTrace
sed -n '1,200p' data/statements.json
sed -n '1,200p' statement_network_model_summary.md
```

## Status
Early-stage repository with the first MVP application slices now present. The repository still centers on the modelling approach, sample input, and ubiquitous language, but it now also includes a local Statement Manager with relationship management for roadmap items A and B.

## Description
The core idea is that everything is modelled as a `statement`: requirements, interpretations, elaborations, decisions, evidence, questions, and risks. Differences between those items are expressed through `statement_type`, supported attributes, parent links, and semantic relations.

The repository currently provides:

- a summary of the statement-network model
- sample requirement data in CSV form
- a YAML sketch of source attributes
- a categorized ubiquitous language as the source of truth for terminology
- MVP design notes for statement and relationship management
- a file-backed Next.js Statement Manager covering create, edit, clone, archive/deprecate, parents, and semantic relations
- roadmap and MVP scope notes for the broader traceability product

## Composition
Main repository contents:

- `AGENTS.md`: repository-level instructions for future AI-assisted changes
- `app/`: Next.js App Router UI for the Statement Manager
- `lib/statement-store.ts`: file-backed persistence, validation, and adjacency logic for roadmap items A and B
- `data/statements.json`: local JSON storage used by the Statement Manager for statements, parent links, and semantic relations
- `package.json`: application dependencies and development scripts
- `docs/ui-design-system.md`: UI design conventions for Pico, tokens, and shared styling rules
- `statement_network_model_summary.md`: concise explanation of the statement-network concept and workflow
- `Sample.csv`: sample requirement export with source codes, original text, translations, interpretations, and stakeholder relevance columns
- `sample_attributes.yaml`: attribute inventory derived from the sample source
- `docs/design-a-statement-manager.md`: functional and technical design for roadmap item A
- `docs/design-b-relationship-management.md`: functional and technical design for roadmap item B
- `docs/stack-technology.md`: recommended MVP stack and technology choices
- `ubiquitous-language/`: YAML glossary split by model core, statement types, traceability, attributes, domain terms, and governance
- `TODO.md`: MVP scope, phasing, and user-story backlog
- `ROADMAP.md`: shorter roadmap summary in Dutch

## Derivation
The model reuses ideas from:

- Domain-Driven Design for the ubiquitous language and shared terminology
- statement-based traceability rather than document-only requirement management
- source material from the eHDSI / MyHealth@EU / NCPeH context reflected in the sample data

## Requirements
- OS / platform: macOS, Linux, or another system capable of running Node.js and editing Markdown, CSV, YAML, and JSON files
- Runtime: Node.js 22 or a compatible recent Node.js release
- Dependencies: `npm` plus the packages declared in `package.json`
- Hardware constraints: none beyond normal local development

## Instructions
### Installing
Clone or copy the repository to a local workspace, then install the application dependencies:

```sh
cd /Users/joostokkinga/Code/reqTrace
npm install
```

### Setup / Config
No environment variables are required for the current implementation. The Statement Manager reads and writes local data in `data/statements.json`.
UI guidance for future development is documented in `AGENTS.md` and `docs/ui-design-system.md`.

### Usage
Run the Statement Manager locally:

```sh
cd /Users/joostokkinga/Code/reqTrace
npm run dev
```

Use the repository as both a modelling workspace and an MVP app:

1. Open `http://localhost:3000`.
2. Review the seeded statements in the left-hand list.
3. Create a new statement or open an existing statement to edit it.
4. Use `Clone`, `Deprecate`, or `Archive` to exercise the roadmap A lifecycle.
5. Add one or more parents and semantic relations to the selected statement.
6. Inspect incoming and outgoing links in the relationship panels.
7. Inspect `data/statements.json` to review the stored output.
8. Continue using `Sample.csv`, `sample_attributes.yaml`, and the glossary YAML files as the domain source material.

### Uninstall
Delete the local repository folder. If you installed dependencies, remove `node_modules` first if you want to reclaim disk space.

## Example
Concrete happy path:

1. Start the app with `npm run dev`.
2. Open `http://localhost:3000`.
3. Click `New statement`.
4. Enter a title, choose a statement type, and fill `Original text` or `Dutch text`.
5. Save the statement and confirm it appears in the list with a generated statement number.
6. Add a parent and an `uitwerking_van` or `detail_van` relation to another statement.
7. Verify that the link appears in both the outgoing and incoming sections.
8. Inspect `data/statements.json` to confirm the persisted result.

## Output
The repository currently produces both documentation assets and local application output:

- a proposed statement data model
- a controlled vocabulary in YAML
- sample requirement data for analysis
- a local JSON-backed Statement Manager UI for roadmap items A and B
- persisted statement records, parent links, and semantic relations in `data/statements.json`
- MVP design documentation for roadmap items A and B
- a scoped roadmap for an MVP tool

## Limitations
- The current app stores data in a local JSON file, not PostgreSQL yet.
- Validation covers roadmap A required fields plus roadmap B duplicate/self-link/cycle checks.
- Search, filtered working views, and graph navigation are still not implemented.
- The sample data appears to focus on a subset of one source domain rather than a complete corpus.
- Licensing terms are not yet defined in the repository.

## Roadmap
- Add working views for slicing statements by source, type, use case, stakeholder, and level.
- Introduce search and validation overviews so incomplete or inconsistent traceability becomes visible.
- Expand later toward Git-aware change tracking, richer relation browsing, and publication/export workflows.

## Credits
This repository builds on project and domain material from the NCPeH / MyHealth@EU context, plus internal modelling work on statement-based traceability and ubiquitous language design.

## Licence
No licence file is present yet. Treat the repository as all rights reserved until a licence is added.
