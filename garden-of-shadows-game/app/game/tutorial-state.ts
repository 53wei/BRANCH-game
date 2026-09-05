import type { CampaignSave } from "./types";

export const shouldShowTutorial = (save: CampaignSave): boolean => !save.tutorial.controls.seen;

export const markTutorialSeen = (save: CampaignSave): CampaignSave => ({
  ...save,
  tutorial: { controls: { seen: true } },
});
