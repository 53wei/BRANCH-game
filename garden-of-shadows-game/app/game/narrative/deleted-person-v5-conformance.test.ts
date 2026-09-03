import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { Story } from "inkjs";
import { deletedPersonDialogueSequences } from "../manifests/deleted-person";
import { DELETED_PERSON_UNSENT_LETTER } from "../runtime/document-content";
import { compileInkSource } from "./ink-runtime";

const mother = readFileSync(join(process.cwd(), "..", "游园惊梦_完整剧情母剧本_V5.0.md"), "utf8");
const ink = readFileSync(join(process.cwd(), "app", "game", "narrative", "deleted-person.ink"), "utf8");
const runtime = readFileSync(join(process.cwd(), "app", "game", "NarrativeChapterRuntime.tsx"), "utf8");

function authoredCharacterLinesByScene() {
  const start = mother.indexOf("## 场景 4-1：沈夫人的箱子");
  const end = mother.indexOf("# 9. 第五章《今晚你没回来》");
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);

  const scenes = new Map<string, string[]>();
  let currentScene = "";
  for (const raw of mother.slice(start, end).split(/\r?\n/)) {
    const line = raw.trim();
    const heading = line.match(/^## 场景 4-(\d)：/);
    if (heading) {
      currentScene = heading[1];
      scenes.set(currentScene, []);
      continue;
    }
    if (!currentScene) continue;
    const spoken = line.match(/^(?:赵映|沈夫人|老周|钱先生|柳生)：(.*)$/);
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
    if (!raw.includes("# line:ch4.4-")) continue;
    if (raw.includes("# speaker:narrator")) continue;
    const scene = raw.match(/# line:ch4\.4-(\d)\./)?.[1];
    if (!scene) continue;
    const values = scenes.get(scene) ?? [];
    values.push(raw.split("#")[0].trim());
    scenes.set(scene, values);
  }
  return scenes;
}

function authoredLetterParagraphs() {
  const start = mother.indexOf("信件正文：", mother.indexOf("## 场景 4-5：沈老爷未寄出的信"));
  const end = mother.indexOf("[赵映看完很久没有说话。]", start);
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  return mother.slice(start, end).split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith(">"))
    .map((line) => line.replace(/^>\s?/, "").trim())
    .filter(Boolean);
}

describe("TASK-011 fourth chapter V5 conformance", () => {
  it("keeps every V5 spoken/inner line for scenes 4-1 through 4-6", () => {
    const authored = authoredCharacterLinesByScene();
    const runtimeLines = inkCharacterLinesByScene();
    expect([...authored.keys()]).toEqual(["1", "2", "3", "4", "5", "6"]);
    for (const scene of ["1", "2", "3", "4", "5", "6"]) {
      expect(runtimeLines.get(scene) ?? [], `scene 4-${scene}`).toEqual(authored.get(scene));
    }
  });

  it("keeps the complete unsent letter in the document viewer instead of reducing it to a slogan", () => {
    const documentParagraphs = [
      DELETED_PERSON_UNSENT_LETTER.pages[0].heading,
      ...DELETED_PERSON_UNSENT_LETTER.pages.flatMap((page) => page.rows.map((row) => row.text)),
    ].filter((value): value is string => Boolean(value));
    expect(documentParagraphs).toEqual(authoredLetterParagraphs());
  });

  it("compiles every authored fourth-chapter Ink knot", () => {
    const compiled = JSON.parse(compileInkSource("test-deleted-person", ink)) as Record<string, unknown>;
    for (const sequence of deletedPersonDialogueSequences) {
      const story = new Story(compiled);
      story.ChoosePathString(sequence.knotId);
      let lines = 0;
      while (story.canContinue) { story.Continue(); lines += 1; }
      expect(lines, sequence.id).toBeGreaterThan(0);
    }
  });

  it("runs protection reinterpretation before the new return-time contradiction", () => {
    expect(deletedPersonDialogueSequences.map((sequence) => sequence.id)).toEqual([
      "deleted-wife-boxes",
      "deleted-gardener-route",
      "deleted-accountant-packet",
      "deleted-painter-original",
      "deleted-letter-reaction",
      "deleted-new-contradiction",
    ]);
    expect(runtime).toContain("<DocumentViewer document={DELETED_PERSON_UNSENT_LETTER}");
    expect(runtime).toContain('deleted-person.new-contradiction-complete');
    expect(runtime).toContain("completeChapter(undefined, next)");
    expect(runtime).not.toContain("四个人，各自删掉了一部分");
  });
});
