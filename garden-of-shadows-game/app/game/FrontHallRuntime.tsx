"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three/webgpu";
import { createCheckpoint } from "./campaign-save";
import { DialogueRunner } from "./narrative/DialogueRunner";
import frontStory from "./narrative/front-hall-guest.json";
import type { CampaignSave, ChapterManifest, CheckpointState, DialogueCommand, DialogueSequence, MemoryId } from "./types";
import { createRenderer, type RendererBackend } from "./runtime/RendererAdapter";
import { FrontHallScene, type FrontHallInteractable } from "./runtime/FrontHallScene";

type FrontPhase = "loading" | "dialogue" | "playing" | "ranking" | "complete" | "error";

interface FrontHallRuntimeProps {
  chapter: ChapterManifest;
  save: CampaignSave;
  onSave: (save: CampaignSave) => void;
  onExit: () => void;
}

const unique = <T,>(values: T[]) => [...new Set(values)];
const memoryOrder: MemoryId[] = ["painter", "wife", "gardener", "accountant"];
const memoryName: Record<string, string> = { painter: "柳生证词", wife: "夫人证词", gardener: "园丁证词", accountant: "账房证词" };
const marks = ["front.mark.painter", "front.mark.wife", "front.mark.gardener", "front.mark.accountant"];

const objectiveFor = (checkpoint: CheckpointState) => {
  const flags = checkpoint.earnedFlags;
  if (!flags.includes("front.mark.painter")) return { title: "检查未完成的画", detail: "保持柳生证词，沿主走廊找到画架。", targetId: "painter-easel" as const };
  if (!flags.includes("front.mark.wife")) return { title: "找回丢失的玉佩", detail: "按 Tab 切到夫人证词，进入右侧偏厅。", targetId: "wife-jade" as const };
  if (!flags.includes("front.mark.gardener")) return { title: "取出园艺剪", detail: "按 Tab 切到园丁证词，检查中庭左侧假山。", targetId: "gardener-shears" as const };
  if (!flags.includes("front.mark.accountant")) return { title: "找到夹页", detail: "按 Tab 切到账房证词，检查中庭右侧案台。", targetId: "accountant-page" as const };
  return { title: "开启四面锁", detail: "四枚印记齐全。走到东院门前，按 F 排列证词。", targetId: "fourfold-lock" as const };
};

export function FrontHallRuntime({ chapter, save, onSave, onExit }: FrontHallRuntimeProps) {
  const [initialCheckpoint] = useState<CheckpointState>(() => {
    if (save.activeCheckpoint.chapterId === chapter.id) return { ...save.activeCheckpoint, memoryId: memoryOrder.includes(save.activeCheckpoint.memoryId) ? save.activeCheckpoint.memoryId : "painter" };
    return { ...createCheckpoint(chapter.id, "painter"), anchorId: chapter.spawnAnchor };
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef<{ renderer: Awaited<ReturnType<typeof createRenderer>>; world: FrontHallScene } | undefined>(undefined);
  const keysRef = useRef(new Set<string>());
  const playerRef = useRef(new THREE.Vector3(...(initialCheckpoint.position ?? [0, 1.65, 7] as [number, number, number])));
  const yawRef = useRef(initialCheckpoint.yaw ?? 0);
  const pitchRef = useRef(0);
  const memoryRef = useRef<MemoryId>(initialCheckpoint.memoryId);
  const phaseRef = useRef<FrontPhase>("loading");
  const nearestRef = useRef<FrontHallInteractable | undefined>(undefined);
  const promptIdRef = useRef("");
  const areaRef = useRef("慢时前厅");
  const checkpointRef = useRef(initialCheckpoint);
  const saveRef = useRef(save);
  const onSaveRef = useRef(onSave);
  const dialogueRef = useRef<DialogueSequence | undefined>(undefined);
  const startDialogueRef = useRef<(id: string) => void>(() => undefined);

  const [checkpoint, setCheckpoint] = useState(initialCheckpoint);
  const [phase, setPhaseState] = useState<FrontPhase>(save.completedChapters.includes(chapter.id) ? "complete" : "loading");
  const [backend, setBackend] = useState<RendererBackend>();
  const [memory, setMemoryState] = useState<MemoryId>(initialCheckpoint.memoryId);
  const [prompt, setPrompt] = useState<string>();
  const [area, setArea] = useState("慢时前厅");
  const [subtitle, setSubtitle] = useState("前厅的钟慢得像在等人，远处中庭的钟却走得太快。");
  const [activeDialogue, setActiveDialogue] = useState<DialogueSequence>();
  const [hasPointerLock, setHasPointerLock] = useState(false);
  const [keyboardFallback, setKeyboardFallback] = useState(false);
  const [rankingMost, setRankingMost] = useState<MemoryId>();
  const [error, setError] = useState("");

  const setPhase = useCallback((next: FrontPhase) => { phaseRef.current = next; setPhaseState(next); }, []);
  useEffect(() => { saveRef.current = save; onSaveRef.current = onSave; }, [onSave, save]);

  const persistCheckpoint = useCallback((producer: (current: CheckpointState) => CheckpointState) => {
    const position = playerRef.current;
    const next = producer({ ...checkpointRef.current, position: [position.x, position.y, position.z], yaw: yawRef.current, updatedAt: new Date().toISOString() });
    checkpointRef.current = next;
    setCheckpoint(next);
    const nextSave = { ...saveRef.current, activeCheckpoint: next };
    saveRef.current = nextSave;
    onSaveRef.current(nextSave);
    return next;
  }, []);
  const addFlags = useCallback((...flags: string[]) => persistCheckpoint((current) => ({ ...current, earnedFlags: unique([...current.earnedFlags, ...flags]) })), [persistCheckpoint]);

  const requestPointerLock = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.focus();
    setKeyboardFallback(true);
    const result = canvas.requestPointerLock?.();
    if (result instanceof Promise) void result.catch(() => setHasPointerLock(false));
  }, []);

  const changeMemory = useCallback((next: MemoryId) => {
    memoryRef.current = next;
    setMemoryState(next);
    runtimeRef.current?.world.setMemory(next);
    persistCheckpoint((current) => ({ ...current, memoryId: next }));
    setSubtitle(`${memoryName[next]}覆盖前厅：同一个位置，现在服从另一套记忆。`);
  }, [persistCheckpoint]);

  const startDialogue = useCallback((id: string) => {
    const sequence = chapter.dialogueSequences?.find((item) => item.id === id);
    if (!sequence || dialogueRef.current?.id === id) return;
    dialogueRef.current = sequence;
    setActiveDialogue(sequence);
    keysRef.current.clear();
    document.exitPointerLock?.();
    setPhase("dialogue");
  }, [chapter.dialogueSequences, setPhase]);
  useEffect(() => { startDialogueRef.current = startDialogue; }, [startDialogue]);

  const applyDialogueCommand = useCallback((command: DialogueCommand) => {
    if (command.type === "flag:set") addFlags(command.flag);
    else if (command.type === "memory:unlock") addFlags(`memory.${command.memoryId}.unlocked`);
    else if (command.type === "objective:start") persistCheckpoint((current) => ({ ...current, activeObjectiveId: command.objectiveId, objectiveStepId: command.stepId }));
    else if (command.type === "objective:step") persistCheckpoint((current) => ({ ...current, objectiveStepId: command.stepId }));
  }, [addFlags, persistCheckpoint]);

  const finishChapter = useCallback(() => {
    const finalCheckpoint = persistCheckpoint((current) => ({ ...current, earnedFlags: unique([...current.earnedFlags, "front.chapter.complete", "campaign.witness.painter"]), dialogueProgress: undefined }));
    const nextSave: CampaignSave = {
      ...saveRef.current,
      activeCheckpoint: finalCheckpoint,
      completedChapters: unique([...saveRef.current.completedChapters, chapter.id]),
      unlockedChapters: unique([...saveRef.current.unlockedChapters, "sealed-pavilion"]),
    };
    saveRef.current = nextSave;
    onSaveRef.current(nextSave);
    setPhase("complete");
  }, [chapter.id, persistCheckpoint, setPhase]);

  const completeDialogue = useCallback((sequence: DialogueSequence) => {
    dialogueRef.current = undefined;
    setActiveDialogue(undefined);
    persistCheckpoint((current) => ({ ...current, dialogueProgress: undefined, earnedFlags: sequence.completionFlag ? unique([...current.earnedFlags, sequence.completionFlag]) : current.earnedFlags }));
    if (sequence.id === "front-painting") {
      addFlags("front.mark.painter");
      setSubtitle("画作印记已记录。按 Tab 切换夫人证词，去右侧偏厅寻找玉佩。");
      setPhase("playing");
      requestPointerLock();
    } else if (sequence.id === "front-lock") {
      setPhase("ranking");
    } else if (sequence.id === "front-completion") {
      finishChapter();
    } else {
      setPhase("playing");
      requestPointerLock();
    }
  }, [addFlags, finishChapter, persistCheckpoint, requestPointerLock, setPhase]);

  const observeContradiction = useCallback((id: "painted-door" | "vanishing-corridor") => {
    const contradiction = chapter.contradictions.find((item) => item.id === id);
    if (!contradiction) return;
    const next = persistCheckpoint((current) => {
      const observed = unique([...(current.observedBy[id] ?? []), memoryRef.current]);
      const confirmed = contradiction.requiredIndependentTestimonies.every((required) => observed.includes(required));
      return { ...current, observedBy: { ...current.observedBy, [id]: observed }, contradictions: confirmed ? unique([...current.contradictions, id]) : current.contradictions, earnedFlags: confirmed ? unique([...current.earnedFlags, contradiction.outputFlag]) : current.earnedFlags };
    });
    setSubtitle(next.contradictions.includes(id) ? `${contradiction.label}已由两份证词确认。` : `已记录 1/2。切换证词，在同一位置再次勘验。`);
  }, [chapter.contradictions, persistCheckpoint]);

  const interact = useCallback(() => {
    if (phaseRef.current !== "playing") return;
    const item = nearestRef.current;
    if (!item) return;
    if (item.id === "painter-easel") startDialogue("front-painting");
    else if (item.id === "wife-jade") { addFlags("front.mark.wife"); setSubtitle("玉佩仍在梳妆台上。夫人所谓‘丢失’，是从证词里删除，不是从空间里消失。"); }
    else if (item.id === "gardener-shears") { addFlags("front.mark.gardener"); setSubtitle("园艺剪藏在偏移的假山里。死循环被勘误后，它仍保留案发当晚的湿泥。"); }
    else if (item.id === "accountant-page") { addFlags("front.mark.accountant"); setSubtitle("夹页记着东院门轴的修缮款。账房的数字早已走进前厅。"); }
    else if (item.id === "painted-door" || item.id === "vanishing-corridor") observeContradiction(item.id);
    else if (item.id === "fourfold-lock") startDialogue("front-lock");
  }, [addFlags, observeContradiction, startDialogue]);

  const chooseRanking = useCallback((choice: MemoryId) => {
    if (!rankingMost) { setRankingMost(choice); return; }
    if (choice === rankingMost) return;
    persistCheckpoint((current) => ({
      ...current,
      trustDecisions: { ...current.trustDecisions, "front-most-trusted": rankingMost, "front-least-trusted": choice },
      earnedFlags: unique([...current.earnedFlags, "front.trust.ranked", `front.trust.most.${rankingMost}`, `front.trust.least.${choice}`]),
    }));
    setRankingMost(undefined);
    window.setTimeout(() => startDialogueRef.current("front-completion"), 100);
  }, [persistCheckpoint, rankingMost]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    const world = new FrontHallScene(chapter.memories, save.settings.quality);
    world.setMemory(memoryRef.current);
    const resize = () => {
      const runtime = runtimeRef.current;
      if (!runtime) return;
      const width = canvas.clientWidth || window.innerWidth;
      const height = canvas.clientHeight || window.innerHeight;
      world.camera.aspect = width / Math.max(1, height);
      world.camera.updateProjectionMatrix();
      runtime.renderer.resize(width, height, window.devicePixelRatio);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      keysRef.current.add(event.code);
      if (phaseRef.current === "playing" && !event.repeat) {
        const tap = new THREE.Vector3(event.code === "KeyD" ? 1 : event.code === "KeyA" ? -1 : 0, 0, event.code === "KeyS" ? 1 : event.code === "KeyW" ? -1 : 0);
        if (tap.lengthSq() > 0) { tap.applyAxisAngle(new THREE.Vector3(0, 1, 0), yawRef.current).multiplyScalar(.18); playerRef.current.add(tap); world.constrain(playerRef.current); }
        if (event.code === "ArrowLeft") yawRef.current += .08;
        if (event.code === "ArrowRight") yawRef.current -= .08;
      }
      if (event.code === "KeyF") interact();
      if (event.code === "Tab" && phaseRef.current === "playing") { event.preventDefault(); const index = memoryOrder.indexOf(memoryRef.current); changeMemory(memoryOrder[(index + 1) % memoryOrder.length]); }
    };
    const onKeyUp = (event: KeyboardEvent) => keysRef.current.delete(event.code);
    const onMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== canvas || phaseRef.current !== "playing") return;
      yawRef.current -= event.movementX * .0022;
      pitchRef.current = THREE.MathUtils.clamp(pitchRef.current - event.movementY * .0019, -1.25, 1.25);
    };
    const onLockChange = () => setHasPointerLock(document.pointerLockElement === canvas);
    const onBlur = () => { keysRef.current.clear(); setKeyboardFallback(false); };
    window.addEventListener("resize", resize);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("blur", onBlur);
    document.addEventListener("pointerlockchange", onLockChange);

    void createRenderer(canvas, { forceWebGL: save.settings.renderer === "webgl", quality: save.settings.quality }).then((renderer) => {
      if (cancelled) { renderer.dispose(); return; }
      runtimeRef.current = { renderer, world };
      setBackend(renderer.backend);
      resize();
      let previous = performance.now();
      renderer.renderer.setAnimationLoop((now: number) => {
        const delta = Math.min((now - previous) / 1000, .05);
        previous = now;
        if (phaseRef.current === "playing") {
          const turn = Number(keysRef.current.has("ArrowRight")) - Number(keysRef.current.has("ArrowLeft"));
          yawRef.current -= turn * 1.8 * delta;
          const input = new THREE.Vector3((keysRef.current.has("KeyD") ? 1 : 0) - (keysRef.current.has("KeyA") ? 1 : 0), 0, (keysRef.current.has("KeyS") ? 1 : 0) - (keysRef.current.has("KeyW") ? 1 : 0));
          if (input.lengthSq() > 0) { input.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), yawRef.current).multiplyScalar(delta * (keysRef.current.has("ShiftLeft") ? 5.4 : 3.25)); playerRef.current.add(input); world.constrain(playerRef.current); }
        }
        world.camera.position.copy(playerRef.current);
        world.camera.rotation.set(pitchRef.current, yawRef.current, 0);
        world.update(delta, playerRef.current.z);
        const nextArea = playerRef.current.z > 0 ? "慢时前厅" : playerRef.current.z < -8 ? "快时中庭" : "主走廊";
        if (nextArea !== areaRef.current) { areaRef.current = nextArea; setArea(nextArea); }
        const available = world.availableInteractables(memoryRef.current, checkpointRef.current.earnedFlags);
        const nearest = available.map((item) => ({ item, distance: item.position.distanceTo(playerRef.current) })).filter(({ distance }) => distance < 2.35).sort((a, b) => a.distance - b.distance)[0]?.item;
        nearestRef.current = nearest;
        const nextPromptId = phaseRef.current === "playing" ? nearest?.id ?? "" : "";
        if (nextPromptId !== promptIdRef.current) { promptIdRef.current = nextPromptId; setPrompt(nearest?.label); }
        const objective = objectiveFor(checkpointRef.current);
        world.setGuidanceTarget(world.interactables.find((item) => item.id === objective.targetId)?.position);
        renderer.renderer.render(world.scene, world.camera);
      });
      if (save.completedChapters.includes(chapter.id)) setPhase("complete");
      else if (checkpointRef.current.earnedFlags.includes("front.dialogue.opening")) setPhase("playing");
      else startDialogueRef.current("front-opening");
    }).catch((reason: unknown) => { setError(reason instanceof Error ? reason.message : "无法初始化前厅场景"); setPhase("error"); });
    return () => {
      cancelled = true;
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("pointerlockchange", onLockChange);
      world.dispose();
      runtimeRef.current?.renderer.dispose();
      runtimeRef.current = undefined;
    };
  }, [changeMemory, chapter.id, chapter.memories, interact, requestPointerLock, save.completedChapters, save.settings.quality, save.settings.renderer, setPhase]);

  const objective = objectiveFor(checkpoint);
  const markCount = marks.filter((flag) => checkpoint.earnedFlags.includes(flag)).length;
  const testSteps = [
    { label: "柳生证词：检查画中多出的门", done: checkpoint.earnedFlags.includes("front.mark.painter") },
    { label: "夫人证词：偏厅取回玉佩", done: checkpoint.earnedFlags.includes("front.mark.wife") },
    { label: "园丁证词：假山取出园艺剪", done: checkpoint.earnedFlags.includes("front.mark.gardener") },
    { label: "账房证词：中庭找到账页夹页", done: checkpoint.earnedFlags.includes("front.mark.accountant") },
    { label: "四面锁：选择最可信与最不可信", done: checkpoint.earnedFlags.includes("front.chapter.complete") },
  ];
  const activeStep = testSteps.findIndex((step) => !step.done);

  return (
    <main className={`runtime runtime-${memory} runtime-front-hall`}>
      <canvas ref={canvasRef} className="runtime-canvas" tabIndex={0} onClick={() => { if (phase === "playing") requestPointerLock(); }} aria-label="第三章前厅访客三维场景" />
      <div className="vignette" aria-hidden="true" />
      <div className="runtime-topbar">
        <button type="button" className="text-button" onClick={onExit}>← 返回案卷</button>
        <div><span>CHAPTER 03</span><strong>前厅访客</strong></div>
        <div className="runtime-status"><i className="status-dot" /> {backend?.toUpperCase() ?? "LOADING"} · {area}</div>
      </div>
      <section className="objective-card" aria-live="polite">
        <span>CURRENT OBJECTIVE</span><strong>{objective.title}</strong><p>{objective.detail}</p>
        <div className="chapter-test-route"><b>第三章测试路线 · {testSteps.filter((step) => step.done).length}/{testSteps.length}</b><ol>{testSteps.map((step, index) => <li key={step.label} className={step.done ? "done" : index === activeStep ? "active" : ""}><i>{step.done ? "✓" : index + 1}</i>{step.label}</li>)}</ol></div>
      </section>
      <section className="case-progress"><span>FOURFOLD LOCK</span><strong>{markCount} / 4 枚印记</strong><small>空间矛盾 {checkpoint.contradictions.filter((id) => chapter.contradictions.some((item) => item.id === id)).length} / {chapter.contradictions.length}</small></section>
      <section className="memory-card"><span>ACTIVE TESTIMONY</span><strong>{memoryName[memory]}</strong><small>Tab 切换柳生、夫人、园丁、账房。偏厅仅在柳生视角出现低重力漂浮。</small></section>
      {prompt && phase === "playing" && <div className="interaction-prompt">{prompt}</div>}
      {subtitle && phase === "playing" && <div className="bark-subtitle"><p><b>勘验记录</b>{subtitle}</p></div>}
      <div className="runtime-controls">WASD 移动 · {keyboardFallback && !hasPointerLock ? "方向键转向" : "鼠标观察"} · F 勘验 · Tab 切换四份证词 · Shift 加速</div>
      {phase === "playing" && !hasPointerLock && !keyboardFallback && <button type="button" className="pointer-lock-callout" onClick={requestPointerLock}>开始控制<br /><small>点击后使用 WASD；内置浏览器可用方向键转向</small></button>}
      {activeDialogue && <DialogueRunner key={activeDialogue.id} sequence={activeDialogue} storyContent={frontStory} settings={save.settings} restoredState={checkpoint.dialogueProgress?.sequenceId === activeDialogue.id ? checkpoint.dialogueProgress.inkStateJson : undefined} seenLineIds={checkpoint.seenDialogueLines} onCommand={applyDialogueCommand} onProgress={(inkStateJson) => persistCheckpoint((current) => ({ ...current, dialogueProgress: { sequenceId: activeDialogue.id, inkStateJson } }))} onSeen={(lineId) => persistCheckpoint((current) => ({ ...current, seenDialogueLines: unique([...current.seenDialogueLines, lineId]) }))} onComplete={() => completeDialogue(activeDialogue)} />}
      {phase === "ranking" && (
        <div className="runtime-modal-backdrop"><section className="runtime-modal front-ranking" role="dialog" aria-modal="true"><p className="eyebrow">FOURFOLD LOCK · TRUST ORDER</p><h1>{rankingMost ? "谁最不可信？" : "谁最可信？"}</h1><p>{rankingMost ? `已选最可信：${memoryName[rankingMost]}。第二次选择不能与第一次相同。` : "这不是判定真凶，而是决定进入东院后哪份景象最先出现。"}</p><div className="choice-stack">{memoryOrder.map((id) => <button key={id} type="button" disabled={id === rankingMost} onClick={() => chooseRanking(id)}><strong>{memoryName[id]}</strong><small>{id === "painter" ? "画中有现实不存在的门" : id === "wife" ? "丢失的玉佩仍在偏厅" : id === "gardener" ? "死循环深处藏着园艺剪" : "夹页记录东院修缮款"}</small></button>)}</div></section></div>
      )}
      {phase === "complete" && !activeDialogue && <FrontModal eyebrow="CHAPTER 03 COMPLETE" title="四面锁已经转动"><p>最可信：{memoryName[checkpoint.trustDecisions["front-most-trusted"]] ?? "未记录"}；最不可信：{memoryName[checkpoint.trustDecisions["front-least-trusted"]] ?? "未记录"}。</p><blockquote>四枚印记与证词排序已写入存档，第四章“水榭密室”已经解锁。</blockquote><button type="button" className="primary-button" onClick={onExit}>返回章节总览</button></FrontModal>}
      {phase === "error" && <FrontModal eyebrow="可恢复错误" title="前厅场景未能启动"><p>{error}</p><button type="button" className="primary-button" onClick={onExit}>返回章节总览</button></FrontModal>}
    </main>
  );
}

function FrontModal({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return <div className="runtime-modal-backdrop"><section className="runtime-modal" role="dialog" aria-modal="true"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{children}</section></div>;
}
