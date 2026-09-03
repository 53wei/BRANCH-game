import type { EvidenceDefinition, MechanicSaveState, NarrativeGateDefinition } from "./types";

export interface GateEvaluationContext {
  keys: ReadonlySet<string>;
  discoveredEvidence: readonly EvidenceDefinition[];
}

export const isNarrativeGateSatisfied = (gate: NarrativeGateDefinition, context: GateEvaluationContext): boolean => {
  if (!(gate.requiredAll ?? []).every((key) => context.keys.has(key))) return false;
  if (!(gate.requiredAny ?? []).every((group) => group.some((key) => context.keys.has(key)))) return false;
  if (gate.minEvidenceChannels) {
    const scope = gate.evidenceScope ? new Set(gate.evidenceScope) : undefined;
    const channels = new Set(
      context.discoveredEvidence
        .filter((evidence) => !scope || scope.has(evidence.id))
        .map((evidence) => evidence.channel),
    );
    if (channels.size < gate.minEvidenceChannels) return false;
  }
  return true;
};

export class NarrativeGateController {
  private readonly gates: NarrativeGateDefinition[];
  private readonly unlocked = new Set<string>();

  constructor(gates: readonly NarrativeGateDefinition[], saved?: Pick<MechanicSaveState, "narrativeGates">) {
    this.gates = gates.map((gate) => ({ ...gate }));
    saved?.narrativeGates.forEach((id) => this.unlocked.add(id));
  }

  evaluate(context: GateEvaluationContext): NarrativeGateDefinition[] {
    const newlyUnlocked = this.gates.filter((gate) => !this.unlocked.has(gate.id) && isNarrativeGateSatisfied(gate, context));
    newlyUnlocked.forEach((gate) => this.unlocked.add(gate.id));
    return newlyUnlocked;
  }

  has(id: string): boolean {
    return this.unlocked.has(id);
  }

  serialize(): Pick<MechanicSaveState, "narrativeGates"> {
    return { narrativeGates: [...this.unlocked] };
  }
}

