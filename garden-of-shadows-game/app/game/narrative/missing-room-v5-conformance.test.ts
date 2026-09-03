import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { missingRoomDialogueSequences } from "../manifests/missing-room";

const mother = readFileSync(join(process.cwd(), "..", "游园惊梦_完整剧情母剧本_V5.0.md"), "utf8");
const ink = readFileSync(join(process.cwd(), "app", "game", "narrative", "missing-room.ink"), "utf8");
const runtime = readFileSync(join(process.cwd(), "app", "game", "MissingRoomRuntime.tsx"), "utf8");

function authoredCharacterLinesByScene() {
  const start = mother.indexOf("## 场景 3-1：北墙少掉的体积");
  const end = mother.indexOf("# 8. 第四章《被删掉的人》");
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);

  const scenes = new Map<string, string[]>();
  let currentScene = "";
  for (const raw of mother.slice(start, end).split(/\r?\n/)) {
    const line = raw.trim();
    const heading = line.match(/^## 场景 3-(\d)：/);
    if (heading) {
      currentScene = heading[1];
      scenes.set(currentScene, []);
      continue;
    }
    if (!currentScene) continue;
    const spoken = line.match(/^(?:赵映|钱先生|沈夫人)：(.*)$/);
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
    if (!raw.includes("# line:ch3.3-")) continue;
    if (raw.includes("# speaker:narrator")) continue;
    const scene = raw.match(/# line:ch3\.3-(\d)\./)?.[1];
    if (!scene) continue;
    const text = raw.split("#")[0].trim();
    const values = scenes.get(scene) ?? [];
    values.push(text);
    scenes.set(scene, values);
  }
  return scenes;
}

describe("TASK-010 third chapter V5 conformance", () => {
  it("keeps all V5 spoken and inner lines for scenes 3-1 through 3-4", () => {
    const authored = authoredCharacterLinesByScene();
    const runtimeLines = inkCharacterLinesByScene();
    expect([...authored.keys()]).toEqual(["1", "2", "3", "4"]);
    for (const scene of ["1", "2", "3", "4"]) {
      expect(runtimeLines.get(scene), `scene 3-${scene}`).toEqual(authored.get(scene));
    }
  });

  it("keeps structural reconstruction separate from the identity reveal", () => {
    expect(missingRoomDialogueSequences.map((sequence) => sequence.id)).toEqual([
      "room-opening",
      "room-wife-memory",
      "room-reconstructed",
      "room-identity",
    ]);
    expect(runtime).toContain('startDialogue("room-reconstructed")');
    expect(runtime).toContain('startDialogue("room-identity")');
    expect(runtime).not.toContain('window.setTimeout(finishChapter, 500)');
  });

  it("does not award identity confirmation from the child-box interaction itself", () => {
    const inspectStart = runtime.indexOf("const inspectClue");
    const inspectEnd = runtime.indexOf("const changeMemory", inspectStart);
    const inspectSource = runtime.slice(inspectStart, inspectEnd);
    expect(inspectSource).not.toContain('earnedFlags: unique([...current.earnedFlags, "missing-room.identity-confirmed"])');
    expect(inspectSource).toContain('startDialogue("room-identity")');
  });

  it("only completes after the full identity conversation and preserves dialogue progress on reload", () => {
    expect(runtime).toContain('if (sequence.id === "room-identity") finishChapter()');
    expect(runtime).toContain('resumeMissingRoomDialogueId(initialCheckpoint)');
    expect(runtime).toContain('missingRoomInkSource from "./narrative/missing-room.ink?raw"');
    expect(runtime).toContain('compileInkSource("missing-room", missingRoomInkSource)');
    expect(runtime).toContain('dialogueProgress: { sequenceId: activeDialogue.id, inkStateJson }');
  });
});
