import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { Story } from "inkjs";
import { northDialogueSequences } from "../manifests/north-tower-objectives";
import { westDialogueSequences } from "../manifests/west-onboarding";
import northStory from "./north-tower-ledger.json";
import westStory from "./west-onboarding.json";
import { parseDialogueTags } from "./dialogue";
import { speakerProfiles } from "./speakers";

const walkEveryBranch = (story: Story, compiledStory: Record<string, unknown>, voicePrefix: string, depth = 0): number => {
  if (depth > 80) throw new Error("dialogue branch did not terminate");
  let lineCount = 0;
  while (story.canContinue) {
    story.Continue();
    lineCount += 1;
    const parsed = parseDialogueTags(story.currentTags ?? [], `fallback.${lineCount}`);
    const speaker = speakerProfiles[parsed.speakerId];
    expect(speaker).toBeDefined();
    if (parsed.speakerId !== "narrator") {
      expect(parsed.voiceAssetId).toMatch(new RegExp(`^${voicePrefix}\\.`));
      const portrait = speaker.portraits[parsed.portrait ?? speaker.defaultPortrait];
      expect(portrait).toBeTruthy();
      expect(existsSync(join(process.cwd(), "public", portrait))).toBe(true);
    }
  }
  if (story.currentChoices.length === 0) return lineCount;
  return lineCount + story.currentChoices.reduce((sum, choice) => {
    const branch = new Story(compiledStory);
    branch.state.LoadJson(story.state.ToJson());
    branch.ChooseChoiceIndex(choice.index);
    return sum + walkEveryBranch(branch, compiledStory, voicePrefix, depth + 1);
  }, 0);
};

describe("west onboarding dialogue", () => {
  it("resolves every declared sequence and every Ink choice", () => {
    for (const sequence of westDialogueSequences) {
      const story = new Story(westStory);
      story.ChoosePathString(sequence.knotId);
      expect(walkEveryBranch(story, westStory, "west")).toBeGreaterThan(0);
    }
  });

  it("parses objective, trust, voice and speaker tags", () => {
    const parsed = parseDialogueTags([
      "speaker:wife",
      "portrait:guarded",
      "line:trust.001",
      "voice:west.wife.001",
      "objective:start:west-waterline:inspect-wife",
      "trust:set:west-water-motive:protect:west.trust.protective-sabotage",
    ], "fallback");
    expect(parsed.speakerId).toBe("wife");
    expect(parsed.lineId).toBe("trust.001");
    expect(parsed.commands).toContainEqual({ type: "objective:start", objectiveId: "west-waterline", stepId: "inspect-wife" });
    expect(parsed.commands).toContainEqual({ type: "trust:set", nodeId: "west-water-motive", choiceId: "protect", outputFlag: "west.trust.protective-sabotage" });
  });
});

describe("north tower dialogue", () => {
  it("resolves every declared sequence and every Ink choice", () => {
    for (const sequence of northDialogueSequences) {
      const story = new Story(northStory);
      story.ChoosePathString(sequence.knotId);
      expect(walkEveryBranch(story, northStory, "north")).toBeGreaterThan(0);
    }
  });
});
