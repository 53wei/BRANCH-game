import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { FINAL_FACTS } from "./finale-facts";
import { youDidNotReturnDialogueSequences } from "../manifests/you-did-not-return";
import { STORY_CGS } from "./story-cg";

describe("story CG registry", () => {
  it("registers eight unique, non-empty runtime images", () => {
    expect(STORY_CGS).toHaveLength(8);
    expect(new Set(STORY_CGS.map((entry) => entry.id)).size).toBe(8);
    for (const entry of STORY_CGS) {
      const file = resolve(process.cwd(), "public", entry.path.replace(/^\//, ""));
      expect(existsSync(file), entry.path).toBe(true);
      expect(statSync(file).size, entry.path).toBeGreaterThan(100_000);
      expect(entry.alt.length).toBeGreaterThan(10);
    }
  });

  it("keeps key fifth-chapter CG hooks and final facts explicit", () => {
    const backdrops = youDidNotReturnDialogueSequences.map((sequence) => sequence.backdrop).filter(Boolean).join("\n");
    const facts = FINAL_FACTS.map((fact) => fact.label).join("\n");
    expect(backdrops).toContain("cg-05-water-pavilion-argument-v1.png");
    expect(backdrops).toContain("cg-06-wooden-steps-accident-v1.png");
    expect(backdrops).toContain("cg-07-erasure-montage-v1.png");
    expect(facts).toContain("仍有意识");
    expect(facts).toContain("今晚，赵映没有回来");
    expect(facts).toContain("四个人分别删除生活、空间、文字与图像痕迹");
  });
});
