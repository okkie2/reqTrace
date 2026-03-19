import type {
  StatementWarning,
  RelationType,
  SourceRelation,
  StatementStatus,
  StatementType,
} from "@/lib/statement-schema";

export type Lang = "en" | "nl";
export type UiErrorCode =
  | "title_required"
  | "invalid_piezo_id"
  | "invalid_sources"
  | "invalid_payload"
  | "unsupported_source_relation"
  | "unsupported_statement_type"
  | "unsupported_statement_status"
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
  searchLabel: string;
  searchPlaceholder: string;
  hasPiezo: string;
  piezoIdFilter: string;
  piezoIdExact: string;
  applyFilters: string;
  clearFilters: string;
  noStatements: string;
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
  piezoId: string;
  piezoIdHelp: string;
  originalText: string;
  dutchText: string;
  textGuidance: string;
  sources: string;
  sourceTitle: string;
  sourceRelation: string;
  sourceLocator: string;
  sourceUrl: string;
  sourceHelp: string;
  addSource: string;
  level: string;
  order: string;
  notes: string;
  saveStatement: string;
  autosaveSaving: string;
  autosaveSaved: string;
  autosavePendingTitle: string;
  autosaveError: string;
  autosaveUnsaved: string;
  autosaveIdle: string;
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
    searchLabel: "Search and filters",
    searchPlaceholder: "Search title, source, or PIEZO ID",
    hasPiezo: "Only with PIEZO ID",
    piezoIdFilter: "Exact PIEZO ID",
    piezoIdExact: "Exact PIEZO ID",
    applyFilters: "Apply filters",
    clearFilters: "Clear",
    noStatements: "No statements match the current filters.",
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
    piezoId: "PIEZO ID",
    piezoIdHelp: "Programme lineage or external governance reference. This is not the content source.",
    originalText: "Original text",
    dutchText: "Text",
    textGuidance:
      "Text and original text are optional. Fill either or both when available.",
    sources: "Sources",
    sourceTitle: "Source title",
    sourceRelation: "Source relation",
    sourceLocator: "Source locator",
    sourceUrl: "Source URL",
    sourceHelp: "Sources capture provenance. They are not statements and not programme lineage.",
    addSource: "Add source",
    level: "Level",
    order: "Sequence",
    notes: "Notes",
    saveStatement: "Save statement",
    autosaveSaving: "Saving automatically...",
    autosaveSaved: "Saved automatically",
    autosavePendingTitle: "Autosave will start as soon as a title is entered.",
    autosaveError: "Autosave failed. The current change is not saved yet.",
    autosaveUnsaved: "Unsaved changes pending autosave.",
    autosaveIdle: "Autosave is active.",
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
        case "invalid_piezo_id":
          return "PIEZO ID must be plain text.";
        case "invalid_sources":
          return "Each source must at least have a title and relation.";
        case "unsupported_source_relation":
          return "The selected source relation is not supported.";
        case "invalid_payload":
          return "The save payload is invalid.";
        case "unsupported_statement_type":
          return "The selected statement type is not supported.";
        case "unsupported_statement_status":
          return "The selected status is not supported.";
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
    title: "Stellingenbeheer",
    summary:
      "Beheer de levenscyclus, parent-structuur en semantische relaties van stellingen in een enkele werkomgeving.",
    languageLabel: "Taal",
    english: "Engels",
    dutch: "Nederlands",
    statements: "Stellingen",
    applicable: "Geldig",
    workspaceLabel: "Werkruimte stellingenbeheer",
    listHeading: "Stellingen",
    listSummary: "Selecteer een stelling om inhoud, status, parents en relaties te bewerken.",
    searchLabel: "Zoeken en filters",
    searchPlaceholder: "Zoek op titel, bron of PIEZO-id",
    hasPiezo: "Alleen met PIEZO-id",
    piezoIdFilter: "Exacte PIEZO-id",
    piezoIdExact: "Exacte PIEZO-id",
    applyFilters: "Filters toepassen",
    clearFilters: "Wissen",
    noStatements: "Geen stellingen gevonden voor de huidige filters.",
    newStatement: "Nieuwe stelling",
    listAria: "Stellingenoverzicht",
    editStatement: "Stelling bewerken",
    createStatement: "Nieuwe stelling",
    editorSummary:
      "Titel is verplicht. Status, stellingtype en tekstvelden kunnen op elk moment worden aangepast.",
    actionNav: "Stellingacties",
    clone: "Klonen",
    delete: "Verwijderen",
    statusLabel: "Status",
    statementType: "Stellingtype",
    statementNumber: "Stellingnummer",
    assignedOnSave: "Wordt toegekend bij opslaan",
    titleLabel: "Titel",
    piezoId: "PIEZO-id",
    piezoIdHelp: "Programmalijn of externe governanceverwijzing. Dit is niet de inhoudelijke bron.",
    originalText: "Originele tekst",
    dutchText: "Tekst",
    textGuidance:
      "Tekst en originele tekst zijn optioneel. Vul een of beide velden in als ze beschikbaar zijn.",
    sources: "Bronnen",
    sourceTitle: "Brontitel",
    sourceRelation: "Bronrelatie",
    sourceLocator: "Bronlocatie",
    sourceUrl: "Bron-URL",
    sourceHelp: "Bronnen leggen provenance vast. Ze zijn geen stellingen en geen programmalijn.",
    addSource: "Bron toevoegen",
    level: "Niveau",
    order: "Volgorde",
    notes: "Opmerkingen",
    saveStatement: "Stelling opslaan",
    autosaveSaving: "Automatisch opslaan...",
    autosaveSaved: "Automatisch opgeslagen",
    autosavePendingTitle: "Automatisch opslaan start zodra een titel is ingevuld.",
    autosaveError: "Automatisch opslaan is mislukt. De huidige wijziging is nog niet opgeslagen.",
    autosaveUnsaved: "Niet-opgeslagen wijzigingen wachten op automatisch opslaan.",
    autosaveIdle: "Automatisch opslaan is actief.",
    lastUpdated: "Laatst bijgewerkt",
    localDataNote: "Gegevens worden lokaal opgeslagen in data/statements.json.",
    relationshipLabel: "Relatiebeheer",
    parents: "Parents",
    parentsSummary: "Hiërarchische ophanging van de huidige stelling.",
    parentStatement: "Parent-stelling",
    selectParent: "Selecteer parent",
    addParent: "Parent toevoegen",
    noParents: "Nog geen parents gekoppeld.",
    remove: "Verwijderen",
    outgoingRelations: "Uitgaande relaties",
    outgoingSummary: "Expliciete semantische koppelingen van deze stelling naar een andere.",
    relationType: "Relatietype",
    targetStatement: "Doelstelling",
    selectTarget: "Selecteer doel",
    addRelation: "Relatie toevoegen",
    noOutgoing: "Nog geen uitgaande relaties gekoppeld.",
    incomingRelations: "Inkomende relaties",
    incomingSummary: "Stellingen die momenteel naar deze stelling verwijzen.",
    noIncoming: "Nog geen inkomende koppelingen.",
    parentOf: "parent_van",
    warnings: "Waarschuwingen",
    relationManagement: "Relatiebeheer",
    warningMessage: (warning, statusLabel) =>
      `${warning.statementNo} is ${statusLabel} maar nog steeds gekoppeld.`,
    formErrorTitle: "Stelling kon niet worden opgeslagen",
    formErrorMessage: (error) => {
      switch (error) {
        case "title_required":
          return "Vul een titel in voordat je opslaat.";
        case "invalid_piezo_id":
          return "PIEZO-id moet platte tekst zijn.";
        case "invalid_sources":
          return "Elke bron moet minimaal een titel en relatie hebben.";
        case "unsupported_source_relation":
          return "De gekozen bronrelatie wordt niet ondersteund.";
        case "invalid_payload":
          return "De opgeslagen gegevens zijn ongeldig.";
        case "unsupported_statement_type":
          return "Het gekozen stellingtype wordt niet ondersteund.";
        case "unsupported_statement_status":
          return "De gekozen status wordt niet ondersteund.";
        case "unknown_statement":
          return "De geselecteerde stelling kon niet worden gevonden.";
        default:
          return "Er is een onverwachte fout opgetreden bij het opslaan van de stelling.";
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

const sourceRelationLabels: Record<Lang, Record<SourceRelation, string>> = {
  en: {
    copied_from_eu_requirement: "Copied from EU requirement",
    copied_from_national_requirement: "Copied from national requirement",
    derived_from_law: "Derived from law",
  },
  nl: {
    copied_from_eu_requirement: "Gekopieerd uit EU-eis",
    copied_from_national_requirement: "Gekopieerd uit nationale eis",
    derived_from_law: "Afgeleid uit wet",
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

export function getSourceRelationLabel(lang: Lang, relationType: SourceRelation) {
  return sourceRelationLabels[lang][relationType];
}
