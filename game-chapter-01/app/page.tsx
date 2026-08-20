"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CHAPTER_01, deductionOptions, evidence, getEvidence, rooms, type Hotspot } from "./game/chapter01";

type View = "intro" | "game" | "deduction" | "ending";
type SaveData = { room:string; found:string[]; completed:boolean };
const SAVE_KEY = "undying-world.chapter01.save.v1";

function SceneArt({ roomId }:{ roomId:string }) {
  if (roomId === "shrine") return <div className="scene-art shrine-art" aria-hidden="true"><div className="shrine-beam"/><div className="altar"><i/><i/><i/><i/><i/></div><div className="portrait portrait-a"/><div className="portrait portrait-b"/><div className="incense"><i/><i/><i/></div><div className="genealogy-book"/></div>;
  if (roomId === "bedroom") return <div className="scene-art bedroom-art" aria-hidden="true"><div className="paper-window"/><div className="old-bed"><i/></div><div className="wardrobe"><i/><i/></div><div className="dress-chest"/><div className="height-frame"><i/><i/><i/><i/><i/><i/><i/></div></div>;
  return <div className="scene-art dining-art" aria-hidden="true"><div className="dining-window"/><div className="wall-scroll"/><div className="family-table"><i/><i/><i/><i/><i/><i/><i className="seventh"/></div><div className="figure figure-a"/><div className="figure figure-b"/><div className="steam"/></div>;
}

export default function Home() {
  const [view,setView] = useState<View>("intro");
  const [roomId,setRoomId] = useState("dining");
  const [found,setFound] = useState<string[]>([]);
  const [focused,setFocused] = useState<Hotspot|null>(null);
  const [selectedEvidence,setSelectedEvidence] = useState<string|null>(null);
  const [evidenceOpen,setEvidenceOpen] = useState(false);
  const [wrong,setWrong] = useState(false);
  const [restored,setRestored] = useState(false);
  const room = rooms.find((item)=>item.id===roomId) ?? rooms[0];
  const foundEvidence = evidence.filter((item)=>found.includes(item.id));
  const canDeduce = found.length >= CHAPTER_01.minimumEvidence;

  useEffect(()=>{
    const timer = window.setTimeout(()=>{
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return;
        const save = JSON.parse(raw) as SaveData;
        setRoomId(rooms.some((item)=>item.id===save.room)?save.room:"dining");
        setFound(Array.isArray(save.found)?save.found:[]);
        if (save.completed) setView("ending"); else setRestored(save.found?.length>0);
      } catch { localStorage.removeItem(SAVE_KEY); }
    },0);
    return ()=>window.clearTimeout(timer);
  },[]);

  useEffect(()=>{
    if (view==="intro"&&!found.length) return;
    localStorage.setItem(SAVE_KEY,JSON.stringify({room:roomId,found,completed:view==="ending"}));
  },[found,roomId,view]);

  const closeOverlay = useCallback(()=>{setFocused(null);setSelectedEvidence(null);setEvidenceOpen(false);if(view==="deduction")setView("game");},[view]);
  useEffect(()=>{
    const onKey=(event:KeyboardEvent)=>{
      if(event.key==="Escape")closeOverlay();
      if(view!=="game"||focused||evidenceOpen)return;
      if(["1","2","3"].includes(event.key)){const next=rooms[Number(event.key)-1];if(!next.lockedUntil||found.includes(next.lockedUntil))setRoomId(next.id);}
      if(event.key.toLowerCase()==="e")setEvidenceOpen(true);
      if(event.key.toLowerCase()==="d"&&canDeduce)setView("deduction");
    };
    window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey);
  },[canDeduce,closeOverlay,evidenceOpen,focused,found,view]);

  const investigate=(hotspot:Hotspot)=>{
    if(hotspot.requires&&!found.includes(hotspot.requires))return;
    setFocused(hotspot);
    if(hotspot.evidenceId&&!found.includes(hotspot.evidenceId))setFound((current)=>[...current,hotspot.evidenceId as string]);
  };
  const submit=(id:string)=>{
    if(id!==CHAPTER_01.correctDeduction){setWrong(true);return;}
    setWrong(false);setView("ending");
    localStorage.setItem(SAVE_KEY,JSON.stringify({room:roomId,found,completed:true}));
    window.dispatchEvent(new CustomEvent("undying-world:chapter-complete",{detail:{chapterId:CHAPTER_01.id,outputFlag:CHAPTER_01.outputFlag,evidence:found}}));
  };
  const reset=()=>{localStorage.removeItem(SAVE_KEY);setRoomId("dining");setFound([]);setFocused(null);setSelectedEvidence(null);setEvidenceOpen(false);setWrong(false);setRestored(false);setView("intro");};
  const roomProgress=useMemo(()=>room.hotspots.filter((item)=>item.evidenceId&&found.includes(item.evidenceId)).length,[found,room]);
  const roomTotal=room.hotspots.filter((item)=>item.evidenceId).length;

  if(view==="intro")return <main className="title-screen"><div className="title-grain"/><div className="chapter-number">01</div><section className="title-card"><p className="eyebrow">不死世界 · 无名席</p><h1>第七席</h1><div className="title-rule"/><p className="intro-copy">家宴按往年一样开始。<br/>六个人已经坐下，桌上却摆着第七副碗筷。</p><p className="chapter-goal"><span>骨架目标</span>{CHAPTER_01.objective}</p><button className="primary-button" onClick={()=>setView("game")}>{restored?"继续调查":"进入饭厅"}<i>→</i></button>{restored&&<button className="text-button" onClick={reset}>从本章开头重新开始</button>}</section><p className="title-footnote">半开放固定场景 · 叙事调查 · 剧情占位版</p></main>;

  if(view==="ending")return <main className="ending-screen"><div className="ending-backdrop"><div className="seated-shadow"/><div className="empty-shadow"/></div><section className="ending-card"><p className="eyebrow">推断成立 · 章节输出已生成</p><h2>她不是客人。这个家曾经有七个孩子。</h2><p className="speaker">族谱仍然没有她的名字，但每个房间都留下了同一个人的位置。</p><p>碗筷、合影、族谱针孔、旧衣和身高线互相印证：有人系统地删除了她，却没有办法让生活过的痕迹一起消失。</p><blockquote>第七席的女人抬起头，准确叫出了你的乳名。</blockquote><div className="ending-result"><span>输出状态</span><strong>{CHAPTER_01.outputFlag}</strong></div><div className="ending-actions"><a className="primary-button" href={CHAPTER_01.nextChapterUrl}>进入第二章骨架 <i>→</i></a><button className="text-button" onClick={()=>setView("game")}>返回自由调查</button><button className="text-button" onClick={reset}>重置第一章</button></div></section></main>;

  return <main className="game-shell"><header className="game-header"><div><p className="eyebrow">不死世界 · CHAPTER 01</p><h1>第七席</h1></div><div className="objective-block"><span>当前调查</span><p>{CHAPTER_01.objective}</p></div></header>
    <section className="game-grid" aria-label="第一章调查界面"><nav className="room-nav" aria-label="可调查地点"><p className="panel-label">老宅平面</p>{rooms.map((item,index)=>{const locked=Boolean(item.lockedUntil&&!found.includes(item.lockedUntil));const completed=item.hotspots.filter((spot)=>spot.evidenceId).every((spot)=>spot.evidenceId&&found.includes(spot.evidenceId));return <button key={item.id} className={`room-button ${roomId===item.id?"active":""} ${locked?"locked":""}`} disabled={locked} onClick={()=>setRoomId(item.id)}><span className="room-index">0{index+1}</span><span><strong>{item.name}</strong><small>{locked?"需先发现被裁合影":completed?"关键证据已取":item.short}</small></span></button>})}<div className="map-note"><span>半开放调查</span><p>饭厅与祖堂可自由切换；证据会改变旧卧室状态。</p></div></nav>
      <section className={`scene-card scene-${room.id}`} aria-label={`${room.name}场景`}><SceneArt roomId={room.id}/><div className="scene-vignette"/>{room.hotspots.map((hotspot,index)=>{const blocked=Boolean(hotspot.requires&&!found.includes(hotspot.requires));const collected=Boolean(hotspot.evidenceId&&found.includes(hotspot.evidenceId));return <button key={hotspot.id} className={`hotspot ${collected?"collected":""} ${blocked?"blocked":""}`} style={{left:`${hotspot.x}%`,top:`${hotspot.y}%`}} onClick={()=>investigate(hotspot)} disabled={blocked} aria-label={`调查${hotspot.label}`}><span>{collected?"✓":index+1}</span><em>{hotspot.label}</em></button>})}<div className="scene-caption"><div><p>{room.name}</p><span>{room.atmosphere}</span></div><b>{roomProgress}/{roomTotal}</b></div></section>
      <aside className="evidence-rail"><div className="rail-heading"><p className="panel-label">调查案簿</p><button onClick={()=>setEvidenceOpen(true)}>展开</button></div><div className="counter"><strong>{found.length}</strong><span>/ {evidence.length} 关键证据</span></div><div className="evidence-list">{!foundEvidence.length&&<div className="empty-evidence">证据会自动归档。<br/>先调查画面中的编号热点。</div>}{foundEvidence.slice().reverse().map((item)=><button key={item.id} onClick={()=>setSelectedEvidence(item.id)}><span>{item.code} · {item.kind}</span><strong>{item.title}</strong><small>{item.summary}</small></button>)}</div><div className="deduction-status"><span>{canDeduce?"证据门槛已满足":`还需 ${CHAPTER_01.minimumEvidence-found.length} 条证据`}</span><div><i style={{width:`${Math.min(100,found.length/CHAPTER_01.minimumEvidence*100)}%`}}/></div></div><button className="deduction-button" disabled={!canDeduce} onClick={()=>setView("deduction")}>提交推断 <span>D</span></button></aside></section>
    <footer className="game-footer"><span>点击编号热点调查</span><span>1–3 切换地点</span><span>E 证据案簿</span><button onClick={reset}>重置进度</button></footer>
    {focused&&<div className="overlay" role="dialog" aria-modal="true" aria-label={focused.title}><article className="discovery-card"><button className="close-button" onClick={()=>setFocused(null)} aria-label="关闭">×</button><p className="eyebrow">调查 · {room.name}</p><h2>{focused.title}</h2><p>{focused.text}</p>{focused.evidenceId&&<div className="evidence-gained"><span>证据已归档</span><strong>{getEvidence(focused.evidenceId)?.title}</strong></div>}<button className="primary-button" onClick={()=>setFocused(null)}>继续调查</button></article></div>}
    {(selectedEvidence||evidenceOpen)&&<div className="overlay" role="dialog" aria-modal="true" aria-label="证据案簿"><article className="evidence-book"><button className="close-button" onClick={closeOverlay} aria-label="关闭">×</button><p className="eyebrow">EVIDENCE LEDGER</p><h2>第一章证据案簿</h2><div className="book-grid"><div className="book-list">{foundEvidence.map((item)=><button key={item.id} className={selectedEvidence===item.id?"active":""} onClick={()=>setSelectedEvidence(item.id)}><span>{item.code}</span><strong>{item.title}</strong></button>)}</div><div className="book-detail">{selectedEvidence?(()=>{const item=getEvidence(selectedEvidence);return item?<><span>{item.kind} · {item.code}</span><h3>{item.title}</h3><p>{item.detail}</p></>:null})():<><span>已归档 {found.length}/{evidence.length}</span><h3>选择一条证据</h3><p>同一个结论需要不同来源相互支持。场景痕迹、家庭记录和人物失言缺一不可。</p></>}</div></div></article></div>}
    {view==="deduction"&&<div className="overlay deduction-overlay" role="dialog" aria-modal="true" aria-label="提交推断"><article className="deduction-card"><button className="close-button" onClick={()=>setView("game")} aria-label="关闭">×</button><p className="eyebrow">FAMILY LEDGER · 第一条关系</p><h2>第七席的女人是谁？</h2><p className="deduction-help">选择最能同时解释生活痕迹、家庭记录与人物证词的判断。</p><div className="deduction-evidence">{foundEvidence.map((item)=><span key={item.id}>{item.code}</span>)}</div><div className="deduction-options">{deductionOptions.map((option)=><button key={option.id} onClick={()=>submit(option.id)}>{option.label}<i>→</i></button>)}</div>{wrong&&<p className="wrong-answer">这个判断无法解释她为什么拥有多年连续的成长记录和固定席位。证据之间仍有矛盾。</p>}</article></div>}
  </main>;
}
