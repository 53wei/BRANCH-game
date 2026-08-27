import type { ChapterManifest, MemoryLayer } from "../types";
import { northDialogueSequences, northObjectives } from "./north-tower-objectives";

const wifeMemory: MemoryLayer = {
  id: "wife",
  character: "顾蘅秋",
  label: "夫人的证词",
  description: "暖金灯影掩住账页边角，北楼二层却留下她不愿承认的脚步。",
  visual: { fog: "#1d1816", ambient: "#3b2c28", keyLight: "#d9a56f", exposure: 0.88, lut: "warm-amber" },
  topologyOverrides: ["wife-upper-shadow"],
  collisionGroup: 2,
  switchRegions: ["north-tower", "east-rockery"],
};

const gardenerMemory: MemoryLayer = {
  id: "gardener",
  character: "周守圃",
  label: "园丁的证词",
  description: "湿苔覆盖砖缝，假山后的路被记成一段绕回原处的泥径。",
  visual: { fog: "#071713", ambient: "#17382f", keyLight: "#82b294", exposure: 0.78, lut: "wet-moss" },
  topologyOverrides: ["gardener-rockery-loop"],
  collisionGroup: 4,
  switchRegions: ["north-tower", "east-rockery"],
};

const accountantMemory: MemoryLayer = {
  id: "accountant",
  character: "钱先生",
  label: "账房的证词",
  description: "北楼像一册过度工整的账本；只有借景窗和秘密通道破坏了它的对称。",
  visual: { fog: "#09141d", ambient: "#183143", keyLight: "#83b8dc", exposure: 0.84, lut: "ledger-blue" },
  topologyOverrides: ["accountant-borrowed-window", "accountant-secret-passage"],
  collisionGroup: 8,
  switchRegions: ["north-tower", "east-rockery"],
};

export const northTowerChapter: ChapterManifest = {
  id: "north-tower-ledger",
  index: 2,
  title: "第二章·北楼暗账",
  subtitle: "过去与现在互相改路",
  logline: "穿过账房记忆里的借景窗，在过去移动假山，并在现在找到一条直达东院的秘密通道。",
  estimatedMinutes: [15, 25],
  status: "playable",
  unlock: { chapterId: "west-corridor-loop", requiredFlags: ["west.chapter.complete"] },
  assetPack: {
    id: "north-tower-whitebox-v0.1",
    initialBudgetMb: 12,
    preload: ["procedural/north-tower", "audio/rain-loop"],
    deferred: ["models/north-tower", "audio/accountant-voice"],
  },
  spawnAnchor: "north-tower-entry",
  memories: [accountantMemory, wifeMemory, gardenerMemory],
  contradictions: [
    {
      id: "window-scratches",
      label: "窗框翻越痕",
      description: "账房说窗户整夜紧闭，夫人记忆里同一窗框却留下从外向内的三道新划痕。",
      position: [-5.7, 1.25, -8.8],
      kind: "object",
      requiredIndependentTestimonies: ["accountant", "wife"],
      confirmedByDefault: false,
      outputFlag: "north.contradiction.scratches",
    },
    {
      id: "secret-passage",
      label: "直达东院的暗道",
      description: "账房记得一条畅通暗道，园丁却把同一位置记成回环泥径；两者都否定了‘从未去过东院’。",
      position: [-12.5, 1.2, -10],
      kind: "geometry",
      requiredIndependentTestimonies: ["accountant", "gardener"],
      confirmedByDefault: false,
      outputFlag: "north.contradiction.passage",
    },
  ],
  puzzleGraph: {
    nodes: [
      { id: "reach-upper-floor", title: "登上北楼", ruleStage: "teach", prerequisites: [], interaction: "沿一层算盘格找到楼梯，进入二层账房。", outputFlags: ["north.reached.upper-floor"], softHint: "越整齐的格子，越像有人刻意安排的路线。" },
      { id: "cross-borrowed-window", title: "窗里是过去", ruleStage: "teach", prerequisites: ["north.reached.upper-floor"], interaction: "在账房记忆中触碰借景窗，从二层进入案发前的东院。", outputFlags: ["north.borrowed-view.crossed"], softHint: "窗内雨还没有落到地上。" },
      { id: "move-past-rockery", title: "让过去让路", ruleStage: "invert", prerequisites: ["north.borrowed-view.crossed"], interaction: "在过去推动完整假山，再回到现在验证坍塌区域。", outputFlags: ["north.rockery.moved", "north.present.route-open"], softHint: "现在搬不动的石头，倒下之前也许可以。" },
      { id: "cross-check-evidence", title: "暗账之外的路", ruleStage: "combine", prerequisites: ["north.present.route-open"], interaction: "分别在两份证词中勘验窗框划痕和秘密通道。", outputFlags: ["north.contradiction.scratches", "north.contradiction.passage"], softHint: "账房里的数字可以平，窗框上的硬痕不会。" },
      { id: "north-trust", title: "采用谁的北楼", ruleStage: "combine", prerequisites: ["north.contradiction.scratches", "north.contradiction.passage"], interaction: "选择账房、园丁或夫人的记忆作为本章主图层。", outputFlags: ["north.trust.decided"], softHint: "选择不是判定真凶，而是决定下一步采用哪份工作假设。" },
    ],
  },
  trustNodes: [
    {
      id: "north-route-owner",
      prompt: "哪份记忆应成为北楼的主图层？",
      prerequisiteFlags: ["north.contradiction.scratches", "north.contradiction.passage"],
      options: [
        { id: "accountant", label: "相信账房：保留秘密通道", outputFlag: "north.trust.accountant" },
        { id: "gardener", label: "相信园丁：封闭暗道，露出带血剪刀", outputFlag: "north.trust.gardener" },
        { id: "wife", label: "相信夫人：显出二层私情证据", outputFlag: "north.trust.wife" },
      ],
    },
  ],
  chaseSegments: [],
  completionFlags: ["north.chapter.complete", "campaign.witness.accountant"],
  dialogueSequences: northDialogueSequences,
  objectives: northObjectives,
};
