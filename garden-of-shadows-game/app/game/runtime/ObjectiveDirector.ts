import type { CheckpointState, ObjectiveDefinition, TutorialStep } from "../types";
import { guidanceLevelForElapsed } from "./guidance-config";

export interface ActiveObjective {
  objective: ObjectiveDefinition;
  step: TutorialStep;
  hintLevel: number;
  hint?: string;
}

export const objectiveProgressKey = (objectiveId: string, stepId: string) => `${objectiveId}:${stepId}`;

export function resolveActiveObjective(definitions: ObjectiveDefinition[], checkpoint: CheckpointState): ActiveObjective | undefined {
  if (!checkpoint.activeObjectiveId || !checkpoint.objectiveStepId) return undefined;
  const objective = definitions.find((item) => item.id === checkpoint.activeObjectiveId);
  const step = objective?.steps.find((item) => item.id === checkpoint.objectiveStepId);
  if (!objective || !step) return undefined;
  const hintLevel = Math.max(0, Math.min(3, checkpoint.hintLevels[objectiveProgressKey(objective.id, step.id)] ?? 0));
  return { objective, step, hintLevel, hint: hintLevel > 0 ? step.hints[hintLevel - 1] : undefined };
}

export class ObjectiveDirector {
  private elapsedSeconds = 0;
  private activeKey = "";
  private emittedLevel = 0;

  tick(deltaSeconds: number, paused: boolean, objectiveId?: string, stepId?: string): number | undefined {
    const nextKey = objectiveId && stepId ? objectiveProgressKey(objectiveId, stepId) : "";
    if (nextKey !== this.activeKey) {
      this.activeKey = nextKey;
      this.elapsedSeconds = 0;
      this.emittedLevel = 0;
    }
    if (paused || !nextKey) return undefined;
    this.elapsedSeconds += deltaSeconds;
    const level = guidanceLevelForElapsed(this.elapsedSeconds);
    if (level > this.emittedLevel) {
      this.emittedLevel = level;
      return level;
    }
    return undefined;
  }

  markProgress(): void {
    this.elapsedSeconds = 0;
    this.emittedLevel = 0;
  }
}
