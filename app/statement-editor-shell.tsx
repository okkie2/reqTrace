"use client";

import dynamic from "next/dynamic";

export const StatementEditorShell = dynamic(
  () => import("@/app/statement-editor").then((module) => module.StatementEditor),
  { ssr: false },
);
