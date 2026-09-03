import type { CheckpointState, EndingId, MemoryId } from "../types";

export type EndingMetricMemory = Extract<MemoryId, "wife" | "gardener" | "accountant" | "painter">;

export interface EndingMetricSnapshot {
  scores: Record<EndingMetricMemory, number>;
  spread: number;
  leader?: EndingMetricMemory;
  runnerUp?: EndingMetricMemory;
}

const ENDING_FOR_MEMORY: Record<EndingMetricMemory, Exclude<EndingId, "composite">> = {
  wife: "domestic",
  gardener: "spatial",
  accountant: "documentary",
  painter: "pictorial",
};

const METRIC_MEMORIES = Object.keys(ENDING_FOR_MEMORY) as EndingMetricMemory[];

/**
 * Uses only investigation behaviour already recorded during play. Core mandatory
 * evidence flags are intentionally excluded because every successful playthrough
 * must eventually collect them and therefore they cannot represent preference.
 */
export function endingMetricSnapshot(checkpoint: CheckpointState): EndingMetricSnapshot {
  const scores = Object.fromEntries(METRIC_MEMORIES.map((memory) => [memory, 0])) as Record<EndingMetricMemory, number>;

  for (const memory of METRIC_MEMORIES) {
    scores[memory] += checkpoint.reconstructionTrace.cognitionUsage[memory] ?? 0;
  }

  for (const memories of Object.values(checkpoint.observedBy)) {
    for (const memory of memories) {
      if (memory in scores) scores[memory as EndingMetricMemory] += 0.5;
    }
  }

  for (const memories of Object.values(checkpoint.reconstructionTrace.solvedWithCognition)) {
    for (const memory of memories) {
      if (memory in scores) scores[memory as EndingMetricMemory] += 1;
    }
  }

  const ranked = METRIC_MEMORIES.slice().sort((a, b) => scores[b] - scores[a] || a.localeCompare(b));
  const values = ranked.map((memory) => scores[memory]);
  return {
    scores,
    spread: Math.max(...values) - Math.min(...values),
    leader: values[0] > 0 ? ranked[0] : undefined,
    runnerUp: values[1] > 0 ? ranked[1] : undefined,
  };
}

/**
 * A single medium wins only when the player relied on it clearly more often.
 * Balanced/old saves fall back to Ending E, which is deliberately not a "true"
 * ending and preserves multiple incompatible but usable testimonies.
 */
export function deriveEndingLens(checkpoint: CheckpointState): EndingId {
  const snapshot = endingMetricSnapshot(checkpoint);
  if (!snapshot.leader) return "composite";
  const leaderScore = snapshot.scores[snapshot.leader];
  const runnerScore = snapshot.runnerUp ? snapshot.scores[snapshot.runnerUp] : 0;
  if (leaderScore - runnerScore < 2) return "composite";
  return ENDING_FOR_MEMORY[snapshot.leader];
}
