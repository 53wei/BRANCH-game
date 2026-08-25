import type { CampaignManifest, ChapterManifest } from "../types";
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
  planned("north-tower-ledger", 2, "北楼墨账", "过去与现在互相改路", "从账房的漏窗借景中核对错置时辰，让一笔不可能存在的支出显影。", "west-corridor-loop", ["west.chapter.complete"]),
  planned("missing-painted-door", 3, "画中缺门", "逃生门只存在于错误透视里", "沿画师故意画错的透视进入画中门，并在第二次空间追逐中带回门后的证词。", "north-tower-ledger", ["north-tower-ledger.complete"]),
  planned("unperformed-resurrection", 4, "未演还魂", "台上从来有第五道声音", "重构当夜未演完的昆曲与仪式，第一次确认第五席与第五人的存在。", "missing-painted-door", ["missing-painted-door.complete"]),
  planned("four-sided-lock", 5, "四面锁", "四个人共同删去了同一个人", "交叉排列四份证词的可信度，区分每个人说谎的内容与保护的对象。", "unperformed-resurrection", ["unperformed-resurrection.complete"]),
  planned("doorless-pavilion", 6, "水榭无门", "一条唯一可达的死亡路径", "拼出反锁、逆水、画门消失与溺亡的唯一顺序，排除四种表面凶案。", "four-sided-lock", ["four-sided-lock.complete"]),
  planned("nameless-testimony", 7, "无名证词", "被删去的人就是勘验人", "开启第五视角，恢复沈照影的身份，并理解四次破坏为何同时救她也抹去她。", "doorless-pavilion", ["doorless-pavilion.complete"]),
  planned("awakening-resurrection", 8, "惊梦还魂", "名字是最后一间牢房", "在最终追逐中找回四枚姓名锚点，完成关系推断，并决定让真相、姓名还是自由留下。", "nameless-testimony", ["nameless-testimony.complete"]),
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
