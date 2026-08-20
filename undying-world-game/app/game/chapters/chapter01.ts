import type { ChapterDefinition } from "../types";

export const CHAPTER_01: ChapterDefinition = {
  id: "chapter-01-seventh-seat",
  number: "01",
  title: "第七席",
  objective: "确认第七席的女人是否曾属于这个家",
  intro: "家宴照常开始。六个人已经坐下，桌上却一直摆着第七副碗筷。",
  inputFlag: null,
  outputFlag: "chapter01.woman_belonged_to_family",
  initialRoomId: "dining",
  minimumEvidence: 5,
  correctDeduction: "family-member",
  question: "第七席的女人是谁？",
  deductionHelp: "选择最能同时解释生活痕迹、家庭记录与人物证词的判断。",
  deductionOptions: [
    { id: "guest", label: "她只是过去参加过家宴的客人。" },
    { id: "servant", label: "她长期住在老宅，但不属于这个家庭。" },
    { id: "family-member", label: "她曾作为同代女儿在这里生活，后来被主动从家庭记录中删除。" },
  ],
  evidence: [
    { id: "seventh-tableware", code: "F-01", title: "第七副碗筷", kind: "物证", summary: "六人入席，桌上却长期保留第七套餐具。", detail: "碗底磨损与其他旧碗相同，说明这个位置曾被长期使用。" },
    { id: "aunt-slip", code: "F-02", title: "被收回的称呼", kind: "证词", summary: "长辈脱口说出“她还是坐老位置”。", detail: "对方否认认识她，却在紧张时默认她有固定座位。" },
    { id: "cropped-photo", code: "Z-01", title: "裁去一人的合影", kind: "物证", summary: "祖堂旧照右侧被裁掉，仍留下半只手。", detail: "照片原本至少多一人，裁口比相纸褪色更新。" },
    { id: "genealogy-stitch", code: "Z-02", title: "重新缝过的族谱", kind: "记录", summary: "同代排行从六开始，装订处藏着拆页痕迹。", detail: "页码与排行都表明这里原本还有一个同代成员。" },
    { id: "childhood-dress", code: "W-01", title: "第七件旧衣", kind: "物证", summary: "旧卧室里保存着尺寸连续的一件女孩衣服。", detail: "衣服与家中其他孩子的旧衣同批缝制，名字布被拆走。" },
    { id: "height-marks", code: "W-02", title: "被刮掉的身高线", kind: "记录", summary: "门框有七组成长刻线，其中一组名字被刮除。", detail: "刻线跨越多年，证明她曾和其他孩子一起长大。" },
  ],
  rooms: [
    { id: "dining", name: "饭厅", short: "多出的碗筷无人解释。", atmosphere: "六个人围坐，桌上却摆着七副碗筷。", hotspots: [
      { id: "tableware", x: 68, y: 64, label: "空席", title: "一直被使用的第七席", text: "餐具有长期磨损，它不是为客人临时准备的。", evidenceId: "seventh-tableware" },
      { id: "aunt", x: 25, y: 42, label: "长辈", title: "一句没有说完的话", text: "她先说家里只有六个孩子，又脱口而出：她还是坐老位置。", evidenceId: "aunt-slip" },
      { id: "seat-card", x: 52, y: 53, label: "席位牌", title: "没有名字的旧牌", text: "原本刻字的位置被仔细刮平。" },
    ] },
    { id: "shrine", name: "祖堂", short: "照片和族谱维持家族承认的秩序。", atmosphere: "香烟升得笔直，最边上的相框微微向内倾。", hotspots: [
      { id: "photo", x: 67, y: 36, label: "合影", title: "照片外还有一个人", text: "合影右侧被裁去一条，画面里仍留着半只手。", evidenceId: "cropped-photo" },
      { id: "genealogy", x: 44, y: 61, label: "族谱", title: "被重新缝过的页码", text: "同代排行直接从六开始，旧线孔证明至少一页被拆走。", evidenceId: "genealogy-stitch" },
      { id: "tablet", x: 28, y: 33, label: "牌位", title: "空出来的间距", text: "牌位间留着一道规整空隙，这里也有人被移走过。" },
    ] },
    { id: "bedroom", name: "旧卧室", short: "合影证明第七人存在后，这个房间才会开放。", atmosphere: "门轴很久没有响过，屋内却没有积下相应的灰。", lockedUntil: "cropped-photo", hotspots: [
      { id: "dress", x: 30, y: 53, label: "旧衣箱", title: "第七件孩子的衣服", text: "衣服与家中其他旧衣同批缝制，名字布被拆掉。", evidenceId: "childhood-dress" },
      { id: "marks", x: 72, y: 45, label: "门框", title: "一起长大的刻线", text: "门框上有七组身高线，最右一组跨越多年。", evidenceId: "height-marks" },
      { id: "mirror", x: 53, y: 37, label: "旧镜", title: "镜中的空位", text: "衣架轻轻晃动，这间房不像无人居住。" },
    ] },
  ],
  endingTitle: "她不是客人。这个家曾经有七个孩子。",
  endingBody: "碗筷、合影、族谱针孔、旧衣和身高线互相印证：有人系统地删除了她。",
  endingQuote: "第七席的女人抬起头，准确叫出了你的乳名。",
};
