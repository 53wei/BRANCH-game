export const STORY_BACKDROPS = {
  "prologue.letter": "/media/backdrops/prologue/story-prologue-letter-v1.webp",
  "prologue.gate": "/media/cg/story-v1/cg-01-rain-return-v1.png",
  "prologue.anomaly": "/media/backdrops/prologue/story-prologue-anomaly-wall-v1.webp",
  "prologue.including-you": "/media/backdrops/prologue/story-prologue-including-you-v1.webp",
  "ch1.wall-vs-path": "/media/backdrops/chapter1/story-ch1-wall-vs-path-v1.webp",
  "ch1.loop": "/media/backdrops/chapter1/story-ch1-loop-realization-v1.webp",
  "ch1.borrowed-view": "/media/backdrops/chapter1/story-ch1-borrowed-view-v1.webp",
  "ch1.hidden-yard": "/media/backdrops/chapter1/story-ch1-hidden-yard-v1.webp",
} as const;

export type StoryBackdropId = keyof typeof STORY_BACKDROPS;

export const resolveStoryBackdrop = (id: StoryBackdropId | undefined) => id ? STORY_BACKDROPS[id] : undefined;
