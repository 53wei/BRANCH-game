"use client";

import { useEffect, useMemo, useState } from "react";
import { SceneArt } from "./SceneArt";
import type { ChapterDefinition, ChapterProgress, Evidence, Hotspot, View } from "./types";

type Props = {
  chapter: ChapterDefinition;
  progress: ChapterProgress;
  hasNext: boolean;
  onProgress: (progress: ChapterProgress) => void;
  onComplete: (detail: { chapterId: string; outputFlag: string; evidence: string[]; decisionId?: string }) => void;
  onNext: () => void;
  onHub: () => void;
  onResetChapter: () => void;
};

export function ChapterRunner({ chapter, progress, hasNext, onProgress, onComplete, onNext, onHub, onResetChapter }: Props) {
  const initialSlide = Math.max(0, chapter.rooms.findIndex((room) => room.id === progress.roomId));
  const [view, setView] = useState<View>("intro");
  const [slideIndex, setSlideIndex] = useState(initialSlide);
  const [found, setFound] = useState(progress.foundEvidenceIds);
  const [response, setResponse] = useState<Hotspot | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [wrong, setWrong] = useState(false);

  const room = chapter.rooms[slideIndex];
  const canDeduce = found.length >= chapter.minimumEvidence;
  const foundEvidence = useMemo(() => chapter.evidence.filter((item) => found.includes(item.id)), [chapter.evidence, found]);

  useEffect(() => {
    onProgress({ roomId: room.id, foundEvidenceIds: found, completed: progress.completed });
  }, [found, room.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const choose = (spot: Hotspot) => {
    if (spot.requires && !found.includes(spot.requires)) return;
    setResponse(spot);
    if (spot.evidenceId && !found.includes(spot.evidenceId)) {
      setFound((current) => [...current, spot.evidenceId!]);
    }
  };

  const moveTo = (index: number) => {
    if (index < 0 || index >= chapter.rooms.length) return;
    const next = chapter.rooms[index];
    if (next.lockedUntil && !found.includes(next.lockedUntil)) return;
    setSlideIndex(index);
    setResponse(null);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setResponse(null); setSelectedEvidence(null); if (view === "deduction") setView("game"); }
      if (view !== "game" || selectedEvidence) return;
      if (event.key === "ArrowLeft") moveTo(slideIndex - 1);
      if (event.key === "ArrowRight") moveTo(slideIndex + 1);
      if (["1", "2", "3"].includes(event.key)) choose(room.hotspots[Number(event.key) - 1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [found, room.hotspots, selectedEvidence, slideIndex, view]); // eslint-disable-line react-hooks/exhaustive-deps

  const finishChapter = (decisionId: string) => {
    const completed = { roomId: room.id, foundEvidenceIds: found, completed: true, decisionId };
    onProgress(completed);
    onComplete({ chapterId: chapter.id, outputFlag: chapter.outputFlag, evidence: found, decisionId });
    setWrong(false);
    setView("ending");
  };

  const submit = (id: string) => {
    if (id !== chapter.correctDeduction) { setWrong(true); return; }
    setWrong(false);
    if (chapter.endingChoice) { setView("choice"); return; }
    finishChapter(id);
  };

  if (view === "intro") {
    return <main className={`ppt-stage ppt-intro chapter-${chapter.number}`}>
      <div className="ppt-frame intro-frame">
        <button className="ppt-back" onClick={onHub}>← 章节总览</button>
        <div className="ppt-counter">CHAPTER {chapter.number}</div>
        <div className="intro-number">{chapter.number}</div>
        <section className="intro-content">
          <p className="eyebrow">不死世界 · 无名席</p>
          <h1>{chapter.title}</h1>
          <p className="intro-copy">{chapter.intro}</p>
          <div className="chapter-goal"><span>本章目标</span>{chapter.objective}</div>
          <button className="ppt-primary" onClick={() => setView("game")}>{found.length ? "继续播放" : "开始播放"}<i>→</i></button>
        </section>
        <p className="ppt-hint">每一幕都是一张幻灯片 · 在画面右侧选择行动</p>
      </div>
    </main>;
  }

  if (view === "ending") {
    return <main className={`ppt-stage chapter-${chapter.number}`}>
      <div className="ppt-frame ending-frame">
        <div className="ppt-counter">CHAPTER {chapter.number} · END</div>
        <section className="ending-copy">
          <p className="eyebrow">推断成立 · 章节状态已保存</p>
          <h2>{chapter.endingTitle}</h2>
          <p>{chapter.endingBody}</p>
          <blockquote>{chapter.endingQuote}</blockquote>
          <small>{chapter.outputFlag}</small>
          <div className="ending-actions">
            {hasNext && <button className="ppt-primary" onClick={onNext}>立即播放下一章 <i>→</i></button>}
            <button className="ppt-secondary" onClick={() => setView("game")}>回看本章</button>
            <button className="ppt-secondary" onClick={onHub}>章节总览</button>
          </div>
        </section>
      </div>
    </main>;
  }

  if (view === "deduction") {
    return <main className={`ppt-stage chapter-${chapter.number}`}>
      <div className="ppt-frame deduction-frame">
        <button className="ppt-back" onClick={() => setView("game")}>← 返回上一幕</button>
        <div className="ppt-counter">FINAL QUESTION</div>
        <section className="deduction-copy">
          <p className="eyebrow">FAMILY LEDGER · 最终选择</p>
          <h2>{chapter.question}</h2>
          <p>{chapter.deductionHelp}</p>
          <div className="ppt-deduction-options">
            {chapter.deductionOptions.map((option, index) => <button key={option.id} onClick={() => submit(option.id)}><b>0{index + 1}</b><span>{option.label}</span><i>→</i></button>)}
          </div>
          {wrong && <p className="ppt-wrong">这项选择还不能解释所有证据，请换一个判断。</p>}
        </section>
        <div className="evidence-strip deduction-strip">{foundEvidence.map((item) => <span key={item.id}>{item.code}</span>)}</div>
      </div>
    </main>;
  }

  if (view === "choice" && chapter.endingChoice) {
    return <main className={`ppt-stage chapter-${chapter.number}`}>
      <div className="ppt-frame deduction-frame">
        <button className="ppt-back" onClick={() => setView("deduction")}>← 返回最终推断</button>
        <div className="ppt-counter">ENDING CHOICE</div>
        <section className="deduction-copy">
          <p className="eyebrow">FAMILY LEDGER · 结局选择</p>
          <h2>{chapter.endingChoice.prompt}</h2>
          <p>{chapter.endingChoice.help}</p>
          <div className="ppt-deduction-options">
            {chapter.endingChoice.options.map((option, index) => <button key={option.id} onClick={() => finishChapter(option.id)}><b>0{index + 1}</b><span>{option.label}</span><i>→</i></button>)}
          </div>
        </section>
        <div className="evidence-strip deduction-strip">最终关系重建完成 · 请选择结局方向</div>
      </div>
    </main>;
  }

  const nextRoom = chapter.rooms[slideIndex + 1];
  const nextLocked = Boolean(nextRoom?.lockedUntil && !found.includes(nextRoom.lockedUntil));
  return <main className={`ppt-stage chapter-${chapter.number}`}>
    <div className="ppt-frame game-frame">
      <header className="ppt-header">
        <button className="ppt-back" onClick={onHub}>← 章节总览</button>
        <div><p className="eyebrow">不死世界 · CHAPTER {chapter.number}</p><h1>{chapter.title}</h1></div>
        <div className="slide-progress"><span>{String(slideIndex + 1).padStart(2, "0")}</span><i/> <span>{String(chapter.rooms.length).padStart(2, "0")}</span></div>
      </header>

      <section key={room.id} className="ppt-slide">
        <div className="slide-visual">
          <SceneArt roomId={room.id}/>
          <div className="slide-shade"/>
          <div className="scene-heading"><p>SCENE {String(slideIndex + 1).padStart(2, "0")}</p><h2>{room.name}</h2><span>{room.atmosphere}</span></div>
        </div>
        <aside className="slide-choices">
          <div className="choice-heading"><span>这一幕，你要调查什么？</span><small>选择会留在线索案簿中</small></div>
          <div className="choice-list">
            {room.hotspots.map((spot, index) => {
              const blocked = Boolean(spot.requires && !found.includes(spot.requires));
              const collected = Boolean(spot.evidenceId && found.includes(spot.evidenceId));
              return <button key={spot.id} className={`${response?.id === spot.id ? "selected" : ""} ${collected ? "collected" : ""}`} disabled={blocked} onClick={() => choose(spot)}>
                <b>0{index + 1}</b><span><strong>{spot.label}</strong><small>{blocked ? "需要先取得关联线索" : collected ? "已调查 · 可重新查看" : spot.title}</small></span><i>{collected ? "✓" : "→"}</i>
              </button>;
            })}
          </div>
          <div className={`choice-result ${response ? "visible" : ""}`}>
            {response ? <><span>{response.evidenceId ? "线索已记录" : "场景观察"}</span><h3>{response.title}</h3><p>{response.text}</p></> : <><span>操作提示</span><h3>从上方选择一个选项</h3><p>也可以按数字键 1、2、3。选完以后再播放下一幕。</p></>}
          </div>
        </aside>
      </section>

      <footer className="ppt-footer">
        <div className="slide-dots">{chapter.rooms.map((item, index) => { const locked = Boolean(item.lockedUntil && !found.includes(item.lockedUntil)); return <button key={item.id} className={index === slideIndex ? "active" : ""} disabled={locked} onClick={() => moveTo(index)} aria-label={`第${index + 1}幕 ${item.name}`}>{index + 1}</button>; })}</div>
        <div className="evidence-strip"><b>线索 {found.length}/{chapter.evidence.length}</b>{foundEvidence.map((item) => <button key={item.id} onClick={() => setSelectedEvidence(item)}>{item.code}</button>)}</div>
        <div className="slide-controls">
          <button className="ppt-secondary" disabled={slideIndex === 0} onClick={() => moveTo(slideIndex - 1)}>← 上一幕</button>
          {slideIndex < chapter.rooms.length - 1
            ? <button className="ppt-primary" disabled={nextLocked} onClick={() => moveTo(slideIndex + 1)}>{nextLocked ? "先取得关键线索" : "播放下一幕"}<i>→</i></button>
            : <button className="ppt-primary" disabled={!canDeduce} onClick={() => setView("deduction")}>{canDeduce ? "进入最终推断" : `还需 ${chapter.minimumEvidence - found.length} 条线索`}<i>→</i></button>}
        </div>
      </footer>
      <button className="ppt-reset" onClick={onResetChapter}>重播本章</button>
    </div>

    {selectedEvidence && <div className="ppt-modal"><button className="ppt-modal-backdrop" aria-label="关闭证据详情" onClick={() => setSelectedEvidence(null)}/><article><button onClick={() => setSelectedEvidence(null)}>×</button><span>{selectedEvidence.code} · {selectedEvidence.kind}</span><h2>{selectedEvidence.title}</h2><p>{selectedEvidence.detail}</p></article></div>}
  </main>;
}
