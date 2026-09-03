import type { BorrowableConfig } from "../mechanics/types";
import { getGameplayAnchor, type ChapterAnchorId } from "./tingyuxuan-gameplay-map";

export type Vec3Tuple = readonly [number, number, number];

const anchorPosition = (id: ChapterAnchorId): Vec3Tuple => getGameplayAnchor(id).position;

export interface SlicePointDefinition {
  id: string;
  label: string;
  position: Vec3Tuple;
  radius?: number;
}

export interface SliceEvidenceDefinition extends SlicePointDefinition {
  title: string;
  body: string;
  note: string;
  flag: string;
}

/**
 * Spatial content for the prologue + chapter-one vertical slice.
 *
 * These are gameplay anchors only. They never move, scale, hide or rebuild formal
 * Master architecture. They are intentionally concentrated in the already audited
 * A-zone traversal chain: measured south gate -> A baseline -> false-path/loop ->
 * east exit. Fine art-placement can be nudged after an in-browser walkthrough.
 */
export const PROLOGUE_LANDMARKS = [
  {
    // Legacy save id retained for compatibility; player-facing meaning is the distant moon-gate sightline from scene 0-4.
    id: "gate-back-view",
    label: "确认月洞门远景",
    position: anchorPosition("PROLOGUE_MOONGATE_VIEW"),
    radius: 1.2,
  },
  {
    id: "window-row",
    label: "记住窗列",
    position: anchorPosition("PROLOGUE_WINDOW_ROW"),
    radius: 1.35,
  },
  {
    id: "lantern-turn",
    label: "记住转角灯",
    position: anchorPosition("PROLOGUE_LANTERN_TURN"),
    radius: 1.35,
  },
] as const;

export const PROLOGUE_EVIDENCE: readonly SliceEvidenceDefinition[] = [
  {
    id: "ledger",
    label: "[F] 查看七年前的离家记录",
    title: "离家记录",
    body: "记录写着：赵映于傍晚六点十分离开听雨轩。纸角却留着很浅的压痕，像同一处曾写过另一组时间。",
    note: "纸面与赵映的记忆都指向傍晚离园；眼下只能确认，这个时间曾被人处理过。",
    flag: "prologue.evidence.ledger",
    position: anchorPosition("PROLOGUE_LEDGER"),
  },
  {
    id: "umbrella",
    label: "[F] 查看前厅旧画像",
    title: "补过的全家福",
    body: "画框是旧的，画布明显补过。沈夫人右侧留着一块不自然的空处，衣袖与背景花木的颜色轻微重叠。",
    note: "画面被修过，但现在还不能断定原来画着谁。",
    flag: "prologue.evidence.umbrella",
    position: anchorPosition("PROLOGUE_UMBRELLA"),
  },
  {
    id: "shoes",
    label: "前厅茶点",
    title: "凉掉的桂花糕",
    body: "保温壶旁放着两只杯子和一碟凉掉的桂花糕。沈夫人等了一下午，仍先惦记赵映有没有吃饭。",
    note: "这不是案件证物，只是一件仍按旧习惯准备好的小事。",
    flag: "prologue.evidence.shoes",
    position: anchorPosition("PROLOGUE_SHOES"),
  },
] as const;

export const PROLOGUE_STEWARD_POINT = {
  id: "prologue-steward-inside",
  label: "[F] 回去问老周",
  position: anchorPosition("PROLOGUE_STEWARD"),
  radius: 1.7,
} as const;

export const PROLOGUE_ANOMALY_POINT = {
  id: "prologue-first-anomaly",
  label: "刚才这里有门",
  position: anchorPosition("PROLOGUE_ANOMALY"),
  radius: 2.0,
} as const;

export const CH1_TRACES: readonly SliceEvidenceDefinition[] = [
  {
    id: "waterline",
    label: "[F] 查看墙脚断掉的水线",
    title: "墙脚水痕",
    body: "雨水沿墙脚流到这里突然中断，墙的另一侧却出现同高度的湿线。",
    note: "如果这里从来没有开口，两边的水线不该像同一条路径。",
    flag: "west.trace.waterline",
    position: [4.45, 0.9, 42.55],
  },
  {
    id: "mud",
    label: "[F] 查看消失在墙边的泥印",
    title: "泥脚印",
    body: "两枚不完整鞋印朝墙面收窄，最后一枚只有前掌，像脚步还在继续。",
    note: "它们不像站在墙前停下，更像从这里穿过去。",
    flag: "west.trace.mud",
    position: [4.05, 0.9, 43.45],
  },
  {
    id: "lantern",
    label: "[F] 检查倒灯底部擦痕",
    title: "倒灯擦痕",
    body: "灯架底部有向内拖过的浅痕，方向与风口相反。",
    note: "有人从旁边挤过，或者曾经有一条比现在更窄的通道。",
    flag: "west.trace.lantern",
    position: [3.45, 0.9, 42.15],
  },
  {
    id: "plant",
    label: "[F] 检查墙边被蹭断的枝叶",
    title: "折断枝叶",
    body: "枝条都在相近高度向同一侧倒伏，新旧断口叠在一起，不像一次暴雨造成。",
    note: "这里长期有人贴着墙经过。",
    flag: "west.trace.plant",
    position: [5.05, 0.9, 41.8],
  },
] as const;

export const CH1_BORROWED_VIEW_POINT = {
  id: "west-borrowed-view",
  label: "[F] 透过漏窗借看另一份园子",
  position: [2.75, 1.35, 41.25] as Vec3Tuple,
  radius: 2.2,
} as const;

export const CH1_BORROW_SOURCE = {
  id: "wife-threshold-stone",
  label: "[F] 借下夫人记忆里的踏石",
  position: [2.95, 0.18, 40.4] as Vec3Tuple,
  radius: 1.7,
} as const;

export const CH1_ANCHOR_TARGET = {
  id: "loop-break-anchor",
  label: "[F] 把踏石锚在这里",
  position: [1.8, 0.12, 39.55] as Vec3Tuple,
  radius: 1.8,
} as const;

export const CH1_REWARD_POINTS: readonly SliceEvidenceDefinition[] = [


  {
    id: "wet-footprint",
    label: "[F] 查看朝主宅延伸的湿脚印",
    title: "向主宅延伸的湿脚印",
    body: "脚印从侧路方向进入园内，在东侧出口前重新出现，并继续朝主宅方向延伸。",
    note: "七年前确实有人从这里经过。你还不知道是谁，也不知道方向是否被记反。",
    flag: "west.wet-footprint-found",
    position: [2.0, 0.9, 32.2],
  },
] as const;

export const CH1_REWARD_COURTYARD = {
  id: "west-reward-courtyard",
  label: "夹院",
  position: [1.75, 0.9, 37.45] as Vec3Tuple,
  radius: 2.3,
} as const;

export const CH1_BORROWABLES: readonly BorrowableConfig[] = [
  {
    id: CH1_BORROW_SOURCE.id,
    sourceCognition: "wife",
    runtimePrefabId: "west-threshold-stone-visual",
    collisionPrefabId: "west-threshold-stone-collider",
    allowedTargetAnchors: [CH1_ANCHOR_TARGET.id],
  },
] as const;

export const countFlags = (flags: readonly string[], prefix: string) =>
  flags.filter((flag) => flag.startsWith(prefix)).length;

export const distance2D = (a: { x: number; z: number }, b: Vec3Tuple) =>
  Math.hypot(a.x - b[0], a.z - b[2]);
