import type {
  RelationType,
  StatementStatus,
  StatementType,
  StatementWarning,
} from "@/lib/statement-store";

export type Lang = "en" | "nl";
export type UiErrorCode =
  | "title_required"
  | "unsupported_statement_type"
  | "unknown_statement"
  | "unknown";

type UiStrings = {
  eyebrow: string;
  title: string;
  summary: string;
  languageLabel: string;
  english: string;
  dutch: string;
  statements: string;
  applicable: string;
  workspaceLabel: string;
  listHeading: string;
  listSummary: string;
  newStatement: string;
  listAria: string;
  editStatement: string;
  createStatement: string;
  editorSummary: string;
  actionNav: string;
  clone: string;
  delete: string;
  statusLabel: string;
  statementType: string;
  statementNumber: string;
  assignedOnSave: string;
  titleLabel: string;
  originalText: string;
  dutchText: string;
  textGuidance: string;
  sourceCode: string;
  source: string;
  level: string;
  order: string;
  moscow: string;
  increment: string;
  notes: string;
  saveStatement: string;
  lastUpdated: string;
  localDataNote: string;
  relationshipLabel: string;
  parents: string;
  parentsSummary: string;
  parentStatement: string;
  selectParent: string;
  addParent: string;
  noParents: string;
  remove: string;
  outgoingRelations: string;
  outgoingSummary: string;
  relationType: string;
  targetStatement: string;
  selectTarget: string;
  addRelation: string;
  noOutgoing: string;
  incomingRelations: string;
  incomingSummary: string;
  noIncoming: string;
  parentOf: string;
  warnings: string;
  relationManagement: string;
  warningMessage: (warning: StatementWarning, statusLabel: string) => string;
  formErrorTitle: string;
  formErrorMessage: (error: UiErrorCode) => string;
  titleRequired: string;
};

const uiByLang: Record<Lang, UiStrings> = {
  en: {
    eyebrow: "reqTrace MVP",
    title: "Statement Manager",
    summary:
      "Manage statement lifecycle, parent structure, and semantic relations in a single working environment.",
    languageLabel: "Language",
    english: "English",
    dutch: "Dutch",
    statements: "Statements",
    applicable: "Applicable",
    workspaceLabel: "Statement manager workspace",
    listHeading: "Statements",
    listSummary: "Select a statement to edit content, status, parents, and relations.",
    newStatement: "New statement",
    listAria: "Statement overview",
    editStatement: "Edit statement",
    createStatement: "New statement",
    editorSummary:
      "Title is required. Status, statement type, and text fields can be updated at any time.",
    actionNav: "Statement actions",
    clone: "Clone",
    delete: "Delete",
    statusLabel: "Status",
    statementType: "Statement type",
    statementNumber: "Statement number",
    assignedOnSave: "Assigned on save",
    titleLabel: "Title",
    originalText: "Original text",
    dutchText: "Text",
    textGuidance:
      "Text and original text are optional. Fill either or both when available.",
    sourceCode: "Source code",
    source: "Source",
    level: "Level",
    order: "Order",
    moscow: "MoSCoW",
    increment: "Increment",
    notes: "Notes",
    saveStatement: "Save statement",
    lastUpdated: "Last updated",
    localDataNote: "Data is stored locally in data/statements.json.",
    relationshipLabel: "Relationship management",
    parents: "Parents",
    parentsSummary: "Hierarchical placement of the current statement.",
    parentStatement: "Parent statement",
    selectParent: "Select parent",
    addParent: "Add parent",
    noParents: "No parents linked yet.",
    remove: "Remove",
    outgoingRelations: "Outgoing relations",
    outgoingSummary: "Explicit semantic links from this statement to another.",
    relationType: "Relation type",
    targetStatement: "Target statement",
    selectTarget: "Select target",
    addRelation: "Add relation",
    noOutgoing: "No outgoing relations linked yet.",
    incomingRelations: "Incoming relations",
    incomingSummary: "Statements that currently point to this statement.",
    noIncoming: "No incoming links yet.",
    parentOf: "parent_of",
    warnings: "Warnings",
    relationManagement: "Relationship management",
    warningMessage: (warning, statusLabel) =>
      `${warning.statementNo} is ${statusLabel} but still linked.`,
    formErrorTitle: "Unable to save statement",
    formErrorMessage: (error) => {
      switch (error) {
        case "title_required":
          return "Enter a title before saving.";
        case "unsupported_statement_type":
          return "The selected statement type is not supported.";
        case "unknown_statement":
          return "The selected statement could not be found.";
        default:
          return "An unexpected error occurred while saving the statement.";
      }
    },
    titleRequired: "Title is required.",
  },
  nl: {
    eyebrow: "reqTrace MVP",
    title: "Statementbeheer",
    summary:
      "Beheer de levenscyclus, parent-structuur en semantische relaties van statements in een enkele werkomgeving.",
    languageLabel: "Taal",
    english: "Engels",
    dutch: "Nederlands",
    statements: "Statements",
    applicable: "Geldig",
    workspaceLabel: "Werkruimte statementbeheer",
    listHeading: "Statements",
    listSummary: "Selecteer een statement om inhoud, status, parents en relaties te bewerken.",
    newStatement: "Nieuw statement",
    listAria: "Statementoverzicht",
    editStatement: "Statement bewerken",
    createStatement: "Nieuw statement",
    editorSummary:
      "Titel is verplicht. Status, statementtype en tekstvelden kunnen op elk moment worden aangepast.",
    actionNav: "Statementacties",
    clone: "Klonen",
    delete: "Verwijderen",
    statusLabel: "Status",
    statementType: "Statementtype",
    statementNumber: "Statementnummer",
    assignedOnSave: "Wordt toegekend bij opslaan",
    titleLabel: "Titel",
    originalText: "Originele tekst",
    dutchText: "Tekst",
    textGuidance:
      "Tekst en originele tekst zijn optioneel. Vul een of beide velden in als ze beschikbaar zijn.",
    sourceCode: "Broncode",
    source: "Bron",
    level: "Niveau",
    order: "Volgorde",
    moscow: "MoSCoW",
    increment: "Increment",
    notes: "Opmerkingen",
    saveStatement: "Statement opslaan",
    lastUpdated: "Laatst bijgewerkt",
    localDataNote: "Gegevens worden lokaal opgeslagen in data/statements.json.",
    relationshipLabel: "Relatiebeheer",
    parents: "Parents",
    parentsSummary: "Hiërarchische ophanging van het huidige statement.",
    parentStatement: "Parent statement",
    selectParent: "Selecteer parent",
    addParent: "Parent toevoegen",
    noParents: "Nog geen parents gekoppeld.",
    remove: "Verwijderen",
    outgoingRelations: "Uitgaande relaties",
    outgoingSummary: "Expliciete semantische koppelingen van dit statement naar een ander.",
    relationType: "Relatietype",
    targetStatement: "Doelstatement",
    selectTarget: "Selecteer doel",
    addRelation: "Relatie toevoegen",
    noOutgoing: "Nog geen uitgaande relaties gekoppeld.",
    incomingRelations: "Inkomende relaties",
    incomingSummary: "Statements die momenteel naar dit statement verwijzen.",
    noIncoming: "Nog geen inkomende koppelingen.",
    parentOf: "parent_van",
    warnings: "Waarschuwingen",
    relationManagement: "Relatiebeheer",
    warningMessage: (warning, statusLabel) =>
      `${warning.statementNo} is ${statusLabel} maar nog steeds gekoppeld.`,
    formErrorTitle: "Statement kon niet worden opgeslagen",
    formErrorMessage: (error) => {
      switch (error) {
        case "title_required":
          return "Vul een titel in voordat je opslaat.";
        case "unsupported_statement_type":
          return "Het gekozen statementtype wordt niet ondersteund.";
        case "unknown_statement":
          return "Het geselecteerde statement kon niet worden gevonden.";
        default:
          return "Er is een onverwachte fout opgetreden bij het opslaan van het statement.";
      }
    },
    titleRequired: "Titel is verplicht.",
  },
};

const statusLabels: Record<Lang, Record<StatementStatus, string>> = {
  en: {
    draft: "Draft",
    applicable: "Applicable",
    deprecated: "Deprecated",
  },
  nl: {
    draft: "Concept",
    applicable: "Geldig",
    deprecated: "Vervallen",
  },
};

const statementTypeLabels: Record<Lang, Record<StatementType, string>> = {
  en: {
    requirement: "Requirement",
    interpretation: "Interpretation",
    decision: "Decision",
    evidence: "Evidence",
    question: "Question",
    risk: "Risk",
  },
  nl: {
    requirement: "Eis",
    interpretation: "Interpretatie",
    decision: "Besluit",
    evidence: "Bewijs",
    question: "Vraag",
    risk: "Risico",
  },
};

const relationTypeLabels: Record<Lang, Record<RelationType, string>> = {
  en: {
    verplicht_wegens: "Required because of",
    vertaling_van: "Translation of",
    detail_van: "Detail of",
    uitwerking_van: "Elaboration of",
  },
  nl: {
    verplicht_wegens: "Verplicht wegens",
    vertaling_van: "Vertaling van",
    detail_van: "Detail van",
    uitwerking_van: "Uitwerking van",
  },
};

export function getLang(input: string | undefined): Lang {
  return input === "nl" ? "nl" : "en";
}

export function getUi(lang: Lang) {
  return uiByLang[lang];
}

export function getStatusLabel(lang: Lang, status: StatementStatus) {
  return statusLabels[lang][status];
}

export function getStatementTypeLabel(lang: Lang, statementType: StatementType) {
  return statementTypeLabels[lang][statementType];
}

export function getRelationTypeLabel(lang: Lang, relationType: RelationType) {
  return relationTypeLabels[lang][relationType];
}
