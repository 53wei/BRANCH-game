"use client";
/* eslint-disable @next/next/no-img-element -- full-bleed authored CG files must retain their original framing */

import { useEffect, useState } from "react";
import { completeCampaignChapter } from "./campaign-progress";
import { createCheckpoint } from "./campaign-save";
import { DialogueRunner } from "./narrative/DialogueRunner";
import { compileInkSource } from "./narrative/ink-runtime";
import deletedPersonInkSource from "./narrative/deleted-person.ink?raw";
import { storyCGById, type StoryCGId } from "./narrative/story-cg";
import { DELETED_PERSON_UNSENT_LETTER } from "./runtime/document-content";
import { CaseFilePanel } from "./ui/CaseFilePanel";
import { DocumentViewer } from "./ui/DocumentViewer";
import type { CampaignSave, ChapterManifest, CheckpointState, DialogueSequence } from "./types";

interface NarrativeChapterRuntimeProps {
  chapter: ChapterManifest;
  save: CampaignSave;
  onSave: (save: CampaignSave) => void;
  onExit: () => void;
  onContinue?: () => void;
}

interface EvidenceCard {
  id: string;
  witness: string;
  title: string;
  summary: string;
  testimony: string;
  cg: StoryCGId;
}

const unique = <T,>(values: T[]) => [...new Set(values)];
const DELETED_PERSON_STORY_CONTENT = compileInkSource("deleted-person", deletedPersonInkSource);

export const CHAPTER_FOUR_EVIDENCE: readonly EvidenceCard[] = [
  {
    id: "wife-boxes",
    witness: "沈夫人",
    title: "被收好的生活",
    summary: "旧房里的衣物、书本和生日卡没有被丢弃，而是被分箱保存。",
    testimony: "我换掉那间房，是因为只要房间还在，我就没法说服自己你已经走了。你可以恨我。",
    cg: "child-room",
  },
  {
    id: "gardener-route",
    witness: "老周",
    title: "被封住的侧路",
    summary: "老周当夜送赵映离园，之后亲手封住西侧小路。",
    testimony: "我送她出去，再把那条路封上。后来我分不清，是墙先砌起来，还是我们先不肯记得。",
    cg: "rain-return",
  },
  {
    id: "accountant-packet",
    witness: "钱先生",
    title: "没有用上的离开",
    summary: "车票、现金、旅店地址与介绍信共同指向一套保护赵映离开的安排。",
    testimony: "动机相同，方法越来越错。那张没有用上的返程票，我一直留着。",
    cg: "family-portrait",
  },
  {
    id: "painter-original",
    witness: "柳生",
    title: "画框背后的原画",
    summary: "被覆盖的原始合影一直藏在画框背板后，第五个人从未真正消失。",
    testimony: "我把她从正面盖掉，却又把原画藏在背后。我既不敢承认，也不敢真的毁掉。",
    cg: "liusheng-fifth-figure",
  },
] as const;

export function NarrativeChapterRuntime({ chapter, save, onSave, onExit, onContinue }: NarrativeChapterRuntimeProps) {
  const [checkpoint, setCheckpoint] = useState<CheckpointState>(() => save.activeCheckpoint.chapterId === chapter.id
    ? save.activeCheckpoint
    : createCheckpoint(chapter.id, chapter.id === "fifth-tingyuxuan" ? "zhaoying" : "baseline"));
  const [showCaseFile, setShowCaseFile] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "KeyN" || event.repeat) return;
      event.preventDefault();
      setShowCaseFile((current) => !current);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const persistCheckpoint = (next: CheckpointState) => {
    setCheckpoint(next);
    onSave({ ...save, activeCheckpoint: next });
  };

  const addFlag = (flag: string) => {
    persistCheckpoint({ ...checkpoint, earnedFlags: unique([...checkpoint.earnedFlags, flag]), updatedAt: new Date().toISOString() });
  };

  const completeChapter = (sourceCheckpoint?: CheckpointState, next?: CheckpointState) => {
    const pending = next ?? sourceCheckpoint ?? checkpoint;
    const finalCheckpoint: CheckpointState = {
      ...pending,
      activeObjectiveId: undefined,
      objectiveStepId: undefined,
      updatedAt: new Date().toISOString(),
    };
    const nextSave = completeCampaignChapter(save, chapter.id, finalCheckpoint);
    setCheckpoint(nextSave.activeCheckpoint);
    onSave(nextSave);
  };

  const caseFileOverlay = showCaseFile
    ? <CaseFilePanel checkpoint={checkpoint} completedChapters={save.completedChapters} chapterTitle="第四章 · 被删掉的人" onClose={() => setShowCaseFile(false)} />
    : null;

  if (chapter.id === "deleted-person") {
    const evidenceIndex = CHAPTER_FOUR_EVIDENCE.findIndex((item) => !checkpoint.earnedFlags.includes(`deleted-person.evidence.${item.id}`));
    const letterSeen = checkpoint.earnedFlags.includes("deleted-person.unsent-letter");
    const letterReactionSeen = checkpoint.earnedFlags.includes("deleted-person.letter-reaction-complete");
    const contradictionSeen = checkpoint.earnedFlags.includes("deleted-person.new-contradiction-complete");
    const complete = checkpoint.earnedFlags.includes("deleted-person.complete");

    const renderDialogue = (sequence: DialogueSequence, cg: StoryCGId, onDialogueComplete: () => void) => (
      <main className="narrative-chapter narrative-chapter-four">
        <img className="narrative-chapter-bg" src={storyCGById(cg).path} alt="" />
        <div className="narrative-chapter-wash" aria-hidden="true" />
        <header className="narrative-chapter-header"><button type="button" className="text-button" onClick={onExit}>← 返回案卷</button><div><span>第四章</span><strong>被删掉的人</strong></div></header>
        <DialogueRunner key={sequence.id} sequence={sequence} storyContent={DELETED_PERSON_STORY_CONTENT} settings={save.settings} suspended={showCaseFile} restoredState={checkpoint.dialogueProgress?.sequenceId === sequence.id ? checkpoint.dialogueProgress.inkStateJson : undefined} seenLineIds={[]} onCommand={() => undefined} onProgress={(inkStateJson) => persistCheckpoint({ ...checkpoint, dialogueProgress: { sequenceId: sequence.id, inkStateJson }, updatedAt: new Date().toISOString() })} onSeen={() => undefined} onComplete={onDialogueComplete} />
        {caseFileOverlay}
      </main>
    );

    const completeSequence = (sequence: DialogueSequence) => {
      persistCheckpoint({
        ...checkpoint,
        dialogueProgress: undefined,
        earnedFlags: sequence.completionFlag ? unique([...checkpoint.earnedFlags, sequence.completionFlag]) : checkpoint.earnedFlags,
        updatedAt: new Date().toISOString(),
      });
    };

    if (evidenceIndex >= 0) {
      const item = CHAPTER_FOUR_EVIDENCE[evidenceIndex];
      const sequence = chapter.dialogueSequences?.find((value) => value.id === `deleted-${item.id}`);
      if (!sequence) return <main className="narrative-chapter"><section className="narrative-paper"><h1>第四章对白缺失</h1><p>{item.id}</p><button type="button" className="primary-button" onClick={onExit}>返回案卷</button></section></main>;
      return renderDialogue(sequence, item.cg, () => completeSequence(sequence));
    }

    if (!letterSeen) {
      return <main className="narrative-chapter narrative-chapter-four"><img className="narrative-chapter-bg" src={storyCGById("family-portrait").path} alt="" /><div className="narrative-chapter-wash" aria-hidden="true" /><header className="narrative-chapter-header"><button type="button" className="text-button" onClick={onExit}>← 返回案卷</button><div><span>第四章</span><strong>沈老爷未寄出的信</strong></div></header><DocumentViewer document={DELETED_PERSON_UNSENT_LETTER} closeLabel="读完并收进案卷" onClose={() => addFlag("deleted-person.unsent-letter")} />{caseFileOverlay}</main>;
    }

    if (!letterReactionSeen) {
      const sequence = chapter.dialogueSequences?.find((value) => value.id === "deleted-letter-reaction");
      if (sequence) return renderDialogue(sequence, "family-portrait", () => completeSequence(sequence));
    }

    if (!contradictionSeen) {
      const sequence = chapter.dialogueSequences?.find((value) => value.id === "deleted-new-contradiction");
      if (sequence) return renderDialogue(sequence, "rain-return", () => {
        const next: CheckpointState = {
          ...checkpoint,
          dialogueProgress: undefined,
          earnedFlags: sequence.completionFlag ? unique([...checkpoint.earnedFlags, sequence.completionFlag]) : checkpoint.earnedFlags,
          updatedAt: new Date().toISOString(),
        };
        completeChapter(undefined, next);
      });
    }

    return <main className="narrative-chapter narrative-chapter-four"><img className="narrative-chapter-bg" src={storyCGById("rain-return").path} alt="" /><div className="narrative-chapter-wash" aria-hidden="true" /><header className="narrative-chapter-header"><button type="button" className="text-button" onClick={onExit}>← 返回案卷</button><div><span>第四章</span><strong>被删掉的人</strong></div></header>{complete && <section className="narrative-paper"><p className="eyebrow">第四章结束</p><h1>我为什么又回来了？</h1><p>装箱、封路、准备离开、藏画与未寄出的信已经把“删除”重新解释为保护计划；这不消除四个人替赵映决定人生、持续撒谎和自我欺骗造成的伤害。</p><blockquote>赵映已经确认自己傍晚离开后又在事故前折返。下一步必须亲自重走案发雨夜。</blockquote><button type="button" className="primary-button" onClick={onContinue ?? onExit}>进入第五章：今晚你没回来</button></section>}{caseFileOverlay}</main>;
  }

  return <main className="narrative-chapter"><section className="narrative-paper"><h1>暂时无法进入这一章</h1><p>请返回案卷目录后重新选择章节；当前存档不会丢失。</p><button type="button" className="primary-button" onClick={onExit}>返回案卷目录</button></section></main>;
}
