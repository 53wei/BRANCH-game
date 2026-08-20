"use client";

import { useEffect, useState } from "react";
import { CAMPAIGN_SAVE_KEY, clearCampaign, freshCampaign, loadCampaign, saveCampaign } from "./game/campaign-save";
import { ChapterRunner } from "./game/ChapterRunner";
import { CHAPTER_01 } from "./game/chapters/chapter01";
import { CHAPTER_02 } from "./game/chapters/chapter02";
import { CHAPTER_03 } from "./game/chapters/chapter03";
import { CHAPTER_04 } from "./game/chapters/chapter04";
import { CHAPTER_05 } from "./game/chapters/chapter05";
import type { CampaignSave, ChapterProgress } from "./game/types";

const CHAPTERS = [CHAPTER_01, CHAPTER_02, CHAPTER_03, CHAPTER_04, CHAPTER_05];

export default function Home() {
  const [campaign, setCampaign] = useState<CampaignSave>(() => freshCampaign(CHAPTERS));
  const [showHub, setShowHub] = useState(true);
  const [resetVersion, setResetVersion] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCampaign(loadCampaign(CHAPTERS));
      setShowHub(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const commit = (next: CampaignSave) => { setCampaign(next); saveCampaign(next); };
  const openChapter = (chapterId: string) => {
    const chapter = CHAPTERS.find((item) => item.id === chapterId);
    if (!chapter || (chapter.inputFlag && !campaign.flags.includes(chapter.inputFlag))) return;
    commit({ ...campaign, activeChapterId: chapterId });
    setShowHub(false);
  };
  const updateProgress = (progress: ChapterProgress) => {
    const previous = campaign.chapters[campaign.activeChapterId];
    const stable = { ...progress, completed: previous.completed || progress.completed };
    commit({ ...campaign, chapters: { ...campaign.chapters, [campaign.activeChapterId]: stable } });
  };
  const completeChapter = (detail: { chapterId: string; outputFlag: string; evidence: string[]; decisionId?: string }) => {
    setCampaign((current) => {
      const flags = [...new Set([...current.flags, detail.outputFlag])];
      const completedIndex = CHAPTERS.findIndex((item) => item.id === detail.chapterId);
      const followingChapter = CHAPTERS[completedIndex + 1];
      const canAdvance = followingChapter && (!followingChapter.inputFlag || flags.includes(followingChapter.inputFlag));
      const next = {
        ...current,
        flags,
        activeChapterId: canAdvance ? followingChapter.id : current.activeChapterId,
        chapters: { ...current.chapters, [detail.chapterId]: { ...current.chapters[detail.chapterId], foundEvidenceIds: detail.evidence, completed: true, decisionId: detail.decisionId } },
      };
      saveCampaign(next);
      return next;
    });
    window.dispatchEvent(new CustomEvent("undying-world:chapter-complete", { detail: { chapterId: detail.chapterId, outputFlag: detail.outputFlag, evidence: detail.evidence } }));
  };
  const goNext = () => {
    setCampaign((current) => {
      const currentChapter = CHAPTERS.find((item) => item.id === current.activeChapterId);
      const nextChapter = CHAPTERS[CHAPTERS.findIndex((item) => item.id === current.activeChapterId) + 1];
      const earnedFlag = currentChapter && current.chapters[currentChapter.id].completed ? [currentChapter.outputFlag] : [];
      const effectiveFlags = [...new Set([...current.flags, ...earnedFlag])];
      if (!nextChapter || (nextChapter.inputFlag && !effectiveFlags.includes(nextChapter.inputFlag))) return current;
      const next = { ...current, flags: effectiveFlags, activeChapterId: nextChapter.id };
      saveCampaign(next);
      return next;
    });
    setShowHub(false);
  };
  const resetChapter = () => {
    const chapter = CHAPTERS.find((item) => item.id === campaign.activeChapterId)!;
    commit({ ...campaign, chapters: { ...campaign.chapters, [chapter.id]: { roomId: chapter.initialRoomId, foundEvidenceIds: [], completed: campaign.chapters[chapter.id].completed } } });
    setResetVersion((value) => value + 1);
  };
  const resetAll = () => { clearCampaign(); setCampaign(freshCampaign(CHAPTERS)); setShowHub(true); };

  const active = CHAPTERS.find((item) => item.id === campaign.activeChapterId) ?? CHAPTER_01;
  if (!showHub) return <ChapterRunner key={`${active.id}:${resetVersion}`} chapter={active} progress={campaign.chapters[active.id]} hasNext={CHAPTERS.indexOf(active) < CHAPTERS.length - 1} onProgress={updateProgress} onComplete={completeChapter} onNext={goNext} onHub={() => setShowHub(true)} onResetChapter={resetChapter}/>;

  return <main className="hub"><div className="seal">無</div><section><p className="eyebrow">不死世界 · 无名席</p><h1>章节总览</h1><div className="line"/>{CHAPTERS.map((chapter) => { const locked = Boolean(chapter.inputFlag && !campaign.flags.includes(chapter.inputFlag)); const progress = campaign.chapters[chapter.id]; return <button key={chapter.id} className={locked ? "locked" : ""} disabled={locked} onClick={() => openChapter(chapter.id)}><b>{chapter.number}</b><span><strong>{chapter.title}</strong><small>{locked ? "完成上一章后自动解锁" : progress.completed ? "已完成 · 可重新进入" : progress.foundEvidenceIds.length ? `调查中 · ${progress.foundEvidenceIds.length}/${chapter.evidence.length}` : chapter.objective}</small></span><em>{locked ? "未解锁" : progress.completed ? "回看 →" : "进入 →"}</em></button>; })}<p className="save-note">总存档：{CAMPAIGN_SAVE_KEY}</p><button className="reset-all" onClick={resetAll}>重置整个游戏</button></section></main>;
}
