import type { ChapterDefinition } from "../types";

// 第三章目前只搭玩法与衔接骨架。所有标有“剧情占位”的内容都要在剧情定稿后替换。
export const CHAPTER_03: ChapterDefinition = {
  id: "chapter-03-first-death",
  number: "03",
  title: "第一次“死”",
  objective: "调查她身体死亡时发生了什么",
  intro: "证据将调查引向一组 Old Tableau / 旧景静态场景。具体人物、事件与对白尚未定稿，当前先完成章节流程骨架。",
  inputFlag: "chapter02.first_family_conflict",
  outputFlag: "chapter03.death_was_not_accident",
  initialRoomId: "old-tableau-a",
  minimumEvidence: 5,
  correctDeduction: "placeholder-conclusion-c",
  question: "她身体死亡时发生了什么？",
  deductionHelp: "GDD 目前只确定最终应理解“事件并非意外”；具体证据链和责任人等待剧情定稿。",
  deductionOptions: [
    { id: "placeholder-conclusion-a", label: "占位结论 A：等待剧情组填写。" },
    { id: "placeholder-conclusion-b", label: "占位结论 B：等待剧情组填写。" },
    { id: "placeholder-conclusion-c", label: "占位结论 C：现有证据指向这并非一次意外。" },
  ],
  evidence: [
    { id: "chapter3-clue-a1", code: "A-01", title: "旧景 I 线索一", kind: "物证", summary: "第三章剧情占位线索。", detail: "此处保留证据接口、归档和推断依赖，具体内容等待剧情定稿。" },
    { id: "chapter3-clue-a2", code: "A-02", title: "旧景 I 线索二", kind: "记录", summary: "第三章剧情占位线索。", detail: "此处保留证据接口、归档和推断依赖，具体内容等待剧情定稿。" },
    { id: "chapter3-clue-b1", code: "B-01", title: "旧景 II 线索一", kind: "证词", summary: "第三章剧情占位线索。", detail: "此处保留证据接口、归档和推断依赖，具体内容等待剧情定稿。" },
    { id: "chapter3-clue-b2", code: "B-02", title: "旧景 II 线索二", kind: "物证", summary: "第三章剧情占位线索。", detail: "此处保留证据接口、归档和推断依赖，具体内容等待剧情定稿。" },
    { id: "chapter3-clue-c1", code: "C-01", title: "旧景 III 线索一", kind: "记录", summary: "第三章剧情占位线索。", detail: "此处保留证据接口、归档和推断依赖，具体内容等待剧情定稿。" },
    { id: "chapter3-clue-c2", code: "C-02", title: "旧景 III 线索二", kind: "证词", summary: "第三章剧情占位线索。", detail: "此处保留证据接口、归档和推断依赖，具体内容等待剧情定稿。" },
  ],
  rooms: [
    { id: "old-tableau-a", name: "旧景 I（占位）", short: "Old Tableau 第一幕，等待剧情与美术替换。", atmosphere: "旧景静态场景的第一幕气氛占位。", hotspots: [
      { id: "chapter3-a-option-1", x: 30, y: 40, label: "选项 A1", title: "调查场景 A 的第一处", text: "剧情占位：这里会显示选项 A1 的调查结果。", evidenceId: "chapter3-clue-a1" },
      { id: "chapter3-a-option-2", x: 62, y: 52, label: "选项 A2", title: "调查场景 A 的第二处", text: "剧情占位：这里会显示选项 A2 的调查结果。", evidenceId: "chapter3-clue-a2" },
      { id: "chapter3-a-option-3", x: 76, y: 31, label: "选项 A3", title: "观察场景 A", text: "剧情占位：该选项用于测试无证据的场景观察。" },
    ] },
    { id: "old-tableau-b", name: "旧景 II（占位）", short: "Old Tableau 第二幕，等待剧情与美术替换。", atmosphere: "旧景静态场景的第二幕气氛占位。", hotspots: [
      { id: "chapter3-b-option-1", x: 35, y: 58, label: "选项 B1", title: "调查场景 B 的第一处", text: "剧情占位：这里会显示选项 B1 的调查结果。", evidenceId: "chapter3-clue-b1" },
      { id: "chapter3-b-option-2", x: 64, y: 36, label: "选项 B2", title: "调查场景 B 的第二处", text: "剧情占位：这里会显示选项 B2 的调查结果。", evidenceId: "chapter3-clue-b2" },
      { id: "chapter3-b-option-3", x: 80, y: 70, label: "选项 B3", title: "观察场景 B", text: "剧情占位：该选项用于测试无证据的场景观察。" },
    ] },
    { id: "old-tableau-c", name: "旧景 III（占位）", short: "取得旧景 II 的关键线索后进入。", atmosphere: "旧景静态场景的第三幕气氛占位。", lockedUntil: "chapter3-clue-b1", hotspots: [
      { id: "chapter3-c-option-1", x: 27, y: 35, label: "选项 C1", title: "调查场景 C 的第一处", text: "剧情占位：这里会显示选项 C1 的调查结果。", evidenceId: "chapter3-clue-c1" },
      { id: "chapter3-c-option-2", x: 66, y: 54, label: "选项 C2", title: "调查场景 C 的第二处", text: "剧情占位：这里会显示选项 C2 的调查结果。", evidenceId: "chapter3-clue-c2", requires: "chapter3-clue-b1" },
      { id: "chapter3-c-option-3", x: 81, y: 28, label: "选项 C3", title: "观察场景 C", text: "剧情占位：该选项用于测试无证据的场景观察。" },
    ] },
  ],
  endingTitle: "这不是一次意外。",
  endingBody: "第三章骨架已经建立“事件并非意外”的章节输出；责任人、过程和证据细节等待剧情统一完成后替换。",
  endingQuote: "下一章将追问：为什么所有人继续隐瞒？",
};
