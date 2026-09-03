import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { Story } from "inkjs";
import { campaignManifest } from "../manifests/campaign";
import { fifthTingYuXuanDialogueSequences } from "../manifests/fifth-tingyuxuan";
import { compileInkSource } from "./ink-runtime";
import { FINAL_FACT_IDS } from "./finale-facts";

const mother = readFileSync(join(process.cwd(), "..", "游园惊梦_完整剧情母剧本_V5.0.md"), "utf8");
const ink = readFileSync(join(process.cwd(), "app", "game", "narrative", "fifth-tingyuxuan.ink"), "utf8");
const runtime = readFileSync(join(process.cwd(), "app", "game", "FifthTingYuXuanRuntime.tsx"), "utf8");
const page = readFileSync(join(process.cwd(), "app", "page.tsx"), "utf8");
const legacy = readFileSync(join(process.cwd(), "app", "game", "NarrativeChapterRuntime.tsx"), "utf8");
const globalStyles = readFileSync(join(process.cwd(), "app", "globals.css"), "utf8");

function authoredCharacterLines() {
  const start = mother.indexOf("## 场景 F-1：最后一次走园子");
  const end = mother.indexOf("# 11. 可选结局差分", start);
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  return mother.slice(start, end).split(/\r?\n/)
    .map((line) => line.trim())
    .flatMap((line) => {
      const spoken = line.match(/^(?:赵映|沈夫人|老周|钱先生|柳生)：(.*)$/);
      if (spoken) return [spoken[1].trim()];
      const inner = line.match(/^（(.*)）$/);
      return inner ? [inner[1].trim()] : [];
    });
}

function runtimeCharacterLines() {
  return ink.split(/\r?\n/)
    .filter((line) => line.includes("# line:finale.") && !line.includes("# speaker:narrator"))
    .map((line) => line.split("#")[0].trim());
}

describe("TASK-013 finale V5 conformance", () => {
  it("keeps every F-1/F-2/F-3 spoken and inner line in mother-script order", () => {
    expect(runtimeCharacterLines()).toEqual(authoredCharacterLines());
    expect(ink).toContain("“我回来过。”");
    expect(ink).toContain("“我也会再离开。”");
    expect(ink).toContain("赵映提起行李，从正门离开。老周站在门内，没有再问她什么时候回来。");
  });

  it("compiles every finale knot and keeps CG-08 on the actual departure", () => {
    const compiled = JSON.parse(compileInkSource("test-fifth-tingyuxuan", ink)) as Record<string, unknown>;
    expect(fifthTingYuXuanDialogueSequences).toHaveLength(10);
    for (const sequence of fifthTingYuXuanDialogueSequences) {
      const story = new Story(compiled);
      story.ChoosePathString(sequence.knotId);
      let lines = 0;
      while (story.canContinue) { story.Continue(); lines += 1; }
      expect(lines, sequence.id).toBeGreaterThan(0);
    }
    expect(fifthTingYuXuanDialogueSequences.find((item) => item.id === "finale-main-departure")?.backdrop).toContain("cg-08-fifth-garden-departure");
  });

  it("makes the final walk spatial and explicitly removes guidance UI", () => {
    expect(runtime).toContain("TingYuXuanScene.create");
    expect(runtime).toContain('getGameplayAnchor("ROUTE_01_START")');
    expect(runtime).toContain('getGameplayAnchor("ROUTE_04_A_EAST_EXIT")');
    expect(runtime).toContain('getGameplayAnchor("B_CHILD_BOX")');
    expect(runtime).toContain('getGameplayAnchor("C_WATER_EDGE")');
    expect(runtime).toContain("world.setRainEnabled(false)");
    expect(runtime).toContain("world.setGuidanceTarget(undefined)");
    expect(runtime).not.toContain("objective-card");
    expect(runtime).not.toContain("guideDistance");
    expect(runtime).not.toContain("guidanceLevel");
  });

  it("routes the formal finale to the dedicated 3D runtime and physically removes the old checkbox/manual-ending finale", () => {
    expect(page).toContain('if (view === "fifth-tingyuxuan")');
    expect(page).toContain("<FifthTingYuXuanRuntime");
    for (const obsolete of ["FinaleRuntime", "fact-assembly", "lens-selection", "FINALE_GOODBYES", "chooseLens"]) {
      expect(legacy).not.toContain(obsolete);
      expect(page).not.toContain(obsolete);
      expect(globalStyles).not.toContain(obsolete);
    }
    expect(runtime).toContain("deriveEndingLens");
    expect(runtime).not.toContain("选择第五份证词");
  });

  it("locks all five ending rules to the same fixed case facts and only changes stability mode", () => {
    expect(FINAL_FACT_IDS).toEqual([
      "grew-up-here", "left-and-returned", "argument", "no-push", "protective-order", "four-erased", "delay-contributed",
    ]);
    expect(Object.keys(campaignManifest.endingRules)).toEqual(["domestic", "spatial", "documentary", "pictorial", "composite"]);
    expect(campaignManifest.endingRules.domestic.metrics).toEqual({ cognition: "wife", minimumLead: 2 });
    expect(campaignManifest.endingRules.spatial.metrics).toEqual({ cognition: "gardener", minimumLead: 2 });
    expect(campaignManifest.endingRules.documentary.metrics).toEqual({ cognition: "accountant", minimumLead: 2 });
    expect(campaignManifest.endingRules.pictorial.metrics).toEqual({ cognition: "painter", minimumLead: 2 });
    expect(campaignManifest.endingRules.composite.metrics).toEqual({ balancedMaxSpread: 1.5 });
  });

  it("keeps Ending E as a silent formal-asset spatial sting, not a primitive or horror caption", () => {
    const start = runtime.indexOf("async function buildCompositeSpatialSting");
    const end = runtime.indexOf("export function FifthTingYuXuanRuntime", start);
    const stingBuilder = runtime.slice(start, end);
    expect(stingBuilder).toContain('cloneFormalAsset("tyx-arch-pavilion-a", "LP_ChinesePavWalls")');
    expect(stingBuilder).not.toMatch(/BoxGeometry|SphereGeometry|CylinderGeometry|CapsuleGeometry/);

    const triggerStart = runtime.indexOf('!flags.includes("finale.composite-sting-seen")');
    const triggerEnd = runtime.indexOf('lens === "spatial"', triggerStart);
    const compositeTrigger = runtime.slice(triggerStart, triggerEnd);
    expect(compositeTrigger).toContain("sting.visible = true");
    expect(compositeTrigger).not.toMatch(/setSubtitle|audio\.|bell\(|sting\(\)|objective/i);
    expect(ink).not.toMatch(/现实是假的|现实.*虚假|第七个窗框/);
  });

  it("never introduces a new culprit or reverses the accident truth", () => {
    const joined = `${ink}\n${runtime}`;
    expect(joined).not.toMatch(/下毒|毒杀|邪教|祭坛|隐藏凶手|其实.*凶手/);
    expect(FINAL_FACT_IDS).toContain("no-push");
    expect(FINAL_FACT_IDS).toContain("delay-contributed");
  });
});
