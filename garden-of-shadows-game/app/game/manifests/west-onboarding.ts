import type { DialogueSequence, ObjectiveDefinition } from "../types";

export const westDialogueSequences: DialogueSequence[] = [
  { id: "opening", knotId: "opening", presentation: "stage", participants: ["zhaoying", "steward"], defaultRightSpeaker: "steward", completionFlag: "prologue.dialogue.complete" },
  { id: "wife-arrival", knotId: "wife_arrival", presentation: "stage", participants: ["zhaoying", "wife"], defaultRightSpeaker: "wife", completionFlag: "west.dialogue.wife-complete" },
  { id: "gardener-arrival", knotId: "gardener_arrival", presentation: "stage", participants: ["zhaoying", "gardener"], defaultRightSpeaker: "gardener", completionFlag: "west.dialogue.gardener-complete" },
  { id: "waterline-confirmed", knotId: "waterline_confirmed", presentation: "stage", participants: ["zhaoying", "steward"], defaultRightSpeaker: "steward", completionFlag: "west.dialogue.waterline-complete" },
  { id: "loop-first-observation", knotId: "loop_first_observation", presentation: "bark", participants: ["zhaoying", "steward"], defaultRightSpeaker: "steward", completionFlag: "west.dialogue.loop-hint-complete" },
  { id: "trust", knotId: "trust", presentation: "stage", participants: ["zhaoying", "wife", "gardener"], defaultRightSpeaker: "gardener", completionFlag: "west.dialogue.trust-complete" },
  { id: "chase-intro", knotId: "chase_intro", presentation: "stage", participants: ["zhaoying", "steward"], defaultRightSpeaker: "steward", completionFlag: "west.dialogue.chase-complete" },
  { id: "completion", knotId: "completion", presentation: "stage", participants: ["zhaoying", "steward"], defaultRightSpeaker: "steward", completionFlag: "west.dialogue.completion-complete" },
];

const noAnswerHints: [string, string, string] = [
  "听一听铜铃传来的方向。",
  "金色灯影会标出当前需要核对的区域。",
  "沿着地面标记前进，到目标附近按 F 勘验。",
];

export const westObjectives: ObjectiveDefinition[] = [
  {
    id: "west-arrival",
    title: "进入西廊",
    description: "跟随提灯人的方向，领取第一份证词。",
    completionFlags: ["west.arrived"],
    steps: [{ id: "follow-lantern", instruction: "跟随提灯人，前往西廊入口", targetPosition: [0, 1.1, 0.5], guidance: ["objective", "direction", "world-marker", "light", "audio"], hints: ["先试着向前走。", "朝悬着纸灯的廊口前进。", "使用 WASD 走到前方 4 米处的金色标记。"] }],
  },
  {
    id: "west-waterline",
    title: "核对水路证词",
    description: "在同一条水渠上取得夫人与园丁的两份独立观察。",
    completionFlags: ["west.contradiction.waterline"],
    steps: [
      { id: "inspect-wife", instruction: "在夫人证词中勘验干渠", targetPosition: [-2.6, 1.1, -9], targetInteractableId: "waterline-direction", guidance: ["objective", "direction", "world-marker", "outline", "light"], hints: noAnswerHints },
      { id: "switch-gardener", instruction: "按 Tab，切换到园丁证词", guidance: ["objective"], hints: ["铜铃允许你重看同一个地方。", "切换证词后，园林的材质和水路都会改变。", "按 Tab 切换到周守圃的证词。"] },
      { id: "inspect-gardener", instruction: "在园丁证词中复查同一条水渠", targetPosition: [-2.6, 1.1, -9], targetInteractableId: "waterline-direction", guidance: ["objective", "direction", "world-marker", "outline", "light"], hints: noAnswerHints },
    ],
  },
  {
    id: "west-loop",
    title: "核对第七扇漏窗",
    description: "确认两份证词中的回廊是否通向同一个出口。",
    completionFlags: ["west.contradiction.loop"],
    steps: [
      { id: "inspect-seventh-window", instruction: "前往第七扇漏窗，核对回廊长度", targetPosition: [2.5, 1.2, -22], targetInteractableId: "corridor-count", guidance: ["objective", "direction"], hints: ["观察反复出现的窗格。", "沿右侧漏窗数到第七扇。", "走到西廊深处的第七扇漏窗并按 F。"] },
      { id: "cross-check-window", instruction: "切换另一份证词，在同一位置复查漏窗", targetPosition: [2.5, 1.2, -22], targetInteractableId: "corridor-count", guidance: ["objective"], hints: ["一份证词还不能确认矛盾。", "保持位置不变，切换证词。", "按 Tab 切换证词，再按 F 勘验第七扇漏窗。"] },
    ],
  },
  {
    id: "west-escape",
    title: "逃离被改写的证词",
    description: "园丁的回廊没有出口，夫人的记忆里仍留着一扇门。",
    completionFlags: ["west.chapter.complete"],
    steps: [{ id: "reach-moon-gate", instruction: "切到夫人证词，穿过亮起的月洞门", targetPosition: [0, 1.2, -27], targetInteractableId: "wife-moon-gate", guidance: ["objective", "direction", "world-marker", "light", "audio"], hints: ["月洞门只存在于一份证词中。", "园丁的证词会把你送回入口。", "按 Tab 切到夫人证词，向廊尾的金色月洞门奔跑。"] }],
  },
];
