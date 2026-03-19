# PostgreSQL vs Neo4j for reqTrace

## Recommendation
For the current `reqTrace` roadmap, choose `PostgreSQL` as the primary store.

Do not start with `Neo4j` for MVP.

That recommendation is specific to the current scope:

- statement CRUD
- parent selection
- relation selection
- incoming and outgoing link views
- filters
- search
- validation overviews

If the product later becomes dominated by multi-hop graph exploration, path analysis, and graph-first navigation, re-evaluate then.

## What a graph stack implies
Choosing `Neo4j` means more than swapping databases.

It usually implies:

- storing statements as graph nodes
- storing parents and semantic links as directed edges
- writing traversal-heavy queries in `Cypher`
- operating a graph database as a core dependency
- designing the product around graph semantics early

That can be the right move for graph-native products. The question is whether `reqTrace` is graph-native in MVP or just graph-shaped in parts.

## Current roadmap fit
### Roadmap A: Statement manager
This is mostly:

- create
- edit
- clone
- archive / deprecate
- validate required fields

This is classic relational CRUD.

### Roadmap B: Relationship management
This adds:

- select parents
- add semantic relationships
- view incoming links
- view outgoing links
- prevent invalid structures

This is still a very manageable relational problem with adjacency tables.

### Roadmap C, D, E
The next planned work is also relationally friendly:

- filtered views
- search
- validation lists

None of these force an early graph decision.

## How each model would look
### PostgreSQL model
Use tables such as:

- `statements`
- `statement_parents`
- `statement_relations`
- `sources`

In this model:

- a statement is a row
- a parent link is a row in `statement_parents`
- a semantic relation is a row in `statement_relations`

### Neo4j model
Use graph elements such as:

- `(:Statement)` nodes
- `(:Statement)-[:PARENT_OF]->(:Statement)` or equivalent
- `(:Statement)-[:DETAIL_VAN]->(:Statement)` and similar relation edges

In this model:

- statements are nodes
- links are edges with meaning encoded in edge labels or properties

## Strengths of PostgreSQL here
### 1. Better fit for the dominant workload
The dominant MVP workload is forms, lists, editing, validation, and filtered views.

That maps naturally to relational storage and transactional CRUD.

### 2. Simpler constraints
You need strong rules for:

- required fields
- allowed status values
- duplicate prevention
- foreign-key integrity

PostgreSQL is strong and predictable here.

### 3. Easier onboarding
Most engineers already understand:

- SQL
- migrations
- relational schema design
- common hosting setups

That lowers delivery risk.

### 4. Search is already nearby
You already need search by:

- title
- source code
- text
- notes

PostgreSQL can cover this in MVP without introducing a second search system.

### 5. Graph-like queries are still possible
You are not blocked from handling graph-shaped needs.

PostgreSQL supports:

- join-table edges
- recursive CTEs
- ancestor / descendant traversal
- cycle checks

That is enough for the planned roadmap.

## Strengths of Neo4j here
### 1. More natural multi-hop traversal
If the core user task becomes:

- “show me all downstream impacts within 4 hops”
- “find all paths from source requirement to implementation consequence”
- “explore the network interactively”

then Neo4j becomes much more compelling.

### 2. Graph thinking matches the domain language
This repository explicitly describes a statement network. Neo4j maps nicely to that concept and can make some traversal queries more direct to express.

### 3. Easier future graph-first UI features
If V2 or V3 shifts toward:

- relation browser
- network exploration
- path-based impact analysis
- graph analytics

Neo4j can be a better long-term fit.

## Costs of starting with Neo4j now
### 1. Extra infrastructure and team complexity
You add:

- another database technology
- graph-specific query language
- graph-specific modeling decisions
- new operational concerns

That is a real cost for a small MVP.

### 2. Worse fit for the boring but essential work
Most first-release effort will go into:

- forms
- validation
- list views
- lifecycle actions
- imports

Neo4j does not meaningfully simplify that part.

### 3. Risk of over-optimizing for future traversal
The roadmap mentions a better relation browser only in V2.

That suggests graph-heavy exploration is a later concern, not the first release’s center of gravity.

### 4. More design pressure too early
A graph stack encourages early decisions about:

- edge semantics
- traversal semantics
- graph query patterns

But your own model notes say the main risk is too much complexity. That argues for restraint.

## Practical examples
### Example: create and edit statement
PostgreSQL is the obvious fit.

You save one row, validate columns, and update it over time.

Neo4j can also do this, but it provides no clear advantage.

### Example: assign parents
PostgreSQL:

- add rows to `statement_parents`
- use recursive query for cycle detection

Neo4j:

- create parent edge
- use traversal query to detect loops

Both can do it. PostgreSQL is simpler in the overall app context.

### Example: incoming and outgoing relations
PostgreSQL:

- query `statement_relations` by source or target

Neo4j:

- match incoming or outgoing edges

Again, both work. This is not yet a graph-only problem.

### Example: deep impact analysis over many hops
PostgreSQL:

- possible, but gets less pleasant as traversal complexity grows

Neo4j:

- often clearer and more expressive

This is the strongest argument for Neo4j, but it is not yet the MVP workload.

## Decision criteria
Choose `PostgreSQL` now if:

- the product is still defining semantics
- most work is CRUD and validation
- direct relation views are enough
- the team wants lower implementation risk
- search and filtered working views matter more than graph exploration

Choose `Neo4j` now only if:

- graph traversal is the central user experience from day one
- multi-hop path questions are core to daily work
- you already have team comfort with graph tech
- you are willing to accept more infrastructure and modeling complexity early

## Recommended path
### Phase 1
Build on `PostgreSQL` with an explicitly graph-friendly relational schema:

- `statements`
- `statement_parents`
- `statement_relations`

Keep edge semantics clear and directional.

### Phase 2 trigger
Reconsider `Neo4j` only when you can point to real product pressure such as:

- users repeatedly need multi-hop impact views
- recursive SQL becomes hard to maintain
- a graph-first relation browser becomes a primary screen
- path analysis becomes more important than record editing

## Final advice
Your colleague is not wrong that the domain looks graph-like.

The mistake would be assuming that “graph-like domain” automatically means “graph database first”.

For `reqTrace` as currently scoped, the safer and stronger engineering decision is:

- relational core first
- explicit edge tables
- revisit graph infrastructure only when graph exploration becomes the real product center
