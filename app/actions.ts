"use server";

import { redirect } from "next/navigation";
import {
  addParent,
  addRelation,
  cloneStatement,
  createStatement,
  deleteStatement,
  removeParent,
  removeRelation,
  updateStatement,
} from "@/lib/statement-store";
import {
  RELATION_TYPES,
  STATEMENT_STATUSES,
  STATEMENT_TYPES,
  type RelationType,
  type StatementInput,
} from "@/lib/statement-schema";
import { logger } from "@/lib/logger";

function getString(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function getNullableString(formData: FormData, key: string): string | null {
  const value = getString(formData, key);
  return value === "" ? null : value;
}

function getLang(formData: FormData): "en" | "nl" {
  return getString(formData, "lang") === "nl" ? "nl" : "en";
}

function buildRedirect(statementId: string, lang: "en" | "nl") {
  return `/?statement=${statementId}&lang=${lang}`;
}

type FormErrorCode =
  | "title_required"
  | "invalid_piezo_id"
  | "unsupported_statement_type"
  | "unsupported_statement_status"
  | "unknown_statement"
  | "unknown";

function buildFormRedirect({
  lang,
  statementId,
  mode,
  error,
}: {
  lang: "en" | "nl";
  statementId?: string;
  mode?: "new";
  error?: FormErrorCode;
}) {
  const query = new URLSearchParams();

  if (statementId) {
    query.set("statement", statementId);
  }

  if (mode) {
    query.set("mode", mode);
  }

  if (error) {
    query.set("error", error);
  }

  query.set("lang", lang);
  return `/?${query.toString()}`;
}

function getFormErrorCode(error: unknown): FormErrorCode {
  if (!(error instanceof Error)) {
    return "unknown";
  }

  switch (error.message) {
    case "Title is required.":
      return "title_required";
    case "Invalid piezo_id value.":
      return "invalid_piezo_id";
    default:
      if (error.message.startsWith("Unsupported statement type:")) {
        return "unsupported_statement_type";
      }

      if (error.message.startsWith("Unsupported statement status:")) {
        return "unsupported_statement_status";
      }

      if (error.message.startsWith("Unknown statement:")) {
        return "unknown_statement";
      }

      return "unknown";
  }
}

function getStatementType(formData: FormData): StatementInput["statementType"] {
  const value = getString(formData, "statementType");

  if (!STATEMENT_TYPES.includes(value as StatementInput["statementType"])) {
    throw new Error(`Unsupported statement type: ${value}`);
  }

  return value as StatementInput["statementType"];
}

function getStatementStatus(formData: FormData): StatementInput["status"] {
  const value = getString(formData, "status");

  if (!STATEMENT_STATUSES.includes(value as StatementInput["status"])) {
    throw new Error(`Unsupported statement status: ${value}`);
  }

  return value as StatementInput["status"];
}

function getRelationType(formData: FormData): RelationType {
  const value = getString(formData, "relationType");

  if (!RELATION_TYPES.includes(value as RelationType)) {
    throw new Error(`Unsupported relation type: ${value}`);
  }

  return value as RelationType;
}

export async function saveStatementAction(formData: FormData) {
  const id = getString(formData, "id");
  const lang = getLang(formData);
  const payload: StatementInput = {
    status: getStatementStatus(formData),
    statementType: getStatementType(formData),
    title: getString(formData, "title"),
    piezoId: getNullableString(formData, "piezoId"),
    textOriginal: getNullableString(formData, "textOriginal"),
    textNl: getNullableString(formData, "textNl"),
    note: getNullableString(formData, "note"),
    sources: [],
    level: getNullableString(formData, "level"),
    orderNo: getNullableString(formData, "orderNo"),
  };

  try {
    const saved = id
      ? await updateStatement(id, payload)
      : await createStatement(payload);

    redirect(buildRedirect(saved.id, lang));
  } catch (error) {
    const errorCode = getFormErrorCode(error);

    logger.userFacingErrorWithException("statement.save_failed", "Failed to save statement.", error, {
      action: id ? "update" : "create",
      statementId: id || null,
      lang,
      errorCode,
      piezoId: payload.piezoId,
    });

    redirect(
      buildFormRedirect({
        lang,
        statementId: id || undefined,
        mode: id ? undefined : "new",
        error: errorCode,
      }),
    );
  }
}

export async function cloneStatementAction(formData: FormData) {
  const sourceId = getString(formData, "sourceId");
  const lang = getLang(formData);
  let cloned;

  try {
    cloned = await cloneStatement(sourceId);
  } catch (error) {
    logger.userFacingErrorWithException("statement.clone_failed", "Failed to clone statement.", error, {
      sourceId,
      lang,
    });
    throw error;
  }

  redirect(buildRedirect(cloned.id, lang));
}

export async function deleteStatementAction(formData: FormData) {
  const statementId = getString(formData, "statementId");
  const lang = getLang(formData);

  try {
    await deleteStatement(statementId);
  } catch (error) {
    logger.userFacingErrorWithException(
      "statement.delete_failed",
      "Failed to delete statement.",
      error,
      {
        statementId,
        lang,
      },
    );
    throw error;
  }

  redirect(`/?lang=${lang}`);
}

export async function addParentAction(formData: FormData) {
  const statementId = getString(formData, "statementId");
  const parentStatementId = getString(formData, "parentStatementId");
  const lang = getLang(formData);

  try {
    await addParent(statementId, parentStatementId);
  } catch (error) {
    logger.userFacingErrorWithException("statement.parent_add_failed", "Failed to add parent link.", error, {
      statementId,
      parentStatementId,
      lang,
    });
    throw error;
  }

  redirect(buildRedirect(statementId, lang));
}

export async function removeParentAction(formData: FormData) {
  const statementId = getString(formData, "statementId");
  const parentStatementId = getString(formData, "parentStatementId");
  const lang = getLang(formData);

  try {
    await removeParent(statementId, parentStatementId);
  } catch (error) {
    logger.userFacingErrorWithException(
      "statement.parent_remove_failed",
      "Failed to remove parent link.",
      error,
      {
        statementId,
        parentStatementId,
        lang,
      },
    );
    throw error;
  }

  redirect(buildRedirect(statementId, lang));
}

export async function addRelationAction(formData: FormData) {
  const sourceStatementId = getString(formData, "sourceStatementId");
  const targetStatementId = getString(formData, "targetStatementId");
  const relationType = getRelationType(formData);
  const lang = getLang(formData);

  try {
    await addRelation(sourceStatementId, targetStatementId, relationType);
  } catch (error) {
    logger.userFacingErrorWithException(
      "statement.relation_add_failed",
      "Failed to add relation.",
      error,
      {
        sourceStatementId,
        targetStatementId,
        relationType,
        lang,
      },
    );
    throw error;
  }

  redirect(buildRedirect(sourceStatementId, lang));
}

export async function removeRelationAction(formData: FormData) {
  const sourceStatementId = getString(formData, "sourceStatementId");
  const relationId = getString(formData, "relationId");
  const lang = getLang(formData);

  try {
    await removeRelation(relationId);
  } catch (error) {
    logger.userFacingErrorWithException(
      "statement.relation_remove_failed",
      "Failed to remove relation.",
      error,
      {
        sourceStatementId,
        relationId,
        lang,
      },
    );
    throw error;
  }

  redirect(buildRedirect(sourceStatementId, lang));
}
