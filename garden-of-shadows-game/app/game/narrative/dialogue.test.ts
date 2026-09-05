import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { Story } from "inkjs";
import { northDialogueSequences } from "../manifests/north-tower-objectives";
import { westDialogueSequences } from "../manifests/west-onboarding";
import northInkSource from "./north-tower-ledger.ink?raw";
import westInkSource from "./west-onboarding.ink?raw";
import { compileInkSource } from "./ink-runtime";
import { parseDialogueTags } from "./dialogue";
import { speakerProfiles } from "./speakers";

const westStory = JSON.parse(compileInkSource("test-west-onboarding", westInkSource)) as Record<string, unknown>;
const northStory = JSON.parse(compileInkSource("test-north-tower-ledger", northInkSource)) as Record<string, unknown>;

const walkEveryBranch = (story: Story, compiledStory: Record<string, unknown>, voicePrefix?: string, depth = 0): number => {
  if (depth > 80) throw new Error("dialogue branch did not terminate");
  let lineCount = 0;
  while (story.canContinue) {
    story.Continue();
    lineCount += 1;
    const parsed = parseDialogueTags(story.currentTags ?? [], `fallback.${lineCount}`);
    const speaker = speakerProfiles[parsed.speakerId];
    expect(speaker).toBeDefined();
    if (parsed.speakerId !== "narrator") {
      // Inner monologue is deliberately unvoiced; SemanticMorph carries it instead.
      if (voicePrefix && parsed.kind !== "inner") expect(parsed.voiceAssetId).toMatch(new RegExp(`^${voicePrefix}\\.`));
      // Speakers without declared portraits (painter, master) are an accepted
      // asset BLOCK; only declared portraits must resolve to real files.
      if (Object.keys(speaker.portraits).length > 0) {
        const portrait = speaker.portraits[parsed.portrait ?? speaker.defaultPortrait];
        expect(portrait).toBeTruthy();
        expect(existsSync(join(process.cwd(), "public", portrait))).toBe(true);
      }
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
      "kind:spoken",
      "portrait:guarded",
      "line:trust.001",
      "voice:west.wife.001",
      "objective:start:west-waterline:inspect-wife",
      "trust:set:west-water-motive:protect:west.trust.protective-sabotage",
    ], "fallback");
    expect(parsed.speakerId).toBe("wife");
    expect(parsed.kind).toBe("spoken");
    expect(parsed.lineId).toBe("trust.001");
    expect(parsed.commands).toContainEqual({ type: "objective:start", objectiveId: "west-waterline", stepId: "inspect-wife" });
    expect(parsed.commands).toContainEqual({ type: "trust:set", nodeId: "west-water-motive", choiceId: "protect", outputFlag: "west.trust.protective-sabotage" });
  });

  it("keeps narrative semantics separate from speaker identity", () => {
    expect(parseDialogueTags(["speaker:narrator", "kind:action", "line:test.action"], "fallback").kind).toBe("action");
    expect(parseDialogueTags(["speaker:zhaoying", "kind:inner", "line:test.inner"], "fallback").kind).toBe("inner");
    expect(parseDialogueTags(["speaker:narrator", "kind:narration", "line:test.narration"], "fallback").kind).toBe("narration");
    expect(parseDialogueTags(["speaker:zhaoying", "kind:inner", "line:test.inner-voice", "portrait:guarded", "voice:forbidden.inner"], "fallback")).toMatchObject({ voiceAssetId: undefined, portrait: undefined });
    expect(parseDialogueTags(["speaker:narrator", "kind:narration", "line:test.narration-voice", "voice:forbidden.narration"], "fallback").voiceAssetId).toBeUndefined();
    expect(() => parseDialogueTags(["speaker:wife", "kind:spoken"], "missing-line")).toThrow("missing line tag");
    expect(() => parseDialogueTags(["speaker:narrator", "kind:spoken", "line:invalid.narrator"], "invalid.narrator")).toThrow("Narrator cannot be spoken dialogue");
  });

  it("parses semantic ink-rewrite tags", () => {
    const parsed = parseDialogueTags([
      "speaker:narrator",
      "kind:narration",
      "line:prologue.ledger",
      "morph:四>五>四",
      "morph-delay:900",
      "morph-hold:650",
      "morph-shake:medium",
      "morph-log:stable",
      "morph-once:true",
    ], "fallback");
    expect(parsed.semanticMorph).toEqual({
      source: "四",
      sequence: ["五", "四"],
      delayMs: 900,
      holdMs: 650,
      shake: "medium",
      logMode: "stable",
      once: true,
    });
  });
});

describe("north tower dialogue", () => {
  it("resolves every declared sequence and every Ink choice", () => {
    for (const sequence of northDialogueSequences) {
      const story = new Story(northStory);
      story.ChoosePathString(sequence.knotId);
      expect(walkEveryBranch(story, northStory)).toBeGreaterThan(0);
    }
  });
});
