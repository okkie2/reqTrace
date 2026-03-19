import Link from "next/link";
import {
  addParentAction,
  addRelationAction,
  cloneStatementAction,
  removeParentAction,
  removeRelationAction,
  saveStatementAction,
  updateStatusAction,
} from "@/app/actions";
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
  STATEMENT_TYPES,
  getStatementDetail,
  listStatementSummaries,
} from "@/lib/statement-store";

type SearchParams = Promise<{
  statement?: string;
  mode?: string;
  lang?: string;
  error?: string;
}>;

function getErrorCode(input: string | undefined): UiErrorCode | null {
  switch (input) {
    case "title_required":
    case "text_required":
    case "unsupported_statement_type":
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
}: {
  statement?: string;
  mode?: string;
  lang: "en" | "nl";
}) {
  const query = new URLSearchParams();

  if (statement) {
    query.set("statement", statement);
  }

  if (mode) {
    query.set("mode", mode);
  }

  query.set("lang", lang);
  return `/?${query.toString()}`;
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
  const selectedId = params.statement;
  const isNew = params.mode === "new";
  const detail = selectedId ? await getStatementDetail(selectedId) : null;
  const selectedStatement = detail?.statement ?? null;
  const editor = isNew || !selectedStatement ? EMPTY_STATEMENT_INPUT : selectedStatement;
  const selectableStatements = statements.filter(
    (statement) => statement.id !== selectedStatement?.id,
  );
  const activeCount = statements.filter((statement) => statement.status === "active").length;
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
              <dt>{ui.active}</dt>
              <dd>{activeCount}</dd>
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
            <Link href={buildHref({ mode: "new", lang })} role="button">
              {ui.newStatement}
            </Link>
          </header>

          <ul className="statement-list" aria-label={ui.listAria}>
            {statements.map((statement) => (
              <li key={statement.id}>
                <Link
                  href={buildHref({ statement: statement.id, lang })}
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
                </Link>
              </li>
            ))}
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
                  <form action={updateStatusAction}>
                    <input type="hidden" name="statementId" value={selectedStatement.id} />
                    <input type="hidden" name="status" value="deprecated" />
                    <input type="hidden" name="lang" value={lang} />
                    <button type="submit" className="secondary">
                      {ui.deprecate}
                    </button>
                  </form>
                  <form action={updateStatusAction}>
                    <input type="hidden" name="statementId" value={selectedStatement.id} />
                    <input type="hidden" name="status" value="archived" />
                    <input type="hidden" name="lang" value={lang} />
                    <button type="submit" className="secondary">
                      {ui.archive}
                    </button>
                  </form>
                </nav>
              ) : null}
            </header>

            <form action={saveStatementAction}>
              <input type="hidden" name="id" value={selectedStatement?.id ?? ""} />
              <input type="hidden" name="lang" value={lang} />

              <div className="form-grid">
                <label>
                  {ui.statementType}
                  <select name="statementType" defaultValue={editor.statementType} required>
                    {STATEMENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {getStatementTypeLabel(lang, type)}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  {ui.statementNumber}
                  <input value={selectedStatement?.statementNo ?? ui.assignedOnSave} disabled />
                </label>

                <label className="span-full">
                  {ui.titleLabel}
                  <input name="title" defaultValue={editor.title} required />
                  {errorCode === "title_required" ? (
                    <small className="field-error">{ui.titleRequired}</small>
                  ) : null}
                </label>

                <label className="span-full">
                  {ui.originalText}
                  <textarea
                    name="textOriginal"
                    defaultValue={editor.textOriginal ?? ""}
                    rows={4}
                    aria-describedby="text-guidance"
                  />
                </label>

                <label className="span-full">
                  {ui.dutchText}
                  <textarea
                    name="textNl"
                    defaultValue={editor.textNl ?? ""}
                    rows={4}
                    aria-describedby="text-guidance"
                  />
                </label>

                <p id="text-guidance" className="field-note span-full">
                  {ui.textGuidance}
                </p>
                {errorCode === "text_required" ? (
                  <p className="field-error span-full">{ui.textRequired}</p>
                ) : null}

                <label>
                  {ui.sourceCode}
                  <input name="sourceCode" defaultValue={editor.sourceCode ?? ""} />
                </label>

                <label>
                  {ui.source}
                  <input name="source" defaultValue={editor.source ?? ""} />
                </label>

                <label>
                  {ui.level}
                  <input name="level" defaultValue={editor.level ?? ""} />
                </label>

                <label>
                  {ui.order}
                  <input name="orderNo" defaultValue={editor.orderNo ?? ""} />
                </label>

                <label>
                  {ui.moscow}
                  <input name="moscow" defaultValue={editor.moscow ?? ""} />
                </label>

                <label>
                  {ui.increment}
                  <input name="increment" defaultValue={editor.increment ?? ""} />
                </label>

                <label className="span-full">
                  {ui.notes}
                  <textarea name="note" defaultValue={editor.note ?? ""} rows={4} />
                </label>
              </div>

              {errorCode ? (
                <aside className="feedback-panel feedback-panel--error" aria-live="polite">
                  <h3>{ui.formErrorTitle}</h3>
                  <p>{ui.formErrorMessage(errorCode)}</p>
                </aside>
              ) : null}

              <footer className="panel-footer">
                <button type="submit">{ui.saveStatement}</button>
                {selectedStatement ? (
                  <p className="field-note">
                    {ui.lastUpdated}{" "}
                    {new Date(selectedStatement.updatedAt).toLocaleString(dateLocale, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                ) : (
                  <p className="field-note">
                    {ui.localDataNote.split("data/statements.json")[0]}
                    <code>data/statements.json</code>
                    {ui.localDataNote.split("data/statements.json")[1] ?? ""}
                  </p>
                )}
              </footer>
            </form>
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
