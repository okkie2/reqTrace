"use server";

import { redirect } from "next/navigation";
import {
  RELATION_TYPES,
  STATEMENT_TYPES,
  type RelationType,
  type StatementInput,
  addParent,
  addRelation,
  cloneStatement,
  createStatement,
  removeParent,
  removeRelation,
  updateStatement,
  updateStatementStatus,
} from "@/lib/statement-store";

function getString(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function getNullableString(formData: FormData, key: string): string | null {
  const value = getString(formData, key);
  return value === "" ? null : value;
}

function getStatementType(formData: FormData): StatementInput["statementType"] {
  const value = getString(formData, "statementType");

  if (!STATEMENT_TYPES.includes(value as StatementInput["statementType"])) {
    throw new Error(`Unsupported statement type: ${value}`);
  }

  return value as StatementInput["statementType"];
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
  const payload: StatementInput = {
    statementType: getStatementType(formData),
    title: getString(formData, "title"),
    textOriginal: getNullableString(formData, "textOriginal"),
    textNl: getNullableString(formData, "textNl"),
    note: getNullableString(formData, "note"),
    sourceCode: getNullableString(formData, "sourceCode"),
    source: getNullableString(formData, "source"),
    level: getNullableString(formData, "level"),
    orderNo: getNullableString(formData, "orderNo"),
    moscow: getNullableString(formData, "moscow"),
    increment: getNullableString(formData, "increment"),
  };

  const saved = id
    ? await updateStatement(id, payload)
    : await createStatement(payload);

  redirect(`/?statement=${saved.id}`);
}

export async function cloneStatementAction(formData: FormData) {
  const sourceId = getString(formData, "sourceId");
  const cloned = await cloneStatement(sourceId);
  redirect(`/?statement=${cloned.id}`);
}

export async function updateStatusAction(formData: FormData) {
  const statementId = getString(formData, "statementId");
  const status = getString(formData, "status");

  if (status !== "active" && status !== "deprecated" && status !== "archived") {
    throw new Error(`Unsupported status: ${status}`);
  }

  const updated = await updateStatementStatus(statementId, status);
  redirect(`/?statement=${updated.id}`);
}

export async function addParentAction(formData: FormData) {
  const statementId = getString(formData, "statementId");
  const parentStatementId = getString(formData, "parentStatementId");

  await addParent(statementId, parentStatementId);
  redirect(`/?statement=${statementId}`);
}

export async function removeParentAction(formData: FormData) {
  const statementId = getString(formData, "statementId");
  const parentStatementId = getString(formData, "parentStatementId");

  await removeParent(statementId, parentStatementId);
  redirect(`/?statement=${statementId}`);
}

export async function addRelationAction(formData: FormData) {
  const sourceStatementId = getString(formData, "sourceStatementId");
  const targetStatementId = getString(formData, "targetStatementId");
  const relationType = getRelationType(formData);

  await addRelation(sourceStatementId, targetStatementId, relationType);
  redirect(`/?statement=${sourceStatementId}`);
}

export async function removeRelationAction(formData: FormData) {
  const sourceStatementId = getString(formData, "sourceStatementId");
  const relationId = getString(formData, "relationId");

  await removeRelation(relationId);
  redirect(`/?statement=${sourceStatementId}`);
}
