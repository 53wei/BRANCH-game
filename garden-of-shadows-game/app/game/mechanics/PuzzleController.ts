import type { MechanicSaveState, PuzzleDefinition, PuzzleRuntimeState } from "./types";

const emptyState = (): PuzzleRuntimeState => ({ tokens: [], solved: false });

export class PuzzleController {
  private readonly definitions = new Map<string, PuzzleDefinition>();
  private readonly states = new Map<string, PuzzleRuntimeState>();

  constructor(definitions: readonly PuzzleDefinition[], saved?: Pick<MechanicSaveState, "puzzleStates">) {
    definitions.forEach((definition) => {
      if (this.definitions.has(definition.id)) throw new Error(`Duplicate puzzle: ${definition.id}`);
      this.definitions.set(definition.id, definition);
      const restored = saved?.puzzleStates[definition.id];
      this.states.set(definition.id, restored ? { ...restored, tokens: [...restored.tokens] } : emptyState());
    });
  }

  recordToken(puzzleId: string, token: string): PuzzleRuntimeState {
    const definition = this.definition(puzzleId);
    if (!definition.inputs.includes(token)) throw new Error(`Token ${token} is not an input for ${puzzleId}`);
    const state = this.states.get(puzzleId)!;
    if (!state.tokens.includes(token)) state.tokens.push(token);
    if (!state.solved) {
      const solution = definition.solutions.find((candidate) => candidate.requiredTokens.every((required) => state.tokens.includes(required)));
      if (solution) {
        state.solved = true;
        state.solutionId = solution.id;
        state.worldStateId = solution.worldStateId;
      }
    }
    return this.state(puzzleId);
  }

  reset(puzzleId: string, reason: "manual" | "checkpoint"): PuzzleRuntimeState {
    const definition = this.definition(puzzleId);
    if (definition.resetPolicy === "never" || (reason === "checkpoint" && definition.resetPolicy !== "checkpoint")) return this.state(puzzleId);
    this.states.set(puzzleId, emptyState());
    return this.state(puzzleId);
  }

  state(puzzleId: string): PuzzleRuntimeState {
    this.definition(puzzleId);
    const state = this.states.get(puzzleId)!;
    return { ...state, tokens: [...state.tokens] };
  }

  serialize(): Pick<MechanicSaveState, "puzzleStates"> {
    return { puzzleStates: Object.fromEntries([...this.states].map(([id, state]) => [id, { ...state, tokens: [...state.tokens] }])) };
  }

  private definition(id: string): PuzzleDefinition {
    const definition = this.definitions.get(id);
    if (!definition) throw new Error(`Unknown puzzle: ${id}`);
    return definition;
  }
}

