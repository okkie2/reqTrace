import Link from "next/link";
import {
  addParentAction,
  addRelationAction,
  cloneStatementAction,
  deleteStatementAction,
  removeParentAction,
  removeRelationAction,
} from "@/app/actions";
import { StatementEditorShell } from "@/app/statement-editor-shell";
import {
  getLang,
  getRelationTypeLabel,
  getStatementTypeLabel,
  getStatusLabel,
  getUi,
  type UiErrorCode,
} from "@/app/i18n";
import {
  EMPTY_STATEMENT_INPUT,
  RELATION_TYPES,
  STATEMENT_STATUSES,
  STATEMENT_TYPES,
  getStatementDetail,
  listStatementSummaries,
} from "@/lib/statement-store";

type SearchParams = Promise<{
  statement?: string;
  mode?: string;
  lang?: string;
  error?: string;
  q?: string;
  hasPiezo?: string;
  piezo?: string;
}>;

function getErrorCode(input: string | undefined): UiErrorCode | null {
  switch (input) {
    case "title_required":
    case "invalid_piezo_id":
    case "invalid_sources":
    case "unsupported_source_relation":
    case "unsupported_statement_type":
    case "unsupported_statement_status":
    case "unknown_statement":
    case "unknown":
      return input;
    default:
      return null;
  }
}

function isSelected(currentId: string | undefined, statementId: string) {
  return currentId === statementId;
}

function buildHref({
  statement,
  mode,
  lang,
  q,
  hasPiezo,
  piezo,
}: {
  statement?: string;
  mode?: string;
  lang: "en" | "nl";
  q?: string;
  hasPiezo?: boolean;
  piezo?: string;
}) {
  const query = new URLSearchParams();

  if (statement) {
    query.set("statement", statement);
  }

  if (mode) {
    query.set("mode", mode);
  }

  if (q && q.trim() !== "") {
    query.set("q", q.trim());
  }

  if (hasPiezo) {
    query.set("hasPiezo", "1");
  }

  if (piezo && piezo.trim() !== "") {
    query.set("piezo", piezo.trim());
  }

  query.set("lang", lang);
  return `/?${query.toString()}`;
}

function matchesQuery(
  statement: Awaited<ReturnType<typeof listStatementSummaries>>[number],
  query: string,
) {
  const haystack = [
    statement.statementNo,
    statement.title,
    ...statement.sourceTitles,
    statement.piezoId ?? "",
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
}

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const lang = getLang(params.lang);
  const ui = getUi(lang);
  const errorCode = getErrorCode(params.error);
  const statements = await listStatementSummaries();
  const query = params.q?.trim() ?? "";
  const exactPiezoId = params.piezo?.trim() ?? "";
  const hasPiezo = params.hasPiezo === "1";
  const selectedId = params.statement;
  const isNew = params.mode === "new";
  const detail = selectedId ? await getStatementDetail(selectedId) : null;
  const selectedStatement = detail?.statement ?? null;
  const editor = isNew || !selectedStatement ? EMPTY_STATEMENT_INPUT : selectedStatement;
  const filteredStatements = statements.filter((statement) => {
    if (query !== "" && !matchesQuery(statement, query)) {
      return false;
    }

    if (hasPiezo && !statement.piezoId) {
      return false;
    }

    if (exactPiezoId !== "" && statement.piezoId !== exactPiezoId) {
      return false;
    }

    return true;
  });
  const selectableStatements = statements.filter(
    (statement) => statement.id !== selectedStatement?.id,
  );
  const applicableCount = filteredStatements.filter(
    (statement) => statement.status === "applicable",
  ).length;
  const dateLocale = lang === "nl" ? "nl-NL" : "en-GB";

  return (
    <main className="app-shell container">
      <header className="page-header">
        <div className="page-header__intro">
          <p className="eyebrow">{ui.eyebrow}</p>
          <h1>{ui.title}</h1>
          <p className="page-summary">{ui.summary}</p>
        </div>

        <div className="page-header__meta">
          <nav className="language-switch" aria-label={ui.languageLabel}>
            <span className="language-switch__label">{ui.languageLabel}</span>
            <div className="language-switch__options">
              <Link
                href={buildHref({
                  statement: selectedId,
                  mode: isNew ? "new" : undefined,
                  lang: "en",
                  q: query,
                  hasPiezo,
                  piezo: exactPiezoId,
                })}
                className={lang === "en" ? "language-option is-active" : "language-option"}
              >
                {ui.english}
              </Link>
              <Link
                href={buildHref({
                  statement: selectedId,
                  mode: isNew ? "new" : undefined,
                  lang: "nl",
                  q: query,
                  hasPiezo,
                  piezo: exactPiezoId,
                })}
                className={lang === "nl" ? "language-option is-active" : "language-option"}
              >
                {ui.dutch}
              </Link>
            </div>
          </nav>

          <dl className="summary-list">
            <div>
              <dt>{ui.statements}</dt>
              <dd>{statements.length}</dd>
            </div>
            <div>
              <dt>{ui.applicable}</dt>
              <dd>{applicableCount}</dd>
            </div>
          </dl>
        </div>
      </header>

      <section className="app-layout" aria-label={ui.workspaceLabel}>
        <aside className="sidebar-panel" aria-labelledby="statement-list-heading">
          <header className="panel-heading">
            <div>
              <h2 id="statement-list-heading">{ui.listHeading}</h2>
              <p className="muted-text">{ui.listSummary}</p>
            </div>
            <Link
              href={buildHref({ mode: "new", lang, q: query, hasPiezo, piezo: exactPiezoId })}
              role="button"
            >
              {ui.newStatement}
            </Link>
          </header>

          <form method="get" className="compact-form">
            <input type="hidden" name="lang" value={lang} />
            <label>
              {ui.searchLabel}
              <input name="q" defaultValue={query} placeholder={ui.searchPlaceholder} />
            </label>
            <label>
              {ui.piezoIdFilter}
              <input name="piezo" defaultValue={exactPiezoId} placeholder={ui.piezoIdExact} />
            </label>
            <label>
              <input type="checkbox" name="hasPiezo" value="1" defaultChecked={hasPiezo} />
              {ui.hasPiezo}
            </label>
            <div className="action-set">
              <button type="submit" className="secondary">
                {ui.applyFilters}
              </button>
              <Link href={buildHref({ lang })} className="outline secondary" role="button">
                {ui.clearFilters}
              </Link>
            </div>
          </form>

          <ul className="statement-list" aria-label={ui.listAria}>
            {filteredStatements.length === 0 ? (
              <li className="empty-state">{ui.noStatements}</li>
            ) : (
              filteredStatements.map((statement) => (
                <li key={statement.id}>
                  <Link
                    href={buildHref({
                      statement: statement.id,
                      lang,
                      q: query,
                      hasPiezo,
                      piezo: exactPiezoId,
                    })}
                    className={isSelected(selectedId, statement.id) ? "statement-link is-selected" : "statement-link"}
                  >
                    <div className="statement-link__meta">
                      <span className="statement-number">{statement.statementNo}</span>
                      <span className={`status-badge status-${statement.status}`}>
                        {getStatusLabel(lang, statement.status)}
                      </span>
                    </div>
                    <strong>{statement.title}</strong>
                    <small>{getStatementTypeLabel(lang, statement.statementType)}</small>
                    {statement.piezoId ? <small>{ui.piezoId}: {statement.piezoId}</small> : null}
                    {statement.sourceTitles[0] ? (
                      <small>
                        {ui.sources}: {statement.sourceTitles[0]}
                      </small>
                    ) : null}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </aside>

        <section className="content-panel" aria-labelledby="editor-heading">
          <article className="panel-block">
            <header className="panel-heading">
              <div>
                <h2 id="editor-heading">
                  {isNew || !selectedStatement ? ui.createStatement : ui.editStatement}
                </h2>
                <p className="muted-text">{ui.editorSummary}</p>
              </div>

              {selectedStatement ? (
                <nav className="action-set" aria-label={ui.actionNav}>
                  <form action={cloneStatementAction}>
                    <input type="hidden" name="sourceId" value={selectedStatement.id} />
                    <input type="hidden" name="lang" value={lang} />
                    <button type="submit" className="secondary">
                      {ui.clone}
                    </button>
                  </form>
                  <form action={deleteStatementAction}>
                    <input type="hidden" name="statementId" value={selectedStatement.id} />
                    <input type="hidden" name="lang" value={lang} />
                    <button type="submit" className="outline secondary">
                      {ui.delete}
                    </button>
                  </form>
                </nav>
              ) : null}
            </header>

            <StatementEditorShell
              lang={lang}
              initialState={{
                id: selectedStatement?.id ?? "",
                statementNo: selectedStatement?.statementNo ?? "",
                updatedAt: selectedStatement?.updatedAt ?? null,
                ...editor,
              }}
              isNew={isNew || !selectedStatement}
              errorCode={errorCode}
              q={query}
              hasPiezo={hasPiezo}
              piezo={exactPiezoId}
            />
          </article>

          {detail ? (
            <>
              <section className="relationship-grid" aria-label={ui.relationshipLabel}>
                <article className="panel-block">
                  <header className="panel-heading">
                    <div>
                      <h3>{ui.parents}</h3>
                      <p className="muted-text">{ui.parentsSummary}</p>
                    </div>
                  </header>

                  <form action={addParentAction} className="compact-form">
                    <input type="hidden" name="statementId" value={detail.statement.id} />
                    <input type="hidden" name="lang" value={lang} />
                    <label>
                      {ui.parentStatement}
                      <select name="parentStatementId" required defaultValue="">
                        <option value="" disabled>
                          {ui.selectParent}
                        </option>
                        {selectableStatements.map((statement) => (
                          <option key={statement.id} value={statement.id}>
                            {statement.statementNo} · {statement.title}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button type="submit" className="secondary">
                      {ui.addParent}
                    </button>
                  </form>

                  <ul className="link-list">
                    {detail.parents.length === 0 ? (
                      <li className="empty-state">{ui.noParents}</li>
                    ) : (
                      detail.parents.map((parent) => (
                        <li key={parent.statementId} className="link-item">
                          <div>
                            <strong>{parent.statementNo}</strong>
                            <p>{parent.title}</p>
                            <small>
                              {getStatementTypeLabel(lang, parent.statementType)} ·{" "}
                              {getStatusLabel(lang, parent.status)}
                            </small>
                          </div>
                          <form action={removeParentAction}>
                            <input type="hidden" name="statementId" value={detail.statement.id} />
                            <input
                              type="hidden"
                              name="parentStatementId"
                              value={parent.statementId}
                            />
                            <input type="hidden" name="lang" value={lang} />
                            <button type="submit" className="outline secondary">
                              {ui.remove}
                            </button>
                          </form>
                        </li>
                      ))
                    )}
                  </ul>
                </article>

                <article className="panel-block">
                  <header className="panel-heading">
                    <div>
                      <h3>{ui.outgoingRelations}</h3>
                      <p className="muted-text">{ui.outgoingSummary}</p>
                    </div>
                  </header>

                  <form action={addRelationAction} className="compact-form">
                    <input type="hidden" name="sourceStatementId" value={detail.statement.id} />
                    <input type="hidden" name="lang" value={lang} />
                    <label>
                      {ui.relationType}
                      <select name="relationType" required defaultValue={RELATION_TYPES[0]}>
                        {RELATION_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {getRelationTypeLabel(lang, type)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      {ui.targetStatement}
                      <select name="targetStatementId" required defaultValue="">
                        <option value="" disabled>
                          {ui.selectTarget}
                        </option>
                        {selectableStatements.map((statement) => (
                          <option key={statement.id} value={statement.id}>
                            {statement.statementNo} · {statement.title}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button type="submit" className="secondary">
                      {ui.addRelation}
                    </button>
                  </form>

                  <ul className="link-list">
                    {detail.outgoingRelations.length === 0 ? (
                      <li className="empty-state">{ui.noOutgoing}</li>
                    ) : (
                      detail.outgoingRelations.map((relation) => (
                        <li key={relation.relationId} className="link-item">
                          <div>
                            <strong>{getRelationTypeLabel(lang, relation.relationType)}</strong>
                            <p>
                              {relation.statementNo} · {relation.title}
                            </p>
                            <small>
                              {getStatementTypeLabel(lang, relation.statementType)} ·{" "}
                              {getStatusLabel(lang, relation.status)}
                            </small>
                          </div>
                          <form action={removeRelationAction}>
                            <input
                              type="hidden"
                              name="sourceStatementId"
                              value={detail.statement.id}
                            />
                            <input type="hidden" name="relationId" value={relation.relationId} />
                            <input type="hidden" name="lang" value={lang} />
                            <button type="submit" className="outline secondary">
                              {ui.remove}
                            </button>
                          </form>
                        </li>
                      ))
                    )}
                  </ul>
                </article>

                <article className="panel-block">
                  <header className="panel-heading">
                    <div>
                      <h3>{ui.incomingRelations}</h3>
                      <p className="muted-text">{ui.incomingSummary}</p>
                    </div>
                  </header>

                  <ul className="link-list">
                    {detail.incomingParents.length === 0 && detail.incomingRelations.length === 0 ? (
                      <li className="empty-state">{ui.noIncoming}</li>
                    ) : (
                      <>
                        {detail.incomingParents.map((child) => (
                          <li key={`parent-${child.statementId}`} className="link-item">
                            <div>
                              <strong>{ui.parentOf}</strong>
                              <p>
                                {child.statementNo} · {child.title}
                              </p>
                              <small>
                                {getStatementTypeLabel(lang, child.statementType)} ·{" "}
                                {getStatusLabel(lang, child.status)}
                              </small>
                            </div>
                          </li>
                        ))}
                        {detail.incomingRelations.map((relation) => (
                          <li key={relation.relationId} className="link-item">
                            <div>
                              <strong>{getRelationTypeLabel(lang, relation.relationType)}</strong>
                              <p>
                                {relation.statementNo} · {relation.title}
                              </p>
                              <small>
                                {getStatementTypeLabel(lang, relation.statementType)} ·{" "}
                                {getStatusLabel(lang, relation.status)}
                              </small>
                            </div>
                          </li>
                        ))}
                      </>
                    )}
                  </ul>
                </article>
              </section>

              {detail.warnings.length > 0 ? (
                <aside className="feedback-panel feedback-panel--warning" aria-live="polite">
                  <h3>{ui.warnings}</h3>
                  <ul>
                    {detail.warnings.map((warning) => (
                      <li key={`${warning.statementNo}-${warning.status}`}>
                        {ui.warningMessage(warning, getStatusLabel(lang, warning.status))}
                      </li>
                    ))}
                  </ul>
                </aside>
              ) : null}
            </>
          ) : null}
        </section>
      </section>
    </main>
  );
}
