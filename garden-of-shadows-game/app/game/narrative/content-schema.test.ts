import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { NARRATIVE_NODE_KINDS, narrativeDisplayLabel, narrativePresentationRole } from "./content-schema";
import { parseDialogueTags } from "./dialogue";

describe("TASK-006 unified narrative semantics", () => {
  it("defines the seven authored node kinds once", () => {
    expect(NARRATIVE_NODE_KINDS).toEqual(["spoken", "inner", "narration", "action", "choice", "cg", "interaction"]);
  });

  it("never presents inner/narration/action as ordinary audible speech", () => {
    expect(narrativePresentationRole("spoken")).toBe("speech");
    expect(narrativePresentationRole("inner")).toBe("thought");
    expect(narrativePresentationRole("narration")).toBe("world");
    expect(narrativePresentationRole("action")).toBe("stage");
    expect(narrativeDisplayLabel("inner")).toBe("心声");
    expect(narrativeDisplayLabel("narration")).toBeUndefined();
    expect(parseDialogueTags(["speaker:narrator", "kind:narration", "line:narration.1"], "narration.1").kind).toBe("narration");
  });

  it("routes all four 3D runtimes through the shared lightweight semantic renderer", () => {
    for (const file of ["PrologueRuntime.tsx", "GameRuntime.tsx", "NorthTowerRuntime.tsx", "MissingRoomRuntime.tsx"]) {
      const source = readFileSync(join(process.cwd(), "app", "game", file), "utf8");
      expect(source, file).toContain("NarrativeInline");
    }
  });
});
