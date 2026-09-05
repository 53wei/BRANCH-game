import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseDialogueTags } from "./dialogue";

const inkSources = [
  "west-onboarding.ink",
  "north-tower-ledger.ink",
  "missing-room.ink",
  "deleted-person.ink",
  "you-did-not-return.ink",
  "fifth-tingyuxuan.ink",
] as const;

const authoredLines = (file: string) => readFileSync(join(process.cwd(), "app", "game", "narrative", file), "utf8")
  .split(/\r?\n/)
  .map((line, index) => ({ line, lineNumber: index + 1 }))
  .filter(({ line }) => line.includes("# speaker:"));

const tagsFromLine = (line: string) => line
  .split("#")
  .slice(1)
  .map((tag) => tag.trim())
  .filter(Boolean);

describe("TASK-027 narrative semantics gate", () => {
  it("requires explicit speaker and kind tags on every authored Ink line", () => {
    for (const file of inkSources) {
      for (const { line, lineNumber } of authoredLines(file)) {
        expect(() => parseDialogueTags(tagsFromLine(line), `${file}:${lineNumber}`), `${file}:${lineNumber}`).not.toThrow();
      }
    }
  });

  it("allows voice assets only for spoken lines", () => {
    for (const file of inkSources) {
      for (const { line, lineNumber } of authoredLines(file)) {
        const parsed = parseDialogueTags(tagsFromLine(line), `${file}:${lineNumber}`);
        if (parsed.kind !== "spoken") expect(parsed.voiceAssetId, `${file}:${lineNumber}`).toBeUndefined();
      }
    }
  });

  it("keeps narrator lines non-spoken and inner lines visibly separate", () => {
    for (const file of inkSources) {
      for (const { line, lineNumber } of authoredLines(file)) {
        const parsed = parseDialogueTags(tagsFromLine(line), `${file}:${lineNumber}`);
        if (parsed.speakerId === "narrator") expect(parsed.kind, `${file}:${lineNumber}`).not.toBe("spoken");
        if (parsed.kind === "inner") expect(["zhaoying", "young-zhaoying"], `${file}:${lineNumber}`).toContain(parsed.speakerId);
      }
    }
  });
});
