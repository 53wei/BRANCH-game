import { describe, expect, it } from "vitest";
import { createCheckpoint } from "../campaign-save";
import { createChapterCompletePayload } from "./chapter-behavior";

describe("west chapter completion payload", () => {
  it("preserves evidence and trust in the chapter-complete event payload", () => {
    const checkpoint = createCheckpoint("west-corridor-loop", "wife");
    checkpoint.earnedFlags = ["west-corridor-loop.complete", "campaign.witness.wife", "campaign.witness.gardener"];
    checkpoint.contradictions = ["waterline-direction", "corridor-count"];
    checkpoint.trustDecisions["west-water-motive"] = "protect";
    expect(createChapterCompletePayload("west-corridor-loop", checkpoint)).toEqual({
      chapterId: "west-corridor-loop",
      earnedFlags: checkpoint.earnedFlags,
      contradictions: checkpoint.contradictions,
      trustDecision: "protect",
    });
  });
});
