import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { Story } from "inkjs";
import { youDidNotReturnDialogueSequences } from "../manifests/you-did-not-return";
import { compileInkSource } from "./ink-runtime";

const mother = readFileSync(join(process.cwd(), "..", "游园惊梦_完整剧情母剧本_V5.0.md"), "utf8");
const ink = readFileSync(join(process.cwd(), "app", "game", "narrative", "you-did-not-return.ink"), "utf8");
const runtime = readFileSync(join(process.cwd(), "app", "game", "YouDidNotReturnRuntime.tsx"), "utf8");
const page = readFileSync(join(process.cwd(), "app", "page.tsx"), "utf8");
const legacyRuntime = readFileSync(join(process.cwd(), "app", "game", "NarrativeChapterRuntime.tsx"), "utf8");

function authoredCharacterLinesByScene() {
  const start = mother.indexOf("## 场景 5-1：重走折返路线");
  const end = mother.indexOf("# 10. 终章《第五种听雨轩》");
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);

  const scenes = new Map<string, string[]>();
  let currentScene = "";
  for (const raw of mother.slice(start, end).split(/\r?\n/)) {
    const line = raw.trim();
    const heading = line.match(/^## 场景 5-(\d)：/);
    if (heading) {
      currentScene = heading[1];
      scenes.set(currentScene, []);
      continue;
    }
    if (!currentScene) continue;
    const spoken = line.match(/^(?:赵映|年轻赵映|沈老爷|沈夫人|老周|钱先生|柳生)：(.*)$/);
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
    if (!raw.includes("# line:ch5.5-")) continue;
    if (raw.includes("# speaker:narrator")) continue;
    const scene = raw.match(/# line:ch5\.5-(\d)\./)?.[1];
    if (!scene) continue;
    const values = scenes.get(scene) ?? [];
    values.push(raw.split("#")[0].trim());
    scenes.set(scene, values);
  }
  return scenes;
}

describe("TASK-012 fifth chapter V5 conformance", () => {
  it("keeps every V5 spoken and inner line for scenes 5-1 through 5-8", () => {
    const authored = authoredCharacterLinesByScene();
    const runtimeLines = inkCharacterLinesByScene();
    expect([...authored.keys()]).toEqual(["1", "2", "3", "4", "5", "6", "7", "8"]);
    for (const scene of ["1", "2", "3", "4", "5", "6", "7", "8"]) {
      expect(runtimeLines.get(scene), `scene 5-${scene}`).toEqual(authored.get(scene));
    }
  });

  it("compiles every full fifth-chapter Ink scene and keeps key CG hooks", () => {
    const compiled = JSON.parse(compileInkSource("test-you-did-not-return", ink)) as Record<string, unknown>;
    expect(youDidNotReturnDialogueSequences).toHaveLength(8);
    for (const sequence of youDidNotReturnDialogueSequences) {
      const story = new Story(compiled);
      story.ChoosePathString(sequence.knotId);
      let lines = 0;
      while (story.canContinue) { story.Continue(); lines += 1; }
      expect(lines, sequence.id).toBeGreaterThan(0);
    }
    expect(youDidNotReturnDialogueSequences.find((item) => item.id === "flashback-argument")?.backdrop).toContain("cg-05-water-pavilion-argument");
    expect(youDidNotReturnDialogueSequences.find((item) => item.id === "flashback-accident")?.backdrop).toContain("cg-06-wooden-steps-accident");
    expect(youDidNotReturnDialogueSequences.find((item) => item.id === "flashback-cover-plan")?.backdrop).toContain("cg-07-erasure-montage");
  });

  it("makes 5-1 and 5-2 actual spatial traversal in the shared Master Scene", () => {
    expect(runtime).toContain("TingYuXuanScene.create");
    expect(runtime).toContain("PhysicsController.create");
    expect(runtime).toContain('getGameplayAnchor("ROUTE_01_START")');
    expect(runtime).toContain('getGameplayAnchor("B_CHILD_BOX")');
    expect(runtime).toContain('"you-did-not-return.route.reverse-complete"');
    expect(runtime).toContain('"you-did-not-return.route.return-room-complete"');
    expect(runtime).toContain('physics.setMemory("zhaoying")');
    expect(runtime).toContain("handleRouteMilestone(pose)");
  });

  it("routes the formal chapter to the dedicated 3D runtime and removes the old summary timeline", () => {
    expect(page).toContain('if (view === "you-did-not-return")');
    expect(page).toContain("<YouDidNotReturnRuntime");
    expect(legacyRuntime).not.toContain("CHAPTER_FIVE_BEATS");
    expect(legacyRuntime).not.toContain('chapter.id === "you-did-not-return"');
  });

  it("only completes after scene 5-8 and keeps the fixed accident truth explicit", () => {
    expect(runtime).toContain('if (sequence.id === "flashback-present-return")');
    expect(runtime).toContain("finishChapter(nextCheckpoint)");
    expect(ink).toContain("没有碰到她");
    expect(ink).toContain("他不是被我推下去的");
    expect(ink).toContain("别跑……我听得见");
    expect(ink).toContain("今晚，赵映没有回来");
    expect(ink).toContain("最后一点一点加起来，就是一条命");
    expect(ink).toContain("也没有什么藏起来的凶手");
  });

  it("contains no poison or cult replacement twist", () => {
    expect(ink).not.toMatch(/下毒|毒杀|邪教|祭祀|祭坛|隐藏凶手/);
  });
});
