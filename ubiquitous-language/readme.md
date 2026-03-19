# Ubiquitous Language (DDD)

This folder contains the Ubiquitous Language for the NCPeH domain.

The terms form the shared language for:
- requirements
- interpretations
- decision-making
- documentation

YAML is the source of truth. Other representations, such as Markdown or Hugo, are derived from it.

---

## Structure

Files:

- model-core.yaml  
  Core concepts of the model, such as statement, id, and level

- statement-types.yaml  
  Allowed kinds of statements, such as requirement, interpretation, and elaboration

- traceability.yaml  
  Relations and structure, such as parent, relation, and traceability

- attributes.yaml  
  Statement properties, such as title, text_origineel, moscow, and relevance

- domain.yaml  
  Terms from the eHealth / NCPeH domain, such as NCPeH, Patient Summary, and ISM

- governance.yaml  
  Terms around responsibility, decision-making, and stewardship, such as owner and DoD

---

## Rules

- Every term appears exactly once, single source of truth
- Every term belongs to exactly one category
- YAML leads; other representations are derived
- Add new terms only if they:
  - are needed for decision-making, or
  - demonstrably prevent confusion

---

## Guidelines Per Category

- model-core  
  Only concepts needed to understand the model itself

- statement-types  
  Only statement types, not attributes or domain terms

- traceability  
  Only relations and structure, not business meaning

- attributes  
  Only fields that belong on a statement

- domain  
  Only substantive eHealth / NCPeH domain terms

- governance  
  Only terms around responsibility, ownership, and process

---

## Usage

- Use these terms consistently in:
  - requirements
  - documentation
  - communication

- Avoid synonyms marked as forbidden in the glossary

- Unsure about a term?
  Add it to the glossary first before using it.

---

## Evolution

This Ubiquitous Language is living.

Changes:
- happen explicitly
- are discussed within the team
- are immediately applied in the YAML

Goal:
- fewer interpretation differences
- higher traceability
