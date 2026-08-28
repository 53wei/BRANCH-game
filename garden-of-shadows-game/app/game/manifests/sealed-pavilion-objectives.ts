import type { DialogueSequence, ObjectiveDefinition } from "../types";

export const sealedPavilionDialogueSequences: DialogueSequence[] = [
  { id: "pavilion-opening", knotId: "pavilion_opening", presentation: "stage", participants: ["zhaoying", "steward"], defaultRightSpeaker: "steward", completionFlag: "pavilion.dialogue.opening", backdrop: "/media/hero-hearing-rain.png" },
  { id: "pavilion-sealed-door", knotId: "pavilion_sealed_door", presentation: "stage", participants: ["zhaoying", "steward"], defaultRightSpeaker: "steward", completionFlag: "pavilion.door.confirmed", backdrop: "/media/cg/front-fourfold-lock.webp" },
  { id: "pavilion-route-wife", knotId: "pavilion_route_wife", presentation: "stage", participants: ["zhaoying", "wife"], defaultRightSpeaker: "wife", completionFlag: "pavilion.route.wife", backdrop: "/media/hero-hearing-rain.png" },
  { id: "pavilion-route-gardener", knotId: "pavilion_route_gardener", presentation: "stage", participants: ["zhaoying", "gardener"], defaultRightSpeaker: "gardener", completionFlag: "pavilion.route.gardener", backdrop: "/media/hero-hearing-rain.png" },
  { id: "pavilion-route-accountant", knotId: "pavilion_route_accountant", presentation: "stage", participants: ["zhaoying", "accountant"], defaultRightSpeaker: "accountant", completionFlag: "pavilion.route.accountant", backdrop: "/media/cg/north-secret-passage.webp" },
  { id: "pavilion-route-painter", knotId: "pavilion_route_painter", presentation: "stage", participants: ["zhaoying", "painter"], defaultRightSpeaker: "painter", completionFlag: "pavilion.route.painter", backdrop: "/media/cg/front-painted-door.webp" },
  { id: "pavilion-threshold", knotId: "pavilion_threshold", presentation: "stage", participants: ["zhaoying", "steward"], defaultRightSpeaker: "steward", completionFlag: "pavilion.entered", backdrop: "/media/hero-hearing-rain.png" },
  { id: "pavilion-body-wife", knotId: "pavilion_body_wife", presentation: "stage", participants: ["zhaoying", "wife"], defaultRightSpeaker: "wife", completionFlag: "pavilion.body.wife", backdrop: "/media/hero-hearing-rain.png" },
  { id: "pavilion-body-gardener", knotId: "pavilion_body_gardener", presentation: "stage", participants: ["zhaoying", "gardener"], defaultRightSpeaker: "gardener", completionFlag: "pavilion.body.gardener", backdrop: "/media/hero-hearing-rain.png" },
  { id: "pavilion-body-accountant", knotId: "pavilion_body_accountant", presentation: "stage", participants: ["zhaoying", "accountant"], defaultRightSpeaker: "accountant", completionFlag: "pavilion.body.accountant", backdrop: "/media/cg/north-ledger-room.webp" },
  { id: "pavilion-body-painter", knotId: "pavilion_body_painter", presentation: "stage", participants: ["zhaoying", "painter"], defaultRightSpeaker: "painter", completionFlag: "pavilion.body.painter", backdrop: "/media/cg/front-painted-door.webp" },
  { id: "pavilion-inner-bolt", knotId: "pavilion_inner_bolt", presentation: "stage", participants: ["zhaoying", "wife"], defaultRightSpeaker: "wife", completionFlag: "pavilion.evidence.inner-bolt", backdrop: "/media/hero-hearing-rain.png" },
  { id: "pavilion-drain", knotId: "pavilion_drain", presentation: "stage", participants: ["zhaoying", "gardener"], defaultRightSpeaker: "gardener", completionFlag: "pavilion.evidence.reverse-water", backdrop: "/media/hero-hearing-rain.png" },
  { id: "pavilion-paint-residue", knotId: "pavilion_paint_residue", presentation: "stage", participants: ["zhaoying", "painter"], defaultRightSpeaker: "painter", completionFlag: "pavilion.evidence.vanished-exit", backdrop: "/media/cg/front-painted-door.webp" },
  { id: "pavilion-causality", knotId: "pavilion_causality", presentation: "stage", participants: ["zhaoying", "steward"], defaultRightSpeaker: "steward", completionFlag: "pavilion.causality.complete", backdrop: "/media/hero-hearing-rain.png" },
  { id: "pavilion-completion", knotId: "pavilion_completion", presentation: "stage", participants: ["zhaoying", "steward"], defaultRightSpeaker: "steward", completionFlag: "pavilion.dialogue.completion", backdrop: "/media/hero-hearing-rain.png" },
];

export const sealedPavilionObjectives: ObjectiveDefinition[] = [
  {
    id: "pavilion-lock",
    title: "先证明密室成立",
    description: "进入任何证词前，先确认基准现实中的门窗与锁舌。",
    completionFlags: ["pavilion.door.confirmed"],
    steps: [{ id: "inspect-door", instruction: "检查水榭正门的内侧锁舌", targetPosition: [0, 1.2, -4], targetInteractableId: "sealed-door", guidance: ["objective", "direction", "world-marker", "outline"], hints: ["先别相信任何入口。", "正门没有外力破坏痕迹。", "走到水榭正门前按 F。"] }],
  },
  {
    id: "pavilion-routes",
    title: "核对至少两条入口证词",
    description: "四个人各自记得一条入口，但入口存在的时间并不相同。",
    completionFlags: ["pavilion.routes.ready"],
    steps: [{ id: "inspect-routes", instruction: "切换证词，验证两条进入水榭的路线", targetPosition: [0, 1.2, -4.5], guidance: ["objective", "direction", "world-marker"], hints: ["每份证词都给出一条路。", "夫人记得后门，园丁记得屋顶，账房记得密道，柳生记得破窗。", "按 Tab 切换证词，在发光入口前按 F。"] }],
  },
  {
    id: "pavilion-body",
    title: "四份完全不同的死亡现场",
    description: "进入水榭后，在四份证词中检查同一个中央位置。",
    completionFlags: ["pavilion.body.all"],
    steps: [{ id: "cross-check-body", instruction: "在四份证词中分别勘验园主的位置", targetPosition: [0, 1.2, -10], targetInteractableId: "body-scene", guidance: ["objective", "direction", "world-marker", "outline"], hints: ["同一个位置有四种答案。", "每检查一次就按 Tab 切换到下一份证词。", "在水榭中央按 F，直到进度达到 4/4。"] }],
  },
  {
    id: "pavilion-causality",
    title: "重建唯一因果顺序",
    description: "锁舌、逆水和消失的出口必须按时间顺序同时成立。",
    completionFlags: ["pavilion.causality.complete"],
    steps: [
      { id: "inner-bolt", instruction: "检查只能从内部扣上的锁舌", targetPosition: [-3, 1.2, -7.5], targetInteractableId: "inner-bolt", guidance: ["objective", "direction", "world-marker"], hints: ["密室不是伪造的。", "锁舌的积灰在内侧断开。", "在夫人证词的后门内侧按 F。"] },
      { id: "drain-channel", instruction: "检查逆灌进水榭的排水槽", targetPosition: [-2.8, 1.2, -12], targetInteractableId: "drain-channel", guidance: ["objective", "direction", "world-marker"], hints: ["水不是从屋顶来的。", "苔线由低处爬向室内。", "在园丁证词中检查左侧排水槽。"] },
      { id: "paint-residue", instruction: "检查已经消失的画门残迹", targetPosition: [3, 1.2, -11], targetInteractableId: "paint-residue", guidance: ["objective", "direction", "world-marker"], hints: ["破窗不是唯一被打开过的面。", "屏画边缘还有未干的松节油。", "在柳生证词中检查右侧屏画。"] },
      { id: "final-reconstruction", instruction: "在水榭最深处排列因果顺序", targetPosition: [0, 1.2, -15], targetInteractableId: "final-reconstruction", guidance: ["objective", "direction", "world-marker", "light"], hints: ["先发生的不是死亡。", "内锁、临时出口消失、逆水、溺亡。", "走到水榭尽头按 F。"] },
    ],
  },
];
