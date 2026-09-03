import type { DialogueSequence, ObjectiveDefinition } from "../types";
import { getGameplayAnchor } from "../runtime/tingyuxuan-gameplay-map";

export const northDialogueSequences: DialogueSequence[] = [
  { id: "north-opening", knotId: "north_opening", presentation: "stage", participants: ["zhaoying", "accountant"], defaultRightSpeaker: "accountant", completionFlag: "north.dialogue.opening-complete" },
  { id: "north-cup-confirmed", knotId: "north_cup_confirmed", presentation: "stage", participants: ["zhaoying"], defaultRightSpeaker: "accountant", completionFlag: "north.dialogue.cup-reaction-complete" },
  { id: "north-record-intro", knotId: "north_record_intro", presentation: "stage", participants: ["zhaoying", "accountant"], defaultRightSpeaker: "accountant", completionFlag: "north.dialogue.record-intro-complete" },
  { id: "north-record-confirmed", knotId: "north_record_confirmed", presentation: "stage", participants: ["zhaoying", "accountant"], defaultRightSpeaker: "accountant", completionFlag: "north.dialogue.record-reaction-complete" },
  { id: "north-image-intro", knotId: "north_image_intro", presentation: "stage", participants: ["zhaoying", "painter"], defaultRightSpeaker: "painter", completionFlag: "north.dialogue.image-intro-complete" },
  { id: "north-image-confirmed", knotId: "north_image_confirmed", presentation: "stage", participants: ["zhaoying"], defaultRightSpeaker: "painter", completionFlag: "north.dialogue.image-reaction-complete" },
  { id: "north-completion", knotId: "north_completion", presentation: "stage", participants: ["zhaoying", "steward"], defaultRightSpeaker: "steward", completionFlag: "north.dialogue.completion-complete" },
];

const anchorPosition = (id: Parameters<typeof getGameplayAnchor>[0]) => [...getGameplayAnchor(id).position] as [number, number, number];

export const northObjectives: ObjectiveDefinition[] = [
  {
    id: "north-life-evidence",
    title: "先确认多出来的生活痕迹",
    description: "第五人不是从口供里突然出现的。先从主宅院落一件真正被使用过的物品开始。",
    completionFlags: ["north.evidence.sixth-cup"],
    steps: [
      {
        id: "inspect-sixth-cup",
        instruction: "在主宅院落的茶桌检查第六只使用过的茶杯",
        targetPosition: anchorPosition("B_TEA_TABLE"),
        targetInteractableId: "sixth-teacup",
        guidance: ["objective", "direction", "world-marker", "outline"],
        hints: [
          "先数已经被使用过的杯子，不要先猜是谁。",
          "杯沿和杯底都有新水痕，它不是备用杯。",
          "保持沈夫人的认知，到主宅檐下的茶桌旁按 F。",
        ],
      },
    ],
  },
  {
    id: "north-document-evidence",
    title: "核对被修改的离园记录",
    description: "纸面说主角早已离开，但修改痕迹本身也是一条独立事实。",
    completionFlags: ["north.evidence.departure-record"],
    steps: [
      {
        id: "inspect-departure-record",
        instruction: "切到钱先生的认知，去主宅内侧检查离园时间的补墨与压痕",
        targetPosition: anchorPosition("B_LEDGER"),
        targetInteractableId: "departure-record",
        guidance: ["objective", "direction", "world-marker", "outline"],
        hints: [
          "第二条证据不需要上楼；它就在最终主宅动线内。",
          "按 Tab 切到钱先生的认知，先读原字，再看后来补上的一笔。",
          "到内侧书案上的离园记录旁按 F。",
        ],
      },
    ],
  },
  {
    id: "north-image-evidence",
    title: "复现柳生的观看位置",
    description: "图像证据不是从任何角度都成立；必须在主宅里复现画稿当时的框景。",
    completionFlags: ["north.evidence.rain-figure"],
    steps: [
      {
        id: "align-artist-view",
        instruction: "切到柳生认知，在旧画旁对准雨夜人影",
        targetPosition: anchorPosition("B_IMAGE_EVIDENCE"),
        targetInteractableId: "artist-viewpoint",
        guidance: ["objective", "direction", "world-marker", "outline"],
        hints: [
          "这一次不是找一个发光物体，而是复现观看角度。",
          "按 Tab 切到柳生认知；站到旧画旁后缓慢转动镜头。",
          "额外人影稳定出现在框景里后按 F。",
        ],
      },
    ],
  },
  {
    id: "north-fifth-person",
    title: "确认第五人存在",
    description: "生活物件、文字记录和图像观看三个独立通道已经指向同一件事。",
    completionFlags: ["north.fifth-person.confirmed"],
    steps: [
      {
        id: "synthesize-evidence",
        instruction: "到主宅深处整理三条证据，只回答‘有没有第五人’",
        targetPosition: anchorPosition("B_MISSING_ROOM"),
        targetInteractableId: "fifth-person-board",
        guidance: ["objective", "direction", "world-marker"],
        hints: [
          "本章只回答‘有没有第五人’，不要提前回答‘第五人是谁’。",
          "第六只茶杯、被改记录和特定角度人影来自三个不同证据通道。",
          "三条都完成后，到北墙附近的案卷板按 F。",
        ],
      },
    ],
  },
];
