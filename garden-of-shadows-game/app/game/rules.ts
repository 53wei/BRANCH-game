import type { CampaignManifest, CheckpointState, EndingId, MemoryId, SpatialContradiction } from "./types";

export const confirmContradiction = (
  contradiction: SpatialContradiction,
  observedBy: MemoryId[],
): boolean => contradiction.requiredIndependentTestimonies.every((memory) => observedBy.includes(memory));

export const availableEndings = (
  campaign: CampaignManifest,
  checkpoint: Pick<CheckpointState, "earnedFlags" | "contradictions" | "nameAnchors">,
): EndingId[] => {
  const flags = new Set(checkpoint.earnedFlags);
  return (Object.entries(campaign.endingRules) as Array<[EndingId, CampaignManifest["endingRules"][EndingId]]>)
    .filter(([, rule]) => rule.requiredFlags.every((flag) => flags.has(flag)))
    .filter(([, rule]) => checkpoint.contradictions.length >= (rule.requiredContradictions ?? 0))
    .filter(([, rule]) => checkpoint.nameAnchors.length >= (rule.requiredNameAnchors ?? 0))
    .map(([endingId]) => endingId);
};

export const validatePuzzleGraph = (prerequisites: Array<{ id: string; prerequisites: string[]; outputFlags: string[] }>) => {
  const available = new Set<string>();
  const remaining = [...prerequisites];
  let changed = true;
  while (remaining.length && changed) {
    changed = false;
    for (let index = remaining.length - 1; index >= 0; index -= 1) {
      if (remaining[index].prerequisites.every((flag) => available.has(flag))) {
        remaining[index].outputFlags.forEach((flag) => available.add(flag));
        remaining.splice(index, 1);
        changed = true;
      }
    }
  }
  return { valid: remaining.length === 0, blockedNodeIds: remaining.map((node) => node.id), producedFlags: [...available] };
};
