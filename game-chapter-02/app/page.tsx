"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CHAPTER_02,
  deductionOptions,
  evidence,
  getEvidence,
  rooms,
  type Hotspot,
} from "./game/chapter02";

type View = "intro" | "game" | "deduction" | "ending";
type SaveData = { room: string; found: string[]; completed: boolean };

const SAVE_KEY = "undying-world.chapter02.save.v1";

function SceneArt({ roomId }: { roomId: string }) {
  if (roomId === "courtyard") {
    return (
      <div className="scene-art courtyard-art" aria-hidden="true">
        <div className="moon" /><div className="roof roof-a" /><div className="roof roof-b" />
        <div className="courtyard-wall"><i /><i /><i /></div>
        <div className="rain-chain" /><div className="aunt-silhouette"><i /></div>
        <div className="brazier"><i /><i /><i /></div><div className="wet-ground" />
      </div>
    );
  }
  if (roomId === "account") {
    return (
      <div className="scene-art account-art" aria-hidden="true">
        <div className="paper-window" /><div className="account-cabinet"><i /><i /><i /></div>
        <div className="account-desk"><div className="ledger"><i /><i /><i /></div><div className="abacus">•••••••</div></div>
        <div className="hanging-lamp" /><div className="dust dust-a" /><div className="dust dust-b" />
      </div>
    );
  }
  return (
    <div className="scene-art archive-art" aria-hidden="true">
      <div className="scene-light" /><div className="archive-window"><i /><i /></div>
      <div className="shelf shelf-left"><i /><i /><i /></div>
      <div className="shelf shelf-right"><i /><i /><i /></div>
      <div className="archive-desk"><div className="paper-stack"><i /></div></div>
      <div className="hanging-dust" />
    </div>
  );
}

export default function Home() {
  const [view, setView] = useState<View>("intro");
  const [roomId, setRoomId] = useState("archive");
  const [found, setFound] = useState<string[]>([]);
  const [focusedHotspot, setFocusedHotspot] = useState<Hotspot | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [wrongDeduction, setWrongDeduction] = useState(false);
  const [restored, setRestored] = useState(false);

  const room = rooms.find((item) => item.id === roomId) ?? rooms[0];
  const availableEvidence = evidence.filter((item) => found.includes(item.id));
  const canDeduce = found.length >= CHAPTER_02.minimumEvidence;

  useEffect(() => {
    const restoreTimer = window.setTimeout(() => {
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (raw) {
          const save = JSON.parse(raw) as SaveData;
          setRoomId(rooms.some((item) => item.id === save.room) ? save.room : "archive");
          setFound(Array.isArray(save.found) ? save.found : []);
          if (save.completed) setView("ending");
          else setRestored(save.found?.length > 0);
        }
      } catch {
        localStorage.removeItem(SAVE_KEY);
      }
    }, 0);
    return () => window.clearTimeout(restoreTimer);
  }, []);

  useEffect(() => {
    if (view === "intro" && !found.length) return;
    localStorage.setItem(SAVE_KEY, JSON.stringify({ room: roomId, found, completed: view === "ending" }));
  }, [found, roomId, view]);

  const closeOverlay = useCallback(() => {
    setFocusedHotspot(null);
    setSelectedEvidence(null);
    setEvidenceOpen(false);
    if (view === "deduction") setView("game");
  }, [view]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeOverlay();
      if (view !== "game" || focusedHotspot || evidenceOpen) return;
      if (["1", "2", "3"].includes(event.key)) {
        const nextRoom = rooms[Number(event.key) - 1];
        if (!nextRoom.lockedUntil || found.includes(nextRoom.lockedUntil)) setRoomId(nextRoom.id);
      }
      if (event.key.toLowerCase() === "e") setEvidenceOpen(true);
      if (event.key.toLowerCase() === "d" && canDeduce) setView("deduction");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canDeduce, closeOverlay, evidenceOpen, focusedHotspot, found, view]);

  const investigate = (hotspot: Hotspot) => {
    if (hotspot.requires && !found.includes(hotspot.requires)) return;
    setFocusedHotspot(hotspot);
    if (hotspot.evidenceId && !found.includes(hotspot.evidenceId)) {
      setFound((current) => [...current, hotspot.evidenceId as string]);
    }
  };

  const submitDeduction = (id: string) => {
    if (id !== CHAPTER_02.correctDeduction) {
      setWrongDeduction(true);
      return;
    }
    setWrongDeduction(false);
    setView("ending");
    localStorage.setItem(SAVE_KEY, JSON.stringify({ room: roomId, found, completed: true }));
    window.dispatchEvent(new CustomEvent("undying-world:chapter-complete", {
      detail: { chapterId: CHAPTER_02.id, outputFlag: CHAPTER_02.outputFlag, evidence: found },
    }));
  };

  const resetChapter = () => {
    localStorage.removeItem(SAVE_KEY);
    setRoomId("archive"); setFound([]); setFocusedHotspot(null); setSelectedEvidence(null);
    setEvidenceOpen(false); setWrongDeduction(false); setRestored(false); setView("intro");
  };

  const roomProgress = useMemo(() => room.hotspots.filter((item) => item.evidenceId && found.includes(item.evidenceId)).length, [found, room]);
  const roomEvidenceCount = room.hotspots.filter((item) => item.evidenceId).length;

  if (view === "intro") {
    return (
      <main className="title-screen">
        <div className="title-grain" />
        <div className="chapter-number">02</div>
        <section className="title-card">
          <p className="eyebrow">不死世界 · 无名席</p>
          <h1>谁删了名字</h1>
          <div className="title-rule" />
          <p className="intro-copy">第七席的女人确实属于这个家。<br />可有人不只从族谱里划掉她，还在今夜继续烧掉剩下的证据。</p>
          <p className="chapter-goal"><span>本章目标</span>{CHAPTER_02.objective}</p>
          <button className="primary-button" onClick={() => setView("game")}>{restored ? "继续调查" : "进入档案间"}<i>→</i></button>
          {restored && <button className="text-button" onClick={resetChapter}>从本章开头重新开始</button>}
        </section>
        <p className="title-footnote">半开放固定场景 · 叙事调查 · 本地自动存档</p>
      </main>
    );
  }

  if (view === "ending") {
    return (
      <main className="ending-screen">
        <div className="ending-backdrop"><div className="elder-shadow" /><div className="uncle-shadow" /></div>
        <section className="ending-card">
          <p className="eyebrow">推断成立 · 家族冲突已触发</p>
          <h2>“我只是按她的意思，把纸烧干净。”</h2>
          <p className="speaker">二叔终于看向祖母。屋里没有人否认。</p>
          <p>祖母的止付印证明命令来自长房；二叔的经手签与今夜纸灰证明，删除延续至今。可当你问是谁先从族谱上划下第一刀时，母亲打翻了茶盏。</p>
          <blockquote>“别问纸。去问她第一次死的时候，谁还在屋里。”</blockquote>
          <div className="ending-result">
            <span>章节状态</span><strong>第一次明确家族冲突 · 已建立</strong>
          </div>
          <div className="ending-actions">
            <button className="primary-button" onClick={() => setView("game")}>返回自由调查</button>
            <button className="text-button" onClick={resetChapter}>重置第二章</button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="game-shell">
      <header className="game-header">
        <div><p className="eyebrow">不死世界 · CHAPTER 02</p><h1>谁删了名字</h1></div>
        <div className="objective-block"><span>当前调查</span><p>{CHAPTER_02.objective}</p></div>
      </header>

      <section className="game-grid" aria-label="第二章调查界面">
        <nav className="room-nav" aria-label="可调查地点">
          <p className="panel-label">老宅平面</p>
          {rooms.map((item, index) => {
            const locked = Boolean(item.lockedUntil && !found.includes(item.lockedUntil));
            const completed = item.hotspots.filter((spot) => spot.evidenceId).every((spot) => spot.evidenceId && found.includes(spot.evidenceId));
            return <button key={item.id} className={`room-button ${roomId === item.id ? "active" : ""} ${locked ? "locked" : ""}`} disabled={locked} onClick={() => setRoomId(item.id)}>
              <span className="room-index">0{index + 1}</span><span><strong>{item.name}</strong><small>{locked ? "需找到红印纸灰" : completed ? "关键证据已取" : item.short}</small></span>
            </button>;
          })}
          <div className="map-note"><span>半开放调查</span><p>前两个地点可自由切换；线索会改变旧账房状态。</p></div>
        </nav>

        <section className={`scene-card scene-${room.id}`} aria-label={`${room.name}场景`}>
          <SceneArt roomId={room.id} />
          <div className="scene-vignette" />
          {room.hotspots.map((hotspot, index) => {
            const blocked = Boolean(hotspot.requires && !found.includes(hotspot.requires));
            const collected = Boolean(hotspot.evidenceId && found.includes(hotspot.evidenceId));
            return <button key={hotspot.id} className={`hotspot ${collected ? "collected" : ""} ${blocked ? "blocked" : ""}`} style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }} onClick={() => investigate(hotspot)} disabled={blocked} aria-label={`调查${hotspot.label}`}>
              <span>{collected ? "✓" : index + 1}</span><em>{hotspot.label}</em>
            </button>;
          })}
          <div className="scene-caption"><div><p>{room.name}</p><span>{room.atmosphere}</span></div><b>{roomProgress}/{roomEvidenceCount}</b></div>
        </section>

        <aside className="evidence-rail">
          <div className="rail-heading"><p className="panel-label">调查案簿</p><button onClick={() => setEvidenceOpen(true)} aria-label="打开全部证据">展开</button></div>
          <div className="counter"><strong>{found.length}</strong><span>/ {evidence.length} 关键证据</span></div>
          <div className="evidence-list">
            {availableEvidence.length === 0 && <div className="empty-evidence">证据会自动归档。<br />先调查画面中的编号热点。</div>}
            {availableEvidence.slice().reverse().map((item) => <button key={item.id} onClick={() => setSelectedEvidence(item.id)}><span>{item.code} · {item.kind}</span><strong>{item.title}</strong><small>{item.summary}</small></button>)}
          </div>
          <div className="deduction-status"><span>{canDeduce ? "证据门槛已满足" : `还需 ${CHAPTER_02.minimumEvidence - found.length} 条证据`}</span><div><i style={{ width: `${Math.min(100, found.length / CHAPTER_02.minimumEvidence * 100)}%` }} /></div></div>
          <button className="deduction-button" disabled={!canDeduce} onClick={() => setView("deduction")}>提交推断 <span>D</span></button>
        </aside>
      </section>

      <footer className="game-footer"><span>点击编号热点调查</span><span>1–3 切换地点</span><span>E 证据案簿</span><button onClick={resetChapter}>重置进度</button></footer>

      {focusedHotspot && <div className="overlay" role="dialog" aria-modal="true" aria-label={focusedHotspot.title}>
        <article className="discovery-card">
          <button className="close-button" onClick={() => setFocusedHotspot(null)} aria-label="关闭">×</button>
          <p className="eyebrow">调查 · {room.name}</p><h2>{focusedHotspot.title}</h2><p>{focusedHotspot.text}</p>
          {focusedHotspot.evidenceId && <div className="evidence-gained"><span>{found.includes(focusedHotspot.evidenceId) ? "证据已归档" : "获得证据"}</span><strong>{getEvidence(focusedHotspot.evidenceId)?.title}</strong></div>}
          <button className="primary-button" onClick={() => setFocusedHotspot(null)}>继续调查</button>
        </article>
      </div>}

      {(selectedEvidence || evidenceOpen) && <div className="overlay" role="dialog" aria-modal="true" aria-label="证据案簿">
        <article className="evidence-book"><button className="close-button" onClick={closeOverlay} aria-label="关闭">×</button><p className="eyebrow">EVIDENCE LEDGER</p><h2>第二章证据案簿</h2>
          <div className="book-grid"><div className="book-list">{availableEvidence.map((item) => <button key={item.id} className={selectedEvidence === item.id ? "active" : ""} onClick={() => setSelectedEvidence(item.id)}><span>{item.code}</span><strong>{item.title}</strong></button>)}</div>
          <div className="book-detail">{selectedEvidence ? (() => { const item = getEvidence(selectedEvidence); return item ? <><span>{item.kind} · {item.code}</span><h3>{item.title}</h3><p>{item.detail}</p></> : null; })() : <><span>已归档 {found.length}/{evidence.length}</span><h3>选择一条证据</h3><p>推断至少需要记录、物证和证词互相支持。单独找到一张纸，并不能证明是谁删掉了名字。</p></>}</div></div>
        </article>
      </div>}

      {view === "deduction" && <div className="overlay deduction-overlay" role="dialog" aria-modal="true" aria-label="提交推断">
        <article className="deduction-card"><button className="close-button" onClick={() => setView("game")} aria-label="关闭">×</button><p className="eyebrow">FAMILY LEDGER · 首次冲突</p><h2>谁开始删除她？</h2><p className="deduction-help">选择最能同时解释登记缺页、今夜纸灰和旧账签押的判断。</p>
          <div className="deduction-evidence">{availableEvidence.map((item) => <span key={item.id}>{item.code}</span>)}</div>
          <div className="deduction-options">{deductionOptions.map((option) => <button key={option.id} onClick={() => submitDeduction(option.id)}>{option.label}<i>→</i></button>)}</div>
          {wrongDeduction && <p className="wrong-answer">这个判断无法同时解释“命令来自谁”和“今夜是谁继续灭证”。证据之间仍有矛盾。</p>}
        </article>
      </div>}
    </main>
  );
}
