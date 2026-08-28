"use client";

import { lazy, Suspense, useEffect, useState } from "react";
import { createCheckpoint, createDefaultSave, loadCampaignSave, resetGardenSave, storeCampaignSave } from "./game/campaign-save";
import { campaignManifest, getChapter } from "./game/manifests/campaign";
import type { CampaignSave, GameSettings } from "./game/types";

const GameRuntime = lazy(() => import("./game/GameRuntime").then((module) => ({ default: module.GameRuntime })));
const NorthTowerRuntime = lazy(() => import("./game/NorthTowerRuntime").then((module) => ({ default: module.NorthTowerRuntime })));

type View = "hub" | "west-corridor-loop" | "north-tower-ledger" | "settings";

const versionForChapter = (index: number) => {
  if (index <= 1) return "V0.1";
  if (index <= 3) return "V0.2";
  if (index <= 6) return "V0.3";
  return "V0.4";
};

export default function Home() {
  const [save, setSave] = useState<CampaignSave>(() => createDefaultSave());
  const [view, setView] = useState<View>("hub");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      if (process.env.NODE_ENV === "development" && params.get("visualTest") === "1") {
        const anchorId = params.get("visualAnchor") ?? "front-gate";
        const checkpoint = {
          ...createCheckpoint("west-corridor-loop", "wife"),
          anchorId,
          earnedFlags: ["prologue.dialogue.complete"],
        };
        const visualSave = createDefaultSave();
        setSave({
          ...visualSave,
          activeCheckpoint: checkpoint,
          settings: {
            ...visualSave.settings,
            renderer: params.get("renderer") === "webgl" ? "webgl" : "auto",
            quality: "high",
            masterVolume: 0,
            subtitles: false,
          },
        });
        setView("west-corridor-loop");
        setReady(true);
        return;
      }
      setSave(loadCampaignSave());
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const persist = (next: CampaignSave) => {
    setSave(next);
    storeCampaignSave(next);
  };

  const startOnboarding = (restart = false) => {
    if (restart) {
      const checkpoint = { ...createCheckpoint("west-corridor-loop", "wife"), anchorId: "west-entry" };
      persist({ ...save, activeCheckpoint: checkpoint, completedChapters: save.completedChapters.filter((id) => !["prologue-rain", "west-corridor-loop"].includes(id)) });
    }
    setView("west-corridor-loop");
  };

  const startNorthTower = (restart = false) => {
    if (restart || save.activeCheckpoint.chapterId !== "north-tower-ledger") {
      const checkpoint = { ...createCheckpoint("north-tower-ledger", "accountant"), anchorId: "north-tower-entry" };
      persist({
        ...save,
        activeCheckpoint: checkpoint,
        completedChapters: restart ? save.completedChapters.filter((id) => id !== "north-tower-ledger") : save.completedChapters,
      });
    }
    setView("north-tower-ledger");
  };

  if (view === "west-corridor-loop") {
    const chapter = getChapter("west-corridor-loop");
    if (!chapter) return null;
    return (
      <Suspense fallback={<main className="runtime-loading"><p className="eyebrow">LOADING RUNTIME</p><strong>正在载入园林与证词…</strong></main>}>
        <GameRuntime chapter={chapter} save={save} onSave={persist} onExit={() => setView("hub")} />
      </Suspense>
    );
  }

  if (view === "north-tower-ledger") {
    const chapter = getChapter("north-tower-ledger");
    if (!chapter) return null;
    return (
      <Suspense fallback={<main className="runtime-loading"><p className="eyebrow">LOADING CHAPTER 02</p><strong>正在载入北楼与借景时间线…</strong></main>}>
        <NorthTowerRuntime chapter={chapter} save={save} onSave={persist} onExit={() => setView("hub")} />
      </Suspense>
    );
  }

  return (
    <main className="site-shell">
      <header className="site-nav">
        <a href="#top" className="wordmark"><i>园</i><span>游园惊梦<small>四面证词</small></span></a>
        <nav aria-label="主导航">
          <a href="#case">案卷</a>
          <a href="#chapters">章节</a>
          <a href="#roadmap">长线规划</a>
          <button type="button" onClick={() => setView("settings")}>设置</button>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-image" aria-hidden="true" />
        <div className="hero-wash" aria-hidden="true" />
        <div className="hero-content">
          <p className="eyebrow">1923 · 中元雨夜 · 听雨轩</p>
          <h1>游园惊梦</h1>
          <p className="hero-subtitle">四面证词</p>
          <p className="hero-logline">一座反锁的水榭，四份互相否认的证词，<br />以及一个从所有人口中被删去的名字。</p>
          <div className="hero-actions">
            <button type="button" className="primary-button" onClick={() => startOnboarding()}>{save.activeCheckpoint.earnedFlags.includes("prologue.dialogue.complete") ? "继续勘验" : "开始序章"} <span>→</span></button>
            <button type="button" className="ghost-button" onClick={() => startNorthTower(true)}>从头测试第二章</button>
            <button type="button" className="ghost-button" onClick={() => startOnboarding(true)}>从序章重新开始</button>
          </div>
          <small className="hero-meta">PC WEB · 实时 3D · 叙事解谜 · 16+</small>
        </div>
        <div className="scroll-mark">向下查阅案卷 <i /></div>
      </section>

      <section className="case-section" id="case">
        <div className="section-heading">
          <p className="eyebrow">CASE 01 · THE HEARING RAIN PAVILION</p>
          <h2>死者没有出口，证人没有说谎。</h2>
          <p>唯一因果链并不意味着唯一道德答案。你要比对的不是台词，而是每份证词如何重新布置同一座园林。</p>
        </div>
        <div className="case-grid">
          <article><span>01</span><h3>同地异景</h3><p>夫人、园丁、账房与画师各自拥有一套视觉规则和拓扑覆盖。</p></article>
          <article><span>02</span><h3>空间勘误</h3><p>同一个矛盾必须得到两份独立证词确认，推断才会进入案件链。</p></article>
          <article><span>03</span><h3>信任重构</h3><p>事实只有一个，动机与责任由你判断；它们会改变人物关系与结局语义。</p></article>
          <article><span>04</span><h3>无名第五席</h3><p>当四份证词都缺少同一个人，你需要问：是谁替你拿着勘验簿？</p></article>
        </div>
      </section>

      <section className="chapters-section" id="chapters">
        <div className="section-heading compact">
          <p className="eyebrow">CAMPAIGN · PROLOGUE + 4 CHAPTERS + FINALE</p>
          <h2>首案全章规划</h2>
          <p>定稿结构为序章、四个正文章节与终章；当前第一、第二章均可独立进入验证。</p>
        </div>
        <div className="chapter-list">
          {campaignManifest.chapters.map((chapter) => {
            const completed = save.completedChapters.includes(chapter.id);
            const playable = chapter.id === "west-corridor-loop" || chapter.id === "north-tower-ledger";
            return (
              <article key={chapter.id} className={`${playable ? "playable" : ""} ${completed ? "completed" : ""}`}>
                <b>{String(chapter.index).padStart(2, "0")}</b>
                <div><span>{versionForChapter(chapter.index)} · {chapter.estimatedMinutes[0]}–{chapter.estimatedMinutes[1]} 分钟</span><h3>{chapter.title}</h3><p>{chapter.subtitle}</p></div>
                <em>{completed ? "已完成" : playable ? "可游玩" : chapter.status === "prototype" ? "已接入对话" : "已规划"}</em>
                {chapter.id === "west-corridor-loop" && <button type="button" onClick={() => setView("west-corridor-loop")} aria-label="进入西廊回环">→</button>}
                {chapter.id === "north-tower-ledger" && <button type="button" onClick={() => startNorthTower()} aria-label="进入北楼暗账">→</button>}
                {chapter.index === 0 && <button type="button" onClick={() => startOnboarding(true)} aria-label="从序章开始">→</button>}
              </article>
            );
          })}
        </div>
      </section>

      <section className="roadmap-section" id="roadmap">
        <div>
          <p className="eyebrow">LONG-RANGE DEVELOPMENT</p>
          <h2>先把一个案件做完，<br />再让园林继续长。</h2>
        </div>
        <ol>
          <li className="active"><b>V0.1R</b><span>新手垂直切片</span><small>序章对话、任务导演、西院双视角、信任重构与追逐</small></li>
          <li><b>V0.2</b><span>系统 Alpha</span><small>前三章白盒、四种记忆、画中门与完整存档</small></li>
          <li><b>V0.3</b><span>叙事 Alpha</span><small>死亡证据形成唯一因果链，4–5 小时连续流程</small></li>
          <li><b>V0.4–1.0</b><span>内容完整至正式版</span><small>第五视角、三结局、最终资产与全量审计</small></li>
        </ol>
      </section>

      <footer className="site-footer">
        <span>《游园惊梦：四面证词》 V0.1R ONBOARDING SLICE</span>
        <span><a href="/credits">制作与授权</a> · {ready ? `存档：${save.completedChapters.length} / 6 段完成` : "正在读取存档…"}</span>
      </footer>

      {view === "settings" && (
        <SettingsPanel
          settings={save.settings}
          onClose={() => setView("hub")}
          onChange={(settings) => persist({ ...save, settings })}
          onReset={() => {
            resetGardenSave();
            setSave(createDefaultSave());
          }}
        />
      )}
    </main>
  );
}

function SettingsPanel({ settings, onClose, onChange, onReset }: {
  settings: GameSettings;
  onClose: () => void;
  onChange: (settings: GameSettings) => void;
  onReset: () => void;
}) {
  const update = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => onChange({ ...settings, [key]: value });
  return (
    <div className="page-modal-backdrop">
      <section className="settings-panel" role="dialog" aria-modal="true" aria-label="游戏设置">
        <button type="button" className="panel-close" onClick={onClose}>×</button>
        <p className="eyebrow">DISPLAY & ACCESSIBILITY</p>
        <h2>设置</h2>
        <div className="setting-row"><span><label htmlFor="quality">画质</label><small>稳定与低画质会限制像素比和雨滴数量</small></span><select id="quality" value={settings.quality} onChange={(event) => update("quality", event.target.value as GameSettings["quality"])}><option value="high">高画质</option><option value="stable">稳定模式</option><option value="low">最低画质</option></select></div>
        <div className="setting-row"><span><label htmlFor="renderer">渲染后端</label><small>自动优先 WebGPU，失败时可强制 WebGL 2</small></span><select id="renderer" value={settings.renderer} onChange={(event) => update("renderer", event.target.value as GameSettings["renderer"])}><option value="auto">自动</option><option value="webgl">强制 WebGL 2</option></select></div>
        <div className="setting-row"><span><label htmlFor="stable-camera">稳定镜头</label><small>关闭追逐镜头扰动；不会影响解谜</small></span><input id="stable-camera" type="checkbox" checked={settings.stableCamera} onChange={(event) => update("stableCamera", event.target.checked)} /></div>
        <div className="setting-row"><span><label htmlFor="subtitles">字幕</label><small>显示证词、提示与追逐揭示</small></span><input id="subtitles" type="checkbox" checked={settings.subtitles} onChange={(event) => update("subtitles", event.target.checked)} /></div>
        <div className="setting-row"><span><label htmlFor="dialogue-speed">对话速度</label><small>控制剧情文字逐字显示速度</small></span><select id="dialogue-speed" value={settings.dialogueSpeed} onChange={(event) => update("dialogueSpeed", event.target.value as GameSettings["dialogueSpeed"])}><option value="slow">慢</option><option value="normal">标准</option><option value="fast">快</option><option value="instant">立即显示</option></select></div>
        <div className="setting-row"><span><label htmlFor="master-volume">主音量</label><small>{Math.round(settings.masterVolume * 100)}%</small></span><input id="master-volume" type="range" min="0" max="1" step="0.05" value={settings.masterVolume} onChange={(event) => update("masterVolume", Number(event.target.value))} /></div>
        <button type="button" className="reset-button" onClick={onReset}>仅清除《游园惊梦》存档</button>
        <p className="settings-note">不会读取、迁移或删除旧项目的 `undying-world.game.save.v1`。</p>
      </section>
    </div>
  );
}
