import type { DialogueCommand, MemoryId, SpeakerId } from "../types";

export interface ParsedDialogueTags {
  speakerId: SpeakerId;
  portrait?: string;
  lineId: string;
  voiceAssetId?: string;
  commands: DialogueCommand[];
}

export function parseDialogueTags(tags: string[], fallbackLineId: string): ParsedDialogueTags {
  let speakerId: SpeakerId = "narrator";
  let portrait: string | undefined;
  let lineId = fallbackLineId;
  let voiceAssetId: string | undefined;
  const commands: DialogueCommand[] = [];

  for (const rawTag of tags) {
    const tag = rawTag.trim();
    if (tag.startsWith("speaker:")) speakerId = tag.slice("speaker:".length) as SpeakerId;
    else if (tag.startsWith("portrait:")) portrait = tag.slice("portrait:".length);
    else if (tag.startsWith("line:")) lineId = tag.slice("line:".length);
    else if (tag.startsWith("voice:")) voiceAssetId = tag.slice("voice:".length);
    else if (tag.startsWith("flag:set:")) commands.push({ type: "flag:set", flag: tag.slice("flag:set:".length) });
    else if (tag.startsWith("memory:unlock:")) commands.push({ type: "memory:unlock", memoryId: tag.slice("memory:unlock:".length) as MemoryId });
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

  return { speakerId, portrait, lineId, voiceAssetId, commands };
}
