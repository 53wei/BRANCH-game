import { describe, expect, it } from "vitest";
import type { SemanticMorphSpec } from "./dialogue";
import { morphLogText } from "./SemanticMorphText";

const spec = (logMode: SemanticMorphSpec["logMode"]): SemanticMorphSpec => ({
  source: "四",
  sequence: ["五", "四"],
  delayMs: 800,
  holdMs: 700,
  shake: "subtle",
  logMode,
  once: true,
});

describe("semantic morph log policy", () => {
  it("keeps the stable record when the visual anomaly is not evidence", () => {
    expect(morphLogText("中元夜，入园四人。", spec("stable"))).toBe("中元夜，入园四人。");
  });

  it("can omit an unstable visual-only line from the log", () => {
    expect(morphLogText("中元夜，入园四人。", spec("none"))).toBe("");
  });

  it("can commit the final rewritten form when the morph becomes a fact", () => {
    const finalSpec = { ...spec("final"), sequence: ["五"] };
    expect(morphLogText("中元夜，入园四人。", finalSpec)).toBe("中元夜，入园五人。");
  });
});
