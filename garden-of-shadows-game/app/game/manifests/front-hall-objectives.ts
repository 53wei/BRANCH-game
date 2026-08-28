import type { DialogueSequence, ObjectiveDefinition } from "../types";

export const frontHallDialogueSequences: DialogueSequence[] = [
  { id: "front-opening", knotId: "front_opening", presentation: "stage", participants: ["zhaoying", "painter"], defaultRightSpeaker: "painter", completionFlag: "front.dialogue.opening", backdrop: "/media/cg/front-unfinished-hall.webp" },
  { id: "front-painting", knotId: "front_painting", presentation: "stage", participants: ["zhaoying", "painter"], defaultRightSpeaker: "painter", completionFlag: "front.dialogue.painting", backdrop: "/media/cg/front-painted-door.webp" },
  { id: "front-lock", knotId: "front_lock", presentation: "stage", participants: ["zhaoying", "wife", "gardener", "accountant", "painter"], defaultRightSpeaker: "painter", completionFlag: "front.dialogue.lock", backdrop: "/media/cg/front-fourfold-lock.webp" },
  { id: "front-completion", knotId: "front_completion", presentation: "stage", participants: ["zhaoying", "steward"], defaultRightSpeaker: "steward", completionFlag: "front.dialogue.completion", backdrop: "/media/cg/front-fourfold-lock.webp" },
];

export const frontHallObjectives: ObjectiveDefinition[] = [
  {
    id: "front-painter",
    title: "走进未完成的证词",
    description: "柳生说自己只在前厅等候；先看他留下的画。",
    completionFlags: ["front.mark.painter"],
    steps: [{ id: "inspect-easel", instruction: "沿主走廊找到柳生的画架", targetPosition: [0, 1.1, -4], targetInteractableId: "painter-easel", guidance: ["objective", "direction", "world-marker", "outline"], hints: ["饱和的颜色会指向仍被记住的地方。", "保持柳生证词，沿画布碎片向前。", "走到走廊中段的画架前按 F。"] }],
  },
  {
    id: "front-marks",
    title: "收集四份证词的印记",
    description: "同一座前厅藏着四件不能由单一证词解释的物品。",
    completionFlags: ["front.mark.wife", "front.mark.gardener", "front.mark.accountant", "front.mark.painter"],
    steps: [
      { id: "wife-jade", instruction: "在夫人证词中找回丢失的玉佩", targetPosition: [4.2, 1.1, -2], targetInteractableId: "wife-jade", guidance: ["objective", "direction", "world-marker"], hints: ["偏厅里有一件她说已经丢失的东西。", "按 Tab 切到夫人证词，进入右侧偏厅。", "在红色梳妆台前按 F。"] },
      { id: "gardener-shears", instruction: "在园丁证词中取出园艺剪", targetPosition: [-3.2, 1.1, -11], targetInteractableId: "gardener-shears", guidance: ["objective", "direction", "world-marker"], hints: ["中庭假山在不同证词中不在同一位置。", "切到园丁证词，靠近左侧假山。", "在苔绿色假山前按 F。"] },
      { id: "accountant-page", instruction: "在账房证词中找到夹页", targetPosition: [3.1, 1.1, -10], targetInteractableId: "accountant-page", guidance: ["objective", "direction", "world-marker"], hints: ["白纸在靛蓝网格里最显眼。", "切到账房证词，查看中庭右侧案台。", "在蓝色账案前按 F。"] },
    ],
  },
  {
    id: "front-lock",
    title: "打开四面锁",
    description: "四枚印记齐全。给四份证词排出暂时的可信顺序。",
    completionFlags: ["front.chapter.complete"],
    steps: [{ id: "open-lock", instruction: "在东院入口操作四面锁", targetPosition: [0, 1.2, -17], targetInteractableId: "fourfold-lock", guidance: ["objective", "direction", "world-marker", "light"], hints: ["锁需要四枚印记，不需要唯一真凶。", "确认右上角显示 4/4，然后继续向中庭深处走。", "在东院门前的四面锁按 F，再完成两次选择。"] }],
  },
];
