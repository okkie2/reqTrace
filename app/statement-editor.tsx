"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import {
  SOURCE_RELATIONS,
  STATEMENT_STATUSES,
  STATEMENT_TYPES,
  type StatementInput,
  type SourceRelation,
  type StatementSource,
  type StatementStatus,
  type StatementType,
} from "@/lib/statement-schema";
import {
  getSourceRelationLabel,
  getStatementTypeLabel,
  getStatusLabel,
  getUi,
  type Lang,
  type UiErrorCode,
} from "@/app/i18n";

type EditorState = StatementInput & {
  id: string;
  statementNo: string;
  updatedAt: string | null;
};

type AutosaveResponse =
  | {
      ok: true;
      statement: {
        id: string;
        statementNo: string;
        updatedAt: string;
      } & StatementInput;
    }
  | {
      ok: false;
      errorCode: UiErrorCode;
      message: string;
    };

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

function serializeState(state: EditorState) {
  return JSON.stringify(state);
}

function emptySource(): StatementSource {
  return {
    title: "",
    relation: "copied_from_eu_requirement",
    locator: null,
    url: null,
  };
}

export function StatementEditor({
  lang,
  initialState,
  isNew,
  errorCode,
  q,
  hasPiezo,
  piezo,
}: {
  lang: Lang;
  initialState: EditorState;
  isNew: boolean;
  errorCode: UiErrorCode | null;
  q: string;
  hasPiezo: boolean;
  piezo: string;
}) {
  const router = useRouter();
  const ui = getUi(lang);
  const [state, setState] = useState<EditorState>(initialState);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error" | "pending_title">(
    "idle",
  );
  const [saveErrorCode, setSaveErrorCode] = useState<UiErrorCode | null>(errorCode);
  const [hasMounted, setHasMounted] = useState(false);
  const lastSavedRef = useRef(serializeState(initialState));
  const stateRef = useRef(initialState);
  const resetKey = `${initialState.id}:${initialState.updatedAt ?? "new"}`;

  useEffect(() => {
    setState(initialState);
    setSaveErrorCode(errorCode);
    setSaveState("idle");
    lastSavedRef.current = serializeState(initialState);
    stateRef.current = initialState;
  }, [resetKey, initialState, errorCode]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  async function persist(reason: "auto" | "manual") {
    const currentState = stateRef.current;
    const snapshot = serializeState(currentState);

    if (snapshot === lastSavedRef.current) {
      return;
    }

    if (currentState.title.trim() === "") {
      setSaveState("pending_title");
      if (reason === "manual") {
        setSaveErrorCode("title_required");
      }
      return;
    }

    setSaveState("saving");
    setSaveErrorCode(null);

    const response = await fetch("/api/statements/autosave", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...currentState,
        lang,
      }),
    });

    const result = (await response.json()) as AutosaveResponse;

    if (!result.ok) {
      setSaveState("error");
      setSaveErrorCode(result.errorCode);
      return;
    }

    const nextState: EditorState = {
      ...currentState,
      id: result.statement.id,
      statementNo: result.statement.statementNo,
      updatedAt: result.statement.updatedAt,
      piezoId: result.statement.piezoId,
      sources: result.statement.sources,
    };

    lastSavedRef.current = serializeState(nextState);
    stateRef.current = nextState;
    setState(nextState);
    setSaveState("saved");

    startTransition(() => {
      const nextHref = buildHref({
        statement: result.statement.id,
        lang,
        q,
        hasPiezo,
        piezo,
      });
      router.replace(nextHref);
      router.refresh();
    });
  }

  useEffect(() => {
    const snapshot = serializeState(state);
    stateRef.current = state;

    if (snapshot === lastSavedRef.current) {
      return;
    }

    if (state.title.trim() === "") {
      setSaveState("pending_title");
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void persist("auto");
    }, 900);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [state, lang, q, hasPiezo, piezo, router]);

  function updateField<Key extends keyof EditorState>(key: Key, value: EditorState[Key]) {
    setState((current) => ({
      ...current,
      [key]: value,
    }));
    setSaveState("idle");
  }

  function updateSource(index: number, key: keyof StatementSource, value: string | null) {
    setState((current) => {
      const nextSources = current.sources.length === 0 ? [emptySource()] : [...current.sources];
      const currentSource = nextSources[index] ?? emptySource();
      nextSources[index] = {
        ...currentSource,
        [key]: value,
      };

      return {
        ...current,
        sources: nextSources,
      };
    });
    setSaveState("idle");
  }

  function addSource() {
    setState((current) => ({
      ...current,
      sources: [...current.sources, emptySource()],
    }));
    setSaveState("idle");
  }

  function removeSource(index: number) {
    setState((current) => ({
      ...current,
      sources: current.sources.filter((_, candidateIndex) => candidateIndex !== index),
    }));
    setSaveState("idle");
  }

  const hasUnsavedChanges = serializeState(state) !== lastSavedRef.current;
  const dateLocale = lang === "nl" ? "nl-NL" : "en-GB";

  return (
    <form>
      <div className="editor-layout">
        <section className="editor-section">
          <div className="editor-meta-grid">
            <label>
              {ui.statementType}
              <select
                name="statementType"
                value={state.statementType}
                onChange={(event) =>
                  updateField("statementType", event.target.value as StatementType)
                }
                required
              >
                {STATEMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {getStatementTypeLabel(lang, type)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              {ui.statusLabel}
              <select
                name="status"
                value={state.status}
                onChange={(event) => updateField("status", event.target.value as StatementStatus)}
                required
              >
                {STATEMENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {getStatusLabel(lang, status)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              {ui.statementNumber}
              <input value={state.statementNo || ui.assignedOnSave} disabled />
            </label>

            <label>
              {ui.piezoId}
              <input
                name="piezoId"
                value={state.piezoId ?? ""}
                onChange={(event) => updateField("piezoId", event.target.value || null)}
              />
            </label>

            <label>
              {ui.level}
              <input
                name="level"
                value={state.level ?? ""}
                onChange={(event) => updateField("level", event.target.value || null)}
              />
            </label>

            <label>
              {ui.order}
              <input
                name="orderNo"
                value={state.orderNo ?? ""}
                onChange={(event) => updateField("orderNo", event.target.value || null)}
              />
            </label>
          </div>
          <p className="field-note compact-note">{ui.piezoIdHelp}</p>

          <label className="span-full">
            {ui.titleLabel}
            <input
              name="title"
              value={state.title}
              onChange={(event) => updateField("title", event.target.value)}
              required
            />
            {(saveErrorCode === "title_required" || state.title.trim() === "") && (
              <small className="field-error">{ui.titleRequired}</small>
            )}
          </label>
        </section>

        <section className="editor-section">
          <div className="editor-text-grid">
            <label className="span-full-mobile">
              {ui.dutchText}
              <textarea
                name="textNl"
                value={state.textNl ?? ""}
                onChange={(event) => updateField("textNl", event.target.value || null)}
                rows={8}
                aria-describedby="text-guidance"
              />
            </label>

            <label className="span-full-mobile">
              {ui.originalText}
              <textarea
                name="textOriginal"
                value={state.textOriginal ?? ""}
                onChange={(event) => updateField("textOriginal", event.target.value || null)}
                rows={8}
                aria-describedby="text-guidance"
              />
            </label>
          </div>

          <p id="text-guidance" className="field-note compact-note">
            {ui.textGuidance}
          </p>
        </section>

        <section className="editor-section editor-side-grid">
          <fieldset>
            <legend>{ui.sources}</legend>
            <p className="field-note">{ui.sourceHelp}</p>
            <div className="source-list">
              {state.sources.length === 0 ? null : state.sources.map((source, index) => (
                <article key={index} className="source-card">
                  <div className="source-grid">
                    <label>
                      {ui.sourceTitle}
                      <input
                        value={source.title}
                        onChange={(event) => updateSource(index, "title", event.target.value)}
                      />
                    </label>

                    <label>
                      {ui.sourceRelation}
                      <select
                        value={source.relation}
                        onChange={(event) =>
                          updateSource(index, "relation", event.target.value as SourceRelation)
                        }
                      >
                        {SOURCE_RELATIONS.map((relation) => (
                          <option key={relation} value={relation}>
                            {getSourceRelationLabel(lang, relation)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      {ui.sourceLocator}
                      <input
                        value={source.locator ?? ""}
                        onChange={(event) =>
                          updateSource(index, "locator", event.target.value || null)
                        }
                      />
                    </label>

                    <label>
                      {ui.sourceUrl}
                      <input
                        value={source.url ?? ""}
                        onChange={(event) => updateSource(index, "url", event.target.value || null)}
                      />
                    </label>
                  </div>
                  <button type="button" className="outline secondary" onClick={() => removeSource(index)}>
                    {ui.remove}
                  </button>
                </article>
              ))}
            </div>
            <button type="button" className="secondary" onClick={addSource}>
              {ui.addSource}
            </button>
          </fieldset>

          <label className="editor-notes">
            {ui.notes}
            <textarea
              name="note"
              value={state.note ?? ""}
              onChange={(event) => updateField("note", event.target.value || null)}
              rows={8}
            />
          </label>
        </section>
      </div>

      {saveErrorCode ? (
        <aside className="feedback-panel feedback-panel--error" aria-live="polite">
          <h3>{ui.formErrorTitle}</h3>
          <p>{ui.formErrorMessage(saveErrorCode)}</p>
        </aside>
      ) : null}

      <footer className="panel-footer">
        <div className="autosave-status" aria-live="polite">
          {saveState === "saving" ? <p className="field-note">{ui.autosaveSaving}</p> : null}
          {saveState === "saved" && state.updatedAt ? (
            <p className="field-note">
              {ui.autosaveSaved}
              {hasMounted ? (
                <>
                  {" "}
                  {new Date(state.updatedAt).toLocaleString(dateLocale, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </>
              ) : null}
            </p>
          ) : null}
          {saveState === "pending_title" ? (
            <p className="field-note">{ui.autosavePendingTitle}</p>
          ) : null}
          {saveState === "error" ? <p className="field-error">{ui.autosaveError}</p> : null}
          {saveState === "idle" && hasUnsavedChanges ? (
            <p className="field-note">{ui.autosaveUnsaved}</p>
          ) : null}
          {saveState === "idle" && !hasUnsavedChanges && !state.updatedAt ? (
            <p className="field-note">{ui.localDataNote}</p>
          ) : null}
        </div>
      </footer>
    </form>
  );
}
