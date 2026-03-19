import { promises as fs } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { logger } from "@/lib/logger";
import {
  RELATION_TYPES,
  SOURCE_RELATIONS,
  STATEMENT_STATUSES,
  STATEMENT_TYPES,
  type RelationType,
  type Statement,
  type StatementInput,
  type SourceRelation,
  type StatementSource,
  type StatementStatus,
  type StatementType,
  type StatementWarning,
} from "@/lib/statement-schema";

export { RELATION_TYPES, SOURCE_RELATIONS, STATEMENT_STATUSES, STATEMENT_TYPES } from "@/lib/statement-schema";

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

export type StatementSummary = Pick<
  Statement,
  "id" | "statementNo" | "statementType" | "title" | "status" | "piezoId"
> & {
  sourceTitles: string[];
};

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
  warnings: StatementWarning[];
};

const DATA_PATH = path.join(process.cwd(), "data", "statements.json");

export const EMPTY_STATEMENT_INPUT: StatementInput = {
  status: "applicable",
  statementType: "requirement",
  title: "",
  piezoId: null,
  textOriginal: null,
  textNl: null,
  note: null,
  sources: [],
  level: null,
  orderNo: null,
};

function normalizeSourceString(value: unknown, fieldName: string): string | null {
  if (value == null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error(`Invalid source ${fieldName} value.`);
  }

  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function normalizeSources(value: unknown): StatementSource[] {
  if (value == null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new Error("Invalid sources value.");
  }

  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      throw new Error("Invalid source entry.");
    }

    const source = entry as Record<string, unknown>;
    const title = normalizeSourceString(source.title, "title");
    const relation = normalizeSourceRelation(source.relation);
    const locator = normalizeSourceString(source.locator, "locator");
    const url = normalizeSourceString(source.url, "url");

    if (!title && !relation && !locator && !url) {
      return [];
    }

    if (!title) {
      throw new Error("Source title is required when a source is present.");
    }

    return [
      {
        title,
        relation: relation ?? "copied_from_eu_requirement",
        locator,
        url,
      },
    ];
  });
}

function normalizeSourceRelation(value: unknown): SourceRelation | null {
  if (value == null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error("Invalid source relation value.");
  }

  const trimmed = value.trim();

  if (trimmed === "") {
    return null;
  }

  if (!SOURCE_RELATIONS.includes(trimmed as SourceRelation)) {
    throw new Error(`Unsupported source relation: ${trimmed}`);
  }

  return trimmed as SourceRelation;
}

function normalizePiezoId(value: unknown): string | null {
  if (value == null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error("Invalid piezo_id value.");
  }

  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function normalizeStatement(statement: Statement): Statement {
  const legacySourceTitle = normalizeSourceString(
    (statement as Statement & { source?: unknown }).source,
    "title",
  );

  return {
    ...statement,
    status: normalizeStatus(statement.status),
    piezoId: normalizePiezoId(statement.piezoId),
    sources:
      "sources" in statement && Array.isArray(statement.sources)
        ? normalizeSources(statement.sources)
        : legacySourceTitle
          ? [
              {
                title: legacySourceTitle,
                relation: "copied_from_eu_requirement",
                locator: null,
                url: null,
              },
            ]
          : [],
  };
}

function normalizeStatus(status: string | null | undefined): StatementStatus {
  switch (status) {
    case "draft":
    case "applicable":
    case "deprecated":
      return status;
    case "active":
      return "applicable";
    case "archived":
      return "deprecated";
    default:
      return "draft";
  }
}

function emptyDb(): StatementDb {
  return {
    statements: [],
    parents: [],
    relations: [],
  };
}

async function readDb(): Promise<StatementDb> {
  let raw: string;

  try {
    raw = await fs.readFile(DATA_PATH, "utf8");
  } catch (error) {
    logger.errorWithException("statement_store.read_failed", "Failed to read statement store.", error, {
      dataPath: DATA_PATH,
    });
    throw error;
  }

  let parsed: StatementDb | Statement[];

  try {
    parsed = JSON.parse(raw) as StatementDb | Statement[];
  } catch (error) {
    logger.errorWithException(
      "statement_store.parse_failed",
      "Failed to parse statement store JSON.",
      error,
      {
        dataPath: DATA_PATH,
      },
    );
    throw error;
  }

  if (Array.isArray(parsed)) {
    return {
      statements: parsed.map(normalizeStatement),
      parents: [],
      relations: [],
    };
  }

  return {
    statements: parsed.statements
      .map(normalizeStatement)
      .sort((left, right) =>
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

  try {
    await fs.writeFile(DATA_PATH, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
  } catch (error) {
    logger.errorWithException(
      "statement_store.write_failed",
      "Failed to write statement store.",
      error,
      {
        dataPath: DATA_PATH,
        statementCount: normalized.statements.length,
        parentCount: normalized.parents.length,
        relationCount: normalized.relations.length,
      },
    );
    throw error;
  }
}

function assertValidInput(input: StatementInput) {
  if (!STATEMENT_TYPES.includes(input.statementType)) {
    throw new Error(`Unsupported statement type: ${input.statementType}`);
  }

  if (!STATEMENT_STATUSES.includes(input.status)) {
    throw new Error(`Unsupported statement status: ${input.status}`);
  }

  if (input.title.trim() === "") {
    throw new Error("Title is required.");
  }

  normalizePiezoId(input.piezoId);
  normalizeSources(input.sources);
}

function normalizeInput(input: StatementInput): StatementInput {
  return {
    ...input,
    piezoId: normalizePiezoId(input.piezoId),
    sources: normalizeSources(input.sources),
  };
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
  ].filter((link) => link.status !== "applicable");

  return inactiveLinks.map((link) => ({
    statementNo: link.statementNo,
    status: link.status,
  }));
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
    piezoId: statement.piezoId,
    sourceTitles: statement.sources.map((source) => source.title),
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
  const normalizedInput = normalizeInput(input);
  const db = await readDb();
  const now = new Date().toISOString();

  const statement: Statement = {
    id: randomUUID(),
    statementNo: nextStatementNo(db.statements),
    clonedFromStatementId: null,
    createdAt: now,
    updatedAt: now,
    ...normalizedInput,
  };

  db.statements.push(statement);
  await writeDb(db);
  return statement;
}

export async function updateStatement(id: string, input: StatementInput) {
  assertValidInput(input);
  const normalizedInput = normalizeInput(input);
  const db = await readDb();
  const index = db.statements.findIndex((statement) => statement.id === id);

  if (index === -1) {
    throw new Error(`Unknown statement: ${id}`);
  }

  const current = db.statements[index];
  const updated: Statement = {
    ...current,
    ...normalizedInput,
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
    status: "draft",
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

export async function deleteStatement(id: string) {
  const db = await readDb();

  getStatementOrThrow(db.statements, id);

  db.statements = db.statements.filter((statement) => statement.id !== id);
  db.parents = db.parents.filter(
    (edge) => edge.statementId !== id && edge.parentStatementId !== id,
  );
  db.relations = db.relations.filter(
    (relation) => relation.sourceStatementId !== id && relation.targetStatementId !== id,
  );

  await writeDb(db);
}

export async function ensureDataFile() {
  try {
    await fs.access(DATA_PATH);
  } catch {
    await writeDb(emptyDb());
  }
}
