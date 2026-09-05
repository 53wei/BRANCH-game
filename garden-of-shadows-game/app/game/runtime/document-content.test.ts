import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CASE_FILE_DOCUMENTS,
  DELETED_PERSON_UNSENT_LETTER,
  NORTH_DEPARTURE_DOCUMENT,
  PROLOGUE_DEPARTURE_DOCUMENT,
} from "./document-content";

describe("TASK-029 paper evidence experience", () => {
  it("shows the V5 prologue pressure mark without revealing its original digits or author", () => {
    const prologueText = JSON.stringify(PROLOGUE_DEPARTURE_DOCUMENT);
    expect(prologueText).toContain("六点十分");
    expect(prologueText).toContain("压痕");
    expect(prologueText).toMatch(/无法确认|无法辨认/);
    expect(prologueText).not.toMatch(/原来写着.{0,8}(?:七点|八点)|钱先生改/);
  });

  it("preserves the flat and raking-light views as player-controlled pages", () => {
    expect(NORTH_DEPARTURE_DOCUMENT.pages.map((page) => page.id)).toEqual([
      "record-flat-light",
      "record-raking-light",
    ]);
    const flat = JSON.stringify(NORTH_DEPARTURE_DOCUMENT.pages[0]);
    const raking = JSON.stringify(NORTH_DEPARTURE_DOCUMENT.pages[1]);
    for (const fact of ["六点十分", "六点四十五分", "七点前"]) {
      expect(flat).toContain(fact);
      expect(raking).toContain(fact);
    }
    expect(raking).toMatch(/刮擦|逆毛/);
    expect(raking).toContain('"abraded":true');
  });

  it("retains every authored document as a reopenable case-file scan", () => {
    expect(CASE_FILE_DOCUMENTS).toEqual({
      "prologue-departure-record": PROLOGUE_DEPARTURE_DOCUMENT,
      "north-departure-record": NORTH_DEPARTURE_DOCUMENT,
      "deleted-unsent-letter": DELETED_PERSON_UNSENT_LETTER,
    });
    const caseFileSource = readFileSync(join(process.cwd(), "app", "game", "ui", "CaseFilePanel.tsx"), "utf8");
    expect(caseFileSource).toContain("查看留存扫描件");
    expect(caseFileSource).toContain("<DocumentViewer");
  });
});
