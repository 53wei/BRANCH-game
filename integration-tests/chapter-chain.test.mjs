import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

function readString(source, field) {
  const match = source.match(new RegExp(`${field}:\\s*[\"']([^\"']+)[\"']`));
  assert.ok(match, `Missing ${field}`);
  return match[1];
}

test("Chapter 01 output connects to Chapter 02 input", async () => {
  const [chapter01, chapter02, page01, page02] = await Promise.all([
    readFile(new URL("game-chapter-01/app/game/chapter01.ts", root), "utf8"),
    readFile(new URL("game-chapter-02/app/game/chapter02.ts", root), "utf8"),
    readFile(new URL("game-chapter-01/app/page.tsx", root), "utf8"),
    readFile(new URL("game-chapter-02/app/page.tsx", root), "utf8"),
  ]);

  assert.equal(readString(chapter01, "outputFlag"), readString(chapter02, "inputFlag"));
  assert.match(page01, /undying-world:chapter-complete/);
  assert.match(page02, /undying-world:chapter-complete/);
  assert.match(page01, /chapterId:[\s\S]*outputFlag:[\s\S]*evidence:/);
  assert.match(page02, /chapterId:[\s\S]*outputFlag:[\s\S]*evidence:/);
  assert.notEqual(readString(chapter01, "id"), readString(chapter02, "id"));
});
