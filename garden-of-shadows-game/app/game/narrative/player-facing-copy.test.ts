import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

const playerFacingSources = [
  "app/page.tsx",
  "app/game/PrologueRuntime.tsx",
  "app/game/GameRuntime.tsx",
  "app/game/NorthTowerRuntime.tsx",
  "app/game/MissingRoomRuntime.tsx",
  "app/game/NarrativeChapterRuntime.tsx",
  "app/game/YouDidNotReturnRuntime.tsx",
  "app/game/FifthTingYuXuanRuntime.tsx",
  "app/game/ui/CaseFilePanel.tsx",
  "app/game/runtime/guidance-config.ts",
  "app/game/manifests/prologue-rain.ts",
  "app/game/manifests/west-corridor.ts",
  "app/game/manifests/north-tower-ledger.ts",
  "app/game/manifests/missing-room.ts",
  "app/game/manifests/campaign.ts",
  "app/game/narrative/west-onboarding.ink",
  "app/game/narrative/north-tower-ledger.ink",
  "app/game/narrative/missing-room.ink",
  "app/game/narrative/deleted-person.ink",
  "app/game/narrative/you-did-not-return.ink",
  "app/game/narrative/fifth-tingyuxuan.ink",
] as const;

const obsoletePlayerCopy = [
  "身体习惯比口供顽固",
  "像这里早就等过你一次",
  "顾蘅秋",
  "周守圃",
  "先别找死人",
  "确认3处空间参照",
  "还需要另一份独立观察",
  "追逐揭示",
  "追逐镜头扰动",
  "选择第五份证词",
  "没有任务光圈，也没有距离数字",
  "共同事实已经固定。结局只记录这一周目",
  "当前 NarrativeChapterRuntime 只负责第四章",
  "Runtime Gameplay Map",
  "Roadmap",
  "True Ending",
] as const;

describe("TASK-014 player-facing copy gate", () => {
  it("keeps obsolete or developer-facing copy out of formal player surfaces", () => {
    for (const relativePath of playerFacingSources) {
      const source = readFileSync(join(root, relativePath), "utf8");
      for (const obsolete of obsoletePlayerCopy) {
        expect(source, `${relativePath} must not expose: ${obsolete}`).not.toContain(obsolete);
      }
    }
  });

  it("keeps generated Ink JSON as non-narrative tombstones", () => {
    for (const file of ["west-onboarding.json", "north-tower-ledger.json"]) {
      const parsed = JSON.parse(readFileSync(join(root, "app", "game", "narrative", file), "utf8")) as Record<string, unknown>;
      expect(parsed.deprecated).toBe(true);
      expect(parsed).not.toHaveProperty("root");
      expect(parsed).not.toHaveProperty("inkVersion");
    }
  });

  it("does not regenerate obsolete compiled dialogue during prebuild", () => {
    const packageJson = readFileSync(join(root, "package.json"), "utf8");
    expect(packageJson).toContain('"prebuild": "npm run validate:content"');
    expect(packageJson).not.toContain("inkjs-compiler app/game/narrative/west-onboarding.ink");
    expect(packageJson).not.toContain("inkjs-compiler app/game/narrative/north-tower-ledger.ink");
  });
});
