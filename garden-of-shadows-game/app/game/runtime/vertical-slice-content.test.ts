import { describe, expect, it } from "vitest";
import { getGameplayAnchor } from "./tingyuxuan-gameplay-map";
import {
  PROLOGUE_ANOMALY_POINT,
  PROLOGUE_EVIDENCE,
  PROLOGUE_LANDMARKS,
  PROLOGUE_STEWARD_POINT,
} from "./vertical-slice-content";

const evidence = (id: "umbrella" | "shoes" | "ledger") => PROLOGUE_EVIDENCE.find((item) => item.id === id)!;
const landmark = (id: "gate-back-view" | "window-row" | "lantern-turn") => PROLOGUE_LANDMARKS.find((item) => item.id === id)!;

describe("vertical-slice content coordinate source", () => {
  it("derives all prologue world/interact/map targets from Gameplay Map anchors", () => {
    expect(evidence("umbrella").position).toBe(getGameplayAnchor("PROLOGUE_UMBRELLA").position);
    expect(evidence("shoes").position).toBe(getGameplayAnchor("PROLOGUE_SHOES").position);
    expect(evidence("ledger").position).toBe(getGameplayAnchor("PROLOGUE_LEDGER").position);
    expect(PROLOGUE_STEWARD_POINT.position).toBe(getGameplayAnchor("PROLOGUE_STEWARD").position);
    expect(PROLOGUE_ANOMALY_POINT.position).toBe(getGameplayAnchor("PROLOGUE_ANOMALY").position);
    expect(landmark("window-row").position).toBe(getGameplayAnchor("PROLOGUE_WINDOW_ROW").position);
    expect(landmark("lantern-turn").position).toBe(getGameplayAnchor("PROLOGUE_LANTERN_TURN").position);
    expect(landmark("gate-back-view").position).toBe(getGameplayAnchor("PROLOGUE_MOONGATE_VIEW").position);
  });
});
