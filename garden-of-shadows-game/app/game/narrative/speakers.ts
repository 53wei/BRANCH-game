import type { SpeakerProfile } from "../types";

export const speakerProfiles: Record<string, SpeakerProfile> = {
  narrator: {
    id: "narrator",
    name: "听雨轩",
    side: "none",
    themeColor: "#b9a87b",
    portraits: {},
    defaultPortrait: "",
  },
  zhaoying: {
    id: "zhaoying",
    name: "我",
    side: "left",
    themeColor: "#d7c99e",
    voiceId: "zh-CN-Xiaochen:DragonHDLatestNeural",
    portraits: {
      calm: "/media/portraits/zhaoying-calm.webp",
      guarded: "/media/portraits/zhaoying-guarded.webp",
      alarmed: "/media/portraits/zhaoying-alarmed.webp",
    },
    defaultPortrait: "calm",
  },
  steward: {
    id: "steward",
    name: "老管家",
    side: "right",
    themeColor: "#b79a66",
    voiceId: "zh-CN-YunyangNeural",
    portraits: {
      courteous: "/media/portraits/steward-courteous.webp",
      knowing: "/media/portraits/steward-knowing.webp",
      threatening: "/media/portraits/steward-threatening.webp",
    },
    defaultPortrait: "courteous",
  },
  wife: {
    id: "wife",
    name: "顾蘅秋",
    side: "right",
    themeColor: "#b8899a",
    voiceId: "zh-CN-XiaoyiNeural",
    portraits: {
      restrained: "/media/portraits/wife-restrained.webp",
      grieving: "/media/portraits/wife-grieving.webp",
      guarded: "/media/portraits/wife-guarded.webp",
    },
    defaultPortrait: "restrained",
  },
  gardener: {
    id: "gardener",
    name: "周守圃",
    side: "right",
    themeColor: "#6e9b83",
    voiceId: "zh-CN-YunjianNeural",
    portraits: {
      taciturn: "/media/portraits/gardener-taciturn.webp",
      guilty: "/media/portraits/gardener-guilty.webp",
      alarmed: "/media/portraits/gardener-alarmed.webp",
    },
    defaultPortrait: "taciturn",
  },
  accountant: {
    id: "accountant",
    name: "钱先生",
    side: "right",
    themeColor: "#7398b8",
    voiceId: "zh-CN-YunxiNeural",
    portraits: {
      composed: "/media/portraits/accountant-composed.webp",
      cornered: "/media/portraits/accountant-cornered.webp",
    },
    defaultPortrait: "composed",
  },
  painter: {
    id: "painter",
    name: "柳生",
    side: "right",
    themeColor: "#9a739f",
    voiceId: "zh-CN-YunxiNeural",
    portraits: {
      distant: "/media/portraits/painter-distant.webp",
      unsettled: "/media/portraits/painter-unsettled.webp",
    },
    defaultPortrait: "distant",
  },
};
