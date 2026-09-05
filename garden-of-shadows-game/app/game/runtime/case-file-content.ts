import type { CheckpointState } from "../types";
import type { EvidenceChannel, EvidenceDefinition } from "../mechanics/types";

export type CaseFileTab = "evidence" | "people" | "questions" | "map" | "review";

export interface CaseFileEvidence extends EvidenceDefinition {
  title: string;
  source: NonNullable<EvidenceDefinition["source"]>;
  discoveredFlag: string;
}

export interface CaseFilePerson {
  id: string;
  name: string;
  role: string;
  note: string;
  unlockAny?: readonly string[];
}

export interface CaseFileQuestion {
  id: string;
  question: string;
  openedByAny: readonly string[];
  resolvedByAny?: readonly string[];
  resolvedText?: string;
}

const evidence = (
  id: string,
  title: string,
  channel: EvidenceChannel,
  discoveredFlag: string,
  location: string,
  facts: readonly string[],
  relatedCharacters: readonly string[],
  relatedQuestionIds: readonly string[],
  protagonistReaction?: string,
  sourceLabel = "现场调查",
): CaseFileEvidence => ({
  id,
  title,
  channel,
  discoveredFlag,
  observableFacts: facts,
  source: { label: sourceLabel, location },
  relatedCharacters,
  relatedQuestionIds,
  protagonistReaction,
  narrativeTags: [],
  interpretations: [],
});

export const CASE_FILE_EVIDENCE: readonly CaseFileEvidence[] = [
  evidence(
    "prologue-family-portrait",
    "前厅旧画像",
    "image",
    "prologue.evidence.umbrella",
    "前厅",
    ["画框是旧的，画布有修补痕迹。", "沈夫人右侧存在一块构图不自然的空处。", "衣袖与背景花木的颜色在空处边缘轻微重叠。"],
    ["赵映", "沈夫人", "柳生"],
    ["who-was-erased"],
    "先记下修补事实，不把空处直接解释成某个人。",
  ),
  evidence(
    "prologue-refreshments",
    "凉掉的茶与桂花糕",
    "object",
    "prologue.evidence.shoes",
    "前厅茶桌",
    ["保温壶旁放着两只杯子。", "桂花糕已经凉透。", "茶水和点心在赵映抵达前就已准备。"],
    ["赵映", "沈夫人"],
    ["why-return"],
    "这不是案件证物，但能说明沈夫人仍按旧习惯等她回家。",
  ),
  evidence(
    "prologue-departure-record",
    "离家记录",
    "document",
    "prologue.evidence.ledger",
    "前厅旧箱",
    ["记录写着赵映于傍晚六点十分离开听雨轩。", "纸角有非常浅的压痕，像同一位置曾写过另一组数字。", "压痕中的原数字无法辨认，此时也不能确认由谁留下。", "旧箱里还保存着钥匙、怀表和用牛皮纸包好的票据。"],
    ["赵映", "钱先生"],
    ["why-return"],
    "先记下纸角压痕与箱内物件；此时还不能判断原数字、修改人或修改目的。",
  ),
  evidence(
    "west-waterline",
    "墙脚断掉的水线",
    "space",
    "west.trace.waterline",
    "西侧旧园墙脚",
    ["同高度湿线在墙体两侧连续出现。", "水线在现有墙面处中断。"],
    ["沈夫人", "老周"],
    ["did-side-path-exist"],
  ),
  evidence(
    "west-mud",
    "消失在墙边的泥脚印",
    "space",
    "west.trace.mud",
    "西侧旧园墙脚",
    ["两枚不完整鞋印朝墙面收窄。", "最后一枚只剩前掌，没有明显停步或转身痕迹。"],
    ["沈夫人", "老周"],
    ["did-side-path-exist", "did-zhaoying-return"],
  ),
  evidence(
    "west-lantern",
    "倒灯底部擦痕",
    "object",
    "west.trace.lantern",
    "西侧旧园转角",
    ["灯架底部有向园内方向拖动的浅痕。", "擦痕方向与当晚主要风口不一致。"],
    ["老周"],
    ["did-side-path-exist"],
  ),
  evidence(
    "west-plant",
    "墙边折断枝叶",
    "object",
    "west.trace.plant",
    "西侧旧园墙边",
    ["多根枝条在相近高度向同一侧倒伏。", "新旧断口重叠，不像一次暴雨造成。"],
    ["老周"],
    ["did-side-path-exist"],
  ),

  evidence(
    "west-wet-footprint",
    "向主宅延伸的湿脚印",
    "space",
    "west.wet-footprint-found",
    "西院东侧出口",
    ["脚印从侧路方向进入园内。", "脚印在东侧出口前重新出现，并继续朝主宅方向延伸。"],
    ["赵映"],
    ["did-zhaoying-return"],
  ),
  evidence(
    "north-sixth-cup",
    "第六只茶杯",
    "object",
    "north.evidence.sixth-cup",
    "主宅茶桌",
    ["桌上共有六只杯子。", "第六只杯沿有新茶渍。", "杯底压着一道尚未完全干透的水痕。"],
    ["沈夫人"],
    ["was-there-fifth-person"],
  ),
  evidence(
    "north-departure-record",
    "被改过的离园记录",
    "document",
    "north.evidence.departure-record",
    "北楼账房",
    ["同一行存在后补墨迹。", "后补字迹与原始记录的墨色和笔压不同。", "纸面压痕说明该位置至少被改写过一次。"],
    ["钱先生", "赵映"],
    ["did-zhaoying-return", "who-changed-record", "was-there-fifth-person"],
  ),
  evidence(
    "north-rain-figure",
    "固定框景中的雨夜人影",
    "image",
    "north.evidence.rain-figure",
    "北楼旧画观看点",
    ["只有在特定观看位置，人影才落入旧画保留的框景。", "人影位置与已确认的四人站位均不重合。"],
    ["柳生"],
    ["was-there-fifth-person"],
  ),
  evidence(
    "room-door-trace",
    "旧门痕",
    "space",
    "room.trace.door",
    "主宅北墙",
    ["地面仍有门槛磨损。", "墙边保留与门轴位置一致的旧固定痕迹。"],
    ["老周"],
    ["did-room-exist"],
  ),
  evidence(
    "room-window-trace",
    "旧画里的窗",
    "image",
    "room.trace.window",
    "主宅北墙 / 柳生旧画",
    ["旧画保留一扇现在墙面不存在的窗。", "按画中视角反推，窗的位置落在当前北墙后方。"],
    ["柳生"],
    ["did-room-exist"],
  ),
  evidence(
    "room-boundary-trace",
    "建筑尺寸缺口",
    "document",
    "room.trace.boundary",
    "北楼建筑记录",
    ["外墙总长度大于现有室内可用长度。", "尺寸差对应一段完整房间深度，而不是普通墙体厚度。"],
    ["钱先生"],
    ["did-room-exist"],
  ),
  evidence(
    "room-furniture-trace",
    "家具位置记忆",
    "testimony",
    "room.trace.furniture",
    "沈夫人证词中的北墙房间",
    ["床、矮书桌和收纳箱的位置关系能组成完整生活空间。", "家具记忆与门、窗和缺失体积互不冲突。"],
    ["沈夫人"],
    ["did-room-exist", "who-was-erased"],
  ),
  evidence(
    "deleted-wife-boxes",
    "被分箱保存的旧物",
    "object",
    "deleted-person.evidence.wife-boxes",
    "储物间旧木箱",
    ["赵映七年前的衣物、课本、杯子、发绳和坏掉的台灯仍被分别包好。", "这些物品被收进箱中保存，而不是被丢弃。"],
    ["赵映", "沈夫人"],
    ["who-was-erased", "why-erasure-plan"],
    undefined,
    "储物间检查",
  ),
  evidence(
    "deleted-sealed-side-route",
    "被封住的侧路",
    "space",
    "deleted-person.evidence.gardener-route",
    "西侧旧砖墙",
    ["藤蔓后的砖墙仍能辨认出封死前的侧门结构。", "老周确认事故当夜曾从这条侧路送赵映离园，并在次日参与封口。"],
    ["赵映", "老周"],
    ["did-zhaoying-return", "why-erasure-plan"],
    undefined,
    "封墙现场与老周证词",
  ),
  evidence(
    "deleted-departure-packet",
    "离开安排材料",
    "document",
    "deleted-person.evidence.accountant-packet",
    "钱先生夹层账册",
    ["夹层内同时保存备用车票、现金支出、旅店地址和写给外地熟人的介绍信。", "部分材料在事故发生前已经准备，事故后又补齐了时间与凭证。"],
    ["赵映", "沈老爷", "钱先生"],
    ["why-erasure-plan"],
    undefined,
    "钱先生保存的材料",
  ),
  evidence(
    "deleted-original-portrait",
    "画框背后的原画",
    "image",
    "deleted-person.evidence.painter-original",
    "柳生旧画背板",
    ["正式画面被覆盖过，但原稿仍夹在画框背板后。", "原稿中赵映站在沈夫人身边，手里抱着一只猫。"],
    ["赵映", "沈夫人", "柳生"],
    ["who-was-erased", "why-erasure-plan"],
    undefined,
    "柳生保存的原稿",
  ),
  evidence(
    "deleted-unsent-letter",
    "沈老爷未寄出的信",
    "document",
    "deleted-person.unsent-letter",
    "旧书桌夹层",
    ["信写于事故当天白天，但没有封口，也没有交给赵映。", "信中明确写着“我不是要你消失”“我是要你走得出去”，并承认沈老爷无法证明园子与共同记忆之间的异常关系。"],
    ["赵映", "沈老爷"],
    ["why-erasure-plan"],
    undefined,
    "未寄出的信",
  ),
] as const;

export const CASE_FILE_PEOPLE: readonly CaseFilePerson[] = [
  { id: "zhaoying", name: "赵映", role: "调查者 / 当年在场者", note: "七年后回到听雨轩。她自己的记忆同样需要被核对。" },
  { id: "steward", name: "老周", role: "听雨轩旧管事", note: "记得一条沈夫人坚称不存在的侧路。", unlockAny: ["prologue.dialogue.complete", "west.arrived"] },
  { id: "wife", name: "沈夫人", role: "沈家女主人", note: "保存了许多旧物，同时否认西院存在那条侧路。", unlockAny: ["west.dialogue.wife-complete", "prologue.evidence.shoes"] },
  { id: "accountant", name: "钱先生", role: "账房", note: "与离园记录和建筑尺寸记录直接相关。", unlockAny: ["north.evidence.departure-record", "room.trace.boundary"] },
  { id: "painter", name: "柳生", role: "画师", note: "修补过旧画像，也留下了只有特定视角才能成立的图像证据。", unlockAny: ["north.evidence.rain-figure", "room.trace.window", "prologue.evidence.umbrella"] },
] as const;

export const CASE_FILE_QUESTIONS: readonly CaseFileQuestion[] = [
  {
    id: "why-return",
    question: "沈夫人为什么在七年后让赵映回来？",
    openedByAny: ["prologue.evidence.shoes", "prologue.evidence.umbrella"],
  },
  {
    id: "did-side-path-exist",
    question: "西院这条侧路是否曾真实存在？",
    openedByAny: ["west.trace.waterline", "west.trace.mud", "west.trace.lantern", "west.trace.plant"],
    resolvedByAny: ["west.contradiction.waterline", "west.loop-broken"],
    resolvedText: "至少可以确认：不同证词中的空间结构互相矛盾，而现实痕迹支持这里长期存在过通行行为。",
  },
  {
    id: "did-zhaoying-return",
    question: "赵映在傍晚离园后，事故前是否再次回到听雨轩？",
    openedByAny: ["west.wet-footprint-found", "north.evidence.departure-record"],
    resolvedByAny: ["you-did-not-return.complete"],
    resolvedText: "是。第五章的行动链确认赵映在事故发生前已经折返。",
  },
  {
    id: "who-changed-record",
    question: "谁改动了赵映的离园记录，为什么？",
    openedByAny: ["north.evidence.departure-record"],
    resolvedByAny: ["deleted-person.complete"],
    resolvedText: "记录改动属于保护计划的一部分；动机可以理解，但由此造成的掩盖和后果仍需分别评价。",
  },
  {
    id: "was-there-fifth-person",
    question: "案发当晚，已知四人之外是否还有第五个人？",
    openedByAny: ["north.evidence.sixth-cup", "north.evidence.departure-record", "north.evidence.rain-figure"],
    resolvedByAny: ["north.fifth-person.confirmed"],
    resolvedText: "是。生活、文字、图像三条独立证据共同支持第五人的存在，但此时身份仍未知。",
  },
  {
    id: "did-room-exist",
    question: "主宅北墙后是否曾经存在一间现在消失的房间？",
    openedByAny: ["room.trace.door", "room.trace.window", "room.trace.boundary", "room.trace.furniture"],
    resolvedByAny: ["room.reconstructed"],
    resolvedText: "是。门、窗、建筑体积与家具记忆四个条件可以同时成立。",
  },
  {
    id: "who-was-erased",
    question: "旧画像、身高刻痕和消失房间共同指向的“被删掉的人”是谁？",
    openedByAny: ["prologue.evidence.umbrella", "room.trace.furniture", "room.reconstructed"],
    resolvedByAny: ["missing-room.identity-confirmed"],
    resolvedText: "身份已经能够被确认；第四章继续回答的是：为什么所有人都参与了删除。",
  },
  {
    id: "why-erasure-plan",
    question: "为什么四个人在事故后持续删除赵映留下的痕迹？",
    openedByAny: ["deleted-person.evidence.wife-boxes", "deleted-person.evidence.gardener-route", "deleted-person.evidence.accountant-packet", "deleted-person.evidence.painter-original", "deleted-person.unsent-letter"],
    resolvedByAny: ["deleted-person.complete"],
    resolvedText: "这些行动都从保护赵映离开开始，但封路、改记录、收走生活痕迹和覆盖画像叠加成了持续七年的删除。动机与造成的伤害需要分别评价。",
  },
  {
    id: "why-returned-that-night",
    question: "赵映傍晚已经离园，为什么又在事故前折返回来？",
    openedByAny: ["deleted-person.new-contradiction-complete"],
    resolvedByAny: ["you-did-not-return.scene.5-3-complete", "you-did-not-return.complete"],
    resolvedText: "她没有上车，而是因为被家人提前安排离开、房间也已开始收拾而折返；她回到水榭，是为了要求沈老爷亲口解释。",
  },
] as const;

export const evidenceChannelLabel = (channel: EvidenceChannel) => ({
  space: "空间",
  object: "实物",
  document: "文书",
  image: "图像",
  testimony: "证词",
  audio: "声音",
})[channel];

export const discoveredCaseEvidence = (checkpoint: Pick<CheckpointState, "earnedFlags">) =>
  CASE_FILE_EVIDENCE.filter((item) => checkpoint.earnedFlags.includes(item.discoveredFlag));

export const unlockedCasePeople = (checkpoint: Pick<CheckpointState, "earnedFlags">) =>
  CASE_FILE_PEOPLE.filter((person) => !person.unlockAny || person.unlockAny.some((flag) => checkpoint.earnedFlags.includes(flag)));

export const unlockedCaseQuestions = (checkpoint: Pick<CheckpointState, "earnedFlags">) =>
  CASE_FILE_QUESTIONS.filter((question) => question.openedByAny.some((flag) => checkpoint.earnedFlags.includes(flag)));

export const isQuestionResolved = (question: CaseFileQuestion, checkpoint: Pick<CheckpointState, "earnedFlags">) =>
  Boolean(question.resolvedByAny?.some((flag) => checkpoint.earnedFlags.includes(flag)));
