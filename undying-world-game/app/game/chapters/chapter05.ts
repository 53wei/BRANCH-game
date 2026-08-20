import type { ChapterDefinition } from "../types";

// 最终章目前只搭玩法、总证据回收和结局选择骨架。GDD 未定稿的身份、关系与结局均明确保留为占位内容。
export const CHAPTER_05: ChapterDefinition = {
  id: "chapter-05-nameless-seat",
  number: "05",
  title: "无名席",
  objective: "调查这个家庭想让谁真正消失",
  intro: "所有核心证据重新回到同一场家宴。玩家将在重构后的席位、关系和记录之间完成最终关系重建，并作出结局选择。具体身份与结局内容仍待剧情组定稿。",
  inputFlag: "chapter04.truth_reveal_choice_made",
  outputFlag: "chapter05.final_relationship_rebuilt",
  initialRoomId: "final-banquet-a",
  minimumEvidence: 5,
  correctDeduction: "final-relation-c",
  question: "这个家庭想让谁真正消失？",
  deductionHelp: "GDD 已确定最终章要完成关系重建，但尚未给出最终身份答案、关系图和完整证据链。当前三个判断只用于验证最终推断流程。",
  deductionOptions: [
    { id: "final-relation-a", label: "最终关系结论 A（剧情占位，待定稿）" },
    { id: "final-relation-b", label: "最终关系结论 B（剧情占位，待定稿）" },
    { id: "final-relation-c", label: "最终关系结论 C（流程测试答案，待定稿）" },
  ],
  endingChoice: {
    prompt: "完成关系重建后，你要如何结束这场家宴？",
    help: "GDD 明确要求结局选择，但尚未定义结局数量、具体行为和后果。以下选项均为流程占位，没有剧情定论。",
    options: [
      { id: "ending-choice-a", label: "结局方向 A（剧情占位）" },
      { id: "ending-choice-b", label: "结局方向 B（剧情占位）" },
      { id: "ending-choice-c", label: "结局方向 C（剧情占位）" },
    ],
  },
  evidence: [
    { id: "chapter5-clue-a1", code: "A-01", title: "重构家宴 I 线索一", kind: "记录", summary: "第五章剧情占位线索。", detail: "保留最终关系重建的证据接口；具体人物身份、关系与年份等待剧情定稿。" },
    { id: "chapter5-clue-a2", code: "A-02", title: "重构家宴 I 线索二", kind: "物证", summary: "第五章剧情占位线索。", detail: "保留最终关系重建的证据接口；具体人物身份、关系与年份等待剧情定稿。" },
    { id: "chapter5-clue-b1", code: "B-01", title: "核心证据 II 线索一", kind: "证词", summary: "第五章剧情占位线索。", detail: "保留核心证据回到同一空间后的交叉验证接口；具体证词等待剧情定稿。" },
    { id: "chapter5-clue-b2", code: "B-02", title: "核心证据 II 线索二", kind: "记录", summary: "第五章剧情占位线索。", detail: "保留核心证据回到同一空间后的交叉验证接口；具体记录等待剧情定稿。" },
    { id: "chapter5-clue-c1", code: "C-01", title: "无名席 III 线索一", kind: "物证", summary: "第五章剧情占位线索。", detail: "保留无名席最终关系判断的证据接口；具体席位含义等待剧情定稿。" },
    { id: "chapter5-clue-c2", code: "C-02", title: "无名席 III 线索二", kind: "证词", summary: "第五章剧情占位线索。", detail: "保留无名席最终关系判断的证据接口；具体人物与真相等待剧情定稿。" },
  ],
  rooms: [
    { id: "final-banquet-a", name: "重构家宴 I（占位）", short: "家宴重构第一幕，等待剧情与美术替换。", atmosphere: "旧席位重新出现，所有证据开始回到同一张桌上。", hotspots: [
      { id: "chapter5-a-option-1", x: 27, y: 38, label: "选项 A1", title: "检查重构记录", text: "剧情占位：这里将回收一项前章核心记录。", evidenceId: "chapter5-clue-a1" },
      { id: "chapter5-a-option-2", x: 65, y: 53, label: "选项 A2", title: "检查重构物证", text: "剧情占位：这里将回收一项前章核心物证。", evidenceId: "chapter5-clue-a2" },
      { id: "chapter5-a-option-3", x: 79, y: 28, label: "选项 A3", title: "观察整张宴席", text: "剧情占位：该选项用于测试无证据的家宴观察。" },
    ] },
    { id: "final-banquet-b", name: "核心证据 II（占位）", short: "所有核心证据回到同一空间的第二幕。", atmosphere: "记录、证词和席位开始彼此交叉验证。", hotspots: [
      { id: "chapter5-b-option-1", x: 33, y: 61, label: "选项 B1", title: "交叉核对证词", text: "剧情占位：这里将核对一项核心证词。", evidenceId: "chapter5-clue-b1" },
      { id: "chapter5-b-option-2", x: 66, y: 38, label: "选项 B2", title: "交叉核对记录", text: "剧情占位：这里将核对一项核心记录。", evidenceId: "chapter5-clue-b2" },
      { id: "chapter5-b-option-3", x: 81, y: 69, label: "选项 B3", title: "观察证据位置", text: "剧情占位：该选项用于测试无证据的场景观察。" },
    ] },
    { id: "final-banquet-c", name: "无名席 III（占位）", short: "取得核心证词后进入最终关系重建。", atmosphere: "所有关系线在无名席周围汇合，最终答案仍待剧情定稿。", lockedUntil: "chapter5-clue-b1", hotspots: [
      { id: "chapter5-c-option-1", x: 28, y: 35, label: "选项 C1", title: "整理最终物证", text: "剧情占位：这里将整理一项决定关系判断的物证。", evidenceId: "chapter5-clue-c1" },
      { id: "chapter5-c-option-2", x: 66, y: 54, label: "选项 C2", title: "整理最终证词", text: "剧情占位：这里将整理一项决定关系判断的证词。", evidenceId: "chapter5-clue-c2", requires: "chapter5-clue-b1" },
      { id: "chapter5-c-option-3", x: 80, y: 27, label: "选项 C3", title: "观察无名席", text: "剧情占位：该选项用于测试无证据的最终场景观察。" },
    ] },
  ],
  endingTitle: "最终关系已经重建。",
  endingBody: "五章玩法骨架已经完整连通。最终身份、关系真相、人物反应和各结局内容将在剧情统一定稿后替换当前占位内容。",
  endingQuote: "死者不会自然消失，但名字、关系和记忆仍可能被一个家庭共同抹去。",
};
