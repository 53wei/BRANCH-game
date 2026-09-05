import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

const formalChapterRuntimes = [
  "app/game/PrologueRuntime.tsx",
  "app/game/GameRuntime.tsx",
  "app/game/NorthTowerRuntime.tsx",
  "app/game/MissingRoomRuntime.tsx",
  "app/game/NarrativeChapterRuntime.tsx",
  "app/game/YouDidNotReturnRuntime.tsx",
  "app/game/FifthTingYuXuanRuntime.tsx",
] as const;

describe("TASK-028 unified case-file architecture", () => {
  it("routes every formal chapter runtime to the same CaseFilePanel with N-key access", () => {
    for (const path of formalChapterRuntimes) {
      const source = read(path);
      expect(source, `${path} must render the shared CaseFilePanel`).toContain("CaseFilePanel");
      expect(source, `${path} must expose the unified N-key case-file shortcut`).toContain("KeyN");
    }
  });

  it("keeps the five required player-facing information categories in one panel", () => {
    const source = read("app/game/ui/CaseFilePanel.tsx");
    for (const tab of ["evidence", "people", "questions", "map", "review"] as const) {
      expect(source).toContain(`id: "${tab}"`);
    }
    for (const label of ["证物", "人物", "问题", "地图", "回顾"] as const) {
      expect(source).toContain(`label: "${label}"`);
    }
  });

  it("does not revive the retired notebook as a second player-facing product", () => {
    const runtime = read("app/game/GameRuntime.tsx");
    const css = read("app/globals.css");
    expect(runtime).not.toContain("notebookRef");
    expect(runtime).not.toContain("showNotebook");
    expect(runtime).not.toContain("notebook-backdrop");
    expect(css).not.toContain(".notebook");
  });

  it("performs the second-chapter synthesis inside the case-file question page", () => {
    const runtime = read("app/game/NorthTowerRuntime.tsx");
    const panel = read("app/game/ui/CaseFilePanel.tsx");
    expect(runtime).toContain('initialTab={caseFileInitialTab}');
    expect(runtime).toContain('questionId: "was-there-fifth-person"');
    expect(runtime).not.toContain('"fifth-person-board"');
    expect(panel).toContain('className="case-file-synthesis"');
    expect(panel).toContain("evidenceChannelLabel(item.channel)");
  });
});
