import type { DialogueSequence, ObjectiveDefinition } from "../types";
import { STORY_BACKDROPS } from "../narrative/story-backdrops";

export const westDialogueSequences: DialogueSequence[] = [
  // Sequence ids remain stable for old saves; their authored text now follows V5 scenes 1-1～1-6.
  { id: "opening", knotId: "opening", presentation: "stage", participants: ["zhaoying", "wife"], completionFlag: "west.dialogue.breakfast-complete" },
  { id: "wife-arrival", knotId: "wife_arrival", presentation: "stage", participants: ["zhaoying", "steward"], completionFlag: "west.dialogue.wife-complete" },
  { id: "gardener-arrival", knotId: "gardener_arrival", presentation: "stage", participants: ["zhaoying", "wife", "steward"], completionFlag: "west.dialogue.gardener-complete" },
  { id: "waterline-confirmed", knotId: "waterline_confirmed", presentation: "stage", participants: ["zhaoying", "wife", "steward"], completionFlag: "west.dialogue.path-complete", backdrop: STORY_BACKDROPS["ch1.wall-vs-path"] },
  { id: "loop-first-observation", knotId: "loop_first_observation", presentation: "stage", participants: ["zhaoying", "steward"], completionFlag: "west.dialogue.loop-hint-complete", backdrop: STORY_BACKDROPS["ch1.loop"] },
  { id: "anchor-confirmed", knotId: "anchor_confirmed", presentation: "stage", participants: ["zhaoying", "steward"], completionFlag: "west.dialogue.anchor-confirmed" },
  { id: "completion", knotId: "completion", presentation: "stage", participants: ["zhaoying", "steward"], completionFlag: "west.dialogue.completion-complete" },
];

const noAnswerHints: [string, string, string] = [
  "先看墙脚：水痕、泥和被碰倒的灯都在说明有人从这里经过。",
  "金色灯影只负责把你带到同一个勘验点，不会替你判断哪份证词正确。",
  "靠近墙脚标记后按 F；记录完一份，再用 Tab 在同一位置复查另一份。",
];

export const westObjectives: ObjectiveDefinition[] = [
  {
    id: "west-arrival",
    title: "进入西侧旧园",
    description: "从园门沿湿石路进入旧园，先把你亲眼见到的空间记下来。",
    completionFlags: ["west.arrived"],
    steps: [{ id: "follow-lantern", instruction: "从园门沿湿石路进入西侧旧园", targetRef: { kind: "trigger", id: "front-hall-to-west" }, guidance: ["objective", "direction", "world-marker", "light", "audio"], hints: ["不要绕去地图外侧，顺着城墙内的湿石路走。", "纸灯标记的是西侧旧园入口，也就是前方亮起的石路尽头。", "沿路走到旧园入口的金色标记。"] }],
  },
  {
    // Compatibility id remains west-waterline until old saves are fully migrated;
    // the actual chapter content is now the contradictory side-path evidence.
    id: "west-waterline",
    title: "核对不存在的侧路",
    description: "同一段墙脚，一份证词记得这里只有墙，另一份却记得这里一直能走。",
    completionFlags: ["west.contradiction.waterline"],
    steps: [
      { id: "inspect-wife", instruction: "在夫人证词中勘验封死的墙脚", targetRef: { kind: "interactable", id: "waterline-direction" }, targetInteractableId: "waterline-direction", guidance: ["objective", "direction", "world-marker", "outline", "light"], hints: noAnswerHints },
      { id: "switch-gardener", instruction: "保持位置不变，按 Tab 切换到老周的证词", guidance: ["objective"], hints: ["不要离开勘验点。", "真正要比较的是同一地点在两个人记忆中的差异。", "按 Tab 切换到老周的证词。"] },
      { id: "inspect-gardener", instruction: "在老周证词中复查同一段墙脚", targetRef: { kind: "interactable", id: "waterline-direction" }, targetInteractableId: "waterline-direction", guidance: ["objective", "direction", "world-marker", "outline", "light"], hints: noAnswerHints },
    ],
  },
  {
    id: "west-loop",
    title: "走完那条“存在”的路",
    description: "老周记得侧路存在，但走进去的人却会回到同一个地标。",
    completionFlags: ["west.contradiction.loop"],
    steps: [
      { id: "inspect-seventh-window", instruction: "沿老周记得的侧路走到重复地标", targetRef: { kind: "interactable", id: "corridor-count" }, targetInteractableId: "corridor-count", guidance: ["objective", "direction"], hints: ["记住你第一次经过的漏窗和灯。", "如果同一个地标再次出现，不要立刻掉头。", "走到重复出现的漏窗前再仔细调查。"] },
      { id: "cross-check-window", instruction: "在同一地标切换另一份证词，再复查一次", targetRef: { kind: "interactable", id: "corridor-count" }, targetInteractableId: "corridor-count", guidance: ["objective"], hints: ["一份证词只能证明一条路走不通。", "保持位置不变，比较另一份听雨轩。", "按 Tab 切换证词，再按 F 勘验重复地标。"] },
    ],
  },
];
