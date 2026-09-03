export type StoryCGId =
  | "rain-return"
  | "family-portrait"
  | "liusheng-fifth-figure"
  | "child-room"
  | "water-pavilion-argument"
  | "wooden-steps-accident"
  | "erasure-montage"
  | "fifth-garden-departure";

export interface StoryCGEntry {
  id: StoryCGId;
  chapterId: string;
  title: string;
  path: string;
  alt: string;
}

export const STORY_CGS: readonly StoryCGEntry[] = [
  {
    id: "rain-return",
    chapterId: "prologue-rain",
    title: "雨夜回园",
    path: "/media/cg/story-v1/cg-01-rain-return-v1.png",
    alt: "暴雨中的江南园林门前，成年赵映独自提灯归来",
  },
  {
    id: "family-portrait",
    chapterId: "prologue-rain",
    title: "旧日合影",
    path: "/media/cg/story-v1/cg-02-family-portrait-v1.png",
    alt: "听雨轩旧日家庭合影，年少赵映站在沈家众人之间",
  },
  {
    id: "liusheng-fifth-figure",
    chapterId: "north-tower-ledger",
    title: "画中的第五个人",
    path: "/media/cg/story-v1/cg-03-liusheng-fifth-figure-v1.png",
    alt: "柳生在昏暗画室里画下合影中被覆盖的第五个人",
  },
  {
    id: "child-room",
    chapterId: "missing-room",
    title: "消失的儿童房",
    path: "/media/cg/story-v1/cg-04-child-room-v1.png",
    alt: "北墙之后重新显现的普通儿童房与床板下的旧盒子",
  },
  {
    id: "water-pavilion-argument",
    chapterId: "you-did-not-return",
    title: "水榭争执",
    path: "/media/cg/story-v1/cg-05-water-pavilion-argument-v1.png",
    alt: "雨夜水榭中赵映与沈老爷隔着桌案争执",
  },
  {
    id: "wooden-steps-accident",
    chapterId: "you-did-not-return",
    title: "木阶事故",
    path: "/media/cg/story-v1/cg-06-wooden-steps-accident-v1.png",
    alt: "赵映已背身下阶，沈老爷在两人没有接触的情况下于湿木阶滑倒",
  },
  {
    id: "erasure-montage",
    chapterId: "you-did-not-return",
    title: "四个人的删除",
    path: "/media/cg/story-v1/cg-07-erasure-montage-v1.png",
    alt: "四联画分别呈现装箱、封路、改记录与覆盖画像",
  },
  {
    id: "fifth-garden-departure",
    chapterId: "fifth-tingyuxuan",
    title: "第五种听雨轩",
    path: "/media/cg/story-v1/cg-08-fifth-garden-departure-v1.png",
    alt: "雨停后的清晨，赵映把写下真相的纸留在桌上并走出园门",
  },
] as const;

export const storyCGById = (id: StoryCGId) => STORY_CGS.find((entry) => entry.id === id)!;

