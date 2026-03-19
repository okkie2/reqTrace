# Roadmap

## MVP Scope

### A. Statement manager

Status: done

* create
* edit
* clone
* archive / deprecate

### B. Relationship management

Status: done

* select parents
* select relationships
* view incoming relationships
* view outgoing relationships

### C. Slices / working views

At minimum, the following views:

* by source
* by statement_type
* by use case
* by relevant party (for example CIBG, VZVZ)
* by level
* by increment / plateau (if populated)

### D. Search

Search on:

* title
* source code
* text
* notes

### E. Validation overviews

* missing parents
* invalid relationships
* empty required fields
* orphan statements

---

## Not in MVP

* public stakeholder portal
* dashboards
* advanced graph editor
* document generator (high fidelity)
* review / approval workflow
* roles and permissions model

---

## Product Positioning

MVP is:

**Statement Manager + Working Views**

Not:

* just an editor
* a full requirements portal

---

## Scope Decision Rule

Only add features if they contribute to:

* capturing statements
* understanding statements
* connecting statements

If not: defer

---

## Phasing

### MVP

* create / edit
* manage relationships
* filterable views
* validation

### V2

* Git integration (branch, commit, diff)
* comparison (diff between statements / versions)
* relation browser (better navigation)

### V3

* publication (Hugo)
* stakeholder views
* thematic exports

---

## MVP User Stories (GitHub issues)

### Epic 1: Statement manager

**US-01 - Create statement**  
As a user, I want to create a new statement so that I can capture new requirements.

**US-02 - Edit statement**  
As a user, I want to edit an existing statement so that I can correct or enrich information.

**US-03 - Clone statement**  
As a user, I want to duplicate a statement so that I can quickly create variants.

**US-04 - Archive / deprecate statement**  
As a user, I want to archive a statement so that outdated information remains visible but no longer active.

---

### Epic 2: Relationship management

**US-05 - Select parent**  
As a user, I want to choose one or more parents so that I can capture hierarchy.

**US-06 - Add relationship**  
As a user, I want to create relationships between statements so that traceability emerges.

**US-07 - View relationships**  
As a user, I want to see incoming and outgoing relationships so that I understand dependencies.

---

### Epic 3: Slices / working views

**US-08 - Filter by source**  
As a user, I want to filter statements by source so that I can analyze per document.

**US-09 - Filter by statement_type**  
As a user, I want to filter statements by type so that, for example, I can see only requirements.

**US-10 - Filter by use case**  
As a user, I want to filter statements by use case so that I can work per EU use case.

**US-11 - Filter by relevant party**  
As a user, I want to filter statements by party so that I can see stakeholder impact.

**US-12 - Filter by level**  
As a user, I want to filter statements by level so that I can distinguish detail levels.

**US-13 - Filter by increment / plateau**  
As a user, I want to filter statements by increment so that I can keep track of planning.

---

### Epic 4: Search

**US-14 - Full-text search**  
As a user, I want to search by text so that I can quickly find relevant statements.

**US-15 - Search by source code**  
As a user, I want to search by source code so that I can quickly find specific requirements.

---

### Epic 5: Validation

**US-16 - Missing parent validation**  
As a user, I want to see which statements have no parent so that the structure remains complete.

**US-17 - Relationship validation**  
As a user, I want to see invalid relationships so that the model remains consistent.

**US-18 - Required field validation**  
As a user, I want to see missing fields so that the data is complete.

**US-19 - Orphan detection**  
As a user, I want to see orphan statements so that nothing hangs loose in the network.

---

## V2 User Stories

**US-20 - Git commit from UI**  
As a user, I want to commit changes so that I retain version control.

**US-21 - View diff**  
As a user, I want to see differences so that I understand changes.

**US-22 - Relation browser**  
As a user, I want to navigate through relationships so that I can explore the network more effectively.

---

## V3 User Stories

**US-23 - Publish to Hugo**  
As a user, I want to publish statements so that stakeholders can read them.

**US-24 - Stakeholder views**  
As a user, I want views per audience so that information is presented in a relevant way.
