import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { choicePositionForNumberKey, steppedChoicePosition } from "./choice-navigation";

describe("TASK-030 dialogue choice interaction", () => {
  it("wraps arrow navigation without losing the active option", () => {
    expect(steppedChoicePosition(0, 3, -1)).toBe(2);
    expect(steppedChoicePosition(2, 3, 1)).toBe(0);
    expect(steppedChoicePosition(1, 3, 1)).toBe(2);
  });

  it("maps only available number keys to options", () => {
    expect(choicePositionForNumberKey("Digit1", 3)).toBe(0);
    expect(choicePositionForNumberKey("Numpad3", 3)).toBe(2);
    expect(choicePositionForNumberKey("Digit4", 3)).toBeUndefined();
    expect(choicePositionForNumberKey("KeyF", 3)).toBeUndefined();
  });

  it("persists the Ink state immediately after a decision", () => {
    const source = readFileSync(join(process.cwd(), "app", "game", "narrative", "DialogueRunner.tsx"), "utf8");
    const choose = source.slice(source.indexOf("const choose"), source.indexOf("const focusChoice"));
    expect(choose.indexOf("ChooseChoiceIndex")).toBeGreaterThanOrEqual(0);
    expect(choose.indexOf("onProgress(story.state.ToJson())")).toBeGreaterThan(choose.indexOf("ChooseChoiceIndex"));
    expect(source).toContain("选择回应方式");
    expect(source).toContain("choiceButtonRefs.current[position]?.focus()");
  });
});
