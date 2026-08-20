export type Evidence = {
  id: string;
  code: string;
  title: string;
  kind: "记录" | "物证" | "证词";
  summary: string;
  detail: string;
};

export type Hotspot = {
  id: string;
  x: number;
  y: number;
  label: string;
  title: string;
  text: string;
  evidenceId?: string;
  requires?: string;
};

export type Room = {
  id: "archive" | "courtyard" | "account";
  name: string;
  short: string;
  atmosphere: string;
  lockedUntil?: string;
  hotspots: Hotspot[];
};

export const CHAPTER_02 = {
  id: "chapter-02-who-erased-the-name",
  title: "谁删了名字",
  objective: "找到谁开始删除她，并迫使家族第一次公开冲突",
  inputFlag: "chapter01.woman_belonged_to_family",
  outputFlag: "chapter02.first_family_conflict",
  minimumEvidence: 5,
  correctDeduction: "ordered-and-executed",
} as const;

export const evidence: Evidence[] = [
  {
    id: "missing-register-page",
    code: "A-01",
    title: "被整页抽走的登记",
    kind: "记录",
    summary: "族籍登记不是受潮缺页，装订线有新鲜割痕。",
    detail: "相邻页码连续，只有夹在中间的一整页被刀片贴着线割走。割口压住了旧霉斑，说明删改发生得更晚。",
  },
  {
    id: "corrected-index",
    code: "A-02",
    title: "重新描过的索引",
    kind: "记录",
    summary: "索引中的人数由“七”改成“六”，墨色比正文新。",
    detail: "改字的人熟悉档案位置，却没有更换整册，只修正了会暴露人数的那一笔。",
  },
  {
    id: "seal-ash",
    code: "Y-01",
    title: "带红印的纸灰",
    kind: "物证",
    summary: "院落火盆里有登记纸残角，压着长房印记。",
    detail: "灰烬尚未受潮。有人在今夜家宴开始前，再次销毁带有长房验讫红印的旧档。",
  },
  {
    id: "aunt-statement",
    code: "Y-02",
    title: "容姨改口的证词",
    kind: "证词",
    summary: "她先说火盆没人用，又说二叔让她添过炭。",
    detail: "容姨并不想指认二叔，但她知道焚烧发生在晚饭前，也知道被烧的是家里的纸，不是落叶。",
  },
  {
    id: "allowance-entry",
    code: "Z-01",
    title: "多出来的一份女儿钱",
    kind: "记录",
    summary: "旧账每月固定支出七份子女钱，后来整列被刮去。",
    detail: "刮痕下仍能看见连续三年的支出。她不是偶然来过，而是曾被长期承认为这个家的女儿。",
  },
  {
    id: "dual-signature",
    code: "Z-02",
    title: "两个人的删改签押",
    kind: "物证",
    summary: "祖母的“止付”印下，藏着二叔当天的经手小签。",
    detail: "删除不是某个人偷偷完成的：长房下令，二叔执行。今夜焚毁备份，是在继续完成当年的决定。",
  },
];

export const rooms: Room[] = [
  {
    id: "archive",
    name: "档案间",
    short: "潮纸、木柜，以及一处太整齐的空白。",
    atmosphere: "纸页受潮的气味里，混着刚烧过的灰。",
    hotspots: [
      { id: "register", x: 52, y: 55, label: "登记册", title: "装订线上的空位", text: "旧登记册自然摊开在同一处。不是纸张脱落，而是有人沿着装订线把整页割走。", evidenceId: "missing-register-page" },
      { id: "index", x: 73, y: 31, label: "索引牌", title: "六，还是七？", text: "“本房子女六人”的“六”比周围更黑。灯斜照过去，底下压着一个没有完全刮净的“七”。", evidenceId: "corrected-index" },
      { id: "cabinet", x: 22, y: 36, label: "空档格", title: "被清得过分干净", text: "其他档格都有灰，只有写着旧年份的这一格像刚被布擦过。里面留着一小片红色纸屑。" },
    ],
  },
  {
    id: "courtyard",
    name: "院落",
    short: "雨刚停，火盆里的纸却还是温的。",
    atmosphere: "屋檐滴水一声一声，容姨始终不看那只火盆。",
    hotspots: [
      { id: "brazier", x: 67, y: 66, label: "火盆", title: "今夜烧掉的纸", text: "灰里压着没有烧透的纸角。红印只剩半枚，仍能辨出长房档案使用的边框。", evidenceId: "seal-ash" },
      { id: "aunt", x: 28, y: 49, label: "容姨", title: "“只是烧落叶”", text: "你问火盆，她先说今夜没人碰过；看见你手里的纸灰后，又说二叔晚饭前让她添过一次炭。", evidenceId: "aunt-statement" },
      { id: "drain", x: 48, y: 78, label: "排水沟", title: "被雨水带走的墨", text: "一缕黑水从火盆方向流来。今夜的雨替某个人处理了大部分痕迹。" },
    ],
  },
  {
    id: "account",
    name: "旧账房",
    short: "旧账册在你找到红印纸灰后才肯开口。",
    atmosphere: "算盘没有人拨，最末一颗珠子却轻轻撞了一下。",
    lockedUntil: "seal-ash",
    hotspots: [
      { id: "allowance", x: 47, y: 58, label: "支出栏", title: "第七份子女钱", text: "每月支出原本有七列。最右一列被反复刮薄，逆着光仍能读到连续三年的数额。", evidenceId: "allowance-entry" },
      { id: "signature", x: 69, y: 43, label: "签押", title: "命令与经手", text: "你把火盆残角贴到缺口旁：祖母的“止付”红印重新完整。印下还压着二叔惯用的小签。", evidenceId: "dual-signature", requires: "seal-ash" },
      { id: "abacus", x: 27, y: 70, label: "算盘", title: "少算一个人", text: "账房的旧算盘固定在六份的位置。最外侧有一颗颜色略浅的珠子，像是后来才换上的。" },
    ],
  },
];

export const deductionOptions = [
  { id: "uncle-alone", label: "二叔为了隐瞒私事，独自删改全部记录。" },
  { id: "mother-first", label: "母亲最早删去名字，二叔只是在今夜销毁备份。" },
  { id: "ordered-and-executed", label: "长房下令停止承认她，二叔负责删档，并在今夜继续灭证。" },
];

export const getEvidence = (id: string) => evidence.find((item) => item.id === id);
