import type { ChapterManifest, MemoryLayer } from "../types";
import { northDialogueSequences, northObjectives } from "./north-tower-objectives";

const wifeMemory: MemoryLayer = {
  id: "wife",
  character: "沈夫人",
  label: "夫人的认知",
  description: "家庭生活痕迹更稳定：杯子、座位与被收起的物品比纸面记录更可信。",
  visual: { fog: "#181816", ambient: "#302b25", keyLight: "#caa16c", exposure: 0.86, lut: "domestic-amber" },
  topologyOverrides: ["wife-life-traces"],
  collisionGroup: 2,
  switchRegions: ["b-main-court", "b-inner-house"],
};

const accountantMemory: MemoryLayer = {
  id: "accountant",
  character: "钱先生",
  label: "钱先生的认知",
  description: "被写下、登记和归档的东西最稳定；修改过的记录反而留下更清楚的制度痕迹。",
  visual: { fog: "#0d151b", ambient: "#1b2a33", keyLight: "#8caec0", exposure: 0.82, lut: "document-blue" },
  topologyOverrides: ["accountant-record-stability"],
  collisionGroup: 8,
  switchRegions: ["b-main-court", "b-inner-house"],
};

const painterMemory: MemoryLayer = {
  id: "painter",
  character: "柳生",
  label: "柳生的认知",
  description: "同一人影只在特定框景和观看角度成立；离开那个位置，它又变得无法确认。",
  visual: { fog: "#121518", ambient: "#25282b", keyLight: "#a8a394", exposure: 0.8, lut: "pictorial-grey" },
  topologyOverrides: ["painter-framed-view"],
  collisionGroup: 16,
  switchRegions: ["b-main-court", "b-inner-house"],
};

export const northTowerChapter: ChapterManifest = {
  // Historical chapter id stays stable for save compatibility. The chapter no
  // longer means a separate North Tower whitebox; it is the B-zone main-house
  // investigation inside the final Master Scene.
  id: "north-tower-ledger",
  index: 2,
  title: "第二章·多出来的人",
  subtitle: "第五人确实存在",
  logline: "旧脚印把赵映带进主宅。钱先生无意中摆出第六只茶杯，离园记录留下改写痕迹，柳生的旧画又在特定角度显出额外人影。三件事共同指向同一个结论：案发当晚还存在第五个人。",
  estimatedMinutes: [20, 35],
  status: "playable",
  unlock: { chapterId: "west-corridor-loop", requiredFlags: ["west.chapter.complete", "campaign.route.a-to-b-open"] },
  assetPack: {
    id: "tingyuxuan-master-v1",
    initialBudgetMb: 100,
    preload: ["/assets/fidelity/TYX_Master_Scene.glb", "/media/cg/story-v1/cg-03-liusheng-fifth-figure-v1.png", "/basis/basis_transcoder.js", "/basis/basis_transcoder.wasm"],
    deferred: [],
  },
  spawnAnchor: "ROUTE_05_B_MAIN_COURT",
  memories: [wifeMemory, accountantMemory, painterMemory],
  contradictions: [],
  puzzleGraph: {
    nodes: [
      {
        id: "sixth-used-cup",
        title: "第六只茶杯",
        ruleStage: "teach",
        prerequisites: [],
        interaction: "在主宅院落检查实际被使用过的第六只茶杯，只记录杯沿、水痕和数量，不推断身份。",
        outputFlags: ["north.evidence.sixth-cup"],
        softHint: "先证明它被用过，再问是谁用的。",
      },
      {
        id: "modified-departure-record",
        title: "被改过的离园记录",
        ruleStage: "combine",
        prerequisites: ["north.evidence.sixth-cup"],
        interaction: "在主宅内侧检查原字、后补墨色和压痕，确认离园时间被事后修改。",
        outputFlags: ["north.evidence.departure-record"],
        softHint: "记录可以说谎，修改痕迹本身不会。",
      },
      {
        id: "framed-rain-figure",
        title: "框景里的人影",
        ruleStage: "invert",
        prerequisites: ["north.evidence.departure-record"],
        interaction: "切到柳生认知，在 B_IMAGE_EVIDENCE 复现画稿视角，只有角度成立时才能固定额外人影。",
        outputFlags: ["north.evidence.rain-figure"],
        softHint: "不要找人，先找柳生当时站在哪里。",
      },
      {
        id: "fifth-person-gate",
        title: "三个通道，一个第五人",
        ruleStage: "combine",
        prerequisites: ["north.evidence.sixth-cup", "north.evidence.departure-record", "north.evidence.rain-figure"],
        interaction: "把生活物件、文字记录、图像观看三个独立通道放在一起，只确认第五人存在，不确认身份。",
        outputFlags: ["north.fifth-person.confirmed"],
        softHint: "本章的问题是‘有没有’，不是‘是谁’。",
      },
    ],
  },
  trustNodes: [],
  chaseSegments: [],
  completionFlags: ["north.chapter.complete", "north.fifth-person.confirmed", "campaign.route.b-investigation-complete"],
  dialogueSequences: northDialogueSequences,
  objectives: northObjectives,
};
