import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { northDialogueSequences } from "../manifests/north-tower-objectives";

const mother = readFileSync(join(process.cwd(), "..", "游园惊梦_完整剧情母剧本_V5.0.md"), "utf8");
const ink = readFileSync(join(process.cwd(), "app", "game", "narrative", "north-tower-ledger.ink"), "utf8");
const runtime = readFileSync(join(process.cwd(), "app", "game", "NorthTowerRuntime.tsx"), "utf8");

function authoredCharacterLinesByScene() {
  const start = mother.indexOf("## 场景 2-1：钱先生与六只茶杯");
  const end = mother.indexOf("# 7. 第三章《不存在的房间》");
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);

  const scenes = new Map<string, string[]>();
  let currentScene = "";
  for (const raw of mother.slice(start, end).split(/\r?\n/)) {
    const line = raw.trim();
    const heading = line.match(/^## 场景 2-(\d)：/);
    if (heading) {
      currentScene = heading[1];
      scenes.set(currentScene, []);
      continue;
    }
    if (!currentScene) continue;
    const spoken = line.match(/^(?:赵映|钱先生|柳生|老周)：(.*)$/);
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
    if (!raw.includes("# line:ch2.2-")) continue;
    if (raw.includes("# speaker:narrator")) continue;
    const scene = raw.match(/# line:ch2\.2-(\d)\./)?.[1];
    if (!scene) continue;
    const text = raw.split("#")[0].trim();
    const values = scenes.get(scene) ?? [];
    values.push(text);
    scenes.set(scene, values);
  }
  return scenes;
}

describe("TASK-009 second chapter V5 conformance", () => {
  it("keeps all V5 spoken and inner lines for scenes 2-1 through 2-4", () => {
    const authored = authoredCharacterLinesByScene();
    const runtimeLines = inkCharacterLinesByScene();
    expect([...authored.keys()]).toEqual(["1", "2", "3", "4"]);
    for (const scene of ["1", "2", "3", "4"]) {
      expect(runtimeLines.get(scene), `scene 2-${scene}`).toEqual(authored.get(scene));
    }
  });

  it("splits dialogue around three distinct evidence operations instead of auto-awarding the chapter", () => {
    expect(northDialogueSequences.map((sequence) => sequence.id)).toEqual([
      "north-opening",
      "north-cup-confirmed",
      "north-record-intro",
      "north-record-confirmed",
      "north-image-intro",
      "north-image-confirmed",
      "north-completion",
    ]);
    expect(runtime).toContain('setDepartureDocumentOpen(true)');
    expect(runtime).toContain('viewAlignedRef.current');
    expect(runtime).toContain('startDialogue("north-completion")');
    expect(runtime).not.toContain('window.setTimeout(finishChapter, 350)');
  });

  it("preserves pre-evidence dialogue state on reload and uses the authored Ink source at runtime", () => {
    expect(runtime).toContain('if (save.activeCheckpoint.chapterId === chapter.id)');
    expect(runtime).toContain('northInkSource from "./narrative/north-tower-ledger.ink?raw"');
    expect(runtime).toContain('compileInkSource("north-tower-ledger", northInkSource)');
    expect(runtime).toContain('resumeNorthDialogueId(initialCheckpoint)');
  });

  it("does not confirm the fifth person until the full V5 synthesis conversation completes", () => {
    const handleStart = runtime.indexOf("const handleEvidence");
    const handleEnd = runtime.indexOf("useEffect(() =>", handleStart);
    const handleSource = runtime.slice(handleStart, handleEnd);
    expect(handleSource).not.toContain('addFlag("north.fifth-person.confirmed")');
    expect(handleSource).toContain('startDialogue("north-completion")');
  });
});
