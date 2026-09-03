import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  PROLOGUE_ANOMALY_LINES,
  PROLOGUE_BASELINE_LINES,
  PROLOGUE_CANONICAL_SCENE_ORDER,
  PROLOGUE_DEPARTURE_RECORD_LINES,
  PROLOGUE_FRONT_HALL_LINES,
  PROLOGUE_GATE_LINES,
  PROLOGUE_STORY_BY_PHASE,
  PROLOGUE_WATER_PAVILION_LINES,
} from "./prologue-content";

const allLines = [
  ...PROLOGUE_GATE_LINES,
  ...PROLOGUE_FRONT_HALL_LINES,
  ...PROLOGUE_DEPARTURE_RECORD_LINES,
  ...PROLOGUE_BASELINE_LINES,
  ...PROLOGUE_WATER_PAVILION_LINES,
  ...PROLOGUE_ANOMALY_LINES,
];

describe("prologue narrative source of truth", () => {
  it("keeps stable unique ids across the runtime story phases", () => {
    expect(new Set(allLines.map((line) => line.id)).size).toBe(allLines.length);
    expect(allLines.every((line) => line.text.trim().length > 0)).toBe(true);
  });

  it("keeps semantic presentation types instead of flattening everything into dialogue", () => {
    const kinds = new Set(allLines.map((line) => line.kind));
    expect(kinds).toEqual(new Set(["spoken", "inner", "narration", "action"]));
  });

  it("locks the V5.0 scene order used by runtime", () => {
    expect(PROLOGUE_CANONICAL_SCENE_ORDER).toEqual([
      "gate",
      "front-hall",
      "departure-record",
      "baseline",
      "water",
      "anomaly",
    ]);
    expect(PROLOGUE_STORY_BY_PHASE["front-hall"]).toBe(PROLOGUE_FRONT_HALL_LINES);
    expect(PROLOGUE_STORY_BY_PHASE["departure-record"]).toBe(PROLOGUE_DEPARTURE_RECORD_LINES);
    expect(PROLOGUE_STORY_BY_PHASE.baseline).toBe(PROLOGUE_BASELINE_LINES);
  });

  it("keeps the water-pavilion scene separate from the first spatial anomaly", () => {
    const waterText = PROLOGUE_WATER_PAVILION_LINES.map((line) => line.text).join("\n");
    const anomalyText = PROLOGUE_ANOMALY_LINES.map((line) => line.text).join("\n");

    expect(waterText).toContain("因为我说了七年");
    expect(waterText).not.toContain("刚才这里有门");
    expect(anomalyText).toContain("刚才这里有门");
    expect(anomalyText).toContain("你明天最好别只问我一个人");
  });

  it("does not omit or paraphrase the authored V5 prologue lines", () => {
    const mother = readFileSync(join(process.cwd(), "..", "游园惊梦_完整剧情母剧本_V5.0.md"), "utf8");
    const start = mother.indexOf("## 场景 0-1：雨夜正门");
    const end = mother.indexOf("# 5. 第一章《不存在的路》");
    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);

    const authored = mother.slice(start, end).split(/\r?\n/).map((raw) => raw.trim()).flatMap((raw) => {
      if (!raw || raw.startsWith("## ") || raw === "---" || raw.startsWith("【交互：") || raw.startsWith("〈转场：")) return [];
      const spoken = raw.match(/^(?:老周|赵映)：(.*)$/);
      if (spoken) return [spoken[1].trim()];
      const inner = raw.match(/^（(.*)）$/);
      if (inner) return [inner[1].trim()];
      const staged = raw.match(/^\[(?:环境：|动作：)?(.*)\]$/);
      if (staged) return [staged[1].trim()];
      const sound = raw.match(/^〈音效：(.*)〉$/);
      if (sound) return [sound[1].trim()];
      return [];
    });

    expect(allLines.map((line) => line.text)).toEqual(authored);
    expect(allLines.map((line) => line.text).join("\n")).not.toContain("第五人");
  });
});
