import type { ChapterManifest, DialogueSequence, MemoryLayer } from "../types";

const wifeMemory: MemoryLayer = {
  id: "wife",
  character: "沈夫人",
  label: "夫人的认知",
  description: "她记得被收走的床、箱子和衣物摆在哪里，却坚持那只是储物的角落。",
  visual: { fog: "#171612", ambient: "#352d25", keyLight: "#d1a56e", exposure: 0.84, lut: "domestic-amber" },
  topologyOverrides: ["missing-room-furniture"],
  collisionGroup: 2,
  switchRegions: ["b-inner-house"],
};

const gardenerMemory: MemoryLayer = {
  id: "gardener",
  character: "老周",
  label: "老周的认知",
  description: "他记得一扇旧门和通往它的窄路，却说门后从来不是卧房。",
  visual: { fog: "#0d1813", ambient: "#213a30", keyLight: "#84aa8e", exposure: 0.78, lut: "wet-moss" },
  topologyOverrides: ["missing-room-door"],
  collisionGroup: 4,
  switchRegions: ["b-inner-house"],
};

const accountantMemory: MemoryLayer = {
  id: "accountant",
  character: "钱先生",
  label: "钱先生的认知",
  description: "房契、尺寸和房号保留了一个被抹去的体积：建筑账面上少不了那一间。",
  visual: { fog: "#0d151b", ambient: "#1b2a33", keyLight: "#8caec0", exposure: 0.82, lut: "document-blue" },
  topologyOverrides: ["missing-room-boundary"],
  collisionGroup: 8,
  switchRegions: ["b-inner-house"],
};

const painterMemory: MemoryLayer = {
  id: "painter",
  character: "柳生",
  label: "柳生的认知",
  description: "旧画保留了一扇窗和窗里的光，但窗后的人被后来的一层墨洗掉了。",
  visual: { fog: "#121518", ambient: "#25282b", keyLight: "#a8a394", exposure: 0.8, lut: "pictorial-grey" },
  topologyOverrides: ["missing-room-window"],
  collisionGroup: 16,
  switchRegions: ["b-inner-house"],
};

export const missingRoomDialogueSequences: DialogueSequence[] = [
  { id: "room-opening", knotId: "room_opening", presentation: "stage", participants: ["zhaoying", "accountant"], defaultRightSpeaker: "accountant", completionFlag: "room.dialogue.opening-complete" },
  { id: "room-wife-memory", knotId: "room_wife_memory", presentation: "stage", participants: ["zhaoying", "wife"], defaultRightSpeaker: "wife", completionFlag: "room.dialogue.wife-memory-complete" },
  { id: "room-reconstructed", knotId: "room_reconstructed", presentation: "stage", participants: ["zhaoying", "wife"], defaultRightSpeaker: "wife", completionFlag: "room.dialogue.reconstructed-complete" },
  { id: "room-identity", knotId: "room_identity", presentation: "stage", participants: ["zhaoying", "wife"], defaultRightSpeaker: "wife", completionFlag: "room.dialogue.identity-complete" },
];

export const missingRoomChapter: ChapterManifest = {
  id: "missing-room",
  index: 3,
  title: "第三章·不存在的房间",
  subtitle: "被抹去的旧房",
  logline: "第五个人确实存在，但身份仍然未知。赵映沿北墙重新核对老周记得的门、柳生画里的窗、钱先生留下的尺寸和沈夫人记得的家具，最后拼回一间普通旧房，并从生活痕迹里认出那曾是自己的房间。",
  estimatedMinutes: [20, 35],
  status: "playable",
  unlock: { chapterId: "north-tower-ledger", requiredFlags: ["north.fifth-person.confirmed", "campaign.route.b-investigation-complete"] },
  assetPack: {
    id: "tingyuxuan-master-v1",
    initialBudgetMb: 100,
    preload: ["/assets/fidelity/TYX_Master_Scene.glb", "/media/cg/story-v1/cg-04-child-room-v1.png", "/basis/basis_transcoder.js", "/basis/basis_transcoder.wasm"],
    deferred: [],
  },
  spawnAnchor: "ROUTE_06_B_NORTHEAST_LINK",
  memories: [wifeMemory, gardenerMemory, accountantMemory, painterMemory],
  contradictions: [],
  puzzleGraph: {
    nodes: [
      {
        id: "missing-door",
        title: "一扇被记住的门",
        ruleStage: "teach",
        prerequisites: [],
        interaction: "在老周认知中确认门槛磨损、门轴位置和一条被封掉的短路。",
        outputFlags: ["room.trace.door"],
        softHint: "先找进入条件，不要先找完整房间。",
      },
      {
        id: "missing-window-boundary",
        title: "窗与体积",
        ruleStage: "combine",
        prerequisites: ["room.trace.door"],
        interaction: "分别用柳生的窗和钱先生的建筑尺寸确定房间至少占据哪一块体积。",
        outputFlags: ["room.trace.window", "room.trace.boundary"],
        softHint: "一扇窗和一段外墙长度，可以证明墙后不该是实心。",
      },
      {
        id: "missing-furniture",
        title: "生活不是结构图",
        ruleStage: "combine",
        prerequisites: ["room.trace.window", "room.trace.boundary"],
        interaction: "用沈夫人的生活记忆恢复床、箱子和书桌位置，让空间第一次像一个有人住过的房间。",
        outputFlags: ["room.trace.furniture"],
        softHint: "先让它成为房间，再问是谁的房间。",
      },
      {
        id: "reconstruct-child-room",
        title: "不存在于任何单一证词中的房间",
        ruleStage: "invert",
        prerequisites: ["room.trace.door", "room.trace.window", "room.trace.boundary", "room.trace.furniture"],
        interaction: "将四份局部条件同时锚定，在主宅北墙深处显现一间谁都没有完整记得的普通旧房。",
        outputFlags: ["room.reconstructed"],
        softHint: "不是选择一份正确证词，而是保留四份证词各自不可替代的一小块。",
      },
      {
        id: "player-room-reveal",
        title: "这是我的房间",
        ruleStage: "combine",
        prerequisites: ["room.reconstructed"],
        interaction: "检查旧盒子、身高刻痕与练习本，确认第五人不是陌生闯入者，而是玩家自己。",
        outputFlags: ["missing-room.identity-confirmed"],
        softHint: "最重要的证据应该是普通的生活痕迹，而不是一张写着答案的纸。",
      },
    ],
  },
  trustNodes: [],
  chaseSegments: [],
  completionFlags: ["missing-room.complete", "missing-room.identity-confirmed", "campaign.route.b-deep-known"],
  dialogueSequences: missingRoomDialogueSequences,
  objectives: [],
};
