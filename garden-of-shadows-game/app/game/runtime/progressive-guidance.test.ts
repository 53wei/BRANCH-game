import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

describe("TASK-040 progressive guidance architecture", () => {
  const guidedRuntimes = [
    "app/game/PrologueRuntime.tsx",
    "app/game/GameRuntime.tsx",
    "app/game/NorthTowerRuntime.tsx",
    "app/game/MissingRoomRuntime.tsx",
    "app/game/YouDidNotReturnRuntime.tsx",
  ] as const;

  it("applies proximity quietening to every guided formal runtime", () => {
    for (const path of guidedRuntimes) {
      expect(read(path), path).toContain("guidanceLevelForProximity");
    }
  });

  it("keeps explicit world guidance subtle and reserves spoken or inner hints for level two", () => {
    for (const path of guidedRuntimes) {
      expect(read(path), path).toContain('"subtle"');
    }
    expect(read("app/game/GameRuntime.tsx")).toContain("if (emittedHint >= 2)");
    expect(read("app/game/YouDidNotReturnRuntime.tsx")).toContain('<NarrativeInline kind="inner" text={guidanceBark} />');
  });

  it("shows a light direction cue in the three later exploration runtimes", () => {
    for (const path of [
      "app/game/NorthTowerRuntime.tsx",
      "app/game/MissingRoomRuntime.tsx",
      "app/game/YouDidNotReturnRuntime.tsx",
    ] as const) {
      expect(read(path), path).toContain('className="objective-direction"');
    }
  });
});
