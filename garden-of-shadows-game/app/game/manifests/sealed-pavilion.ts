import type { ChapterManifest, MemoryLayer } from "../types";
import { sealedPavilionDialogueSequences, sealedPavilionObjectives } from "./sealed-pavilion-objectives";

const memories: MemoryLayer[] = [
  { id: "wife", character: "顾蘅秋", label: "夫人的证词", description: "后门仍开着，园主坐在椅上，像死亡尚未发生。", visual: { fog: "#21161a", ambient: "#50302f", keyLight: "#e0a16e", exposure: .9, lut: "preserved-vermilion" }, topologyOverrides: ["open-rear-door", "seated-body", "ordered-room"], collisionGroup: 2, switchRegions: ["pavilion-bank", "pavilion-interior"] },
  { id: "gardener", character: "周守圃", label: "园丁的证词", description: "屋顶漏雨，泥脚印横过凌乱水榭，尸体倒在地上。", visual: { fog: "#0a1712", ambient: "#1d392e", keyLight: "#76a183", exposure: .76, lut: "mud-green" }, topologyOverrides: ["roof-hole", "mud-room", "prone-body"], collisionGroup: 4, switchRegions: ["pavilion-bank", "pavilion-interior"] },
  { id: "accountant", character: "钱先生", label: "账房的证词", description: "密道只到地板下，屋内空无一物，连尸体也被账目抹去。", visual: { fog: "#091722", ambient: "#17394b", keyLight: "#78acd0", exposure: .82, lut: "ledger-empty" }, topologyOverrides: ["underfloor-tunnel", "empty-room", "missing-body"], collisionGroup: 8, switchRegions: ["pavilion-bank", "pavilion-interior"] },
  { id: "painter", character: "柳生", label: "柳生的证词", description: "破窗、画架和湿颜料把水榭记成一幅尚未干透的现场。", visual: { fog: "#18131d", ambient: "#40294a", keyLight: "#cf858d", exposure: .86, lut: "wet-paint" }, topologyOverrides: ["broken-window", "painted-room", "body-with-canvas"], collisionGroup: 16, switchRegions: ["pavilion-bank", "pavilion-interior"] },
];

export const sealedPavilionChapter: ChapterManifest = {
  id: "sealed-pavilion",
  index: 4,
  title: "第四章·水榭密室",
  subtitle: "四种入口只有一条因果链能够自洽",
  logline: "验证四份互不相容的水榭入口与死亡现场，把内锁、消失的出口、逆水和溺亡排列成唯一顺序。",
  estimatedMinutes: [24, 38],
  status: "playable",
  unlock: { chapterId: "front-hall-guest", requiredFlags: ["front.chapter.complete"] },
  assetPack: { id: "sealed-pavilion-whitebox-v0.1", initialBudgetMb: 12, preload: ["procedural/sealed-pavilion", "media/hero-hearing-rain.png"], deferred: ["models/sealed-pavilion-final", "media/cg/pavilion-*", "audio/pavilion-voices"] },
  spawnAnchor: "sealed-pavilion-entry",
  memories,
  contradictions: [
    { id: "locked-inside", label: "密室确由内部形成", description: "正门与后门的锁舌都从室内扣合，门外没有撬动痕迹。", position: [-3, 1.2, -7.5], kind: "geometry", requiredIndependentTestimonies: ["wife", "accountant"], confirmedByDefault: false, outputFlag: "pavilion.contradiction.locked-inside" },
    { id: "body-state", label: "同一具尸体的四种状态", description: "坐姿、倒地、缺席与画旁尸体占据同一时间和位置，无法同时成立。", position: [0, 1.2, -10], kind: "identity", requiredIndependentTestimonies: ["wife", "gardener", "accountant", "painter"], confirmedByDefault: false, outputFlag: "pavilion.contradiction.body-state" },
    { id: "reverse-water", label: "水由排水槽逆灌", description: "苔线与泥沙沉积证明水从低处进入反锁水榭，而不是由屋顶漏入。", position: [-2.8, 1.2, -12], kind: "causality", requiredIndependentTestimonies: ["gardener", "wife"], confirmedByDefault: false, outputFlag: "pavilion.contradiction.reverse-water" },
    { id: "vanished-exit", label: "出口在案发后消失", description: "破窗不足以解释单向脚印；屏画残留的湿颜料证明曾有一条短暂存在的画门。", position: [3, 1.2, -11], kind: "time", requiredIndependentTestimonies: ["painter", "accountant"], confirmedByDefault: false, outputFlag: "pavilion.contradiction.vanished-exit" },
  ],
  puzzleGraph: { nodes: [
    { id: "prove-lock", title: "先证明没有物理出口", ruleStage: "teach", prerequisites: [], interaction: "检查正门、锁舌与门外破坏痕迹。", outputFlags: ["pavilion.door.confirmed"], softHint: "密室成立，不等于没人离开过。" },
    { id: "retain-routes", title: "四条入口的时间差", ruleStage: "combine", prerequisites: ["pavilion.door.confirmed"], interaction: "至少核对两份入口证词，确认它们分别属于不同时间。", outputFlags: ["pavilion.routes.ready"], softHint: "问入口何时存在，而不是只问入口是否存在。" },
    { id: "four-death-scenes", title: "死亡现场四重曝光", ruleStage: "invert", prerequisites: ["pavilion.entered"], interaction: "在四份证词中勘验同一中央位置。", outputFlags: ["pavilion.body.all", "pavilion.contradiction.body-state"], softHint: "账房的‘空无一物’本身也是一份观察。" },
    { id: "unique-causality", title: "唯一自洽的顺序", ruleStage: "combine", prerequisites: ["pavilion.body.all"], interaction: "排列内锁、画门消失、逆水与溺亡。", outputFlags: ["pavilion.causality.complete", "pavilion.chapter.complete"], softHint: "所有人都只造成了一段条件，没有任何单一行为等于谋杀。" },
  ] },
  trustNodes: [{ id: "pavilion-final-trust", prompt: "终章前，你暂时采用谁的真相？", prerequisiteFlags: ["pavilion.causality.complete"], options: memories.map((memory) => ({ id: memory.id, label: memory.label, outputFlag: `pavilion.truth.${memory.id}` })) }],
  chaseSegments: [],
  completionFlags: ["pavilion.chapter.complete", "sealed-pavilion.complete", "case.unique-causal-chain"],
  dialogueSequences: sealedPavilionDialogueSequences,
  objectives: sealedPavilionObjectives,
};
