# Statement Network Model - Summary

This document summarizes the model so you can pick it up again immediately.

---

## 1. Core Idea

The system is a **network of traceable statements**.

Everything is a statement:
- requirement
- interpretation
- elaboration
- decision
- evidence
- question
- risk

There are no separate object types such as "requirement section" or "rubric".
The difference is expressed through **statement_type**.

---

## 2. Structure

### Statement

Minimal structure:

```yaml
id: "000123"
source_code: "FR-eu02.01.1.a"

statement_type: requirement
level: 2
order: 10

title: "Patient identification based on demographic data"

text_original: >
  ...

text_nl: >
  ...

parents:
  - "000045"

relations: []
```

---

## 3. Main Principles

### 3.1 Everything is a statement

- No special attributes for interpretations or decisions
- Everything with meaning gets its own node

### 3.2 Separate different kinds of information

- requirement = what must be true
- interpretation = what it means
- elaboration = what we do
- decision = which choice we make

### 3.3 Hierarchy is not structure

- `parents` = hierarchical placement
- `relations` = meaningful semantic connections

Hierarchy is only one perspective on the network.

### 3.4 Level is supportive

- `level` helps with filtering and views
- but it does not define the real structure

---

## 4. Statement Types (v1)

- requirement
- interpretation
- elaboration
- decision
- evidence
- question
- risk

---

## 5. Relations, keep them limited

- verplicht_wegens
- vertaling_van
- detail_van
- uitgewerkt_in

Rule:
- maximum 4-6 relation types
- semantically sharp definitions

---

## 6. Attributes (v1)

### Identity
- id, internal and stable
- source_code, external

### Content
- title
- text_original
- text_nl
- note, optional

### Structure
- level
- order
- parents
- relations

### Context
- source
- moscow
- relevance
- increment

---

## 7. What is intentionally not in v1

- no separate "rubric" entity
- no interpretation as a field
- no work package as a type
- no project management board

---

## 8. Ubiquitous Language

The glossary is stored in YAML by category:

- modelkern.yaml
- statement-types.yaml
- traceability.yaml
- attributen.yaml
- domein.yaml
- governance.yaml

Rules:
- each term appears once
- YAML is the source of truth

---

## 9. Workflow, practical

### Step 1 - Add the source
- register source plus source codes

### Step 2 - Capture the requirement
- set `statement_type = requirement`

### Step 3 - Add the interpretation
- separate statement
- relation back to the requirement

### Step 4 - Add the elaboration
- separate statement

### Step 5 - Capture decisions
- explicitly as statements

---

## 10. Main Risk

The model becomes too complex.

Mitigation:
- few types
- few relations
- strict definitions
- tooling, validation and linting

---

## 11. Mental shortcut

When in doubt:

"Is this a statement?"

Yes -> make it a statement
No -> it is not part of this model

---

## 12. Where to continue tomorrow

1. One concrete source, for example `FR-eu02.01.1.a`
2. Model:
   - requirement
   - interpretation(s)
   - elaboration(s)
3. Check:
   - is the type correct?
   - is the relation correct?
   - is something missing?

That is where the real gaps in the model become visible.
