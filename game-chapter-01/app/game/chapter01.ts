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
  id: "dining" | "shrine" | "bedroom";
  name: string;
  short: string;
  atmosphere: string;
  lockedUntil?: string;
  hotspots: Hotspot[];
};

export const CHAPTER_01 = {
  id: "chapter-01-seventh-seat",
  title: "第七席",
  objective: "确认第七席的女人是否曾属于这个家",
  inputFlag: null,
  outputFlag: "chapter01.woman_belonged_to_family",
  minimumEvidence: 5,
  correctDeduction: "family-member",
  nextChapterUrl: "https://undying-world-chapter-02.solar-char-7776.chatgpt.site",
} as const;

export const evidence: Evidence[] = [
  { id:"seventh-tableware", code:"F-01", title:"第七副碗筷", kind:"物证", summary:"六人入席，桌上却一直保留第七套餐具。", detail:"碗底的磨损与其他旧碗相同，不是今夜临时添置。这个位置曾被长期使用。" },
  { id:"aunt-slip", code:"F-02", title:"被收回的称呼", kind:"证词", summary:"长辈脱口说出“她还是坐老位置”，随后改口。", detail:"对方否认认识第七席的女人，却在紧张时默认她有固定座位。人物本身成为证据。" },
  { id:"cropped-photo", code:"Z-01", title:"裁去一人的合影", kind:"物证", summary:"祖堂旧照右侧被裁掉，仍留下半只搭在肩上的手。", detail:"照片原本至少多一人。裁口比相纸褪色更新，说明有人后来主动改变家庭记录。" },
  { id:"genealogy-stitch", code:"Z-02", title:"重新缝过的族谱", kind:"记录", summary:"同代排行从六开始，但装订处藏有被拆走的一页。", detail:"页码与排行都显示这里原本还有一个同代成员。族谱的缺失不是自然损坏。" },
  { id:"childhood-dress", code:"W-01", title:"第七件旧衣", kind:"物证", summary:"旧卧室里保存着尺寸连续的一件女孩衣服。", detail:"衣服与家中其他孩子的旧衣同批缝制，内侧名字布被拆走，只留下针脚。" },
  { id:"height-marks", code:"W-02", title:"被刮掉的身高线", kind:"记录", summary:"门框上有七组成长刻线，其中一组名字被反复刮除。", detail:"刻线跨越多年，证明她曾和其他孩子一起在这里长大，而不是偶然来访。" },
];

export const rooms: Room[] = [
  { id:"dining", name:"饭厅", short:"家宴仍在继续，多出的碗筷无人解释。", atmosphere:"六个人围坐，桌上却摆着七副碗筷。", hotspots:[
    { id:"tableware", x:68, y:64, label:"空席", title:"一直被使用的第七席", text:"这套餐具有长期磨损，碗底还留着与其他旧碗相同的火痕。它不是为客人临时准备的。", evidenceId:"seventh-tableware" },
    { id:"aunt", x:25, y:42, label:"长辈", title:"一句没有说完的话", text:"她先说家里从来只有六个孩子，又在你碰到空席时脱口而出：“别动，她还是坐老位置。”", evidenceId:"aunt-slip" },
    { id:"seat-card", x:53, y:54, label:"席位牌", title:"没有名字的旧牌", text:"木牌被磨得很光，原本刻字的位置被细细刮平。先找到家庭记录，才能判断它属于谁。" },
  ]},
  { id:"shrine", name:"祖堂", short:"照片和族谱共同维持家族承认的秩序。", atmosphere:"香烟升得笔直，最边上的相框却微微向内倾。", hotspots:[
    { id:"photo", x:67, y:36, label:"合影", title:"照片外还有一个人", text:"合影右侧被裁去一条。画面里仍留着半只手，熟练地搭在母亲肩上。", evidenceId:"cropped-photo" },
    { id:"genealogy", x:44, y:61, label:"族谱", title:"被重新缝过的页码", text:"同代排行直接从六开始。装订线下压着旧线孔：至少有一页被拆走后重新缝合。", evidenceId:"genealogy-stitch" },
    { id:"tablet", x:28, y:33, label:"牌位", title:"空出来的间距", text:"牌位之间留着一道规整空隙，宽度恰好能再放一块。这里也有人被移走过。" },
  ]},
  { id:"bedroom", name:"旧卧室", short:"照片证实存在第七人后，这个房间才有意义。", atmosphere:"门轴很久没有响过，屋内却没有积下相应的灰。", lockedUntil:"cropped-photo", hotspots:[
    { id:"dress", x:30, y:53, label:"旧衣箱", title:"第七件孩子的衣服", text:"衣服和家中保存的其他旧衣同批缝制。内侧名字布被拆掉，只留下密集针脚。", evidenceId:"childhood-dress" },
    { id:"marks", x:72, y:45, label:"门框", title:"一起长大的刻线", text:"门框上有七组身高线。最右一组跨越多年，名字位置却被反复刮到木纹发白。", evidenceId:"height-marks" },
    { id:"mirror", x:53, y:37, label:"旧镜", title:"镜中的空位", text:"你站到镜前时，身后衣架轻轻晃动。没有人出现，但这间房不像无人居住。" },
  ]},
];

export const deductionOptions = [
  { id:"guest", label:"她只是过去参加过家宴的客人。" },
  { id:"servant", label:"她长期住在老宅，但不属于这个家庭。" },
  { id:"family-member", label:"她曾作为同代女儿在这里生活，后来被主动从家庭记录中删除。" },
];

export const getEvidence = (id:string) => evidence.find((item) => item.id === id);
