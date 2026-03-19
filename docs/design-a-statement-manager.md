# Design A: Statement Manager

## Scope
Roadmap item A covers the minimum CRUD lifecycle for a statement:

- create
- edit
- clone
- archive / deprecate

This design assumes the statement remains the core aggregate. A statement is the smallest traceable unit and carries meaning through `statement_type`, content fields, hierarchy, and relations.

## Goal
Enable a user to capture and maintain statements quickly without collapsing interpretation, elaboration, and decisions into overloaded fields.

The Statement Manager should optimize for:

- fast entry of new statements from source material
- low-friction editing of existing statements
- safe duplication for variant creation
- retaining history and visibility for deprecated content
- keeping provenance and programme lineage separate

## Non-goals
- rich graph editing
- workflow approvals
- publishing
- Git operations from the UI
- role-based access control

## User flows

### Create
The user opens a "New statement" form, selects a `statement_type`, enters the required content, optionally selects source metadata, and saves. The system assigns a stable internal `id`.

### Edit 
The user opens an existing statement, updates fields, reviews validation feedback inline, and saves the updated version.

### Clone
The user opens a statement and chooses `Clone`. The system creates a draft copy with a new internal `id`, carries over selected fields, and marks the record as a clone source.

### Archive / deprecate
The user marks a statement as no longer active. The statement remains searchable and visible in context, but is excluded from default working views.

## Functional requirements
### Required fields for MVP
- `id`
- `statement_type`
- `title`
- at least one text field: `text_origineel` or `text_nl`

### Optional fields for MVP
- `piezo_id`
- `broncode`
- `bron`
- `niveau`
- `volgorde`
- `opmerking`
- relevance flags

### Lifecycle fields
- `status`: `draft`, `applicable`, `deprecated`
- `created_at`
- `updated_at`
- `cloned_from_statement_id` nullable

## UX design
### Primary layout
Use a two-pane layout:

- left pane: filterable statement list
- right pane: statement editor / detail view

This is better than modal-heavy CRUD because the core work is repetitive comparison and editing across many statements.

### Statement form sections
- Identity: `id`, `piezo_id`, `broncode`, `bron`
- Type and structure: `statement_type`, `niveau`, `order`
- Content: `title`, `text_origineel`, `text_nl`, `opmerking`
- Context: relevant parties
- Lifecycle: `status`, clone origin, timestamps

### Form behavior
- autosave is not required in MVP
- save explicitly
- validate required fields before save
- show warnings for suspicious but allowed input
- keep archive / deprecate as a deliberate secondary action

## Domain rules
- `id` is internal, stable, and meaningless
- `piezo_id` is an external programme lineage identifier, not a provenance field
- `broncode` is external and may be duplicated across statements if multiple statements derive from one source fragment
- `bron` captures provenance of content and must remain separate from `piezo_id`
- `statement_type` defines semantics, not presentation only
- deprecation does not delete data
- cloning creates a new statement identity, never a version overwrite

## Validation rules
- `title` may not be empty
- `statement_type` must be one of the allowed glossary values
- `niveau` must be within the agreed range when provided
- deprecated statements may still be referenced, but UI should warn when linking new applicable work to them

## Suggested API
### Endpoints
- `POST /api/statements`
- `GET /api/statements`
- `GET /api/statements/{id}`
- `PATCH /api/statements/{id}`
- `POST /api/statements/{id}/clone`
- `DELETE /api/statements/{id}`

### Response shape
Return a normalized statement plus lightweight derived metadata:

- statement fields
- counts of parents
- counts of incoming and outgoing relations
- validation warnings

## Suggested data model
### Table: `statements`
Core columns:

- `id` UUID or generated text key
- `statement_no` human-readable stable sequence such as `000123`
- `piezo_id`
- `statement_type`
- `title`
- `text_origineel`
- `text_nl`
- `opmerking`
- `broncode`
- `bron`
- `niveau`
- `order_no`
- `status`
- `cloned_from_statement_id`
- `created_at`
- `updated_at`

### Table: `statement_relevance`
- `statement_id`
- `party_code`
- `is_relevant`

Keep relevance normalized instead of hardcoding one column per stakeholder if stakeholder lists may change. If the stakeholder list is fixed for the domain, a JSONB column is also acceptable for MVP.

## Design decisions
### Keep lifecycle explicit and deletion deliberate
Deletion removes a statement and its direct links in the current MVP. This is acceptable for iteration, but stronger traceability safeguards may be needed later.

### Keep provenance and programme lineage separate
`bron` answers where the content came from. `piezo_id` answers which external programme requirement or governance line the statement belongs to. They must not be merged.

### Separate clone from versioning
Cloning is a user productivity action, not a history model. Proper version history can be added later through audit tables or Git integration.

### Keep one statement editor
Do not create a different screen for each statement type in MVP. The domain model benefits from uniformity, and the differences are semantic, not structural.

## Risks
- too many optional fields in the first form can slow down capture
- users may treat clone as versioning unless the UI labels it clearly
- status semantics can blur unless `deprecated` and `archived` are defined precisely

## Recommendation
Build A first as a strong CRUD core with validation and lifecycle states. Do not postpone archive/deprecate; that behavior shapes the data model and prevents accidental destructive workflows later.
