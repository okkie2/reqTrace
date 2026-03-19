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
  EMPTY_STATEMENT_INPUT,
  RELATION_TYPES,
  STATEMENT_TYPES,
  getStatementDetail,
  listStatementSummaries,
} from "@/lib/statement-store";

type SearchParams = Promise<{
  statement?: string;
  mode?: string;
}>;

function isSelected(currentId: string | undefined, statementId: string) {
  return currentId === statementId;
}

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const statements = await listStatementSummaries();
  const selectedId = params.statement;
  const isNew = params.mode === "new";
  const detail = selectedId ? await getStatementDetail(selectedId) : null;
  const selectedStatement = detail?.statement ?? null;
  const editor = isNew || !selectedStatement ? EMPTY_STATEMENT_INPUT : selectedStatement;
  const selectableStatements = statements.filter(
    (statement) => statement.id !== selectedStatement?.id,
  );

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Roadmap A + B</p>
          <h1>Statement Manager</h1>
          <p className="lede">
            Manage statement lifecycle, hierarchy, and semantic traceability in one
            working view.
          </p>
        </div>
        <div className="heroStats">
          <div>
            <span className="statLabel">Statements</span>
            <strong>{statements.length}</strong>
          </div>
          <div>
            <span className="statLabel">Active</span>
            <strong>
              {statements.filter((statement) => statement.status === "active").length}
            </strong>
          </div>
        </div>
      </section>

      <section className="workspace">
        <aside className="statementList">
          <div className="panelHeader">
            <div>
              <h2>Statements</h2>
              <p>Pick a statement to edit lifecycle, parents, and relations.</p>
            </div>
            <Link className="primaryLink" href="/?mode=new">
              New statement
            </Link>
          </div>

          <ul className="list">
            {statements.map((statement) => (
              <li key={statement.id}>
                <Link
                  className={isSelected(selectedId, statement.id) ? "listItem selected" : "listItem"}
                  href={`/?statement=${statement.id}`}
                >
                  <div className="listItemTop">
                    <span className="statementNo">{statement.statementNo}</span>
                    <span className={`status status-${statement.status}`}>
                      {statement.status}
                    </span>
                  </div>
                  <strong>{statement.title}</strong>
                  <span>{statement.statementType}</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        <section className="editorPanel">
          <div className="panelHeader">
            <div>
              <h2>{isNew || !selectedStatement ? "New statement" : "Edit statement"}</h2>
              <p>
                Required for MVP: title, statement type, and at least one text field.
              </p>
            </div>
            {selectedStatement ? (
              <div className="actionRow">
                <form action={cloneStatementAction}>
                  <input type="hidden" name="sourceId" value={selectedStatement.id} />
                  <button className="secondaryButton" type="submit">
                    Clone
                  </button>
                </form>
                <form action={updateStatusAction}>
                  <input type="hidden" name="statementId" value={selectedStatement.id} />
                  <input type="hidden" name="status" value="deprecated" />
                  <button className="secondaryButton" type="submit">
                    Deprecate
                  </button>
                </form>
                <form action={updateStatusAction}>
                  <input type="hidden" name="statementId" value={selectedStatement.id} />
                  <input type="hidden" name="status" value="archived" />
                  <button className="secondaryButton" type="submit">
                    Archive
                  </button>
                </form>
              </div>
            ) : null}
          </div>

          <form action={saveStatementAction} className="editorForm">
            <input type="hidden" name="id" value={selectedStatement?.id ?? ""} />

            <div className="fieldGrid">
              <label>
                <span>Statement type</span>
                <select name="statementType" defaultValue={editor.statementType} required>
                  {STATEMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Statement no</span>
                <input value={selectedStatement?.statementNo ?? "Assigned on save"} disabled />
              </label>

              <label className="fieldWide">
                <span>Title</span>
                <input name="title" defaultValue={editor.title} required />
              </label>

              <label className="fieldWide">
                <span>Original text</span>
                <textarea name="textOriginal" defaultValue={editor.textOriginal ?? ""} rows={4} />
              </label>

              <label className="fieldWide">
                <span>Dutch text</span>
                <textarea name="textNl" defaultValue={editor.textNl ?? ""} rows={4} />
              </label>

              <label>
                <span>Source code</span>
                <input name="sourceCode" defaultValue={editor.sourceCode ?? ""} />
              </label>

              <label>
                <span>Source</span>
                <input name="source" defaultValue={editor.source ?? ""} />
              </label>

              <label>
                <span>Level</span>
                <input name="level" defaultValue={editor.level ?? ""} />
              </label>

              <label>
                <span>Order</span>
                <input name="orderNo" defaultValue={editor.orderNo ?? ""} />
              </label>

              <label>
                <span>MoSCoW</span>
                <input name="moscow" defaultValue={editor.moscow ?? ""} />
              </label>

              <label>
                <span>Increment</span>
                <input name="increment" defaultValue={editor.increment ?? ""} />
              </label>

              <label className="fieldWide">
                <span>Notes</span>
                <textarea name="note" defaultValue={editor.note ?? ""} rows={4} />
              </label>
            </div>

            <div className="submitRow">
              <button className="primaryButton" type="submit">
                Save statement
              </button>
              {selectedStatement ? (
                <p>
                  Last updated{" "}
                  {new Date(selectedStatement.updatedAt).toLocaleString("en-GB", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              ) : (
                <p>The manager writes statements, parents, and relations to `data/statements.json`.</p>
              )}
            </div>
          </form>

          {detail ? (
            <section className="relationshipPanel">
              <div className="relationshipGrid">
                <section className="linkCard">
                  <div className="linkCardHeader">
                    <div>
                      <h3>Parents</h3>
                      <p>Hierarchical placement of the current statement.</p>
                    </div>
                    <form action={addParentAction} className="inlineForm">
                      <input type="hidden" name="statementId" value={detail.statement.id} />
                      <select name="parentStatementId" required defaultValue="">
                        <option value="" disabled>
                          Select parent
                        </option>
                        {selectableStatements.map((statement) => (
                          <option key={statement.id} value={statement.id}>
                            {statement.statementNo} · {statement.title}
                          </option>
                        ))}
                      </select>
                      <button className="secondaryButton" type="submit">
                        Add parent
                      </button>
                    </form>
                  </div>

                  <ul className="linkList">
                    {detail.parents.length === 0 ? (
                      <li className="emptyState">No parents linked yet.</li>
                    ) : (
                      detail.parents.map((parent) => (
                        <li key={parent.statementId} className="linkRow">
                          <div>
                            <strong>{parent.statementNo}</strong>
                            <p>{parent.title}</p>
                            <span>
                              {parent.statementType} · {parent.status}
                            </span>
                          </div>
                          <form action={removeParentAction}>
                            <input type="hidden" name="statementId" value={detail.statement.id} />
                            <input
                              type="hidden"
                              name="parentStatementId"
                              value={parent.statementId}
                            />
                            <button className="ghostButton" type="submit">
                              Remove
                            </button>
                          </form>
                        </li>
                      ))
                    )}
                  </ul>
                </section>

                <section className="linkCard">
                  <div className="linkCardHeader">
                    <div>
                      <h3>Outgoing relations</h3>
                      <p>Explicit semantic links from this statement to another.</p>
                    </div>
                    <form action={addRelationAction} className="stackedForm">
                      <input type="hidden" name="sourceStatementId" value={detail.statement.id} />
                      <select name="relationType" required defaultValue={RELATION_TYPES[0]}>
                        {RELATION_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      <select name="targetStatementId" required defaultValue="">
                        <option value="" disabled>
                          Select target
                        </option>
                        {selectableStatements.map((statement) => (
                          <option key={statement.id} value={statement.id}>
                            {statement.statementNo} · {statement.title}
                          </option>
                        ))}
                      </select>
                      <button className="secondaryButton" type="submit">
                        Add relation
                      </button>
                    </form>
                  </div>

                  <ul className="linkList">
                    {detail.outgoingRelations.length === 0 ? (
                      <li className="emptyState">No outgoing relations linked yet.</li>
                    ) : (
                      detail.outgoingRelations.map((relation) => (
                        <li key={relation.relationId} className="linkRow">
                          <div>
                            <strong>{relation.relationType}</strong>
                            <p>
                              {relation.statementNo} · {relation.title}
                            </p>
                            <span>
                              {relation.statementType} · {relation.status}
                            </span>
                          </div>
                          <form action={removeRelationAction}>
                            <input
                              type="hidden"
                              name="sourceStatementId"
                              value={detail.statement.id}
                            />
                            <input type="hidden" name="relationId" value={relation.relationId} />
                            <button className="ghostButton" type="submit">
                              Remove
                            </button>
                          </form>
                        </li>
                      ))
                    )}
                  </ul>
                </section>

                <section className="linkCard">
                  <div className="linkCardHeader">
                    <div>
                      <h3>Incoming relations</h3>
                      <p>Everything that currently points at this statement.</p>
                    </div>
                  </div>

                  <ul className="linkList">
                    {detail.incomingParents.length === 0 && detail.incomingRelations.length === 0 ? (
                      <li className="emptyState">No incoming links yet.</li>
                    ) : (
                      <>
                        {detail.incomingParents.map((child) => (
                          <li key={`parent-${child.statementId}`} className="linkRow">
                            <div>
                              <strong>parent_of</strong>
                              <p>
                                {child.statementNo} · {child.title}
                              </p>
                              <span>
                                {child.statementType} · {child.status}
                              </span>
                            </div>
                          </li>
                        ))}
                        {detail.incomingRelations.map((relation) => (
                          <li key={relation.relationId} className="linkRow">
                            <div>
                              <strong>{relation.relationType}</strong>
                              <p>
                                {relation.statementNo} · {relation.title}
                              </p>
                              <span>
                                {relation.statementType} · {relation.status}
                              </span>
                            </div>
                          </li>
                        ))}
                      </>
                    )}
                  </ul>
                </section>
              </div>

              {detail.warnings.length > 0 ? (
                <section className="warningPanel">
                  <h3>Warnings</h3>
                  <ul>
                    {detail.warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </section>
          ) : null}
        </section>
      </section>
    </main>
  );
}
