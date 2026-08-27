"use client";
/* eslint-disable @next/next/no-img-element -- exact transparent portrait sprites must bypass image transforms */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Story } from "inkjs";
import type { CampaignSave, DialogueCommand, DialogueSequence, SpeakerId } from "../types";
import compiledStory from "./west-onboarding.json";
import { parseDialogueTags, type ParsedDialogueTags } from "./dialogue";
import { speakerProfiles } from "./speakers";

interface DialogueLine extends ParsedDialogueTags {
  text: string;
}

export type InkStoryContent = string | Record<string, unknown>;

interface DialogueRunnerProps {
  sequence: DialogueSequence;
  storyContent?: InkStoryContent;
  settings: CampaignSave["settings"];
  restoredState?: string;
  seenLineIds: string[];
  onCommand: (command: DialogueCommand) => void;
  onProgress: (inkStateJson: string) => void;
  onSeen: (lineId: string) => void;
  onComplete: () => void;
}

const speedMs = { slow: 46, normal: 28, fast: 14, instant: 0 } as const;

const createStory = (content: InkStoryContent) => typeof content === "string" ? new Story(content) : new Story(content);

export function DialogueRunner({ sequence, storyContent = compiledStory, settings, restoredState, seenLineIds, onCommand, onProgress, onSeen, onComplete }: DialogueRunnerProps) {
  const storyRef = useRef<Story | undefined>(undefined);
  const callbackRef = useRef({ onCommand, onProgress, onSeen, onComplete });
  const [rightSpeakerId, setRightSpeakerId] = useState<SpeakerId>(sequence.defaultRightSpeaker ?? "steward");
  const [line, setLine] = useState<DialogueLine>();
  const [visibleLength, setVisibleLength] = useState(0);
  const [choices, setChoices] = useState<Array<{ index: number; text: string }>>([]);
  const [history, setHistory] = useState<DialogueLine[]>([]);
  const [showLog, setShowLog] = useState(false);
  const [autoplay, setAutoplay] = useState(false);

  useEffect(() => { callbackRef.current = { onCommand, onProgress, onSeen, onComplete }; }, [onCommand, onComplete, onProgress, onSeen]);

  const pullNext = useCallback((story: Story) => {
    while (story.canContinue) {
      const stateBeforeLine = story.state.ToJson();
      const text = (story.Continue() ?? "").trim();
      const tags = parseDialogueTags(story.currentTags ?? [], `${sequence.id}.${history.length + 1}`);
      tags.commands.forEach((command) => callbackRef.current.onCommand(command));
      callbackRef.current.onProgress(stateBeforeLine);
      if (!text) continue;
      if (tags.speakerId !== "narrator" && tags.speakerId !== "zhaoying") setRightSpeakerId(tags.speakerId);
      const nextLine = { ...tags, text };
      setLine(nextLine);
      setHistory((current) => [...current, nextLine]);
      setChoices(story.currentChoices.map((choice) => ({ index: choice.index, text: choice.text.trim() })));
      setVisibleLength(speedMs[settings.dialogueSpeed] === 0 ? text.length : 0);
      return;
    }
    const nextChoices = story.currentChoices.map((choice) => ({ index: choice.index, text: choice.text.trim() }));
    setChoices(nextChoices);
    if (nextChoices.length === 0) callbackRef.current.onComplete();
  }, [history.length, sequence.id, settings.dialogueSpeed]);

  useEffect(() => {
    const story = createStory(storyContent);
    if (restoredState) story.state.LoadJson(restoredState);
    else story.ChoosePathString(sequence.knotId);
    storyRef.current = story;
    const timer = window.setTimeout(() => pullNext(story), 0);
    return () => { window.clearTimeout(timer); storyRef.current = undefined; };
    // A dialogue sequence is intentionally instantiated once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sequence.id, storyContent]);

  useEffect(() => {
    if (!line || visibleLength >= line.text.length || speedMs[settings.dialogueSpeed] === 0) return;
    const timer = window.setTimeout(() => setVisibleLength((value) => Math.min(value + 1, line.text.length)), speedMs[settings.dialogueSpeed]);
    return () => window.clearTimeout(timer);
  }, [line, settings.dialogueSpeed, visibleLength]);

  const advance = useCallback(() => {
    if (!line) return;
    if (visibleLength < line.text.length) {
      setVisibleLength(line.text.length);
      return;
    }
    if (choices.length > 0) return;
    callbackRef.current.onSeen(line.lineId);
    const story = storyRef.current;
    if (story) pullNext(story);
  }, [choices.length, line, pullNext, visibleLength]);

  useEffect(() => {
    if (!autoplay || !line || visibleLength < line.text.length || choices.length > 0) return;
    const timer = window.setTimeout(advance, Math.max(1100, line.text.length * 75));
    return () => window.clearTimeout(timer);
  }, [advance, autoplay, choices.length, line, visibleLength]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.code === "Enter") {
        event.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance]);

  const choose = (index: number) => {
    const story = storyRef.current;
    if (!story) return;
    if (line) callbackRef.current.onSeen(line.lineId);
    story.ChooseChoiceIndex(index);
    setChoices([]);
    pullNext(story);
  };

  const left = speakerProfiles.zhaoying;
  const right = speakerProfiles[rightSpeakerId] ?? speakerProfiles.steward;
  const activeSpeaker = line ? speakerProfiles[line.speakerId] : undefined;
  const leftExpression = line?.speakerId === "zhaoying" ? line.portrait : left.defaultPortrait;
  const rightExpression = line?.speakerId === right.id ? line.portrait : right.defaultPortrait;
  const leftImage = left.portraits[leftExpression ?? left.defaultPortrait];
  const rightImage = right.portraits[rightExpression ?? right.defaultPortrait];
  const shownText = line?.text.slice(0, visibleLength) ?? "";
  const isRead = line ? seenLineIds.includes(line.lineId) : false;

  const rootClass = useMemo(() => `dialogue dialogue-${sequence.presentation}`, [sequence.presentation]);

  return (
    <section className={rootClass} role="dialog" aria-modal={sequence.presentation === "stage"} aria-label="剧情对话">
      {sequence.presentation === "stage" && <div className="dialogue-curtain" aria-hidden="true" />}
      {sequence.presentation === "stage" && (
        <div className={`portrait portrait-left ${line?.speakerId === "zhaoying" ? "active" : "inactive"}`}>
          <img src={leftImage} alt="我" />
        </div>
      )}
      {rightImage && (
        <div className={`portrait portrait-right ${line?.speakerId === right.id ? "active" : "inactive"}`}>
          <img src={rightImage} alt={right.name} />
        </div>
      )}
      <div className="dialogue-box" style={{ "--speaker-color": activeSpeaker?.themeColor ?? "#b9a87b" } as React.CSSProperties}>
        <div className="dialogue-toolbar">
          <span>{sequence.presentation === "stage" ? "剧情对话" : "证词回声"}</span>
          <button type="button" onClick={(event) => { event.stopPropagation(); setAutoplay((value) => !value); }}>{autoplay ? "停止自动" : "自动"}</button>
          <button type="button" onClick={(event) => { event.stopPropagation(); setShowLog((value) => !value); }}>记录</button>
          {isRead && <button type="button" onClick={(event) => { event.stopPropagation(); setVisibleLength(line?.text.length ?? 0); advance(); }}>跳过已读</button>}
        </div>
        <button type="button" className="dialogue-advance" onClick={advance} aria-label="推进对话">
          <strong className="dialogue-name">{activeSpeaker?.name ?? "听雨轩"}</strong>
          <p>{shownText}<i className={visibleLength >= (line?.text.length ?? 0) ? "ready" : ""} /></p>
        </button>
        {choices.length > 0 && visibleLength >= (line?.text.length ?? 0) && (
          <div className="dialogue-choices">
            {choices.map((choice) => <button key={choice.index} type="button" onClick={(event) => { event.stopPropagation(); choose(choice.index); }}>{choice.text}</button>)}
          </div>
        )}
      </div>
      {showLog && (
        <aside className="dialogue-log">
          <button type="button" onClick={() => setShowLog(false)}>关闭记录</button>
          {history.map((item, index) => <p key={`${item.lineId}-${index}`}><b>{speakerProfiles[item.speakerId]?.name ?? "听雨轩"}</b>{item.text}</p>)}
        </aside>
      )}
    </section>
  );
}
