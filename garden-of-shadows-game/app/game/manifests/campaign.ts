import type { CampaignManifest, ChapterManifest } from "../types";
import { missingRoomChapter } from "./missing-room";
import { deletedPersonDialogueSequences } from "./deleted-person";
import { northTowerChapter } from "./north-tower-ledger";
import { prologueRainChapter } from "./prologue-rain";
import { westCorridorChapter } from "./west-corridor";
import { youDidNotReturnDialogueSequences, youDidNotReturnMemory } from "./you-did-not-return";
import { fifthTingYuXuanDialogueSequences, fifthTingYuXuanMemory } from "./fifth-tingyuxuan";

const STORY_CG_PACKS: Readonly<Record<string, string[]>> = {
  "deleted-person": [
    "/media/cg/story-v1/cg-02-family-portrait-v1.png",
    "/media/cg/story-v1/cg-03-liusheng-fifth-figure-v1.png",
    "/media/cg/story-v1/cg-04-child-room-v1.png",
  ],
  "you-did-not-return": [
    "/media/cg/story-v1/cg-01-rain-return-v1.png",
    "/media/cg/story-v1/cg-05-water-pavilion-argument-v1.png",
    "/media/cg/story-v1/cg-06-wooden-steps-accident-v1.png",
    "/media/cg/story-v1/cg-07-erasure-montage-v1.png",
  ],
  "fifth-tingyuxuan": ["/media/cg/story-v1/cg-08-fifth-garden-departure-v1.png"],
};

const narrativeChapter = (
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
  estimatedMinutes: index === 0 ? [8, 15] : [35, 70],
  status: "playable",
  unlock: index === 0 ? { requiredFlags: [] } : { chapterId: previousId, requiredFlags: flags },
  assetPack: { id: `${id}-pack`, initialBudgetMb: 24, preload: STORY_CG_PACKS[id] ?? [], deferred: [] },
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

const chapterFour: ChapterManifest = {
  ...narrativeChapter(
    "deleted-person",
    4,
    "第四章·被删掉的人",
    "删除不是抛弃，而是保护",
    "沈夫人保存旧物、老周封掉侧路、钱先生固定离开记录、柳生藏起原画。四个人都在删除赵映当晚存在过的痕迹，而沈老爷未寄出的信让这些行为指向同一个保护决定。",
    "missing-room",
    ["missing-room.complete"],
  ),
  dialogueSequences: deletedPersonDialogueSequences,
};

const chapterFive: ChapterManifest = {
  ...narrativeChapter(
    "you-did-not-return",
    5,
    "第五章·今晚你没回来",
    "重走案发雨夜",
    "赵映沿七年前的侧路重新折返听雨轩，回到旧房和水榭。那晚的争吵、木阶跌倒、沈老爷仍能说话的片刻，以及众人随后忙着送走赵映和删除痕迹的经过终于连成完整时间线。",
    "deleted-person",
    ["deleted-person.complete"],
    [youDidNotReturnMemory],
  ),
  dialogueSequences: youDidNotReturnDialogueSequences,
};

const finale: ChapterManifest = {
  ...narrativeChapter(
    "fifth-tingyuxuan",
    6,
    "终章·第五种听雨轩",
    "事实收束，认知仍然分歧",
    "雨停以后，赵映从正门开始，把侧路、旧房和水榭重新走成一条完整路线。她与四个人分别告别，在自己的旧房写下新的离家日期，然后再次从正门离开。",
    "you-did-not-return",
    ["you-did-not-return.complete"],
    [fifthTingYuXuanMemory],
  ),
  dialogueSequences: fifthTingYuXuanDialogueSequences,
};

const chapters: ChapterManifest[] = [
  prologueRainChapter,
  westCorridorChapter,
  northTowerChapter,
  missingRoomChapter,
  chapterFour,
  chapterFive,
  finale,
];

export const campaignManifest: CampaignManifest = {
  id: "garden-of-shadows",
  title: "游园惊梦",
  subtitle: "四面证词",
  version: "5.0-master-map",
  chapterOrder: chapters.map((chapter) => chapter.id),
  chapters,
  endingRules: {
    domestic: {
      title: "家还记得你",
      description: "旧房里的生活痕迹最稳定。沈夫人把原本装箱的物件重新放回一部分。",
      requiredFlags: ["fifth-tingyuxuan.complete", "finale.lens.domestic"],
      metrics: { cognition: "wife", minimumLead: 2 },
    },
    spatial: {
      title: "路还在",
      description: "侧路最稳定。封墙被拆开，清晨有人从那条被删除过的路经过。",
      requiredFlags: ["fifth-tingyuxuan.complete", "finale.lens.spatial"],
      metrics: { cognition: "gardener", minimumLead: 2 },
    },
    documentary: {
      title: "纸上有你",
      description: "离家记录保留原件，并在旁边加上补充说明，承认赵映当晚曾经折返。",
      requiredFlags: ["fifth-tingyuxuan.complete", "finale.lens.documentary"],
      metrics: { cognition: "accountant", minimumLead: 2 },
    },
    pictorial: {
      title: "画外之人",
      description: "柳生重新挂出七年前原稿；移动到特定观看位置时，第五个人重新进入画面。",
      requiredFlags: ["fifth-tingyuxuan.complete", "finale.lens.pictorial"],
      metrics: { cognition: "painter", minimumLead: 2 },
    },
    composite: {
      title: "第五种听雨轩",
      description: "旧房、侧路、记录和画稿都保留各自无法完全解释的部分。",
      requiredFlags: ["fifth-tingyuxuan.complete", "finale.lens.composite"],
      metrics: { balancedMaxSpread: 1.5 },
    },
  },
};

export const getChapter = (chapterId: string) => campaignManifest.chapters.find((chapter) => chapter.id === chapterId);
