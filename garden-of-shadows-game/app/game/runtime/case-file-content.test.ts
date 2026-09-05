import { describe, expect, it } from "vitest";
import { createCheckpoint } from "../campaign-save";
import { EvidenceLedger } from "../mechanics/EvidenceLedger";
import {
  CASE_FILE_EVIDENCE,
  CASE_FILE_QUESTIONS,
  discoveredCaseEvidence,
  isQuestionResolved,
  unlockedCasePeople,
  unlockedCaseQuestions,
} from "./case-file-content";

describe("unified case file content", () => {
  it("keeps every evidence entry as structured observation data", () => {
    expect(CASE_FILE_EVIDENCE.length).toBeGreaterThanOrEqual(17);
    for (const item of CASE_FILE_EVIDENCE) {
      expect(item.title.trim().length).toBeGreaterThan(0);
      expect(item.discoveredFlag.trim().length).toBeGreaterThan(0);
      expect(item.source.location?.trim().length).toBeGreaterThan(0);
      expect(item.observableFacts.length).toBeGreaterThan(0);
      expect(item.observableFacts.every((fact) => fact.trim().length > 0)).toBe(true);
      expect(item.relatedQuestionIds?.length).toBeGreaterThan(0);
      // Interpretations belong to later reasoning/gates, not the raw observation card.
      expect(item.interpretations).toEqual([]);
    }
  });

  it("reveals evidence only after its discovery flag exists", () => {
    const checkpoint = createCheckpoint("north-tower-ledger", "wife");
    expect(discoveredCaseEvidence(checkpoint)).toEqual([]);
    checkpoint.earnedFlags.push("north.evidence.sixth-cup");
    expect(discoveredCaseEvidence(checkpoint).map((item) => item.id)).toEqual(["north-sixth-cup"]);
  });

  it("opens and resolves questions from explicit campaign facts", () => {
    const checkpoint = createCheckpoint("north-tower-ledger", "wife");
    checkpoint.earnedFlags = ["north.evidence.sixth-cup", "north.evidence.departure-record"];
    const open = unlockedCaseQuestions(checkpoint);
    expect(open.map((item) => item.id)).toContain("was-there-fifth-person");
    const fifthPerson = CASE_FILE_QUESTIONS.find((item) => item.id === "was-there-fifth-person")!;
    expect(isQuestionResolved(fifthPerson, checkpoint)).toBe(false);
    checkpoint.earnedFlags.push("north.fifth-person.confirmed");
    expect(isQuestionResolved(fifthPerson, checkpoint)).toBe(true);
  });

  it("unlocks people from story knowledge rather than showing the whole cast immediately", () => {
    const checkpoint = createCheckpoint("prologue-rain", "baseline");
    expect(unlockedCasePeople(checkpoint).map((person) => person.id)).toEqual(["zhaoying"]);
    checkpoint.earnedFlags.push("prologue.dialogue.complete", "prologue.evidence.umbrella");
    expect(unlockedCasePeople(checkpoint).map((person) => person.id)).toEqual(expect.arrayContaining(["zhaoying", "steward", "painter"]));
  });

  it("keeps Chapter Four protection-plan evidence in the same case file", () => {
    const checkpoint = createCheckpoint("deleted-person", "zhaoying");
    checkpoint.earnedFlags.push(
      "deleted-person.evidence.wife-boxes",
      "deleted-person.evidence.gardener-route",
      "deleted-person.evidence.accountant-packet",
      "deleted-person.evidence.painter-original",
      "deleted-person.unsent-letter",
    );
    expect(discoveredCaseEvidence(checkpoint).map((item) => item.id)).toEqual(expect.arrayContaining([
      "deleted-wife-boxes",
      "deleted-sealed-side-route",
      "deleted-departure-packet",
      "deleted-original-portrait",
      "deleted-unsent-letter",
    ]));
    const whyErasure = CASE_FILE_QUESTIONS.find((item) => item.id === "why-erasure-plan")!;
    expect(unlockedCaseQuestions(checkpoint).map((item) => item.id)).toContain("why-erasure-plan");
    expect(isQuestionResolved(whyErasure, checkpoint)).toBe(false);
    checkpoint.earnedFlags.push("deleted-person.complete");
    expect(isQuestionResolved(whyErasure, checkpoint)).toBe(true);
  });

  it("EvidenceLedger returns defensive copies for the new source/person/question metadata", () => {
    const source = CASE_FILE_EVIDENCE[0];
    const ledger = new EvidenceLedger([source]);
    ledger.discover(source.id);
    const copy = ledger.definition(source.id);
    expect(copy.source).toEqual(source.source);
    expect(copy.source).not.toBe(source.source);
    expect(copy.relatedCharacters).toEqual(source.relatedCharacters);
    expect(copy.relatedCharacters).not.toBe(source.relatedCharacters);
    expect(copy.relatedQuestionIds).toEqual(source.relatedQuestionIds);
    expect(copy.relatedQuestionIds).not.toBe(source.relatedQuestionIds);
  });
});
