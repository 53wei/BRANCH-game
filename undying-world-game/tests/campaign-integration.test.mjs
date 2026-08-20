import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);
const chapter01Url = new URL("app/game/chapters/chapter01.ts", projectRoot);
const chapter02Url = new URL("app/game/chapters/chapter02.ts", projectRoot);
const chapter03Url = new URL("app/game/chapters/chapter03.ts", projectRoot);
const chapter04Url = new URL("app/game/chapters/chapter04.ts", projectRoot);
const chapter05Url = new URL("app/game/chapters/chapter05.ts", projectRoot);
const campaignSaveUrl = new URL("app/game/campaign-save.ts", projectRoot);
const pageUrl = new URL("app/page.tsx", projectRoot);
const runnerUrl = new URL("app/game/ChapterRunner.tsx", projectRoot);

function readString(source, field) {
  const match = source.match(
    new RegExp(`\\b${field}\\s*:\\s*["']([^"']+)["']`),
  );
  assert.ok(match, `Missing string field: ${field}`);
  return match[1];
}

function completionEventFieldSets(source) {
  const marker = "undying-world:chapter-complete";
  const expectedFields = ["chapterId", "evidence", "outputFlag"];
  const fieldSets = [];
  let markerIndex = source.indexOf(marker);

  while (markerIndex >= 0) {
    const nearbySource = source.slice(markerIndex, markerIndex + 1_200);
    const presentFields = expectedFields.filter((field) =>
      new RegExp(`\\b${field}\\b`).test(nearbySource),
    );
    fieldSets.push(presentFields.sort());
    markerIndex = source.indexOf(marker, markerIndex + marker.length);
  }

  return fieldSets;
}

async function renderBuiltPage() {
  const workerUrl = new URL("dist/server/index.js", projectRoot);
  workerUrl.searchParams.set("campaign-test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("campaign source connects Chapter 01 to Chapter 02", async () => {
  const [chapter01, chapter02] = await Promise.all([
    readFile(chapter01Url, "utf8"),
    readFile(chapter02Url, "utf8"),
  ]);

  assert.equal(
    readString(chapter01, "outputFlag"),
    readString(chapter02, "inputFlag"),
    "Chapter 01 outputFlag must exactly match Chapter 02 inputFlag",
  );
});

test("campaign source connects Chapter 02 to Chapter 03", async () => {
  const [chapter02, chapter03] = await Promise.all([
    readFile(chapter02Url, "utf8"),
    readFile(chapter03Url, "utf8"),
  ]);

  assert.equal(
    readString(chapter02, "outputFlag"),
    readString(chapter03, "inputFlag"),
    "Chapter 02 outputFlag must exactly match Chapter 03 inputFlag",
  );
});

test("campaign source connects Chapter 03 to Chapter 04", async () => {
  const [chapter03, chapter04] = await Promise.all([
    readFile(chapter03Url, "utf8"),
    readFile(chapter04Url, "utf8"),
  ]);

  assert.equal(
    readString(chapter03, "outputFlag"),
    readString(chapter04, "inputFlag"),
    "Chapter 03 outputFlag must exactly match Chapter 04 inputFlag",
  );
});

test("campaign source connects Chapter 04 to Chapter 05", async () => {
  const [chapter04, chapter05] = await Promise.all([
    readFile(chapter04Url, "utf8"),
    readFile(chapter05Url, "utf8"),
  ]);

  assert.equal(
    readString(chapter04, "outputFlag"),
    readString(chapter05, "inputFlag"),
    "Chapter 04 outputFlag must exactly match Chapter 05 inputFlag",
  );
  assert.match(chapter05, /endingChoice\s*:/,
    "The final chapter must include the GDD-required ending choice");
});

test("campaign uses one versioned global save key", async () => {
  const campaignSave = await readFile(campaignSaveUrl, "utf8");

  assert.match(campaignSave, /undying-world\.game\.save\.v1/);
  assert.match(campaignSave, /OLD_CHAPTER_KEYS/,
    "The campaign may read legacy chapter saves for one-time migration");
  assert.doesNotMatch(campaignSave, /setItem\(OLD_CHAPTER_KEYS/,
    "The campaign must not write chapter-only save keys");
});

test("both chapters share the same completion-event payload", async () => {
  const page = await readFile(pageUrl, "utf8");
  const fieldSets = completionEventFieldSets(page);
  const expectedFields = ["chapterId", "evidence", "outputFlag"];

  assert.ok(
    fieldSets.length >= 1,
    "The campaign page must dispatch undying-world:chapter-complete",
  );
  for (const fields of fieldSets) {
    assert.deepEqual(fields, expectedFields);
  }

  assert.match(page, /CHAPTER_01/);
  assert.match(page, /CHAPTER_02/);
  assert.match(page, /CHAPTER_03/);
  assert.match(page, /CHAPTER_04/);
  assert.match(page, /CHAPTER_05/);
});

test("campaign page has no external Chapter 02 hand-off", async () => {
  const page = await readFile(pageUrl, "utf8");

  assert.doesNotMatch(page, /undying-world-chapter-02/i);
  assert.doesNotMatch(
    page,
    /https?:\/\/[^\s"']*chapter(?:-|%20)?0?2/i,
    "Chapter 02 must be entered through the campaign shell without a full-page navigation",
  );
});

test("chapter completion atomically advances to the next unlocked chapter", async () => {
  const [page, runner] = await Promise.all([
    readFile(pageUrl, "utf8"),
    readFile(runnerUrl, "utf8"),
  ]);

  assert.match(page, /setCampaign\(\(current\)\s*=>/,
    "Chapter completion and navigation must use the latest campaign state");
  assert.match(page, /activeChapterId:\s*canAdvance\s*\?\s*followingChapter\.id/,
    "Completing a chapter must switch activeChapterId in the same state update");
  assert.doesNotMatch(runner, /setTimeout\(onNext/,
    "Chapter transitions must not depend on a component timer");
});

test("built campaign page contains all connected chapter titles", async () => {
  const response = await renderBuiltPage();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /第七席/);
  assert.match(html, /谁删了名字/);
  assert.match(html, /第一次“死”/);
  assert.match(html, /活着的人/);
  assert.match(html, /<b>05<\/b><span><strong>无名席<\/strong>/);
  assert.doesNotMatch(html, /undying-world-chapter-02/i);
});
