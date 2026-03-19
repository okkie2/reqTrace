# Design B: Relationship Management

## Scope
Roadmap item B covers:

- select parents
- select relationships
- view incoming relationships
- view outgoing relationships

This is the minimum traceability layer on top of the statement CRUD core.

## Goal
Make structure and meaning explicit without turning the MVP into a graph editor.

The UI should support two distinct concepts:

- `parents`: hierarchical placement
- `relations`: semantic links between statements

These must not be merged in the product model or the user experience.

## Non-goals
- free-form visual graph editing
- unlimited custom relationship types
- graph analytics
- auto-generated traceability inference

## Core distinction
### Parents
Use `parents` for hierarchical attachment. A statement may have zero, one, or multiple parents.

### Relations
Use `relations` for explicit semantic links. In MVP, keep the allowed relation types limited and glossary-backed.

Recommended initial relation types:

- `verplicht_wegens`
- `vertaling_van`
- `detail_van`
- `uitwerking_van`

The naming should match the glossary exactly. If the glossary changes, the application should read the allowed set from configuration rather than hardcoding strings in multiple places.

## User flows
### Select parents
The user searches for one or more candidate parent statements and adds them to the current statement. The system immediately checks for cycles.

### Add relationship
The user selects a relation type, searches for a target statement, and saves the link.

### View incoming relationships
The statement detail page shows which statements point to this statement and through which relation types.

### View outgoing relationships
The same page shows where the current statement points and why.

## UX design
### Statement detail tabs
Use three adjacent sections or tabs:

- `Parents`
- `Outgoing relations`
- `Incoming relations`

This is clearer than one merged "links" section because hierarchy and semantics must stay distinct.

### Interaction pattern
- searchable combobox for selecting statements
- relation rows with type, target title, target id, and status
- inline add/remove actions
- warnings for deprecated or archived linked statements

### Display pattern
Each linked row should show:

- target `statement_no`
- target title
- `statement_type`
- relation type or parent label
- lifecycle status

Do not hide the target status. Traceability depends on users seeing whether they are linking to inactive material.

## Validation rules
### Parent rules
- no self-parenting
- no cycles
- duplicate parent links not allowed

### Relation rules
- no duplicate relation triplets: source, relation_type, target
- no self-links unless explicitly allowed by a future rule set
- relation type must be in the allowed configured set

### Consistency warnings
- linking to archived statements should warn
- linking to deprecated statements should warn
- relation type constraints can be added later, but do not over-constrain MVP unless domain rules are already settled

## Suggested API
### Parent endpoints
- `PUT /api/statements/{id}/parents`
- `POST /api/statements/{id}/parents/{parentId}`
- `DELETE /api/statements/{id}/parents/{parentId}`

### Relation endpoints
- `GET /api/statements/{id}/relations`
- `POST /api/statements/{id}/relations`
- `DELETE /api/relations/{relationId}`

### Read model
For statement detail, return:

- parent list
- outgoing relations
- incoming relations
- inactive-link warnings

## Suggested data model
### Table: `statement_parents`
- `statement_id`
- `parent_statement_id`
- `created_at`

Unique constraint on `statement_id, parent_statement_id`.

### Table: `statement_relations`
- `id`
- `source_statement_id`
- `relation_type`
- `target_statement_id`
- `created_at`

Unique constraint on `source_statement_id, relation_type, target_statement_id`.

## Query strategy
### Do not start with a graph database
For A and B, PostgreSQL handles this well:

- adjacency tables are simple
- recursive CTEs cover ancestor or descendant checks
- joins cover incoming and outgoing relation views

The graph-database threshold is much later than this roadmap stage.

### Searchable selectors
Parent and relation selectors depend on fast lookup by:

- statement number
- title
- source code

That means the relationship UI depends on basic indexed search, even if full search is roadmap item D.

## Product rules
- parent links are directional
- semantic relations are directional
- inverse display is a read concern, not a second stored edge
- the UI must expose both incoming and outgoing edges clearly

## Risks
- users may confuse `parent` and `detail_van` unless the UI copy is explicit
- a large unfiltered selector becomes unusable quickly
- unlimited relation types will destroy consistency

## Recommendation
Implement B immediately after A using dedicated adjacency tables and explicit validation. Keep the interaction list-based and text-first. A graph visualization can wait until V2 or later, after the domain semantics have stabilized.
