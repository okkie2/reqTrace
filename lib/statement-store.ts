import { promises as fs } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";

export const STATEMENT_TYPES = [
  "requirement",
  "interpretation",
  "decision",
  "evidence",
  "question",
  "risk",
] as const;

export const STATEMENT_STATUSES = ["active", "deprecated", "archived"] as const;
export const RELATION_TYPES = [
  "verplicht_wegens",
  "vertaling_van",
  "detail_van",
  "uitwerking_van",
] as const;

export type StatementType = (typeof STATEMENT_TYPES)[number];
export type StatementStatus = (typeof STATEMENT_STATUSES)[number];
export type RelationType = (typeof RELATION_TYPES)[number];

export type Statement = {
  id: string;
  statementNo: string;
  statementType: StatementType;
  title: string;
  textOriginal: string | null;
  textNl: string | null;
  note: string | null;
  sourceCode: string | null;
  source: string | null;
  level: string | null;
  orderNo: string | null;
  moscow: string | null;
  increment: string | null;
  status: StatementStatus;
  clonedFromStatementId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StatementParent = {
  statementId: string;
  parentStatementId: string;
  createdAt: string;
};

export type StatementRelation = {
  id: string;
  sourceStatementId: string;
  relationType: RelationType;
  targetStatementId: string;
  createdAt: string;
};

type StatementDb = {
  statements: Statement[];
  parents: StatementParent[];
  relations: StatementRelation[];
};

export type StatementInput = Omit<
  Statement,
  "id" | "statementNo" | "status" | "clonedFromStatementId" | "createdAt" | "updatedAt"
>;

export type StatementSummary = Pick<
  Statement,
  "id" | "statementNo" | "statementType" | "title" | "status" | "sourceCode"
>;

export type StatementLinkView = {
  statementId: string;
  statementNo: string;
  title: string;
  statementType: StatementType;
  status: StatementStatus;
};

export type ParentLinkView = StatementLinkView & {
  createdAt: string;
};

export type RelationLinkView = StatementLinkView & {
  relationId: string;
  relationType: RelationType;
  createdAt: string;
};

export type StatementDetail = {
  statement: Statement;
  parents: ParentLinkView[];
  incomingParents: ParentLinkView[];
  outgoingRelations: RelationLinkView[];
  incomingRelations: RelationLinkView[];
  warnings: string[];
};

const DATA_PATH = path.join(process.cwd(), "data", "statements.json");

export const EMPTY_STATEMENT_INPUT: StatementInput = {
  statementType: "requirement",
  title: "",
  textOriginal: null,
  textNl: null,
  note: null,
  sourceCode: null,
  source: null,
  level: null,
  orderNo: null,
  moscow: null,
  increment: null,
};

function emptyDb(): StatementDb {
  return {
    statements: [],
    parents: [],
    relations: [],
  };
}

async function readDb(): Promise<StatementDb> {
  const raw = await fs.readFile(DATA_PATH, "utf8");
  const parsed = JSON.parse(raw) as StatementDb | Statement[];

  if (Array.isArray(parsed)) {
    return {
      statements: parsed,
      parents: [],
      relations: [],
    };
  }

  return {
    statements: [...parsed.statements].sort((left, right) =>
      left.statementNo.localeCompare(right.statementNo),
    ),
    parents: parsed.parents ?? [],
    relations: parsed.relations ?? [],
  };
}

async function writeDb(db: StatementDb) {
  const normalized: StatementDb = {
    statements: [...db.statements].sort((left, right) =>
      left.statementNo.localeCompare(right.statementNo),
    ),
    parents: db.parents,
    relations: db.relations,
  };

  await fs.writeFile(DATA_PATH, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
}

function assertValidInput(input: StatementInput) {
  if (!STATEMENT_TYPES.includes(input.statementType)) {
    throw new Error(`Unsupported statement type: ${input.statementType}`);
  }

  if (input.title.trim() === "") {
    throw new Error("Title is required.");
  }

  const hasText = Boolean(input.textOriginal?.trim() || input.textNl?.trim());
  if (!hasText) {
    throw new Error("At least one text field is required.");
  }
}

function nextStatementNo(statements: Statement[]) {
  const max = statements.reduce((current, statement) => {
    return Math.max(current, Number.parseInt(statement.statementNo, 10));
  }, 0);

  return String(max + 1).padStart(6, "0");
}

function getStatementOrThrow(statements: Statement[], id: string) {
  const statement = statements.find((candidate) => candidate.id === id);

  if (!statement) {
    throw new Error(`Unknown statement: ${id}`);
  }

  return statement;
}

function buildLinkView(statement: Statement): StatementLinkView {
  return {
    statementId: statement.id,
    statementNo: statement.statementNo,
    title: statement.title,
    statementType: statement.statementType,
    status: statement.status,
  };
}

function buildWarnings(
  parents: ParentLinkView[],
  incomingParents: ParentLinkView[],
  outgoingRelations: RelationLinkView[],
  incomingRelations: RelationLinkView[],
) {
  const inactiveLinks = [
    ...parents,
    ...incomingParents,
    ...outgoingRelations,
    ...incomingRelations,
  ].filter((link) => link.status !== "active");

  return inactiveLinks.map((link) => {
    return `${link.statementNo} is ${link.status} but still linked.`;
  });
}

function hasPathToRoot(
  db: StatementDb,
  startStatementId: string,
  targetStatementId: string,
  visited = new Set<string>(),
): boolean {
  if (startStatementId === targetStatementId) {
    return true;
  }

  if (visited.has(startStatementId)) {
    return false;
  }

  visited.add(startStatementId);

  const directParents = db.parents
    .filter((edge) => edge.statementId === startStatementId)
    .map((edge) => edge.parentStatementId);

  return directParents.some((parentId) =>
    hasPathToRoot(db, parentId, targetStatementId, visited),
  );
}

export async function listStatements(): Promise<Statement[]> {
  const db = await readDb();
  return db.statements;
}

export async function listStatementSummaries(): Promise<StatementSummary[]> {
  const statements = await listStatements();
  return statements.map((statement) => ({
    id: statement.id,
    statementNo: statement.statementNo,
    statementType: statement.statementType,
    title: statement.title,
    status: statement.status,
    sourceCode: statement.sourceCode,
  }));
}

export async function getStatement(id: string) {
  const db = await readDb();
  return db.statements.find((statement) => statement.id === id) ?? null;
}

export async function getStatementDetail(id: string): Promise<StatementDetail | null> {
  const db = await readDb();
  const statement = db.statements.find((candidate) => candidate.id === id);

  if (!statement) {
    return null;
  }

  const parents = db.parents
    .filter((edge) => edge.statementId === id)
    .map((edge) => {
      const parent = getStatementOrThrow(db.statements, edge.parentStatementId);
      return {
        ...buildLinkView(parent),
        createdAt: edge.createdAt,
      };
    });

  const incomingParents = db.parents
    .filter((edge) => edge.parentStatementId === id)
    .map((edge) => {
      const child = getStatementOrThrow(db.statements, edge.statementId);
      return {
        ...buildLinkView(child),
        createdAt: edge.createdAt,
      };
    });

  const outgoingRelations = db.relations
    .filter((relation) => relation.sourceStatementId === id)
    .map((relation) => {
      const target = getStatementOrThrow(db.statements, relation.targetStatementId);
      return {
        ...buildLinkView(target),
        relationId: relation.id,
        relationType: relation.relationType,
        createdAt: relation.createdAt,
      };
    });

  const incomingRelations = db.relations
    .filter((relation) => relation.targetStatementId === id)
    .map((relation) => {
      const source = getStatementOrThrow(db.statements, relation.sourceStatementId);
      return {
        ...buildLinkView(source),
        relationId: relation.id,
        relationType: relation.relationType,
        createdAt: relation.createdAt,
      };
    });

  return {
    statement,
    parents,
    incomingParents,
    outgoingRelations,
    incomingRelations,
    warnings: buildWarnings(parents, incomingParents, outgoingRelations, incomingRelations),
  };
}

export async function createStatement(input: StatementInput) {
  assertValidInput(input);
  const db = await readDb();
  const now = new Date().toISOString();

  const statement: Statement = {
    id: randomUUID(),
    statementNo: nextStatementNo(db.statements),
    status: "active",
    clonedFromStatementId: null,
    createdAt: now,
    updatedAt: now,
    ...input,
  };

  db.statements.push(statement);
  await writeDb(db);
  return statement;
}

export async function updateStatement(id: string, input: StatementInput) {
  assertValidInput(input);
  const db = await readDb();
  const index = db.statements.findIndex((statement) => statement.id === id);

  if (index === -1) {
    throw new Error(`Unknown statement: ${id}`);
  }

  const current = db.statements[index];
  const updated: Statement = {
    ...current,
    ...input,
    updatedAt: new Date().toISOString(),
  };

  db.statements[index] = updated;
  await writeDb(db);
  return updated;
}

export async function cloneStatement(id: string) {
  const db = await readDb();
  const source = getStatementOrThrow(db.statements, id);
  const now = new Date().toISOString();
  const clone: Statement = {
    ...source,
    id: randomUUID(),
    statementNo: nextStatementNo(db.statements),
    title: `${source.title} (copy)`,
    status: "active",
    clonedFromStatementId: source.id,
    createdAt: now,
    updatedAt: now,
  };

  db.statements.push(clone);
  await writeDb(db);
  return clone;
}

export async function updateStatementStatus(id: string, status: StatementStatus) {
  const db = await readDb();
  const index = db.statements.findIndex((statement) => statement.id === id);

  if (index === -1) {
    throw new Error(`Unknown statement: ${id}`);
  }

  const updated: Statement = {
    ...db.statements[index],
    status,
    updatedAt: new Date().toISOString(),
  };

  db.statements[index] = updated;
  await writeDb(db);
  return updated;
}

export async function addParent(statementId: string, parentStatementId: string) {
  const db = await readDb();

  getStatementOrThrow(db.statements, statementId);
  getStatementOrThrow(db.statements, parentStatementId);

  if (statementId === parentStatementId) {
    throw new Error("A statement cannot be its own parent.");
  }

  if (
    db.parents.some(
      (edge) =>
        edge.statementId === statementId &&
        edge.parentStatementId === parentStatementId,
    )
  ) {
    throw new Error("Duplicate parent link.");
  }

  if (hasPathToRoot(db, parentStatementId, statementId)) {
    throw new Error("Parent link would create a cycle.");
  }

  db.parents.push({
    statementId,
    parentStatementId,
    createdAt: new Date().toISOString(),
  });

  await writeDb(db);
}

export async function removeParent(statementId: string, parentStatementId: string) {
  const db = await readDb();
  db.parents = db.parents.filter(
    (edge) =>
      !(
        edge.statementId === statementId &&
        edge.parentStatementId === parentStatementId
      ),
  );

  await writeDb(db);
}

export async function addRelation(
  sourceStatementId: string,
  targetStatementId: string,
  relationType: RelationType,
) {
  const db = await readDb();

  getStatementOrThrow(db.statements, sourceStatementId);
  getStatementOrThrow(db.statements, targetStatementId);

  if (!RELATION_TYPES.includes(relationType)) {
    throw new Error(`Unsupported relation type: ${relationType}`);
  }

  if (sourceStatementId === targetStatementId) {
    throw new Error("A statement cannot relate to itself.");
  }

  if (
    db.relations.some(
      (relation) =>
        relation.sourceStatementId === sourceStatementId &&
        relation.targetStatementId === targetStatementId &&
        relation.relationType === relationType,
    )
  ) {
    throw new Error("Duplicate relation.");
  }

  db.relations.push({
    id: randomUUID(),
    sourceStatementId,
    targetStatementId,
    relationType,
    createdAt: new Date().toISOString(),
  });

  await writeDb(db);
}

export async function removeRelation(relationId: string) {
  const db = await readDb();
  db.relations = db.relations.filter((relation) => relation.id !== relationId);
  await writeDb(db);
}

export async function ensureDataFile() {
  try {
    await fs.access(DATA_PATH);
  } catch {
    await writeDb(emptyDb());
  }
}
