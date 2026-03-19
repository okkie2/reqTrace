# Modelling Rule: Source Vs Statement

## Rule

A source is not a statement.

In `reqTrace`, a statement is a normative or analytical claim in the model. A source is the provenance of that claim.

This distinction must remain explicit in the model, the schema, the glossary, and the documentation.

## Statement

A statement is something that can be interpreted, derived, implemented, validated, challenged, related, or assessed in the model.

Examples of statements:

- requirement
- interpretation
- implementation statement
- decision
- risk
- question
- evidence expressed as a claim

## Source

A source is the artefact from which a statement comes.

Examples of sources:

- law
- EU requirement document
- PvE spreadsheet
- policy memo
- interview notes
- website
- PDF
- CSV

## Why The Distinction Matters

- the same source can produce multiple statements
- one source can produce competing interpretations
- one statement can have multiple sources
- provenance and programme lineage are different things
- `piezo_id` is not source metadata and must remain separate

Because of this:

- source must not be a `statement_type`
- provenance and statement semantics must not be collapsed into one concept

## Current MVP Semantics

The current MVP uses structured provenance metadata.

Current semantics are:

- `statement`: first-class claim record
- `sources[]`: provenance metadata
- `piezo_id`: separate first-class field for programme lineage / external governance identity

The conceptual distinction stays the same:

- `sources[]` is provenance
- `piezo_id` is programme lineage
- neither of these is a `statement_type`

For the current MVP, `sources[].relation` is intentionally limited to:

- `copied_from_eu_requirement`
- `copied_from_national_requirement`
- `derived_from_law`

## Examples

### Example A

A requirement interpreted from an EU law:

- statement 1: requirement derived from EU law article
- statement 2: interpretation of what that requirement means in Dutch context
- source: EU law document

The law is the source. The requirement and the interpretation are statements.

### Example B

A PvE requirement copied from a spreadsheet and linked to a `piezo_id`:

- statement: requirement
- source: PvE spreadsheet
- `piezo_id`: external programme requirement reference

The spreadsheet is provenance. The `piezo_id` is governance lineage. They are not the same thing.

### Example C

Two different interpretation statements derived from the same source:

- statement 1: conservative interpretation
- statement 2: broader interpretation
- source: same policy memo

One source can produce multiple statements, including competing interpretations.

### Example D

A statement with sources but without a `piezo_id`:

- statement: local implementation statement
- source: interview notes and internal design note
- `piezo_id`: absent

This is valid. Provenance can exist without programme lineage.

## Rule Of Thumb

- If it can be true or false in the model, it is a statement.
- If it is where the content came from, it is a source.
