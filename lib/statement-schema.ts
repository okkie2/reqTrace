export const STATEMENT_TYPES = [
  "requirement",
  "interpretation",
  "decision",
  "evidence",
  "question",
  "risk",
] as const;

export const STATEMENT_STATUSES = ["draft", "applicable", "deprecated"] as const;
export const RELATION_TYPES = [
  "verplicht_wegens",
  "vertaling_van",
  "detail_van",
  "uitwerking_van",
] as const;
export const SOURCE_RELATIONS = [
  "copied_from_eu_requirement",
  "copied_from_national_requirement",
  "derived_from_law",
] as const;

export type StatementType = (typeof STATEMENT_TYPES)[number];
export type StatementStatus = (typeof STATEMENT_STATUSES)[number];
export type RelationType = (typeof RELATION_TYPES)[number];
export type SourceRelation = (typeof SOURCE_RELATIONS)[number];

export type StatementSource = {
  title: string;
  relation: SourceRelation;
  locator: string | null;
  url: string | null;
};

export type Statement = {
  id: string;
  statementNo: string;
  statementType: StatementType;
  title: string;
  piezoId: string | null;
  textOriginal: string | null;
  textNl: string | null;
  note: string | null;
  sources: StatementSource[];
  level: string | null;
  orderNo: string | null;
  status: StatementStatus;
  clonedFromStatementId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StatementInput = Omit<
  Statement,
  "id" | "statementNo" | "clonedFromStatementId" | "createdAt" | "updatedAt"
>;

export type StatementWarning = {
  statementNo: string;
  status: StatementStatus;
};
