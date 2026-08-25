import type { ChapterManifest, MemoryLayer } from "../types";
import { westDialogueSequences, westObjectives } from "./west-onboarding";

const wifeMemory: MemoryLayer = {
  id: "wife",
  character: "顾蘅秋",
  label: "夫人的证词",
  description: "冷金灯色维持秩序，水痕与名帖会显出被遮掩的边缘。",
  visual: { fog: "#10201e", ambient: "#294943", keyLight: "#e2b677", exposure: 0.92, lut: "cold-jade" },
  topologyOverrides: ["wife-dry-channel", "wife-moon-gate"],
  collisionGroup: 2,
  switchRegions: ["west-corridor", "borrowed-window"],
};

const gardenerMemory: MemoryLayer = {
  id: "gardener",
  character: "周守圃",
  label: "园丁的证词",
  description: "青绿水光暴露地势与水路，但回廊会把隐瞒的人送回原处。",
  visual: { fog: "#071713", ambient: "#183b31", keyLight: "#87b89a", exposure: 0.78, lut: "wet-moss" },
  topologyOverrides: ["gardener-reversed-channel", "gardener-loop"],
  collisionGroup: 4,
  switchRegions: ["west-corridor", "borrowed-window"],
};

export const westCorridorChapter: ChapterManifest = {
  id: "west-corridor-loop",
  index: 1,
  title: "西廊回环",
  subtitle: "两个人都说自己没有走过这里",
  logline: "在夫人与园丁互不相容的记忆中勘验西廊，找出被改写的水路，并从重复的回廊逃过第一次追逐。",
  estimatedMinutes: [12, 20],
  status: "playable",
  unlock: { chapterId: "prologue-rain", requiredFlags: ["prologue.examiner-appointed"] },
  assetPack: {
    id: "west-courtyard-v0.1",
    initialBudgetMb: 18,
    preload: ["procedural/west-corridor", "audio/rain-loop", "media/hero-hearing-rain"],
    deferred: ["video/west-corridor-transition", "character/faceless-owner"],
  },
  spawnAnchor: "west-entry",
  memories: [wifeMemory, gardenerMemory],
  contradictions: [
    {
      id: "waterline-direction",
      label: "逆向水痕",
      description: "夫人记忆中的干渠，在园丁证词里留下朝水榭倒流的苔线。",
      position: [-2.6, 1.1, -9],
      kind: "geometry",
      requiredIndependentTestimonies: ["wife", "gardener"],
      confirmedByDefault: false,
      outputFlag: "west.contradiction.waterline",
    },
    {
      id: "corridor-count",
      label: "第七码步",
      description: "同一组漏窗重复出现；不是园子太长，而是证词把出口接回了入口。",
      position: [2.5, 1.2, -22],
      kind: "geometry",
      requiredIndependentTestimonies: ["wife", "gardener"],
      confirmedByDefault: false,
      outputFlag: "west.contradiction.loop",
    },
  ],
  puzzleGraph: {
    nodes: [
      {
        id: "teach-memory",
        title: "同地异景",
        ruleStage: "teach",
        prerequisites: [],
        interaction: "在铜铃范围内切换夫人/园丁记忆，并分别观察水痕。",
        outputFlags: ["west.learned.memory-switch"],
        softHint: "先别急着向前，听见铜铃时看同一块青砖。",
      },
      {
        id: "combine-waterline",
        title: "水不说谎",
        ruleStage: "combine",
        prerequisites: ["west.learned.memory-switch"],
        interaction: "从两份证词独立标记同一条逆向水痕。",
        outputFlags: ["west.contradiction.waterline"],
        softHint: "干渠没有水，但苔藓仍记得水走过的方向。",
      },
      {
        id: "invert-loop",
        title: "错的出口",
        ruleStage: "invert",
        prerequisites: ["west.contradiction.waterline"],
        interaction: "在园丁记忆走入回环，再借夫人的月洞门跳出重复拓扑。",
        outputFlags: ["west.contradiction.loop", "west.portal.escaped"],
        softHint: "如果路本身在说谎，就别用同一份证词寻找出口。",
      },
      {
        id: "trust-reconstruction",
        title: "相信谁的动机",
        ruleStage: "combine",
        prerequisites: ["west.contradiction.waterline", "west.contradiction.loop"],
        interaction: "判断改水究竟是谋杀动作，还是阻止仪式的破坏。",
        outputFlags: ["west.trust.decided"],
        softHint: "动过水路的人未必想让水榭进水；先看水最初应该流向哪里。",
      },
    ],
  },
  trustNodes: [
    {
      id: "west-water-motive",
      prompt: "周守圃为什么改动水路？",
      prerequisiteFlags: ["west.contradiction.waterline", "west.contradiction.loop"],
      options: [
        { id: "protect", label: "他在破坏还魂局，却误让逆水灌入水榭", outputFlag: "west.trust.gardener-protect" },
        { id: "murder", label: "他早已计算好水路，要让园主死在反锁水榭", outputFlag: "west.trust.gardener-murder" },
      ],
    },
  ],
  chaseSegments: [
    {
      id: "faceless-owner-west",
      title: "没有脸的人认出了你",
      triggerFlags: ["west.trust.decided"],
      startAnchor: "loop-seventh-window",
      safeAnchor: "wife-moon-gate",
      checkpointSeconds: 18,
      narrativeReveal: "残影没有追问证据，只反复喊出一句：把名字还给我。",
    },
  ],
  completionFlags: ["west.chapter.complete", "campaign.witness.wife", "campaign.witness.gardener"],
  dialogueSequences: westDialogueSequences,
  objectives: westObjectives,
};
