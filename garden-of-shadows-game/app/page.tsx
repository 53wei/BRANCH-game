"use client";

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { createCheckpoint, createDefaultSave, createNewGameSave, inheritInvestigationState, loadCampaignSave, resetGardenSave, restartFromPrologue, storeCampaignSave } from "./game/campaign-save";
import { getChapter } from "./game/manifests/campaign";
import { createIsolatedQaChapterSave, isQaChapterId, QA_CHAPTER_QUERY, QA_FIRST_RUN_QUERY } from "./game/qa-session";
import { StoryCGGallery } from "./game/narrative/StoryCGGallery";
import type { CampaignSave, GameSettings } from "./game/types";

const GameRuntime = lazy(() => import("./game/GameRuntime").then((module) => ({ default: module.GameRuntime })));
const NorthTowerRuntime = lazy(() => import("./game/NorthTowerRuntime").then((module) => ({ default: module.NorthTowerRuntime })));
const MissingRoomRuntime = lazy(() => import("./game/MissingRoomRuntime").then((module) => ({ default: module.MissingRoomRuntime })));
const YouDidNotReturnRuntime = lazy(() => import("./game/YouDidNotReturnRuntime").then((module) => ({ default: module.YouDidNotReturnRuntime })));
const FifthTingYuXuanRuntime = lazy(() => import("./game/FifthTingYuXuanRuntime").then((module) => ({ default: module.FifthTingYuXuanRuntime })));
const NarrativeChapterRuntime = lazy(() => import("./game/NarrativeChapterRuntime").then((module) => ({ default: module.NarrativeChapterRuntime })));
const PrologueRuntime = lazy(() => import("./game/PrologueRuntime").then((module) => ({ default: module.PrologueRuntime })));

type View = "hub" | "prologue-rain" | "west-corridor-loop" | "north-tower-ledger" | "missing-room" | "deleted-person" | "you-did-not-return" | "fifth-tingyuxuan" | "chapters" | "gallery" | "settings";
type HomeMenuId = "01" | "02" | "03" | "04" | "05";

export default function Home() {
  const [save, setSave] = useState<CampaignSave>(() => createDefaultSave());
  const [view, setView] = useState<View>("hub");
  const [activeMenu, setActiveMenu] = useState<HomeMenuId>("01");
  const qaSessionRef = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const isDevelopment = process.env.NODE_ENV === "development";

      if (isDevelopment && params.get(QA_FIRST_RUN_QUERY) === "1") {
        resetGardenSave();
        const fresh = createDefaultSave();
        storeCampaignSave(fresh);
        setSave(fresh);
        setView("prologue-rain");
        return;
      }

      const devChapter = isDevelopment ? params.get(QA_CHAPTER_QUERY) : null;
      if (devChapter && isQaChapterId(devChapter)) {
        qaSessionRef.current = true;
        setSave(createIsolatedQaChapterSave(devChapter));
        setView(devChapter as View);
        return;
      }

      if (isDevelopment && params.get("visualTest") === "1") {
        qaSessionRef.current = true;
        const visualSave = createDefaultSave();
        const visualSettings = {
          ...visualSave.settings,
          renderer: params.get("renderer") === "webgl" ? "webgl" as const : "auto" as const,
          quality: "high" as const,
          masterVolume: 0,
          subtitles: false,
        };
        if (params.get("visualChapter") === "prologue-rain") {
          setSave({
            ...visualSave,
            tutorial: { controls: { seen: true } },
            activeCheckpoint: { ...createCheckpoint("prologue-rain", "baseline"), anchorId: "ROUTE_01_START" },
            settings: visualSettings,
          });
          setView("prologue-rain");
          return;
        }
        const anchorId = params.get("visualAnchor") ?? "front-gate";
        const checkpoint = {
          ...createCheckpoint("west-corridor-loop", "wife"),
          anchorId,
          earnedFlags: ["prologue.dialogue.complete"],
        };
        setSave({
          ...visualSave,
          activeCheckpoint: checkpoint,
          settings: visualSettings,
        });
        setView("west-corridor-loop");
        return;
      }
      setSave(loadCampaignSave());
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.textScale = save.settings.textScale;
  }, [save.settings.textScale]);

  const persist = (next: CampaignSave) => {
    setSave(next);
    if (!qaSessionRef.current) storeCampaignSave(next);
  };

  const startChapterOne = (restart = false) => {
    if (restart || save.activeCheckpoint.chapterId !== "west-corridor-loop") {
      const checkpoint = {
        ...inheritInvestigationState(save.activeCheckpoint, createCheckpoint("west-corridor-loop", "wife")),
        anchorId: "ROUTE_02_A_ENTRY",
        earnedFlags: [...new Set([...save.activeCheckpoint.earnedFlags, "prologue-rain.complete", "prologue.dialogue.complete", "prologue.examiner-appointed"])],
        activeObjectiveId: "west-arrival",
        objectiveStepId: "follow-lantern",
      };
      persist({ ...save, activeCheckpoint: checkpoint, completedChapters: restart ? save.completedChapters.filter((id) => id !== "west-corridor-loop") : save.completedChapters });
    }
    setView("west-corridor-loop");
  };

  const startOnboarding = (restart = false) => {
    if (restart) {
      persist(restartFromPrologue(save));
      setView("prologue-rain");
      return;
    }
    const staleDefaultAnchor = save.activeCheckpoint.chapterId === "prologue-rain" && save.activeCheckpoint.anchorId !== "ROUTE_01_START" && !save.activeCheckpoint.position;
    if (save.activeCheckpoint.chapterId !== "prologue-rain" || save.completedChapters.includes("prologue-rain") || staleDefaultAnchor) {
      const checkpoint = { ...createCheckpoint("prologue-rain", "baseline"), anchorId: "ROUTE_01_START" };
      persist({
        ...save,
        activeCheckpoint: checkpoint,
        completedChapters: save.completedChapters.filter((id) => id !== "prologue-rain"),
      });
    }
    setView("prologue-rain");
  };

  const startNewGame = () => {
    persist(createNewGameSave(save));
    setView("prologue-rain");
  };

  const startNorthTower = (restart = false) => {
    if (restart || save.activeCheckpoint.chapterId !== "north-tower-ledger") {
      const checkpoint = { ...inheritInvestigationState(save.activeCheckpoint, createCheckpoint("north-tower-ledger", "wife")), anchorId: "ROUTE_05_B_MAIN_COURT", activeObjectiveId: "north-life-evidence", objectiveStepId: "inspect-sixth-cup", earnedFlags: [...save.activeCheckpoint.earnedFlags] };
      persist({
        ...save,
        activeCheckpoint: checkpoint,
        completedChapters: restart ? save.completedChapters.filter((id) => id !== "north-tower-ledger") : save.completedChapters,
      });
    }
    setView("north-tower-ledger");
  };

  const startMissingRoom = (restart = false) => {
    if (restart || save.activeCheckpoint.chapterId !== "missing-room") {
      const checkpoint = { ...inheritInvestigationState(save.activeCheckpoint, createCheckpoint("missing-room", "gardener")), anchorId: "ROUTE_06_B_NORTHEAST_LINK", earnedFlags: [...save.activeCheckpoint.earnedFlags] };
      persist({ ...save, activeCheckpoint: checkpoint, completedChapters: restart ? save.completedChapters.filter((id) => id !== "missing-room") : save.completedChapters });
    }
    setView("missing-room");
  };

  const startNarrativeChapter = (chapterId: "deleted-person" | "you-did-not-return" | "fifth-tingyuxuan", restart = false) => {
    if (restart || save.activeCheckpoint.chapterId !== chapterId) {
      const inheritedFlags = restart
        ? save.activeCheckpoint.earnedFlags.filter((flag) => !flag.startsWith(`${chapterId}.`) && !flag.startsWith("finale."))
        : save.activeCheckpoint.earnedFlags;
      const checkpoint = {
        ...inheritInvestigationState(save.activeCheckpoint, createCheckpoint(chapterId, chapterId === "fifth-tingyuxuan" ? "zhaoying" : "baseline")),
        earnedFlags: [...inheritedFlags],
      };
      persist({
        ...save,
        activeCheckpoint: checkpoint,
        completedChapters: restart ? save.completedChapters.filter((id) => id !== chapterId) : save.completedChapters,
        endingIds: restart && chapterId === "fifth-tingyuxuan" ? [] : save.endingIds,
      });
    }
    setView(chapterId);
  };

  const continueCurrentInvestigation = () => {
    if (save.activeCheckpoint.chapterId === "west-corridor-loop") startChapterOne();
    else if (save.activeCheckpoint.chapterId === "north-tower-ledger") startNorthTower();
    else if (save.activeCheckpoint.chapterId === "missing-room") startMissingRoom();
    else if (save.activeCheckpoint.chapterId === "deleted-person") startNarrativeChapter("deleted-person");
    else if (save.activeCheckpoint.chapterId === "you-did-not-return") startNarrativeChapter("you-did-not-return");
    else if (save.activeCheckpoint.chapterId === "fifth-tingyuxuan") startNarrativeChapter("fifth-tingyuxuan");
    else startOnboarding();
  };

  const hasPrologueProgress = save.activeCheckpoint.chapterId === "prologue-rain"
    && (save.tutorial.controls.seen
      || save.activeCheckpoint.earnedFlags.length > 0
      || Boolean(save.activeCheckpoint.dialogueProgress)
      || Boolean(save.activeCheckpoint.position));
  const primaryMenuLabel = save.activeCheckpoint.chapterId === "west-corridor-loop"
    ? { titleCn: "继续第一章", titleEn: "CONTINUE CHAPTER ONE" }
    : save.activeCheckpoint.chapterId === "north-tower-ledger"
      ? { titleCn: "继续第二章", titleEn: "CONTINUE CHAPTER TWO" }
      : save.activeCheckpoint.chapterId === "missing-room"
        ? { titleCn: "继续第三章", titleEn: "CONTINUE CHAPTER THREE" }
        : save.activeCheckpoint.chapterId === "deleted-person"
          ? { titleCn: "继续第四章", titleEn: "CONTINUE CHAPTER FOUR" }
          : save.activeCheckpoint.chapterId === "you-did-not-return"
            ? { titleCn: "继续第五章", titleEn: "CONTINUE CHAPTER FIVE" }
            : save.activeCheckpoint.chapterId === "fifth-tingyuxuan"
              ? { titleCn: "继续终章", titleEn: "CONTINUE FINALE" }
        : hasPrologueProgress
          ? { titleCn: "继续序章", titleEn: "CONTINUE PROLOGUE" }
          : { titleCn: "开始序章", titleEn: "NEW CASE" };

  if (view === "prologue-rain") {
    const chapter = getChapter("prologue-rain");
    if (!chapter) return null;
    return (
      <Suspense fallback={<main className="runtime-loading"><p className="eyebrow">序章</p><strong>雨夜正在回到听雨轩…</strong></main>}>
        <PrologueRuntime chapter={chapter} save={save} onSave={persist} onExit={() => setView("hub")} onContinue={() => startChapterOne()} />
      </Suspense>
    );
  }

  if (view === "west-corridor-loop") {
    const chapter = getChapter("west-corridor-loop");
    if (!chapter) return null;
    return (
      <Suspense fallback={<main className="runtime-loading"><p className="eyebrow">第一章</p><strong>正在载入园林与证词…</strong></main>}>
        <GameRuntime chapter={chapter} save={save} onSave={persist} onExit={() => setView("hub")} onContinue={() => startNorthTower()} />
      </Suspense>
    );
  }

  if (view === "north-tower-ledger") {
    const chapter = getChapter("north-tower-ledger");
    if (!chapter) return null;
    return (
      <Suspense fallback={<main className="runtime-loading"><p className="eyebrow">第二章</p><strong>正在载入主宅与旧日痕迹…</strong></main>}>
        <NorthTowerRuntime chapter={chapter} save={save} onSave={persist} onExit={() => setView("hub")} onContinue={startMissingRoom} />
      </Suspense>
    );
  }

  if (view === "missing-room") {
    const chapter = getChapter("missing-room");
    if (!chapter) return null;
    return (
      <Suspense fallback={<main className="runtime-loading"><p className="eyebrow">第三章</p><strong>正在载入北墙与那间消失的旧房…</strong></main>}>
        <MissingRoomRuntime chapter={chapter} save={save} onSave={persist} onExit={() => setView("hub")} onContinue={() => startNarrativeChapter("deleted-person")} />
      </Suspense>
    );
  }

  if (view === "you-did-not-return") {
    const chapter = getChapter("you-did-not-return");
    if (!chapter) return null;
    return (
      <Suspense fallback={<main className="runtime-loading"><p className="eyebrow">第五章</p><strong>正在载入案发雨夜与折返路线…</strong></main>}>
        <YouDidNotReturnRuntime chapter={chapter} save={save} onSave={persist} onExit={() => setView("hub")} onContinue={() => startNarrativeChapter("fifth-tingyuxuan")} />
      </Suspense>
    );
  }

  if (view === "fifth-tingyuxuan") {
    const chapter = getChapter("fifth-tingyuxuan");
    if (!chapter) return null;
    return (
      <Suspense fallback={<main className="runtime-loading"><p className="eyebrow">终章</p><strong>正在载入雨停后的听雨轩…</strong></main>}>
        <FifthTingYuXuanRuntime chapter={chapter} save={save} onSave={persist} onExit={() => setView("hub")} />
      </Suspense>
    );
  }

  if (view === "deleted-person") {
    const chapter = getChapter(view);
    if (!chapter) return null;
    return (
      <Suspense fallback={<main className="runtime-loading"><p className="eyebrow">{chapter.title}</p><strong>正在整理证词与关键画面…</strong></main>}>
        <NarrativeChapterRuntime chapter={chapter} save={save} onSave={persist} onExit={() => setView("hub")} onContinue={() => startNarrativeChapter("you-did-not-return")} />
      </Suspense>
    );
  }

  return (
    <main className="site-shell">
      <section className="case-directory" id="top">
        <div className="case-directory-image" aria-hidden="true" />
        <div className="case-directory-wash" aria-hidden="true" />
        <div className="case-directory-rule" aria-hidden="true" />

        <div className="case-directory-panel">
          <a href="#top" className="case-brand" aria-label="游园惊梦：四面证词">
            <span className="case-brand-mark"><i>园</i></span>
            <span className="case-brand-copy"><strong>游园惊梦</strong><small>四面证词</small></span>
          </a>

          <div className="case-directory-heading">
            <span className="case-kicker">CASE ARCHIVE · TING YU XUAN</span>
            <span className="case-directory-genre">中式悬疑 · 第一人称 3D 调查 · 空间叙事解谜</span>
            <h1>案卷目录</h1>
            <p className="case-directory-logline">七年后，赵映回到旧园听雨轩，重查沈老爷雨夜死亡。四份证词描述着同一座园子，却彼此无法重合。</p>
          </div>

          <HomeMenu
            activeId={activeMenu}
            onActiveChange={setActiveMenu}
            primaryTitleCn={primaryMenuLabel.titleCn}
            primaryTitleEn={primaryMenuLabel.titleEn}
            onContinue={continueCurrentInvestigation}
            onNewGame={startNewGame}
            onChapters={() => setView("chapters")}
            onSettings={() => setView("settings")}
            onCredits={() => { window.location.href = "/credits"; }}
          />

          <div className="case-directory-meta">
            <span>PC WEB · 实时 3D · 叙事解谜 · 16+</span>
            <i aria-hidden="true" />
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <span>《游园惊梦：四面证词》 · CASE ARCHIVE</span>
        <span><a href="/credits">制作与授权</a> · 存档：{save.completedChapters.length} 段完成</span>
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
      {view === "chapters" && (
        <ChapterPanel
          save={save}
          onClose={() => setView("hub")}
          onStart={(chapterId) => {
            if (chapterId === "prologue-rain") startOnboarding(true);
            else if (chapterId === "west-corridor-loop") startChapterOne(true);
            else if (chapterId === "north-tower-ledger") startNorthTower(true);
            else if (chapterId === "missing-room") startMissingRoom(true);
            else if (chapterId === "deleted-person" || chapterId === "you-did-not-return" || chapterId === "fifth-tingyuxuan") startNarrativeChapter(chapterId, true);
          }}
          onGallery={() => setView("gallery")}
        />
      )}
      {view === "gallery" && <StoryCGGallery save={save} onClose={() => setView("chapters")} />}
    </main>
  );
}

function HomeMenu({
  activeId,
  onActiveChange,
  primaryTitleCn,
  primaryTitleEn,
  onContinue,
  onNewGame,
  onChapters,
  onSettings,
  onCredits,
}: {
  activeId: HomeMenuId;
  onActiveChange: (id: HomeMenuId) => void;
  primaryTitleCn: string;
  primaryTitleEn: string;
  onContinue: () => void;
  onNewGame: () => void;
  onChapters: () => void;
  onSettings: () => void;
  onCredits: () => void;
}) {
  const items: Array<{ id: HomeMenuId; titleCn: string; titleEn: string; onClick: () => void }> = [
    { id: "01", titleCn: primaryTitleCn, titleEn: primaryTitleEn, onClick: onContinue },
    { id: "02", titleCn: "开始新游戏", titleEn: "NEW GAME", onClick: onNewGame },
    { id: "03", titleCn: "章节", titleEn: "CHAPTERS", onClick: onChapters },
    { id: "04", titleCn: "设置", titleEn: "SETTINGS", onClick: onSettings },
    { id: "05", titleCn: "制作人员", titleEn: "CREDITS", onClick: onCredits },
  ];

  return (
    <nav className="home-menu" aria-label="案卷目录">
      {items.map((item) => (
        <MenuItem
          key={item.id}
          number={item.id}
          titleCn={item.titleCn}
          titleEn={item.titleEn}
          active={activeId === item.id}
          onActive={() => onActiveChange(item.id)}
          onClick={item.onClick}
        />
      ))}
    </nav>
  );
}

function ChapterPanel({ save, onClose, onStart, onGallery }: {
  save: CampaignSave;
  onClose: () => void;
  onStart: (chapterId: string) => void;
  onGallery: () => void;
}) {
  const playable = [
    ["prologue-rain", "序章 · 回园"],
    ["west-corridor-loop", "第一章 · 不存在的路"],
    ["north-tower-ledger", "第二章 · 多出来的人"],
    ["missing-room", "第三章 · 不存在的房间"],
    ["deleted-person", "第四章 · 被删掉的人"],
    ["you-did-not-return", "第五章 · 今晚你没回来"],
    ["fifth-tingyuxuan", "终章 · 第五种听雨轩"],
  ] as const;
  return (
    <div className="page-modal-backdrop">
      <section className="settings-panel chapter-panel" role="dialog" aria-modal="true" aria-label="章节选择">
        <button type="button" className="panel-close" onClick={onClose}>×</button>
        <p className="eyebrow">CHAPTERS</p>
        <h2>章节</h2>
        <div className="chapter-list">
          {playable.map(([id, label]) => {
            const unlocked = id === "prologue-rain" || save.unlockedChapters.includes(id) || save.completedChapters.includes(id);
            return <button key={id} type="button" disabled={!unlocked} onClick={() => onStart(id)}><strong>{label}</strong><small>{save.completedChapters.includes(id) ? "已完成 · 可重新开始" : unlocked ? "可进入" : "尚未解锁"}</small></button>;
          })}
        </div>
        <button type="button" className="gallery-button" onClick={onGallery}>打开剧情回顾 · {save.completedChapters.length > 0 ? "查看已解锁画面" : "完成章节后解锁"}</button>
      </section>
    </div>
  );
}

function MenuItem({ number, titleCn, titleEn, active, onActive, onClick }: {
  number: HomeMenuId;
  titleCn: string;
  titleEn: string;
  active: boolean;
  onActive: () => void;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`home-menu-item${active ? " active" : ""}`}
      onMouseEnter={onActive}
      onFocus={onActive}
      onClick={() => {
        onActive();
        onClick();
      }}
    >
      <span className="home-menu-number">{number}</span>
      <span className="home-menu-copy"><strong>{titleCn}</strong><small>{titleEn}</small></span>
      <i aria-hidden="true">↗</i>
    </button>
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
        <p className="eyebrow">显示与辅助</p>
        <h2>设置</h2>
        <div className="setting-row"><span><label htmlFor="quality">画质</label><small>稳定与低画质会限制像素比和雨滴数量</small></span><select id="quality" value={settings.quality} onChange={(event) => update("quality", event.target.value as GameSettings["quality"])}><option value="high">高画质</option><option value="stable">稳定模式</option><option value="low">最低画质</option></select></div>
        <div className="setting-row"><span><label htmlFor="renderer">画面兼容模式</label><small>遇到黑屏或闪退时可改用兼容模式</small></span><select id="renderer" value={settings.renderer} onChange={(event) => update("renderer", event.target.value as GameSettings["renderer"])}><option value="auto">自动（推荐）</option><option value="webgl">兼容模式</option></select></div>
        <div className="setting-row"><span><label htmlFor="stable-camera">稳定镜头</label><small>降低快速转向与镜头晃动；不会影响调查内容</small></span><input id="stable-camera" type="checkbox" checked={settings.stableCamera} onChange={(event) => update("stableCamera", event.target.checked)} /></div>
        <div className="setting-row"><span><label htmlFor="subtitles">行走字幕</label><small>显示探索时的环境短句与调查提示；主剧情文字始终保留</small></span><input id="subtitles" type="checkbox" checked={settings.subtitles} onChange={(event) => update("subtitles", event.target.checked)} /></div>
        <div className="setting-row"><span><label htmlFor="dialogue-speed">对话速度</label><small>控制剧情文字逐字显示速度</small></span><select id="dialogue-speed" value={settings.dialogueSpeed} onChange={(event) => update("dialogueSpeed", event.target.value as GameSettings["dialogueSpeed"])}><option value="slow">慢</option><option value="normal">标准</option><option value="fast">快</option><option value="instant">立即显示</option></select></div>
        <div className="setting-row"><span><label htmlFor="text-scale">文字大小</label><small>放大对白、文书、案卷与调查提示</small></span><select id="text-scale" value={settings.textScale} onChange={(event) => update("textScale", event.target.value as GameSettings["textScale"])}><option value="normal">标准</option><option value="large">大字</option></select></div>
        <div className="setting-row"><span><label htmlFor="master-volume">主音量</label><small>{Math.round(settings.masterVolume * 100)}%</small></span><input id="master-volume" type="range" min="0" max="1" step="0.05" value={settings.masterVolume} onChange={(event) => update("masterVolume", Number(event.target.value))} /></div>
        <button type="button" className="reset-button" onClick={onReset}>仅清除《游园惊梦》存档</button>
        <p className="settings-note">此操作只会清除《游园惊梦》的本地进度与选择。</p>
      </section>
    </div>
  );
}
