import type { CampaignManifest, ChapterManifest } from "../types";
import { northTowerChapter } from "./north-tower-ledger";
import { frontHallChapter } from "./front-hall-guest";
import { sealedPavilionChapter } from "./sealed-pavilion";
import { westCorridorChapter } from "./west-corridor";

const planned = (
  id: string,
  index: number,
  title: string,
  subtitle: string,
  logline: string,
  previousId: string,
  flags: string[],
  memories: ChapterManifest["memories"] = [],
): ChapterManifest => ({
  id,
  index,
  title,
  subtitle,
  logline,
  estimatedMinutes: index === 0 ? [8, 12] : [35, 65],
  status: index === 0 ? "prototype" : "planned",
  unlock: index === 0 ? { requiredFlags: [] } : { chapterId: previousId, requiredFlags: flags },
  assetPack: { id: `${id}-pack`, initialBudgetMb: 0, preload: [], deferred: [] },
  spawnAnchor: `${id}-entry`,
  memories,
  contradictions: [],
  puzzleGraph: { nodes: [] },
  trustNodes: [],
  chaseSegments: [],
  completionFlags: [`${id}.complete`],
  dialogueSequences: [],
  objectives: [],
});

const prologue = planned(
  "prologue-rain",
  0,
  "序章·雨入听轩",
  "园子知道你来过",
  "在一座看似正常的园林建立空间基线，并从伪装成管家的残影手中接过勘验簿。",
  "",
  [],
);

const chapters: ChapterManifest[] = [
  prologue,
  westCorridorChapter,
  northTowerChapter,
  frontHallChapter,
  sealedPavilionChapter,
  planned("mirror-self", 5, "终章·镜中我", "第五份证词来自勘验人自己", "在倒流的镜廊中修正记忆片段，并决定接受还是继续否认。", "sealed-pavilion", ["sealed-pavilion.complete"]),
];

export const campaignManifest: CampaignManifest = {
  id: "garden-of-shadows",
  title: "游园惊梦",
  subtitle: "四面证词",
  version: "0.1R",
  chapterOrder: chapters.map((chapter) => chapter.id),
  chapters,
  endingRules: {
    truth: {
      title: "写真",
      description: "公开完整责任链，恢复沈照影本名，让听雨轩退化为一座普通园林。",
      requiredFlags: ["case.unique-causal-chain", "identity.zhaoying-restored"],
      requiredContradictions: 8,
      requiredNameAnchors: 3,
    },
    "borrowed-name": {
      title: "借名",
      description: "继承沈砚堂的姓名与园主权力，让他借沈照影继续存在。",
      requiredFlags: ["identity.owner-name-accepted"],
    },
    "river-lantern": {
      title: "放河灯",
      description: "保留证据，烧毁还魂谱，让五份证词都脱离园主控制。",
      requiredFlags: ["case.unique-causal-chain", "ritual.score-found"],
      requiredContradictions: 12,
      requiredNameAnchors: 4,
      hidden: true,
    },
  },
};

export const getChapter = (chapterId: string) => campaignManifest.chapters.find((chapter) => chapter.id === chapterId);
