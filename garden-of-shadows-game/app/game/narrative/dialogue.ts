import { MEMORY_IDS, SPEAKER_IDS, type DialogueCommand, type MemoryId, type SpeakerId } from "../types";
import { isNarrativeNodeKind, narrativeCanUseVoice, type NarrativeNodeKind } from "./content-schema";

export interface SemanticMorphSpec {
  source: string;
  sequence: string[];
  delayMs: number;
  holdMs: number;
  shake: "subtle" | "medium";
  logMode: "stable" | "final" | "none";
  once: boolean;
}

export interface ParsedDialogueTags {
  speakerId: SpeakerId;
  kind: NarrativeNodeKind;
  portrait?: string;
  lineId: string;
  voiceAssetId?: string;
  semanticMorph?: SemanticMorphSpec;
  commands: DialogueCommand[];
}

const clampMs = (value: string, fallback: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.min(10_000, Math.round(parsed)));
};

export function parseDialogueTags(tags: string[], fallbackLineId: string): ParsedDialogueTags {
  let speakerId: SpeakerId | undefined;
  let kind: NarrativeNodeKind | undefined;
  let portrait: string | undefined;
  let lineId: string | undefined;
  let voiceAssetId: string | undefined;
  let morphSource = "";
  let morphSequence: string[] = [];
  let morphDelayMs = 850;
  let morphHoldMs = 720;
  let morphShake: SemanticMorphSpec["shake"] = "subtle";
  let morphLogMode: SemanticMorphSpec["logMode"] = "stable";
  let morphOnce = true;
  const commands: DialogueCommand[] = [];

  for (const rawTag of tags) {
    const tag = rawTag.trim();
    if (tag.startsWith("speaker:")) {
      const value = tag.slice("speaker:".length);
      if ((SPEAKER_IDS as readonly string[]).includes(value)) speakerId = value as SpeakerId;
      else throw new Error(`Unknown dialogue speaker: ${value}`);
    }
    else if (tag.startsWith("kind:")) {
      const value = tag.slice("kind:".length);
      if (isNarrativeNodeKind(value)) kind = value;
      else throw new Error(`Unknown narrative kind: ${value}`);
    }
    else if (tag.startsWith("portrait:")) portrait = tag.slice("portrait:".length);
    else if (tag.startsWith("line:")) lineId = tag.slice("line:".length);
    else if (tag.startsWith("voice:")) voiceAssetId = tag.slice("voice:".length);
    else if (tag.startsWith("morph:")) {
      const parts = tag.slice("morph:".length).split(">").map((part) => part.trim()).filter(Boolean);
      if (parts.length >= 2) {
        morphSource = parts[0];
        morphSequence = parts.slice(1);
      }
    } else if (tag.startsWith("morph-delay:")) morphDelayMs = clampMs(tag.slice("morph-delay:".length), morphDelayMs);
    else if (tag.startsWith("morph-hold:")) morphHoldMs = clampMs(tag.slice("morph-hold:".length), morphHoldMs);
    else if (tag.startsWith("morph-shake:")) {
      const value = tag.slice("morph-shake:".length);
      if (value === "subtle" || value === "medium") morphShake = value;
    } else if (tag.startsWith("morph-log:")) {
      const value = tag.slice("morph-log:".length);
      if (value === "stable" || value === "final" || value === "none") morphLogMode = value;
    } else if (tag.startsWith("morph-once:")) morphOnce = tag.slice("morph-once:".length) !== "false";
    else if (tag.startsWith("flag:set:")) commands.push({ type: "flag:set", flag: tag.slice("flag:set:".length) });
    else if (tag.startsWith("memory:unlock:")) {
      const value = tag.slice("memory:unlock:".length);
      if ((MEMORY_IDS as readonly string[]).includes(value)) commands.push({ type: "memory:unlock", memoryId: value as MemoryId });
      else throw new Error(`Unknown memory id: ${value}`);
    }
    else if (tag.startsWith("objective:start:")) {
      const [, , objectiveId, stepId] = tag.split(":");
      if (objectiveId && stepId) commands.push({ type: "objective:start", objectiveId, stepId });
    } else if (tag.startsWith("objective:step:")) {
      const stepId = tag.slice("objective:step:".length);
      if (stepId) commands.push({ type: "objective:step", stepId });
    } else if (tag.startsWith("trust:set:")) {
      const [, , nodeId, choiceId, outputFlag] = tag.split(":");
      if (nodeId && choiceId && outputFlag) commands.push({ type: "trust:set", nodeId, choiceId, outputFlag });
    } else if (tag === "scene:resume") commands.push({ type: "scene:resume" });
  }

  const semanticMorph = morphSource && morphSequence.length > 0 ? {
    source: morphSource,
    sequence: morphSequence,
    delayMs: morphDelayMs,
    holdMs: morphHoldMs,
    shake: morphShake,
    logMode: morphLogMode,
    once: morphOnce,
  } satisfies SemanticMorphSpec : undefined;

  if (!speakerId) throw new Error(`Dialogue line ${fallbackLineId} is missing speaker tag`);
  if (!kind) throw new Error(`Dialogue line ${fallbackLineId} is missing kind tag`);
  if (!lineId) throw new Error(`Dialogue line ${fallbackLineId} is missing line tag`);
  if (!narrativeCanUseVoice(kind)) voiceAssetId = undefined;
  if (kind !== "spoken") portrait = undefined;
  if (kind === "spoken" && speakerId === "narrator") throw new Error(`Narrator cannot be spoken dialogue: ${lineId}`);
  return { speakerId, kind, portrait, lineId, voiceAssetId, semanticMorph, commands };
}
