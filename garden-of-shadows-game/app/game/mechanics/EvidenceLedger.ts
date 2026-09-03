import type { EvidenceDefinition, MechanicSaveState } from "./types";

export class EvidenceLedger {
  private readonly definitions = new Map<string, EvidenceDefinition>();
  private readonly discovered = new Set<string>();
  private readonly unlockedInterpretations = new Set<string>();

  constructor(definitions: readonly EvidenceDefinition[], saved?: Pick<MechanicSaveState, "discoveredEvidence" | "unlockedInterpretations">) {
    definitions.forEach((definition) => {
      if (this.definitions.has(definition.id)) throw new Error(`Duplicate evidence: ${definition.id}`);
      this.definitions.set(definition.id, definition);
    });
    saved?.discoveredEvidence.forEach((id) => { if (this.definitions.has(id)) this.discovered.add(id); });
    saved?.unlockedInterpretations.forEach((id) => this.unlockedInterpretations.add(id));
  }

  discover(id: string): boolean {
    if (!this.definitions.has(id)) throw new Error(`Unknown evidence: ${id}`);
    const before = this.discovered.size;
    this.discovered.add(id);
    return this.discovered.size !== before;
  }

  unlockAvailable(contextKeys: ReadonlySet<string>): string[] {
    const unlocked: string[] = [];
    this.discovered.forEach((evidenceId) => {
      const definition = this.definitions.get(evidenceId)!;
      definition.interpretations.forEach((interpretation) => {
        const key = `${evidenceId}:${interpretation.id}`;
        if (this.unlockedInterpretations.has(key)) return;
        if (!interpretation.unlockCondition || contextKeys.has(interpretation.unlockCondition)) {
          this.unlockedInterpretations.add(key);
          unlocked.push(key);
        }
      });
    });
    return unlocked;
  }

  has(id: string): boolean {
    return this.discovered.has(id);
  }

  definition(id: string): EvidenceDefinition {
    const definition = this.definitions.get(id);
    if (!definition) throw new Error(`Unknown evidence: ${id}`);
    return {
      ...definition,
      observableFacts: [...definition.observableFacts],
      source: definition.source ? { ...definition.source } : undefined,
      relatedCharacters: definition.relatedCharacters ? [...definition.relatedCharacters] : undefined,
      relatedQuestionIds: definition.relatedQuestionIds ? [...definition.relatedQuestionIds] : undefined,
      narrativeTags: [...definition.narrativeTags],
      interpretations: definition.interpretations.map((item) => ({ ...item })),
    };
  }

  discoveredDefinitions(): EvidenceDefinition[] {
    return [...this.discovered].map((id) => this.definition(id));
  }

  interpretationsFor(id: string): string[] {
    const definition = this.definition(id);
    return definition.interpretations
      .filter((interpretation) => this.unlockedInterpretations.has(`${id}:${interpretation.id}`))
      .map((interpretation) => interpretation.text);
  }

  serialize(): Pick<MechanicSaveState, "discoveredEvidence" | "unlockedInterpretations"> {
    return {
      discoveredEvidence: [...this.discovered],
      unlockedInterpretations: [...this.unlockedInterpretations],
    };
  }
}

