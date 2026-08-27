import type { DialogueSequence, ObjectiveDefinition } from "../types";

export const northDialogueSequences: DialogueSequence[] = [
  { id: "north-opening", knotId: "north_opening", presentation: "stage", participants: ["zhaoying", "accountant"], defaultRightSpeaker: "accountant", completionFlag: "north.dialogue.opening" },
  { id: "north-scratches", knotId: "north_scratches", presentation: "bark", participants: ["zhaoying", "accountant"], defaultRightSpeaker: "accountant", completionFlag: "north.dialogue.scratches" },
  { id: "north-passage", knotId: "north_passage", presentation: "stage", participants: ["zhaoying", "accountant"], defaultRightSpeaker: "accountant", completionFlag: "north.dialogue.passage" },
  { id: "north-trust", knotId: "north_trust", presentation: "stage", participants: ["zhaoying", "accountant", "wife", "gardener"], defaultRightSpeaker: "accountant", completionFlag: "north.dialogue.trust" },
  { id: "north-completion", knotId: "north_completion", presentation: "stage", participants: ["zhaoying", "steward"], defaultRightSpeaker: "steward", completionFlag: "north.dialogue.completion" },
];

const movementHints: [string, string, string] = [
  "先沿着蓝色算盘格向前走。",
  "楼梯口在一层尽头，金色标记会指向它。",
  "使用 WASD 到达楼梯口，按 F 上楼。",
];

export const northObjectives: ObjectiveDefinition[] = [
  {
    id: "north-enter",
    title: "登上北楼",
    description: "钱先生说自己整夜没有离开账房。先找到他记忆里的账房。",
    completionFlags: ["north.reached.upper-floor"],
    steps: [{ id: "reach-stairs", instruction: "前往一层尽头的楼梯", targetPosition: [0, 1.6, -1], targetInteractableId: "north-stairs", guidance: ["objective", "direction", "world-marker", "light"], hints: movementHints }],
  },
  {
    id: "north-window",
    title: "核对借景窗",
    description: "从账房的窗内看见过去，再从窗外验证现在。",
    completionFlags: ["north.borrowed-view.crossed"],
    steps: [
      { id: "inspect-window", instruction: "在账房视角检查借景窗", targetPosition: [-3.5, 4.5, -11], targetInteractableId: "borrowed-window", guidance: ["objective", "direction", "world-marker", "outline"], hints: ["蓝色网格最密的地方不是墙。", "切到账房证词，寻找能看见完好假山的窗。", "按 Tab 切到账房证词，在二层左侧窗前按 F。"] },
      { id: "cross-window", instruction: "跨过借景窗，进入过去的东院", targetPosition: [-3.5, 4.5, -11], targetInteractableId: "borrowed-window", guidance: ["objective", "world-marker", "light"], hints: ["窗中景象和身后的雨声不在同一时刻。", "再触碰一次窗框，验证它是不是入口。", "在借景窗前按 F，进入过去。"] },
    ],
  },
  {
    id: "north-rockery",
    title: "让过去替现在让路",
    description: "现在的假山已经坍塌；只有过去还能改变它的位置。",
    completionFlags: ["north.rockery.moved", "north.present.route-open"],
    steps: [
      { id: "move-rockery", instruction: "在过去推动完整假山", targetPosition: [-9, 1.4, -10], targetInteractableId: "past-rockery", guidance: ["objective", "direction", "world-marker", "outline"], hints: ["倒下的石头不能搬，倒下之前可以。", "确认右上角显示“过去”，再靠近完整假山。", "在过去的假山前按 F。"] },
      { id: "return-present", instruction: "回到借景框，切回现在", targetPosition: [-5.5, 1.5, -10], targetInteractableId: "borrowed-window-return", guidance: ["objective", "direction", "world-marker"], hints: ["你改变的是过去，答案要在现在检查。", "回到发出蓝光的窗框。", "在庭院入口的借景框前按 F。"] },
    ],
  },
  {
    id: "north-evidence",
    title: "证明账房离开过北楼",
    description: "窗框划痕和直达东院的通道不能同时被他的证词解释。",
    completionFlags: ["north.contradiction.scratches", "north.contradiction.passage"],
    steps: [
      { id: "inspect-scratches", instruction: "在两份证词中核对窗框划痕", targetPosition: [-5.7, 1.25, -8.8], targetInteractableId: "window-scratches", guidance: ["objective", "direction", "outline"], hints: ["雨水冲不出三道平行的硬痕。", "在同一位置切换账房与夫人证词。", "对准窗框划痕按 F，按 Tab 后再检查一次。"] },
      { id: "inspect-passage", instruction: "在两份证词中核对秘密通道", targetPosition: [-12.5, 1.2, -10], targetInteractableId: "secret-passage", guidance: ["objective", "direction", "world-marker", "outline"], hints: ["假山移开后，风声来自墙下。", "账房和园丁对这条路的记忆不同。", "靠近假山后的暗口按 F，切换证词后再检查。"] },
    ],
  },
];
