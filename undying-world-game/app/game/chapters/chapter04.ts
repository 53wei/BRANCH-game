import type { ChapterDefinition } from "../types";

// 第四章目前只搭玩法与衔接骨架。GDD 未定稿的人物、动机、证据和真相片段均明确保留为占位内容。
export const CHAPTER_04: ChapterDefinition = {
  id: "chapter-04-living-people",
  number: "04",
  title: "活着的人",
  objective: "调查为什么所有人继续隐瞒",
  intro: "第三章已经确认事件并非意外。第四章将通过人物关系和席位变化追查隐瞒如何延续；具体人物、动机与事实仍待剧情组定稿。",
  inputFlag: "chapter03.death_was_not_accident",
  outputFlag: "chapter04.truth_reveal_choice_made",
  initialRoomId: "living-relations-a",
  minimumEvidence: 5,
  correctDeduction: "truth-choice-c",
  question: "先公开哪段真相？",
  deductionHelp: "GDD 只确定玩家必须选择先公开哪段真相，尚未定义具体真相片段与后果。当前三个选项仅用于验证选择、结算和第五章接口。",
  deductionOptions: [
    { id: "truth-choice-a", label: "真相片段 A（剧情占位，待定稿）" },
    { id: "truth-choice-b", label: "真相片段 B（剧情占位，待定稿）" },
    { id: "truth-choice-c", label: "真相片段 C（流程测试选项，待定稿）" },
  ],
  evidence: [
    { id: "chapter4-clue-a1", code: "A-01", title: "人物关系 I 线索一", kind: "记录", summary: "第四章剧情占位线索。", detail: "保留人物关系证据接口；具体人物、关系与隐瞒动机等待剧情定稿。" },
    { id: "chapter4-clue-a2", code: "A-02", title: "人物关系 I 线索二", kind: "证词", summary: "第四章剧情占位线索。", detail: "保留人物关系证据接口；具体人物、关系与隐瞒动机等待剧情定稿。" },
    { id: "chapter4-clue-b1", code: "B-01", title: "席位变化 II 线索一", kind: "记录", summary: "第四章剧情占位线索。", detail: "保留席位变化证据接口；席位对象、变化原因与时间等待剧情定稿。" },
    { id: "chapter4-clue-b2", code: "B-02", title: "席位变化 II 线索二", kind: "物证", summary: "第四章剧情占位线索。", detail: "保留席位变化证据接口；席位对象、变化原因与时间等待剧情定稿。" },
    { id: "chapter4-clue-c1", code: "C-01", title: "公开之前 III 线索一", kind: "证词", summary: "第四章剧情占位线索。", detail: "保留公开选择的证据接口；可公开的真相片段及其后果等待剧情定稿。" },
    { id: "chapter4-clue-c2", code: "C-02", title: "公开之前 III 线索二", kind: "记录", summary: "第四章剧情占位线索。", detail: "保留公开选择的证据接口；可公开的真相片段及其后果等待剧情定稿。" },
  ],
  rooms: [
    { id: "living-relations-a", name: "人物关系 I（占位）", short: "人物关系变化的第一幕，等待剧情与美术替换。", atmosphere: "关系线彼此交叠，但具体人物仍未定稿。", hotspots: [
      { id: "chapter4-a-option-1", x: 28, y: 37, label: "选项 A1", title: "查看第一组关系", text: "剧情占位：这里将呈现一组人物关系或证词变化。", evidenceId: "chapter4-clue-a1" },
      { id: "chapter4-a-option-2", x: 63, y: 53, label: "选项 A2", title: "查看第二组关系", text: "剧情占位：这里将呈现另一组人物关系或证词变化。", evidenceId: "chapter4-clue-a2" },
      { id: "chapter4-a-option-3", x: 78, y: 29, label: "选项 A3", title: "观察关系图", text: "剧情占位：该选项用于测试无证据的场景观察。" },
    ] },
    { id: "living-seats-b", name: "席位变化 II（占位）", short: "席位变化的第二幕，等待剧情与美术替换。", atmosphere: "座次已经变化，但具体对象与原因仍未定稿。", hotspots: [
      { id: "chapter4-b-option-1", x: 34, y: 61, label: "选项 B1", title: "检查席位记录", text: "剧情占位：这里将呈现一次席位变化。", evidenceId: "chapter4-clue-b1" },
      { id: "chapter4-b-option-2", x: 66, y: 39, label: "选项 B2", title: "检查席位痕迹", text: "剧情占位：这里将呈现与席位变化有关的物证。", evidenceId: "chapter4-clue-b2" },
      { id: "chapter4-b-option-3", x: 81, y: 69, label: "选项 B3", title: "观察空席", text: "剧情占位：该选项用于测试无证据的场景观察。" },
    ] },
    { id: "living-truth-c", name: "公开之前 III（占位）", short: "取得席位变化的关键线索后进入。", atmosphere: "公开顺序即将被选择，具体真相片段仍待定稿。", lockedUntil: "chapter4-clue-b1", hotspots: [
      { id: "chapter4-c-option-1", x: 29, y: 35, label: "选项 C1", title: "整理第一段材料", text: "剧情占位：这里将整理一个可公开的真相片段。", evidenceId: "chapter4-clue-c1" },
      { id: "chapter4-c-option-2", x: 65, y: 55, label: "选项 C2", title: "整理第二段材料", text: "剧情占位：这里将整理另一个可公开的真相片段。", evidenceId: "chapter4-clue-c2", requires: "chapter4-clue-b1" },
      { id: "chapter4-c-option-3", x: 80, y: 27, label: "选项 C3", title: "观察公开顺序", text: "剧情占位：该选项用于测试无证据的场景观察。" },
    ] },
  ],
  endingTitle: "已经选择先公开哪段真相。",
  endingBody: "第四章骨架已经建立“玩家选择先公开哪段真相”的章节输出；具体真相内容、人物反应和第五章继承结果等待剧情统一完成后替换。",
  endingQuote: "下一章将追问：这个家庭想让谁真正消失？",
};
