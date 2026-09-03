export type NarrativeNodeKind =
  | "spoken"
  | "inner"
  | "narration"
  | "action"
  | "choice"
  | "cg"
  | "interaction";

export interface NarrativeStoryLine<Speaker extends string = string> {
  id: string;
  kind: NarrativeNodeKind;
  speaker?: Speaker;
  text: string;
}

export interface NarrativeScene<Speaker extends string = string> {
  id: string;
  title: string;
  lines: readonly NarrativeStoryLine<Speaker>[];
}

/**
 * Runtime narrative rule:
 * - `spoken` is the only kind that should render as ordinary character speech.
 * - `inner` is Zhao Ying's private thought and must not be presented as audible dialogue.
 * - `narration` / `action` describe world state or blocking.
 * - `choice`, `cg`, `interaction` are explicit authored presentation/control nodes.
 *
 * Story facts and wording still come from the V5 mother script. This schema only
 * standardizes how every Runtime consumes those authored facts.
 */
export const NARRATIVE_NODE_KINDS: readonly NarrativeNodeKind[] = [
  "spoken",
  "inner",
  "narration",
  "action",
  "choice",
  "cg",
  "interaction",
] as const;

export type NarrativePresentationRole = "speech" | "thought" | "world" | "stage" | "control" | "image";

export function narrativePresentationRole(kind: NarrativeNodeKind): NarrativePresentationRole {
  switch (kind) {
    case "spoken": return "speech";
    case "inner": return "thought";
    case "narration": return "world";
    case "action": return "stage";
    case "cg": return "image";
    case "choice":
    case "interaction":
      return "control";
  }
}

export function narrativeDisplayLabel(kind: NarrativeNodeKind, spokenName?: string): string | undefined {
  switch (kind) {
    case "spoken": return spokenName;
    case "inner": return "赵映 · 心声";
    case "narration": return "环境";
    case "action": return "演出";
    case "choice": return "选择";
    case "cg": return "画面";
    case "interaction": return "交互";
  }
}
