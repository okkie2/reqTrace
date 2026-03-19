import { NextResponse } from "next/server";
import {
  createStatement,
  updateStatement,
} from "@/lib/statement-store";
import {
  SOURCE_RELATIONS,
  STATEMENT_STATUSES,
  STATEMENT_TYPES,
  type SourceRelation,
  type StatementInput,
  type StatementSource,
} from "@/lib/statement-schema";
import { logger } from "@/lib/logger";

type AutosaveErrorCode =
  | "title_required"
  | "invalid_piezo_id"
  | "unsupported_statement_type"
  | "unsupported_statement_status"
  | "unsupported_source_relation"
  | "unknown_statement"
  | "invalid_sources"
  | "invalid_payload"
  | "unknown";

function getOptionalString(value: unknown) {
  if (value == null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error("Invalid payload.");
  }

  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function getSources(value: unknown): StatementSource[] {
  if (value == null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new Error("Invalid sources value.");
  }

  return value.map((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      throw new Error("Invalid source entry.");
    }

    const source = entry as Record<string, unknown>;

    return {
      title: getRequiredString(source.title),
      relation: getSourceRelation(source.relation),
      locator: getOptionalString(source.locator),
      url: getOptionalString(source.url),
    };
  });
}

function getSourceRelation(value: unknown): SourceRelation {
  const relation = getRequiredString(value);

  if (!SOURCE_RELATIONS.includes(relation as SourceRelation)) {
    throw new Error(`Unsupported source relation: ${relation}`);
  }

  return relation as SourceRelation;
}

function getRequiredString(value: unknown) {
  if (typeof value !== "string") {
    throw new Error("Invalid payload.");
  }

  return value.trim();
}

function getStatementType(value: unknown): StatementInput["statementType"] {
  const statementType = getRequiredString(value);

  if (!STATEMENT_TYPES.includes(statementType as StatementInput["statementType"])) {
    throw new Error(`Unsupported statement type: ${statementType}`);
  }

  return statementType as StatementInput["statementType"];
}

function getStatementStatus(value: unknown): StatementInput["status"] {
  const status = getRequiredString(value);

  if (!STATEMENT_STATUSES.includes(status as StatementInput["status"])) {
    throw new Error(`Unsupported statement status: ${status}`);
  }

  return status as StatementInput["status"];
}

function getErrorCode(error: unknown): AutosaveErrorCode {
  if (!(error instanceof Error)) {
    return "unknown";
  }

  switch (error.message) {
    case "Title is required.":
      return "title_required";
    case "Invalid piezo_id value.":
      return "invalid_piezo_id";
    case "Invalid sources value.":
    case "Invalid source entry.":
    case "Source title is required when a source is present.":
      return "invalid_sources";
    case "Invalid payload.":
      return "invalid_payload";
    default:
      if (error.message.startsWith("Unsupported statement type:")) {
        return "unsupported_statement_type";
      }

      if (error.message.startsWith("Unsupported statement status:")) {
        return "unsupported_statement_status";
      }

      if (error.message.startsWith("Unsupported source relation:")) {
        return "unsupported_source_relation";
      }

      if (error.message.startsWith("Unknown statement:")) {
        return "unknown_statement";
      }

      return "unknown";
  }
}

function buildPayload(body: Record<string, unknown>): StatementInput {
  return {
    status: getStatementStatus(body.status),
    statementType: getStatementType(body.statementType),
    title: getRequiredString(body.title),
    piezoId: getOptionalString(body.piezoId),
    textOriginal: getOptionalString(body.textOriginal),
    textNl: getOptionalString(body.textNl),
    note: getOptionalString(body.note),
    sources: getSources(body.sources),
    level: getOptionalString(body.level),
    orderNo: getOptionalString(body.orderNo),
  };
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch (error) {
    logger.userFacingErrorWithException(
      "statement.autosave_invalid_json",
      "Failed to parse autosave request body.",
      error,
    );
    return NextResponse.json(
      { ok: false, errorCode: "invalid_payload", message: "Invalid payload." },
      { status: 400 },
    );
  }

  const id = typeof body.id === "string" ? body.id.trim() : "";
  const lang = body.lang === "nl" ? "nl" : "en";

  try {
    const payload = buildPayload(body);
    const statement = id ? await updateStatement(id, payload) : await createStatement(payload);

    return NextResponse.json({ ok: true, statement });
  } catch (error) {
    const errorCode = getErrorCode(error);

    logger.userFacingErrorWithException(
      "statement.autosave_failed",
      "Failed to autosave statement.",
      error,
      {
        action: id ? "update" : "create",
        statementId: id || null,
        lang,
        errorCode,
        piezoId: body.piezoId ?? null,
      },
    );

    return NextResponse.json(
      {
        ok: false,
        errorCode,
        message: error instanceof Error ? error.message : "Unknown error.",
      },
      { status: 400 },
    );
  }
}
