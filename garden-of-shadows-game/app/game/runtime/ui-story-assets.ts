import { STORY_BACKDROPS } from "../narrative/story-backdrops";

export const UI_STORY_ASSETS = {
  tutorialControls: "/media/ui/guide/ui-guide-controls-v1.webp",
  helpPanel: "/media/ui/help/ui-help-panel-bg-v1.webp",
  pausePanel: "/media/ui/pause/ui-pause-panel-bg-v1.webp",
  miniMapA: "/media/maps/minimap/map-minimap-a-zone-v1.webp",
  fullMap: "/media/maps/fullmap/map-minimap-full-v1.webp",
  ...STORY_BACKDROPS,
} as const;

export type UiStoryAssetId = keyof typeof UI_STORY_ASSETS;

export const UI_STORY_ASSET_MANIFEST = Object.entries(UI_STORY_ASSETS).map(([id, path]) => ({
  id: id as UiStoryAssetId,
  path,
  format: "webp" as const,
  fallback: "live-3d-or-css" as const,
}));
