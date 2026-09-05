"use client";
/* eslint-disable @next/next/no-img-element -- exact transparent portrait sprites must bypass image transforms */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Story } from "inkjs";
import type { CampaignSave, DialogueCommand, DialogueSequence } from "../types";
import westInkSource from "./west-onboarding.ink?raw";
import { parseDialogueTags, type ParsedDialogueTags } from "./dialogue";
import { SemanticMorphText, morphLogText } from "./SemanticMorphText";
import { narrativeDisplayLabel, narrativeLogLabel } from "./content-schema";
import { compileInkSource } from "./ink-runtime";
import { speakerProfiles } from "./speakers";
import { choicePositionForNumberKey, steppedChoicePosition } from "./choice-navigation";

interface DialogueLine extends ParsedDialogueTags {
  text: string;
}

export type InkStoryContent = string;

interface DialogueRunnerProps {
  sequence: DialogueSequence;
  storyContent?: InkStoryContent;
  settings: CampaignSave["settings"];
  suspended?: boolean;
  restoredState?: string;
  seenLineIds: string[];
  onCommand: (command: DialogueCommand) => void;
  onProgress: (inkStateJson: string) => void;
  onSeen: (lineId: string) => void;
  onComplete: () => void;
}

const speedMs = { slow: 46, normal: 28, fast: 14, instant: 0 } as const;
const createStory = (content: InkStoryContent) => new Story(content);
const defaultStoryContent = (): string => compileInkSource("west-onboarding", westInkSource);

export function DialogueRunner({ sequence, storyContent, settings, suspended = false, restoredState, seenLineIds, onCommand, onProgress, onSeen, onComplete }: DialogueRunnerProps) {
  const storyRef = useRef<Story | undefined>(undefined);
  const callbackRef = useRef({ onCommand, onProgress, onSeen, onComplete });
  const [line, setLine] = useState<DialogueLine>();
  const [visibleLength, setVisibleLength] = useState(0);
  const [choices, setChoices] = useState<Array<{ index: number; text: string }>>([]);
  const [history, setHistory] = useState<DialogueLine[]>([]);
  const [showLog, setShowLog] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [morphSettled, setMorphSettled] = useState(true);
  const [focusedChoice, setFocusedChoice] = useState(0);
  const choiceButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => { callbackRef.current = { onCommand, onProgress, onSeen, onComplete }; }, [onCommand, onComplete, onProgress, onSeen]);

  const pullNext = useCallback((story: Story) => {
    while (story.canContinue) {
      const stateBeforeLine = story.state.ToJson();
      const text = (story.Continue() ?? "").trim();
      const tags = parseDialogueTags(story.currentTags ?? [], `${sequence.id}.${history.length + 1}`);
      tags.commands.forEach((command) => callbackRef.current.onCommand(command));
      callbackRef.current.onProgress(stateBeforeLine);
      if (!text) continue;
      const nextLine = { ...tags, text };
      setLine(nextLine);
      setHistory((current) => [...current, nextLine]);
      setChoices(story.currentChoices.map((choice) => ({ index: choice.index, text: choice.text.trim() })));
      setFocusedChoice(0);
      setVisibleLength(speedMs[settings.dialogueSpeed] === 0 ? text.length : 0);
      setMorphSettled(!tags.semanticMorph || (tags.semanticMorph.once && seenLineIds.includes(tags.lineId)));
      return;
    }
    const nextChoices = story.currentChoices.map((choice) => ({ index: choice.index, text: choice.text.trim() }));
    setChoices(nextChoices);
    setFocusedChoice(0);
    if (nextChoices.length === 0) callbackRef.current.onComplete();
  }, [history.length, seenLineIds, sequence.id, settings.dialogueSpeed]);

  useEffect(() => {
    const story = createStory(storyContent ?? defaultStoryContent());
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
    if (line.semanticMorph && !morphSettled) {
      setMorphSettled(true);
      return;
    }
    if (choices.length > 0) return;
    callbackRef.current.onSeen(line.lineId);
    const story = storyRef.current;
    if (story) pullNext(story);
  }, [choices.length, line, morphSettled, pullNext, visibleLength]);

  useEffect(() => {
    if (suspended || !autoplay || !line || visibleLength < line.text.length || choices.length > 0 || !morphSettled) return;
    const timer = window.setTimeout(advance, Math.max(1100, line.text.length * 75));
    return () => window.clearTimeout(timer);
  }, [advance, autoplay, choices.length, line, morphSettled, suspended, visibleLength]);

  const choiceVisible = choices.length > 0 && visibleLength >= (line?.text.length ?? 0) && morphSettled;

  const choose = useCallback((index: number) => {
    const story = storyRef.current;
    if (!story) return;
    if (line) callbackRef.current.onSeen(line.lineId);
    story.ChooseChoiceIndex(index);
    // Persist immediately after the choice, before the branch advances. This keeps
    // a save made on a terminal choice from replaying the decision on resume.
    callbackRef.current.onProgress(story.state.ToJson());
    setChoices([]);
    setFocusedChoice(0);
    pullNext(story);
  }, [line, pullNext]);

  const focusChoice = useCallback((position: number) => {
    setFocusedChoice(position);
    choiceButtonRefs.current[position]?.focus();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (suspended) return;
      if (choiceVisible) {
        const numberPosition = choicePositionForNumberKey(event.code, choices.length);
        if (numberPosition !== undefined) {
          event.preventDefault();
          choose(choices[numberPosition].index);
          return;
        }
        if (event.code === "ArrowDown" || event.code === "ArrowRight") {
          event.preventDefault();
          focusChoice(steppedChoicePosition(focusedChoice, choices.length, 1));
          return;
        }
        if (event.code === "ArrowUp" || event.code === "ArrowLeft") {
          event.preventDefault();
          focusChoice(steppedChoicePosition(focusedChoice, choices.length, -1));
          return;
        }
        if (event.code === "Home" || event.code === "End") {
          event.preventDefault();
          focusChoice(event.code === "Home" ? 0 : choices.length - 1);
          return;
        }
        if (event.code === "Space" || event.code === "Enter") {
          event.preventDefault();
          choose(choices[focusedChoice].index);
        }
        return;
      }
      if (event.code === "Space" || event.code === "Enter") {
        event.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance, choiceVisible, choices, choose, focusChoice, focusedChoice, suspended]);

  const activeSpeaker = line?.kind === "spoken" ? speakerProfiles[line.speakerId] : undefined;
  const activeExpression = line?.portrait ?? activeSpeaker?.defaultPortrait;
  const activePortrait = activeSpeaker && activeExpression ? activeSpeaker.portraits[activeExpression] : undefined;
  const activePortraitSide = activeSpeaker?.side === "left" ? "left" : "right";
  const isRead = line ? seenLineIds.includes(line.lineId) : false;
  const morphDisabled = Boolean(line?.semanticMorph?.once && isRead) || morphSettled;
  const rootClass = useMemo(() => `dialogue dialogue-${sequence.presentation}`, [sequence.presentation]);
  const lineKind = line?.kind ?? "narration";
  const displayName = narrativeDisplayLabel(lineKind, activeSpeaker?.name) ?? "";
  const toolbarLabel = lineKind === "spoken" ? (sequence.presentation === "stage" ? "剧情对话" : "证词回声") : undefined;

  return (
    <section className={`${rootClass} dialogue-kind-${lineKind}`} data-line-kind={lineKind} role="dialog" aria-modal={sequence.presentation === "stage"} aria-label="剧情对话">
      {sequence.presentation === "stage" && sequence.backdrop && <div className="dialogue-scene" style={{ backgroundImage: `url(${sequence.backdrop})` }} aria-hidden="true" />}
      {sequence.presentation === "stage" && <div className="dialogue-curtain" aria-hidden="true" />}
      {activeSpeaker && activePortrait && <div className={`portrait portrait-${activePortraitSide} active`}><img src={activePortrait} alt={activeSpeaker.name} /></div>}
      <div className={`dialogue-box${choiceVisible ? " dialogue-box-has-choices" : ""}`} style={{ "--speaker-color": activeSpeaker?.themeColor ?? "#b9a87b" } as React.CSSProperties}>
        <div className="dialogue-toolbar">
          {toolbarLabel && <span>{toolbarLabel}</span>}
          <button type="button" onClick={(event) => { event.stopPropagation(); setAutoplay((value) => !value); }}>{autoplay ? "停止自动" : "自动"}</button>
          <button type="button" onClick={(event) => { event.stopPropagation(); setShowLog((value) => !value); }}>记录</button>
          {isRead && <button type="button" onClick={(event) => { event.stopPropagation(); setVisibleLength(line?.text.length ?? 0); setMorphSettled(true); }}>跳过已读</button>}
        </div>
        <button type="button" className="dialogue-advance" onClick={advance} aria-label="推进对话">
          {displayName && <strong className="dialogue-name">{displayName}</strong>}
          <p>{lineKind === "inner" && "（"}{line && <SemanticMorphText text={line.text} visibleLength={visibleLength} spec={line.semanticMorph} lineKey={line.lineId} disabled={morphDisabled} onSettled={() => setMorphSettled(true)} />}{lineKind === "inner" && "）"}<i className={visibleLength >= (line?.text.length ?? 0) && morphSettled ? "ready" : ""} /></p>
        </button>
        {choiceVisible && <div className="dialogue-choice-panel" aria-label="选择赵映的回应方式">
          <p className="dialogue-choice-prompt"><span>选择回应方式</span><small>方向键移动 · 回车确认 · 数字键直选</small></p>
          <div className="dialogue-choices">{choices.map((choice, position) => <button
            key={choice.index}
            ref={(node) => { choiceButtonRefs.current[position] = node; }}
            type="button"
            className={position === focusedChoice ? "selected" : ""}
            aria-label={`${position + 1}。${choice.text}`}
            onFocus={() => setFocusedChoice(position)}
            onMouseEnter={() => setFocusedChoice(position)}
            onClick={(event) => { event.stopPropagation(); choose(choice.index); }}
          ><b>{String(position + 1).padStart(2, "0")}</b><span>{choice.text}</span><i aria-hidden="true">选择</i></button>)}</div>
        </div>}
      </div>
      {showLog && <aside className="dialogue-log"><button type="button" onClick={() => setShowLog(false)}>关闭记录</button>{history.map((item, index) => {
        const logText = morphLogText(item.text, item.semanticMorph);
        const historySpeaker = item.kind === "spoken" ? speakerProfiles[item.speakerId]?.name : undefined;
        return logText ? <p key={`${item.lineId}-${index}`} data-line-kind={item.kind}><b>{narrativeLogLabel(item.kind, historySpeaker)}</b>{logText}</p> : null;
      })}</aside>}
    </section>
  );
}
