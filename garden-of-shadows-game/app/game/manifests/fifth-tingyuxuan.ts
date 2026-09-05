import type { DialogueSequence, MemoryLayer } from "../types";

export const fifthTingYuXuanMemory: MemoryLayer = {
  id: "zhaoying",
  character: "赵映",
  label: "第五种听雨轩",
  description: "只保留已经由前五章验证过的共同事实；不再把任何单一证词当成绝对现实。",
  visual: { fog: "#17201f", ambient: "#303a36", keyLight: "#c5bd9f", exposure: 0.9, lut: "dawn-neutral" },
  topologyOverrides: [],
  collisionGroup: 1,
  switchRegions: ["front-gate", "west-courtyard", "corridor", "inner-house", "water-court"],
};

export const fifthTingYuXuanDialogueSequences: DialogueSequence[] = [
  { id: "finale-gate", knotId: "finale_gate", presentation: "stage", participants: ["zhaoying"], completionFlag: "finale.route.gate" },
  { id: "finale-side-route", knotId: "finale_side_route", presentation: "stage", participants: ["zhaoying"], completionFlag: "finale.route.side" },
  { id: "finale-old-room", knotId: "finale_old_room", presentation: "stage", participants: ["zhaoying"], completionFlag: "finale.route.room" },
  { id: "finale-water", knotId: "finale_water", presentation: "stage", participants: ["zhaoying"], completionFlag: "finale.route.water" },
  { id: "finale-wife-goodbye", knotId: "finale_wife_goodbye", presentation: "stage", participants: ["zhaoying", "wife"], completionFlag: "finale.goodbye.wife" },
  { id: "finale-steward-goodbye", knotId: "finale_steward_goodbye", presentation: "stage", participants: ["zhaoying", "steward"], completionFlag: "finale.goodbye.steward" },
  { id: "finale-accountant-goodbye", knotId: "finale_accountant_goodbye", presentation: "stage", participants: ["zhaoying", "accountant"], completionFlag: "finale.goodbye.accountant" },
  { id: "finale-painter-goodbye", knotId: "finale_painter_goodbye", presentation: "stage", participants: ["zhaoying", "painter"], completionFlag: "finale.goodbye.painter" },
  { id: "finale-note", knotId: "finale_note", presentation: "stage", participants: ["zhaoying"], completionFlag: "finale.note-written" },
  { id: "finale-main-departure", knotId: "finale_main_departure", presentation: "stage", participants: ["zhaoying", "steward"], completionFlag: "finale.main-departure-complete", backdrop: "/media/cg/story-v1/cg-08-fifth-garden-departure-v1.png" },
];
