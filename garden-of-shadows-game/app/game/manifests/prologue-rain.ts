import type { ChapterManifest, MemoryLayer } from "../types";

const baselineMemory: MemoryLayer = {
  id: "baseline",
  character: "赵映",
  label: "此刻的听雨轩",
  description: "还没有借用任何人的认知。眼前的一切暂时只算你亲眼看见的现实。",
  visual: { fog: "#0a1715", ambient: "#18302b", keyLight: "#a9b5a8", exposure: 0.82, lut: "rain-baseline" },
  topologyOverrides: [],
  collisionGroup: 1,
  switchRegions: ["front-gate"],
};

export const prologueRainChapter: ChapterManifest = {
  id: "prologue-rain",
  index: 0,
  title: "序章·回园",
  subtitle: "七年后，赵映回来取走留在听雨轩的旧物",
  logline: "连日雨夜，赵映因沈夫人的一句口信回到长大的听雨轩。老周仍记得她进门前要蹭掉鞋底泥，前厅也仍留着沈夫人准备的茶点；直到她走过熟悉的西院回廊，刚才还在的月洞门变成了一整面湿墙。",
  estimatedMinutes: [7, 12],
  status: "playable",
  unlock: { requiredFlags: [] },
  assetPack: {
    id: "tingyuxuan-master-v1",
    initialBudgetMb: 100,
    preload: ["/assets/fidelity/TYX_Master_Scene.glb", "/media/cg/story-v1/cg-01-rain-return-v1.png", "/media/cg/story-v1/cg-02-family-portrait-v1.png", "/basis/basis_transcoder.js", "/basis/basis_transcoder.wasm"],
    deferred: [],
  },
  spawnAnchor: "ROUTE_01_START",
  memories: [baselineMemory],
  contradictions: [],
  puzzleGraph: {
    nodes: [
      {
        id: "prologue-traces",
        title: "回到生活过的地方",
        ruleStage: "teach",
        prerequisites: [],
        interaction: "先和老周完成正常的归园对话，再在前厅查看补过的旧画像与有压痕的离家记录；两件物品只提供事实，不替玩家宣布赵映被删除。",
        outputFlags: ["prologue.trace.seen"],
        softHint: "这里首先是赵映生活过的家，疑点要从熟悉的日常里慢慢出现。",
      },
      {
        id: "prologue-entry-rule",
        title: "第一处具体矛盾",
        ruleStage: "combine",
        prerequisites: ["prologue.trace.seen"],
        interaction: "沿西院回廊自然记住六扇漏窗、转角灯与月洞门远景；从水榭外原路返回时，月洞门消失，原处只剩苔痕连续的湿墙。",
        outputFlags: ["prologue.examiner-appointed"],
        softHint: "序章只留下一个新问题：赵映与老周是否真的记得两条不同的路。",
      },
    ],
  },
  trustNodes: [],
  chaseSegments: [],
  completionFlags: ["prologue.complete", "prologue.dialogue.complete", "prologue.examiner-appointed"],
  dialogueSequences: [],
  objectives: [],
};
