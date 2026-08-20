import type { ChapterDefinition } from "../types";

export const CHAPTER_02: ChapterDefinition = {
  id: "chapter-02-who-erased-the-name", number: "02", title: "谁删了名字",
  objective: "找出是谁下令删除她，又是谁在今夜继续灭证",
  intro: "第七席的女人确实属于这个家。可有人不只从族谱里划掉她，还在今夜继续烧掉证据。",
  inputFlag: "chapter01.woman_belonged_to_family", outputFlag: "chapter02.first_family_conflict",
  initialRoomId: "archive", minimumEvidence: 5, correctDeduction: "ordered-and-executed",
  question: "谁开始删除她？", deductionHelp: "选择能同时解释登记缺页、今夜纸灰和旧账签押的判断。",
  deductionOptions: [
    { id: "uncle-alone", label: "二叔为了隐瞒私事，独自删改全部记录。" },
    { id: "mother-first", label: "母亲最早删去名字，二叔只是在今夜销毁备份。" },
    { id: "ordered-and-executed", label: "长房下令停止承认她，二叔负责删档，并在今夜继续灭证。" },
  ],
  evidence: [
    { id: "missing-register-page", code: "D-01", title: "登记册缺页", kind: "记录", summary: "整页沿装订线被割走。", detail: "这不是自然脱落，而是有人沿装订线完整割走一页。" },
    { id: "corrected-index", code: "D-02", title: "被改成六的索引", kind: "记录", summary: "墨迹下压着没有刮净的“七”。", detail: "索引数字被后改，目的是让总人数与删页后的记录一致。" },
    { id: "seal-ash", code: "Y-01", title: "红印纸灰", kind: "物证", summary: "今夜火盆里留下长房档案的红印。", detail: "火盆里的纸角尚未烧透，边框来自长房档案。" },
    { id: "aunt-statement", code: "Y-02", title: "容姨的矛盾证词", kind: "证词", summary: "她先否认动过火盆，又说二叔让她添炭。", detail: "两句话互相冲突，证明今夜确有人处理纸张。" },
    { id: "allowance-entry", code: "Z-01", title: "第七份子女钱", kind: "记录", summary: "旧账连续三年有第七列支出。", detail: "她曾被长期承认为这个家的女儿。" },
    { id: "dual-signature", code: "Z-02", title: "两个人的删改签押", kind: "物证", summary: "长房止付印下藏着二叔的经手小签。", detail: "删除由长房下令、二叔执行，今夜焚毁备份是在延续旧决定。" },
  ],
  rooms: [
    { id: "archive", name: "档案间", short: "潮纸、木柜，以及一处太整齐的空白。", atmosphere: "纸页受潮的气味里，混着刚烧过的灰。", hotspots: [
      { id: "register", x: 52, y: 55, label: "登记册", title: "装订线上的空位", text: "有人沿着装订线把整页割走。", evidenceId: "missing-register-page" },
      { id: "index", x: 73, y: 31, label: "索引牌", title: "六，还是七？", text: "墨迹下压着一个没有完全刮净的七。", evidenceId: "corrected-index" },
      { id: "cabinet", x: 22, y: 36, label: "空档格", title: "被清得过分干净", text: "只有旧年份的这一格像刚被布擦过。" },
    ] },
    { id: "courtyard", name: "院落", short: "雨刚停，火盆里的纸还是温的。", atmosphere: "屋檐滴水，容姨始终不看那只火盆。", hotspots: [
      { id: "brazier", x: 67, y: 66, label: "火盆", title: "今夜烧掉的纸", text: "灰里压着未烧透的纸角，仍能辨出长房档案边框。", evidenceId: "seal-ash" },
      { id: "aunt", x: 28, y: 49, label: "容姨", title: "只是烧落叶", text: "她先说没人碰过，随后又说二叔让她添过炭。", evidenceId: "aunt-statement" },
      { id: "drain", x: 48, y: 78, label: "排水沟", title: "被雨带走的墨", text: "一缕黑水从火盆方向流来。" },
    ] },
    { id: "account", name: "旧账房", short: "找到红印纸灰后，旧账才肯开口。", atmosphere: "算盘无人拨动，末尾一颗珠子却轻轻碰了一下。", lockedUntil: "seal-ash", hotspots: [
      { id: "allowance", x: 47, y: 58, label: "支出格", title: "第七份子女钱", text: "每月支出原本有七列，最后一列仍能读到三年的数额。", evidenceId: "allowance-entry" },
      { id: "signature", x: 69, y: 43, label: "签押", title: "命令与经手", text: "纸灰拼回缺口后，长房止付印和二叔经手签同时出现。", evidenceId: "dual-signature", requires: "seal-ash" },
      { id: "abacus", x: 27, y: 70, label: "算盘", title: "少算一个人", text: "最外侧有一颗颜色略浅的珠子。" },
    ] },
  ],
  endingTitle: "“我只是按她的意思，把纸烧干净。”",
  endingBody: "长房的止付印证明命令来源，二叔的经手签与今夜纸灰证明删除延续至今。",
  endingQuote: "别问纸。去问她第一次死的时候，谁还在屋里。",
};
