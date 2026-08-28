export interface CampaignRoute {
  chapterId: string;
  entryAnchorId: string;
  transitionAnchorIds: string[];
  exitAnchorId: string;
  nextChapterId?: string;
}

export const campaignRoutes: CampaignRoute[] = [
  { chapterId: "west-corridor-loop", entryAnchorId: "west-entry", transitionAnchorIds: ["west-courtyard", "wife-moon-gate"], exitAnchorId: "rockery-side-route", nextChapterId: "north-tower-ledger" },
  { chapterId: "north-tower-ledger", entryAnchorId: "rockery-side-route", transitionAnchorIds: ["north-tower-entry", "north-court"], exitAnchorId: "front-hall", nextChapterId: "front-hall-guest" },
  { chapterId: "front-hall-guest", entryAnchorId: "front-hall", transitionAnchorIds: ["east-pavilion-landmark"], exitAnchorId: "bridge-approach", nextChapterId: "sealed-pavilion" },
  { chapterId: "sealed-pavilion", entryAnchorId: "bridge-approach", transitionAnchorIds: ["water-pavilion-entry", "pavilion-landmark"], exitAnchorId: "mirror-threshold", nextChapterId: "mirror-self" },
  { chapterId: "mirror-self", entryAnchorId: "mirror-threshold", transitionAnchorIds: [], exitAnchorId: "front-gate" },
];

export const getCampaignRoute = (chapterId: string) => campaignRoutes.find((route) => route.chapterId === chapterId);

export const getChapterEntryAnchor = (chapterId: string, fallback: string) => getCampaignRoute(chapterId)?.entryAnchorId ?? fallback;

export const getChapterExitAnchor = (chapterId: string, fallback: string) => getCampaignRoute(chapterId)?.exitAnchorId ?? fallback;
