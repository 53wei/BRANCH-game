import type { DialogueSequence, MemoryLayer } from "../types";

export const youDidNotReturnMemory: MemoryLayer = {
  id: "zhaoying",
  character: "赵映",
  label: "案发雨夜 · 赵映的折返",
  description: "赵映沿前四章彼此吻合的路线与空间，重走她在案发雨夜留下的动作。",
  visual: { fog: "#111619", ambient: "#20272c", keyLight: "#9aa5a7", exposure: 0.76, lut: "rain-flashback" },
  topologyOverrides: [],
  collisionGroup: 1,
  switchRegions: ["front-gate", "west-courtyard", "b-main-court", "b-inner-house", "water-court"],
};

export const youDidNotReturnDialogueSequences: DialogueSequence[] = [
  { id: "flashback-return-route", knotId: "flashback_return_route", presentation: "stage", participants: ["zhaoying", "young-zhaoying"], completionFlag: "you-did-not-return.scene.5-1-complete", backdrop: "/media/cg/story-v1/cg-01-rain-return-v1.png" },
  { id: "flashback-return-room", knotId: "flashback_return_room", presentation: "stage", participants: ["zhaoying", "young-zhaoying"], completionFlag: "you-did-not-return.scene.5-2-complete", backdrop: "/media/cg/story-v1/cg-04-child-room-v1.png" },
  { id: "flashback-argument", knotId: "flashback_argument", presentation: "stage", participants: ["young-zhaoying", "master"], completionFlag: "you-did-not-return.scene.5-3-complete", backdrop: "/media/cg/story-v1/cg-05-water-pavilion-argument-v1.png" },
  { id: "flashback-accident", knotId: "flashback_accident", presentation: "stage", participants: ["zhaoying", "young-zhaoying", "master"], completionFlag: "you-did-not-return.scene.5-4-complete", backdrop: "/media/cg/story-v1/cg-06-wooden-steps-accident-v1.png" },
  { id: "flashback-four-arrive", knotId: "flashback_four_arrive", presentation: "stage", participants: ["zhaoying", "young-zhaoying", "master", "wife", "steward"], completionFlag: "you-did-not-return.scene.5-5-complete", backdrop: "/media/cg/story-v1/cg-06-wooden-steps-accident-v1.png" },
  { id: "flashback-cover-plan", knotId: "flashback_cover_plan", presentation: "stage", participants: ["young-zhaoying", "steward", "wife", "accountant", "painter"], completionFlag: "you-did-not-return.scene.5-6-complete", backdrop: "/media/cg/story-v1/cg-07-erasure-montage-v1.png" },
  { id: "flashback-delayed-treatment", knotId: "flashback_delayed_treatment", presentation: "stage", participants: ["zhaoying", "wife", "steward", "accountant"], completionFlag: "you-did-not-return.scene.5-7-complete", backdrop: "/media/cg/story-v1/cg-07-erasure-montage-v1.png" },
  { id: "flashback-present-return", knotId: "flashback_present_return", presentation: "stage", participants: ["zhaoying", "wife", "steward", "accountant"], completionFlag: "you-did-not-return.scene.5-8-complete", backdrop: "/media/cg/story-v1/cg-05-water-pavilion-argument-v1.png" },
];
