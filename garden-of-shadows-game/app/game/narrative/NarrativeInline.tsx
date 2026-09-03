import type { ReactNode } from "react";
import { narrativeDisplayLabel, narrativePresentationRole, type NarrativeNodeKind } from "./content-schema";

interface NarrativeInlineProps {
  kind: NarrativeNodeKind;
  text: string;
  speakerName?: string;
  prefix?: ReactNode;
  className?: string;
}

/** Shared lightweight renderer for moving-play narrative cues. */
export function NarrativeInline({ kind, text, speakerName, prefix, className = "" }: NarrativeInlineProps) {
  const role = narrativePresentationRole(kind);
  const label = narrativeDisplayLabel(kind, speakerName);
  return (
    <p className={`narrative-inline narrative-inline-${role} narrative-kind-${kind} ${className}`.trim()} data-narrative-kind={kind}>
      {prefix}
      {label && <b>{label}</b>}
      <span>{kind === "inner" ? `（${text}）` : text}</span>
    </p>
  );
}
