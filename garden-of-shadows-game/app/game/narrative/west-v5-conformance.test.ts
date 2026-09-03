import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { westDialogueSequences } from "../manifests/west-onboarding";

const mother = readFileSync(join(process.cwd(), "..", "游园惊梦_完整剧情母剧本_V5.0.md"), "utf8");
const ink = readFileSync(join(process.cwd(), "app", "game", "narrative", "west-onboarding.ink"), "utf8");
const runtime = readFileSync(join(process.cwd(), "app", "game", "GameRuntime.tsx"), "utf8");
const dialogueRunner = readFileSync(join(process.cwd(), "app", "game", "narrative", "DialogueRunner.tsx"), "utf8");

function authoredCharacterLinesByScene() {
  const start = mother.indexOf("## 场景 1-1：第二天早饭");
  const end = mother.indexOf("# 6. 第二章《多出来的人》");
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);

  const scenes = new Map<string, string[]>();
  let currentScene = "";
  for (const raw of mother.slice(start, end).split(/\r?\n/)) {
    const line = raw.trim();
    const heading = line.match(/^## 场景 1-(\d)：/);
    if (heading) {
      currentScene = heading[1];
      scenes.set(currentScene, []);
      continue;
    }
    if (!currentScene) continue;
    const spoken = line.match(/^(?:赵映|沈夫人|老周)：(.*)$/);
    if (spoken) {
      scenes.get(currentScene)!.push(spoken[1].trim());
      continue;
    }
    const inner = line.match(/^（(.*)）$/);
    if (inner) scenes.get(currentScene)!.push(inner[1].trim());
  }
  return scenes;
}

function inkCharacterLinesByScene() {
  const scenes = new Map<string, string[]>();
  for (const raw of ink.split(/\r?\n/)) {
    if (!raw.includes("# line:ch1.1-")) continue;
    if (raw.includes("# speaker:narrator")) continue;
    const scene = raw.match(/# line:ch1\.1-(\d)\./)?.[1];
    if (!scene) continue;
    const text = raw.split("#")[0].trim();
    const values = scenes.get(scene) ?? [];
    values.push(text);
    scenes.set(scene, values);
  }
  return scenes;
}

describe("TASK-008 first chapter V5 conformance", () => {
  it("keeps every authored spoken/inner line for scenes 1-1 through 1-6 without paraphrasing", () => {
    const authored = authoredCharacterLinesByScene();
    const runtimeLines = inkCharacterLinesByScene();
    expect([...authored.keys()]).toEqual(["1", "2", "3", "4", "5", "6"]);
    for (const scene of ["1", "2", "3", "4", "5", "6"]) {
      expect(runtimeLines.get(scene), `scene 1-${scene}`).toEqual(authored.get(scene));
    }
  });

  it("uses a chapter-one breakfast completion flag instead of the prologue flag", () => {
    const opening = westDialogueSequences.find((sequence) => sequence.id === "opening");
    expect(opening?.completionFlag).toBe("west.dialogue.breakfast-complete");
    expect(runtime).toContain('!initialCheckpoint.earnedFlags.includes("west.dialogue.breakfast-complete")');
  });

  it("treats the Ink source as the default runtime truth rather than a stale generated json", () => {
    expect(dialogueRunner).toContain('import westInkSource from "./west-onboarding.ink?raw"');
    expect(dialogueRunner).toContain('compileInkSource("west-onboarding", westInkSource)');
    expect(dialogueRunner).not.toContain('import compiledStory from "./west-onboarding.json"');
  });
});
