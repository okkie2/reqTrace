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
- `broncode`
- `bron`
- `niveau`
- `volgorde`
- `opmerking`
- `moscow`
- `increment`
- relevance flags

### Lifecycle fields
- `status`: `active`, `deprecated`, `archived`
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
- Identity: `id`, `broncode`, `bron`
- Type and structure: `statement_type`, `niveau`, `order`
- Content: `title`, `text_origineel`, `text_nl`, `opmerking`
- Planning / context: `moscow`, `increment`, relevant parties
- Lifecycle: `status`, clone origin, timestamps

### Form behavior
- autosave is not required in MVP
- save explicitly
- validate required fields before save
- show warnings for suspicious but allowed input
- keep archive / deprecate as a deliberate secondary action

## Domain rules
- `id` is internal, stable, and meaningless
- `broncode` is external and may be duplicated across statements if multiple statements derive from one source fragment
- `statement_type` defines semantics, not presentation only
- deprecation does not delete data
- cloning creates a new statement identity, never a version overwrite

## Validation rules
- `title` may not be empty
- one of `text_origineel` or `text_nl` must be present
- `statement_type` must be one of the allowed glossary values
- `niveau` must be within the agreed range when provided
- archived or deprecated statements may still be referenced, but UI should warn when linking new active work to them

## Suggested API
### Endpoints
- `POST /api/statements`
- `GET /api/statements`
- `GET /api/statements/{id}`
- `PATCH /api/statements/{id}`
- `POST /api/statements/{id}/clone`
- `POST /api/statements/{id}/deprecate`
- `POST /api/statements/{id}/archive`

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
- `statement_type`
- `title`
- `text_origineel`
- `text_nl`
- `opmerking`
- `broncode`
- `bron`
- `niveau`
- `order_no`
- `moscow`
- `increment`
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
### Use soft lifecycle states, not hard delete
Hard delete damages traceability and breaks links. For this domain, deletion should be avoided entirely in the product UI.

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
