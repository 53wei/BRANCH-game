import type { ChapterManifest, MemoryLayer } from "../types";
import { interactablePosition } from "../runtime/tingyuxuan-layout";
import { westDialogueSequences, westObjectives } from "./west-onboarding";

const wifeMemory: MemoryLayer = {
  id: "wife",
  character: "沈夫人",
  label: "夫人的证词",
  description: "她记得西侧旧园的边界始终完整：那段墙从来没有路，东侧门洞却确实存在。",
  visual: { fog: "#10201e", ambient: "#294943", keyLight: "#e2b677", exposure: 0.92, lut: "cold-jade" },
  topologyOverrides: ["wife-sealed-side-path", "wife-east-gate"],
  collisionGroup: 2,
  switchRegions: ["west-corridor", "borrowed-window"],
};

const gardenerMemory: MemoryLayer = {
  id: "gardener",
  character: "老周",
  label: "老周的证词",
  description: "他记得墙脚一直有条侧路，但那条路会把人送回已经经过的地标。",
  visual: { fog: "#071713", ambient: "#183b31", keyLight: "#87b89a", exposure: 0.78, lut: "wet-moss" },
  topologyOverrides: ["gardener-side-path", "gardener-loop"],
  collisionGroup: 4,
  switchRegions: ["west-corridor", "borrowed-window"],
};

export const westCorridorChapter: ChapterManifest = {
  id: "west-corridor-loop",
  index: 1,
  title: "第一章·不存在的路",
  subtitle: "到底谁在撒谎？",
  logline: "沈夫人说西院墙脚从来没有路，老周却能说出灯、排水沟和青石的位置。赵映沿老周记得的侧路走进回环，借沈夫人记得的青石继续向前，最后在夹院发现一串朝主宅和水榭延伸的旧脚印。",
  estimatedMinutes: [15, 25],
  status: "playable",
  unlock: { chapterId: "prologue-rain", requiredFlags: ["prologue.examiner-appointed"] },
  assetPack: {
    id: "tingyuxuan-master-v1",
    initialBudgetMb: 100,
    preload: ["/assets/fidelity/TYX_Master_Scene.glb", "/basis/basis_transcoder.js", "/basis/basis_transcoder.wasm"],
    deferred: [],
  },
  spawnAnchor: "ROUTE_02_A_ENTRY",
  memories: [wifeMemory, gardenerMemory],
  contradictions: [
    {
      // Keep the historical id until schema-v3 save migration; player-facing
      // meaning has changed from water flow to the side-path contradiction.
      id: "waterline-direction",
      label: "不存在的侧路",
      description: "同一段墙脚，沈夫人记得这里只有封死的园墙；老周却记得一条长期有人经过的窄路。水痕、泥和倒灯又证明这里确实有过行动。",
      position: interactablePosition("waterline-direction"),
      kind: "geometry",
      requiredIndependentTestimonies: ["wife", "gardener"],
      confirmedByDefault: false,
      outputFlag: "west.contradiction.waterline",
    },
    {
      id: "corridor-count",
      label: "重复的地标",
      description: "老周记得的侧路可以进入，却会把人送回同一盏灯与同一扇漏窗；沈夫人的版本没有这条路，却保留了另一侧出口。",
      position: interactablePosition("corridor-count"),
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
        interaction: "站在同一段墙脚切换夫人 / 老周记忆，分别确认墙与侧路的存在条件。",
        outputFlags: ["west.learned.memory-switch"],
        softHint: "不要先问谁撒谎；先确认两个人是否真的看见了不同的边界。",
      },
      {
        id: "combine-side-path",
        title: "不存在的路",
        ruleStage: "combine",
        prerequisites: ["west.learned.memory-switch"],
        interaction: "用两份证词独立确认同一墙脚的冲突，再把现实痕迹作为第三种约束。",
        outputFlags: ["west.contradiction.waterline"],
        softHint: "墙可以被记成墙，脚印却仍然需要一条能让人经过的路线。",
      },
      {
        id: "invert-loop",
        title: "用共同参照打断回环",
        ruleStage: "invert",
        prerequisites: ["west.contradiction.waterline"],
        interaction: "进入老周记得的侧路并确认回环，再从沈夫人的空间版本借出青石，把它固定为两份空间都保留的落脚点。",
        outputFlags: ["west.contradiction.loop", "west.borrow-anchor.solved", "west.portal.escaped"],
        softHint: "老周记得路，沈夫人记得青石；单独任何一份都走不通。",
      },
    ],
  },
  trustNodes: [],
  chaseSegments: [],
  completionFlags: ["west.chapter.complete", "campaign.witness.wife", "campaign.witness.gardener", "campaign.route.a-to-b-open"],
  dialogueSequences: westDialogueSequences,
  objectives: westObjectives,
};
