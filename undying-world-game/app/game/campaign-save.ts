import type { CampaignSave, ChapterDefinition, ChapterProgress } from "./types";

export const CAMPAIGN_SAVE_KEY = "undying-world.game.save.v1";
export const OLD_CHAPTER_KEYS = ["undying-world.chapter01.save.v1", "undying-world.chapter02.save.v1"] as const;

export function freshCampaign(chapters: ChapterDefinition[]): CampaignSave {
  return {
    schemaVersion: 1,
    activeChapterId: chapters[0].id,
    flags: [],
    chapters: Object.fromEntries(chapters.map((chapter) => [chapter.id, {
      roomId: chapter.initialRoomId,
      foundEvidenceIds: [],
      completed: false,
    }])),
    updatedAt: new Date().toISOString(),
  };
}

function cleanProgress(value: unknown, chapter: ChapterDefinition): ChapterProgress {
  const source = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const validRooms = new Set(chapter.rooms.map((room) => room.id));
  const validEvidence = new Set(chapter.evidence.map((item) => item.id));
  const roomCandidate = typeof source.roomId === "string" ? source.roomId : source.room;
  const foundCandidate = Array.isArray(source.foundEvidenceIds) ? source.foundEvidenceIds : source.found;
  const validDecisions = new Set([
    ...chapter.deductionOptions.map((option) => option.id),
    ...(chapter.endingChoice?.options.map((option) => option.id) ?? []),
  ]);
  return {
    roomId: typeof roomCandidate === "string" && validRooms.has(roomCandidate) ? roomCandidate : chapter.initialRoomId,
    foundEvidenceIds: Array.isArray(foundCandidate)
      ? [...new Set(foundCandidate.filter((id): id is string => typeof id === "string" && validEvidence.has(id)))]
      : [],
    completed: source.completed === true,
    decisionId: typeof source.decisionId === "string" && validDecisions.has(source.decisionId) ? source.decisionId : undefined,
  };
}

export function loadCampaign(chapters: ChapterDefinition[]): CampaignSave {
  const blank = freshCampaign(chapters);
  try {
    const raw = localStorage.getItem(CAMPAIGN_SAVE_KEY);
    if (raw) {
      const source = JSON.parse(raw) as Partial<CampaignSave>;
      const flags = Array.isArray(source.flags) ? source.flags.filter((item): item is string => typeof item === "string") : [];
      const progress = Object.fromEntries(chapters.map((chapter) => [chapter.id, cleanProgress(source.chapters?.[chapter.id], chapter)]));
      for (const chapter of chapters) if (progress[chapter.id].completed && !flags.includes(chapter.outputFlag)) flags.push(chapter.outputFlag);
      const requested = chapters.find((chapter) => chapter.id === source.activeChapterId);
      const allowed = requested && (!requested.inputFlag || flags.includes(requested.inputFlag));
      return { ...blank, activeChapterId: allowed ? requested.id : chapters[0].id, flags: [...new Set(flags)], chapters: progress };
    }

    const migrated = { ...blank, chapters: { ...blank.chapters } };
    chapters.forEach((chapter, index) => {
      const legacyKey = OLD_CHAPTER_KEYS[index];
      if (!legacyKey) return;
      const legacyRaw = localStorage.getItem(legacyKey);
      if (!legacyRaw) return;
      migrated.chapters[chapter.id] = cleanProgress(JSON.parse(legacyRaw), chapter);
      if (migrated.chapters[chapter.id].completed) migrated.flags.push(chapter.outputFlag);
    });
    const unlocked = chapters.filter((chapter) => !chapter.inputFlag || migrated.flags.includes(chapter.inputFlag));
    migrated.activeChapterId = unlocked.at(-1)?.id ?? chapters[0].id;
    migrated.flags = [...new Set(migrated.flags)];
    if (OLD_CHAPTER_KEYS.some((key) => localStorage.getItem(key))) saveCampaign(migrated);
    return migrated;
  } catch {
    localStorage.removeItem(CAMPAIGN_SAVE_KEY);
    return blank;
  }
}

export function saveCampaign(save: CampaignSave) {
  localStorage.setItem(CAMPAIGN_SAVE_KEY, JSON.stringify({ ...save, updatedAt: new Date().toISOString() }));
}

export function clearCampaign() {
  localStorage.removeItem(CAMPAIGN_SAVE_KEY);
  OLD_CHAPTER_KEYS.forEach((key) => localStorage.removeItem(key));
}
