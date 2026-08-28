import type { ChapterManifest, MemoryLayer } from "../types";
import { frontHallDialogueSequences, frontHallObjectives } from "./front-hall-objectives";

const memories: MemoryLayer[] = [
  { id: "painter", character: "柳生", label: "柳生的证词", description: "油彩和铅笔线在同一面墙上争夺完成权。", visual: { fog: "#17131c", ambient: "#382443", keyLight: "#d58b87", exposure: .9, lut: "unfinished-oil" }, topologyOverrides: ["corridor-erasure", "painted-door", "low-gravity-side-hall"], collisionGroup: 16, switchRegions: ["front-hall", "courtyard"] },
  { id: "wife", character: "顾蘅秋", label: "夫人的证词", description: "朱红与金色保留了她口中已经丢失的玉佩。", visual: { fog: "#211217", ambient: "#4a252c", keyLight: "#e3a070", exposure: .92, lut: "vermilion-gold" }, topologyOverrides: ["wife-jade"], collisionGroup: 2, switchRegions: ["front-hall", "courtyard"] },
  { id: "gardener", character: "周守圃", label: "园丁的证词", description: "假山向左偏移，死循环深处埋着园艺剪。", visual: { fog: "#071611", ambient: "#17352b", keyLight: "#79a884", exposure: .76, lut: "wet-moss" }, topologyOverrides: ["gardener-rockery", "gardener-shears"], collisionGroup: 4, switchRegions: ["front-hall", "courtyard"] },
  { id: "accountant", character: "钱先生", label: "账房的证词", description: "靛蓝网格把前厅化成账页，夹页却越过了北楼。", visual: { fog: "#091620", ambient: "#18384a", keyLight: "#80b7d9", exposure: .84, lut: "ledger-blue" }, topologyOverrides: ["accountant-page"], collisionGroup: 8, switchRegions: ["front-hall", "courtyard"] },
];

export const frontHallChapter: ChapterManifest = {
  id: "front-hall-guest",
  index: 3,
  title: "第三章·前厅访客",
  subtitle: "四份证词第一次同时展开",
  logline: "进入柳生未完成的记忆，在四套空间法则中收集印记，并决定谁的证词先转动四面锁。",
  estimatedMinutes: [18, 30],
  status: "playable",
  unlock: { chapterId: "north-tower-ledger", requiredFlags: ["north.chapter.complete"] },
  assetPack: { id: "front-hall-whitebox-v0.1", initialBudgetMb: 16, preload: ["procedural/front-hall", "media/cg/front-unfinished-hall.webp"], deferred: ["models/front-hall", "audio/painter-voice"] },
  spawnAnchor: "front-hall",
  memories,
  contradictions: [
    { id: "painted-door", label: "画中多出的一扇门", description: "柳生坚称画的是中庭，画里却有一扇现实中不存在的东院侧门。", position: [0, 1.3, -4], kind: "geometry", requiredIndependentTestimonies: ["painter", "accountant"], confirmedByDefault: false, outputFlag: "front.contradiction.painted-door" },
    { id: "vanishing-corridor", label: "回头消失的走廊", description: "柳生离开中庭后，身后的主走廊被记成白墙；夫人的记忆仍保留入口。", position: [0, 1.3, -7], kind: "time", requiredIndependentTestimonies: ["painter", "wife"], confirmedByDefault: false, outputFlag: "front.contradiction.vanishing-corridor" },
  ],
  puzzleGraph: { nodes: [
    { id: "painter-mark", title: "画中的第五条边", ruleStage: "teach", prerequisites: [], interaction: "检查柳生画架，取得画作印记。", outputFlags: ["front.mark.painter"], softHint: "画里的门不属于你站立的中庭。" },
    { id: "cross-check-laws", title: "先证明空间正在撒谎", ruleStage: "combine", prerequisites: ["front.mark.painter"], interaction: "用账房证词核对画中门，再用夫人证词核对消失走廊。", outputFlags: ["front.contradiction.painted-door", "front.contradiction.vanishing-corridor"], softHint: "一份记忆只能提出疑点，两份独立证词才能完成勘误。" },
    { id: "cross-memory-marks", title: "四份记忆，四枚印记", ruleStage: "combine", prerequisites: ["front.contradiction.painted-door", "front.contradiction.vanishing-corridor"], interaction: "切换夫人、园丁与账房证词，分别取得玉佩、园艺剪与账页。", outputFlags: ["front.mark.wife", "front.mark.gardener", "front.mark.accountant"], softHint: "按 Tab 改变空间，而不是反复搜索同一张地图。" },
    { id: "fourfold-lock", title: "四面锁", ruleStage: "combine", prerequisites: ["front.mark.painter", "front.mark.wife", "front.mark.gardener", "front.mark.accountant"], interaction: "选择最可信和最不可信的证人，让四枚印记按判断依次入锁。", outputFlags: ["front.trust.ranked", "front.chapter.complete"], softHint: "排序决定东院先采用谁的景象，不等于给案件定罪。" },
  ] },
  trustNodes: [{ id: "front-witness-ranking", prompt: "谁最可信，谁最不可信？", prerequisiteFlags: ["front.mark.painter", "front.mark.wife", "front.mark.gardener", "front.mark.accountant"], options: memories.map((memory) => ({ id: memory.id, label: memory.label, outputFlag: `front.trust.${memory.id}` })) }],
  chaseSegments: [],
  completionFlags: ["front.chapter.complete", "campaign.witness.painter"],
  dialogueSequences: frontHallDialogueSequences,
  objectives: frontHallObjectives,
};
