"use client";
/* eslint-disable @next/next/no-img-element -- runtime portraits are already compressed transparent WebP sprites */

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three/webgpu";
import { createCheckpoint } from "./campaign-save";
import { DialogueRunner } from "./narrative/DialogueRunner";
import { speakerProfiles } from "./narrative/speakers";
import type { CampaignSave, ChapterCompletePayload, ChapterManifest, CheckpointState, DialogueCommand, DialogueSequence, MemoryId } from "./types";
import { AudioAtmosphere } from "./runtime/AudioAtmosphere";
import { ObjectiveDirector, objectiveProgressKey, resolveActiveObjective } from "./runtime/ObjectiveDirector";
import { PhysicsController, type PlayerPose } from "./runtime/PhysicsController";
import { createRenderer, type RendererBackend } from "./runtime/RendererAdapter";
import { WestCorridorScene, type SceneInteractable } from "./runtime/WestCorridorScene";

type RuntimePhase = "loading" | "dialogue" | "playing" | "chase" | "failed" | "complete" | "error";

interface GameRuntimeProps {
  chapter: ChapterManifest;
  save: CampaignSave;
  onSave: (save: CampaignSave) => void;
  onExit: () => void;
}

const unique = <T,>(values: T[]) => [...new Set(values)];
const distance = (a: PlayerPose, b: THREE.Vector3) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

export function GameRuntime({ chapter, save, onSave, onExit }: GameRuntimeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef<{
    renderer: Awaited<ReturnType<typeof createRenderer>>;
    world: WestCorridorScene;
    physics: PhysicsController;
    audio: AudioAtmosphere;
  } | undefined>(undefined);
  const keysRef = useRef(new Set<string>());
  const touchModeRef = useRef(false);
  const yawRef = useRef(0);
  const pitchRef = useRef(0);
  const nearestRef = useRef<SceneInteractable | undefined>(undefined);
  const chaseStartedAtRef = useRef(0);
  const phaseRef = useRef<RuntimePhase>("loading");
  const dialogueRef = useRef<DialogueSequence | undefined>(undefined);
  const startDialogueRef = useRef<(id: string) => void>(() => undefined);
  const saveRef = useRef(save);
  const onSaveRef = useRef(onSave);
  const notebookRef = useRef(false);
  const directorRef = useRef(new ObjectiveDirector());
  const lastGuideUpdateRef = useRef(0);

  const [phase, setPhaseState] = useState<RuntimePhase>("loading");
  const [backend, setBackend] = useState<RendererBackend>();
  const [subtitle, setSubtitle] = useState("雨落在回廊外，像有人用指节一遍遍敲门。");
  const [barkSpeaker, setBarkSpeaker] = useState<MemoryId | "steward">("steward");
  const [prompt, setPrompt] = useState<string>();
  const [showNotebook, setShowNotebookState] = useState(false);
  const [activeDialogue, setActiveDialogueState] = useState<DialogueSequence>();
  const [hasPointerLock, setHasPointerLock] = useState(false);
  const [touchMode, setTouchMode] = useState(false);
  const [guideDistance, setGuideDistance] = useState<number>();
  const [guideAngle, setGuideAngle] = useState(0);
  const [error, setError] = useState("");

  const [initialCheckpoint] = useState<CheckpointState>(() => {
    if (save.activeCheckpoint.chapterId === chapter.id) {
      const restored = save.activeCheckpoint;
      return { ...restored, memoryId: restored.memoryId === "gardener" ? "gardener" : "wife" };
    }
    return { ...createCheckpoint(chapter.id, "wife"), anchorId: chapter.spawnAnchor };
  });
  const [checkpoint, setCheckpointState] = useState(initialCheckpoint);
  const checkpointRef = useRef(checkpoint);

  useEffect(() => { saveRef.current = save; onSaveRef.current = onSave; }, [onSave, save]);

  const setPhase = useCallback((next: RuntimePhase) => { phaseRef.current = next; setPhaseState(next); }, []);
  const setShowNotebook = useCallback((next: boolean) => { notebookRef.current = next; setShowNotebookState(next); }, []);

  const requestPointerLock = useCallback(() => {
    if (touchModeRef.current) return;
    const result = canvasRef.current?.requestPointerLock();
    if (result instanceof Promise) void result.catch(() => setHasPointerLock(false));
  }, []);

  const commitCheckpoint = useCallback((producer: (current: CheckpointState) => CheckpointState, includePosition = true) => {
    const current = checkpointRef.current;
    const pose = includePosition ? runtimeRef.current?.physics.pose() : undefined;
    const next = producer({ ...current, position: pose ? [pose.x, pose.y, pose.z] : current.position, yaw: yawRef.current, updatedAt: new Date().toISOString() });
    checkpointRef.current = next;
    setCheckpointState(next);
    const nextSave = { ...saveRef.current, activeCheckpoint: next };
    saveRef.current = nextSave;
    onSaveRef.current(nextSave);
    return next;
  }, []);

  const startDialogue = useCallback((id: string) => {
    const sequence = chapter.dialogueSequences?.find((item) => item.id === id);
    if (!sequence || dialogueRef.current?.id === id) return;
    dialogueRef.current = sequence;
    setActiveDialogueState(sequence);
    keysRef.current.clear();
    if (sequence.presentation === "stage") { document.exitPointerLock?.(); setPhase("dialogue"); }
    commitCheckpoint((current) => ({ ...current, dialogueProgress: current.dialogueProgress?.sequenceId === id ? current.dialogueProgress : undefined, pointerLockPending: sequence.presentation === "stage" }));
  }, [chapter.dialogueSequences, commitCheckpoint, setPhase]);
  useEffect(() => { startDialogueRef.current = startDialogue; }, [startDialogue]);

  const applyDialogueCommand = useCallback((command: DialogueCommand) => {
    directorRef.current.markProgress();
    if (command.type === "objective:start") commitCheckpoint((current) => ({ ...current, activeObjectiveId: command.objectiveId, objectiveStepId: command.stepId }));
    else if (command.type === "objective:step") commitCheckpoint((current) => ({ ...current, objectiveStepId: command.stepId }));
    else if (command.type === "flag:set") commitCheckpoint((current) => ({ ...current, earnedFlags: unique([...current.earnedFlags, command.flag]) }));
    else if (command.type === "trust:set") commitCheckpoint((current) => ({ ...current, trustDecisions: { ...current.trustDecisions, [command.nodeId]: command.choiceId }, earnedFlags: unique([...current.earnedFlags, "west.trust.decided", command.outputFlag]) }));
    else if (command.type === "memory:unlock") commitCheckpoint((current) => ({ ...current, earnedFlags: unique([...current.earnedFlags, `memory.${command.memoryId}.unlocked`]) }));
  }, [commitCheckpoint]);

  const startChase = useCallback(() => {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    runtime.audio.sting();
    const player = runtime.physics.pose();
    runtime.world.setOwnerVisible(true, new THREE.Vector3(player.x, 0, player.z + 7.5));
    chaseStartedAtRef.current = performance.now();
    commitCheckpoint((current) => ({ ...current, anchorId: "loop-seventh-window", chaseProgress: { ...current.chaseProgress, "faceless-owner-west": "active" } }));
    setSubtitle("没有脸的园主正在逼近。切到夫人的证词，穿过亮起的月洞门！");
    setBarkSpeaker("steward");
    setPhase("chase");
    requestPointerLock();
  }, [commitCheckpoint, requestPointerLock, setPhase]);

  const completeDialogue = useCallback((sequence: DialogueSequence) => {
    dialogueRef.current = undefined;
    setActiveDialogueState(undefined);
    const nextCheckpoint = commitCheckpoint((current) => ({
      ...current,
      dialogueProgress: undefined,
      pointerLockPending: false,
      earnedFlags: sequence.completionFlag ? unique([...current.earnedFlags, sequence.completionFlag]) : current.earnedFlags,
    }));

    if (sequence.id === "opening") {
      const nextSave = { ...saveRef.current, activeCheckpoint: nextCheckpoint, completedChapters: unique([...saveRef.current.completedChapters, "prologue-rain"]), unlockedChapters: unique([...saveRef.current.unlockedChapters, chapter.id]) };
      saveRef.current = nextSave;
      onSaveRef.current(nextSave);
      runtimeRef.current?.audio.start(save.settings.masterVolume);
      setSubtitle("跟着灯走。到西廊入口后，顾夫人会告诉你她看见了什么。");
      setBarkSpeaker("steward");
      setPhase("playing");
      requestPointerLock();
    } else if (sequence.id === "waterline-confirmed") {
      setSubtitle("第一笔勘误已经成立。打开勘误簿，记住两份独立证词的规则。");
      setBarkSpeaker("steward");
      setPhase("playing");
      setShowNotebook(true);
    } else if (sequence.id === "trust") window.setTimeout(() => startDialogueRef.current("chase-intro"), 120);
    else if (sequence.id === "chase-intro") startChase();
    else if (sequence.id === "completion") setPhase("complete");
    else if (sequence.presentation === "stage") {
      if (sequence.id === "wife-arrival") { setSubtitle("顾蘅秋：那不是水。是雨。你若要写进簿子，就先亲眼看看。"); setBarkSpeaker("wife"); }
      if (sequence.id === "gardener-arrival") { setSubtitle("周守圃：你要判错，就看脚下，别看我的脸。"); setBarkSpeaker("gardener"); }
      setPhase("playing");
      requestPointerLock();
    }
  }, [chapter.id, commitCheckpoint, requestPointerLock, save.settings.masterVolume, setPhase, setShowNotebook, startChase]);

  const switchMemory = useCallback(() => {
    if (!runtimeRef.current || !["playing", "chase"].includes(phaseRef.current) || dialogueRef.current?.presentation === "stage") return;
    const current = checkpointRef.current;
    const active = resolveActiveObjective(chapter.objectives ?? [], current);
    const waterlineConfirmed = current.contradictions.includes("waterline-direction");
    if (!waterlineConfirmed && active?.step.id !== "switch-gardener" && active?.step.id !== "inspect-gardener") {
      setSubtitle("先在夫人的证词里记下干渠，再用铜铃复查同一个地方。");
      setBarkSpeaker("wife");
      return;
    }
    const next: MemoryId = current.memoryId === "wife" ? "gardener" : "wife";
    runtimeRef.current.world.setMemory(next);
    runtimeRef.current.physics.setMemory(next);
    runtimeRef.current.audio.bell(next);
    setSubtitle(next === "wife" ? "顾蘅秋：我记得这一夜，水渠是干的。" : "周守圃：水从来没有顺着园主的意思走。");
    setBarkSpeaker(next);
    const nextCheckpoint = commitCheckpoint((value) => ({ ...value, memoryId: next, objectiveStepId: active?.step.id === "switch-gardener" ? "inspect-gardener" : value.objectiveStepId, earnedFlags: unique([...value.earnedFlags, "west.learned.memory-switch"]) }));
    directorRef.current.markProgress();
    if (next === "gardener" && !nextCheckpoint.earnedFlags.includes("west.dialogue.gardener-complete")) startDialogue("gardener-arrival");
  }, [chapter.objectives, commitCheckpoint, startDialogue]);

  const inspectContradiction = useCallback((item: SceneInteractable) => {
    const current = checkpointRef.current;
    const active = resolveActiveObjective(chapter.objectives ?? [], current);
    if (active?.step.targetInteractableId && active.step.targetInteractableId !== item.id) { setSubtitle(`当前任务：${active.step.instruction}`); return; }
    if (item.id === "waterline-direction" && active?.step.id === "inspect-wife" && current.memoryId !== "wife") return;
    if (item.id === "waterline-direction" && active?.step.id === "inspect-gardener" && current.memoryId !== "gardener") return;

    const memory = current.memoryId;
    const observed = current.observedBy[item.id] ?? [];
    if (observed.includes(memory)) { setSubtitle("这份证词已经记下。需要换一个人的记忆，在同一位置复查。"); return; }
    const definition = chapter.contradictions.find((value) => value.id === item.id);
    if (!definition) return;
    const nextObserved = unique([...observed, memory]);
    const confirmed = definition.requiredIndependentTestimonies.every((required) => nextObserved.includes(required));
    const next = commitCheckpoint((value) => ({
      ...value,
      observedBy: { ...value.observedBy, [item.id]: nextObserved },
      contradictions: confirmed ? unique([...value.contradictions, item.id]) : value.contradictions,
      earnedFlags: confirmed ? unique([...value.earnedFlags, definition.outputFlag]) : value.earnedFlags,
      objectiveStepId: !confirmed && item.id === "waterline-direction" ? "switch-gardener" : !confirmed && item.id === "corridor-count" ? "cross-check-window" : value.objectiveStepId,
      objectiveProgress: { ...value.objectiveProgress, [value.activeObjectiveId ?? "unknown"]: unique([...(value.objectiveProgress[value.activeObjectiveId ?? "unknown"] ?? []), `${item.id}:${memory}`]) },
    }));
    directorRef.current.markProgress();
    setBarkSpeaker(memory);
    if (confirmed) {
      setSubtitle(`矛盾确认：${definition.label}。两份独立证词在同一位置无法同时成立。`);
      if (item.id === "waterline-direction") window.setTimeout(() => startDialogue("waterline-confirmed"), 280);
      else if (next.contradictions.length >= chapter.contradictions.length) window.setTimeout(() => startDialogue("trust"), 280);
    } else {
      setSubtitle(`${definition.label}：已记录${memory === "wife" ? "夫人" : "园丁"}证词，还需要另一份独立观察。`);
      if (item.id === "corridor-count") window.setTimeout(() => startDialogue("loop-first-observation"), 140);
    }
  }, [chapter.contradictions, chapter.objectives, commitCheckpoint, startDialogue]);

  const interact = useCallback(() => { const item = nearestRef.current; if (item?.kind === "contradiction") inspectContradiction(item); }, [inspectContradiction]);

  const finishChapter = useCallback(() => {
    if (phaseRef.current === "complete" || dialogueRef.current?.id === "completion") return;
    const current = checkpointRef.current;
    const finalCheckpoint: CheckpointState = { ...current, anchorId: "west-safe-courtyard", activeObjectiveId: undefined, objectiveStepId: undefined, earnedFlags: unique([...current.earnedFlags, ...chapter.completionFlags]), chaseProgress: { ...current.chaseProgress, "faceless-owner-west": "escaped" }, updatedAt: new Date().toISOString() };
    checkpointRef.current = finalCheckpoint;
    setCheckpointState(finalCheckpoint);
    const nextSave: CampaignSave = { ...saveRef.current, activeCheckpoint: finalCheckpoint, completedChapters: unique([...saveRef.current.completedChapters, chapter.id]), unlockedChapters: unique([...saveRef.current.unlockedChapters, "north-tower-ledger"]) };
    saveRef.current = nextSave;
    onSaveRef.current(nextSave);
    const payload: ChapterCompletePayload = { chapterId: chapter.id, earnedFlags: finalCheckpoint.earnedFlags, contradictions: finalCheckpoint.contradictions, trustDecision: finalCheckpoint.trustDecisions["west-water-motive"] };
    window.dispatchEvent(new CustomEvent<ChapterCompletePayload>("garden-of-shadows:chapter-complete", { detail: payload }));
    document.exitPointerLock?.();
    runtimeRef.current?.world.setOwnerVisible(false);
    startDialogue("completion");
  }, [chapter.completionFlags, chapter.id, startDialogue]);

  const retryChase = useCallback(() => {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    runtime.physics.teleport({ x: 0, y: 0.9, z: -18 });
    yawRef.current = 0;
    runtime.world.setMemory("wife");
    runtime.physics.setMemory("wife");
    commitCheckpoint((current) => ({ ...current, memoryId: "wife" }));
    startChase();
  }, [commitCheckpoint, startChase]);

  useEffect(() => {
    const onChange = () => setHasPointerLock(document.pointerLockElement === canvasRef.current);
    document.addEventListener("pointerlockchange", onChange);
    return () => document.removeEventListener("pointerlockchange", onChange);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let animationFrame = 0;

    const boot = async () => {
      try {
        const renderer = await createRenderer(canvas, { forceWebGL: save.settings.renderer === "webgl", quality: save.settings.quality });
        const restored = initialCheckpoint.position;
        const physics = await PhysicsController.create({ x: restored?.[0] ?? 0, y: Math.max(restored?.[1] ?? 0.9, 0.9), z: restored?.[2] ?? 4.5 });
        if (cancelled) { renderer.dispose(); physics.dispose(); return; }
        const world = new WestCorridorScene(chapter.memories, save.settings.quality);
        const audio = new AudioAtmosphere();
        world.setMemory(initialCheckpoint.memoryId);
        physics.setMemory(initialCheckpoint.memoryId);
        yawRef.current = initialCheckpoint.yaw ?? 0;
        runtimeRef.current = { renderer, world, physics, audio };
        setBackend(renderer.backend);

        const resize = () => {
          const rect = canvas.getBoundingClientRect();
          renderer.resize(rect.width, rect.height, window.devicePixelRatio);
          world.camera.aspect = rect.width / Math.max(rect.height, 1);
          world.camera.updateProjectionMatrix();
        };
        resize();
        window.addEventListener("resize", resize);

        let previous = performance.now();
        const clock = (now: number) => {
          const delta = Math.min((now - previous) / 1000, 0.05);
          previous = now;
          const activePhase = phaseRef.current;
          let pose = physics.pose();
          if (["playing", "chase"].includes(activePhase) && (document.pointerLockElement === canvas || touchModeRef.current)) {
            const keys = keysRef.current;
            const forward = Number(keys.has("KeyW")) - Number(keys.has("KeyS"));
            const strafe = Number(keys.has("KeyD")) - Number(keys.has("KeyA"));
            const speed = keys.has("ShiftLeft") ? 4.5 : 2.75;
            const sin = Math.sin(yawRef.current);
            const cos = Math.cos(yawRef.current);
            pose = physics.move({ x: (forward * -sin + strafe * cos) * speed * delta, y: -2.2 * delta, z: (forward * -cos - strafe * sin) * speed * delta });
          }

          const objective = resolveActiveObjective(chapter.objectives ?? [], checkpointRef.current);
          const target = objective?.step.targetPosition ? new THREE.Vector3(...objective.step.targetPosition) : undefined;
          const showMarker = Boolean(target && (objective?.step.guidance.includes("world-marker") || (objective?.hintLevel ?? 0) >= 2));
          world.setGuidanceTarget(showMarker ? target : undefined);
          if (target && now - lastGuideUpdateRef.current > 120) {
            lastGuideUpdateRef.current = now;
            const dx = target.x - pose.x;
            const dz = target.z - pose.z;
            setGuideDistance(Math.hypot(dx, dz));
            setGuideAngle(THREE.MathUtils.radToDeg(Math.atan2(dx, -dz) - yawRef.current));
          }

          const emittedHint = directorRef.current.tick(delta, activePhase !== "playing" || notebookRef.current || Boolean(dialogueRef.current) || (!touchModeRef.current && document.pointerLockElement !== canvas), checkpointRef.current.activeObjectiveId, checkpointRef.current.objectiveStepId);
          if (emittedHint && objective) {
            const key = objectiveProgressKey(objective.objective.id, objective.step.id);
            commitCheckpoint((current) => ({ ...current, hintLevels: { ...current.hintLevels, [key]: emittedHint } }));
            setSubtitle(objective.step.hints[emittedHint - 1]);
            setBarkSpeaker("steward");
            audio.bell(checkpointRef.current.memoryId === "gardener" ? "gardener" : "wife");
          }

          if (objective?.objective.id === "west-arrival" && objective.step.id === "follow-lantern" && pose.z <= 1.15) {
            directorRef.current.markProgress();
            commitCheckpoint((current) => ({ ...current, earnedFlags: unique([...current.earnedFlags, "west.arrived"]) }));
            startDialogueRef.current("wife-arrival");
          }

          if (checkpointRef.current.memoryId === "gardener" && pose.z < -27.1) {
            physics.teleport({ x: pose.x, y: 0.9, z: 3.6 });
            pose = physics.pose();
            setSubtitle(activePhase === "chase" ? "回廊又把你送回入口。园丁的证词里没有出口！" : "同一盏灯、同一扇漏窗——你回到了西廊入口。");
            setBarkSpeaker("gardener");
          }

          world.camera.position.set(pose.x, pose.y + 0.78, pose.z);
          world.camera.rotation.set(pitchRef.current, yawRef.current, 0);
          const playerVector = new THREE.Vector3(pose.x, 0.9, pose.z);
          world.update(delta, playerVector, activePhase === "chase");

          let nearest: SceneInteractable | undefined;
          let nearestDistance = Number.POSITIVE_INFINITY;
          for (const item of world.interactables) {
            if (!item.memoryIds.includes(checkpointRef.current.memoryId)) continue;
            if (item.kind === "portal" && activePhase !== "chase") continue;
            const itemDistance = distance(pose, item.position);
            if (itemDistance < 2.15 && itemDistance < nearestDistance) { nearest = item; nearestDistance = itemDistance; }
          }
          if (nearestRef.current?.id !== nearest?.id) { nearestRef.current = nearest; setPrompt(nearest ? `[F] ${nearest.label}` : undefined); }

          if (activePhase === "chase") {
            if (checkpointRef.current.memoryId === "wife" && pose.z < -26.25 && Math.abs(pose.x) < 1.65) finishChapter();
            else if (world.ownerDistance(playerVector) < 1.15 || now - chaseStartedAtRef.current > 42_000) {
              document.exitPointerLock?.();
              world.setOwnerVisible(false);
              setSubtitle("他没有杀死你，只把你的脸在记忆里擦掉了一次。");
              setPhase("failed");
            }
          }

          renderer.renderer.render(world.scene, world.camera);
          animationFrame = window.requestAnimationFrame(clock);
        };
        animationFrame = window.requestAnimationFrame(clock);

        const resumeId = initialCheckpoint.dialogueProgress?.sequenceId;
        if (resumeId) startDialogueRef.current(resumeId);
        else if (!initialCheckpoint.earnedFlags.includes("prologue.dialogue.complete")) startDialogueRef.current("opening");
        else if (initialCheckpoint.chaseProgress["faceless-owner-west"] === "active") setPhase("failed");
        else if (initialCheckpoint.earnedFlags.includes("west.chapter.complete")) setPhase("complete");
        else { audio.start(save.settings.masterVolume); setPhase("playing"); }

        return () => window.removeEventListener("resize", resize);
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "未知渲染错误");
        setPhase("error");
      }
    };

    let removeResize: (() => void) | undefined;
    void boot().then((cleanup) => { removeResize = cleanup; });
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(animationFrame);
      removeResize?.();
      runtimeRef.current?.audio.dispose();
      runtimeRef.current?.world.dispose();
      runtimeRef.current?.physics.dispose();
      runtimeRef.current?.renderer.dispose();
      runtimeRef.current = undefined;
    };
  }, [chapter.memories, chapter.objectives, commitCheckpoint, finishChapter, initialCheckpoint, save.settings.masterVolume, save.settings.quality, save.settings.renderer, setPhase]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (dialogueRef.current?.presentation === "stage") return;
      keysRef.current.add(event.code);
      if (event.repeat) return;
      if (event.code === "Tab") { event.preventDefault(); switchMemory(); }
      if (event.code === "KeyF") interact();
      if (event.code === "KeyM" && ["playing", "chase"].includes(phaseRef.current)) {
        const next = !notebookRef.current;
        setShowNotebook(next);
        if (next) document.exitPointerLock?.(); else requestPointerLock();
      }
    };
    const onKeyUp = (event: KeyboardEvent) => keysRef.current.delete(event.code);
    const onMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== canvasRef.current) return;
      yawRef.current -= event.movementX * 0.0022;
      pitchRef.current = THREE.MathUtils.clamp(pitchRef.current - event.movementY * 0.0018, -1.18, 1.18);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("mousemove", onMouseMove);
    return () => { window.removeEventListener("keydown", onKeyDown); window.removeEventListener("keyup", onKeyUp); window.removeEventListener("mousemove", onMouseMove); };
  }, [interact, requestPointerLock, setShowNotebook, switchMemory]);

  const activeObjective = resolveActiveObjective(chapter.objectives ?? [], checkpoint);
  const activeMemory = chapter.memories.find((memory) => memory.id === checkpoint.memoryId);
  const observedCount = Object.values(checkpoint.observedBy).reduce((sum, memories) => sum + memories.length, 0);
  const barkProfile = speakerProfiles[barkSpeaker];
  const barkImage = barkProfile?.portraits[barkProfile.defaultPortrait];
  const beginTouchMove = (code: string) => {
    touchModeRef.current = true;
    setTouchMode(true);
    keysRef.current.add(code);
  };

  return (
    <main className={`runtime runtime-${checkpoint.memoryId}`}>
      <canvas ref={canvasRef} className="runtime-canvas" aria-label="西廊回环实时三维场景" tabIndex={0} onClick={() => ["playing", "chase"].includes(phase) && requestPointerLock()} />
      <div className="vignette" aria-hidden="true" />
      <header className="runtime-topbar">
        <button type="button" onClick={onExit} className="text-button">← 章节总览</button>
        <div><span>序章＋第一章</span><strong>雨入听轩 · 西廊回环</strong></div>
        <div className="runtime-status"><i className="status-dot" /> {backend?.toUpperCase() ?? "LOADING"}</div>
      </header>

      {activeObjective && <aside className="objective-card" aria-live="polite"><span>当前任务</span><strong>{activeObjective.objective.title}</strong><p>{activeObjective.step.instruction}</p>{activeObjective.hint && <small>提示：{activeObjective.hint}</small>}</aside>}
      <aside className="memory-card"><span>当前证词 · TAB 切换</span><strong>{activeMemory?.label}</strong><small>{activeMemory?.description}</small></aside>
      <aside className="case-progress"><span>勘误进度</span><strong>{checkpoint.contradictions.length} / {chapter.contradictions.length}</strong><small>{observedCount} 次独立观察</small><button type="button" onClick={() => { setShowNotebook(true); document.exitPointerLock?.(); }}>M · 打开勘误簿</button></aside>

      {guideDistance !== undefined && activeObjective?.step.guidance.includes("direction") && <div className="objective-direction"><i style={{ transform: `rotate(${guideAngle}deg)` }}>↑</i><span>{Math.max(1, Math.round(guideDistance))} m</span></div>}
      {prompt && <div className="interaction-prompt">{prompt}</div>}
      {save.settings.subtitles && subtitle && !activeDialogue && <div className="bark-subtitle">{barkImage && <img src={barkImage} alt="" />}<p><b>{barkProfile?.name}</b>{subtitle}</p></div>}
      <div className="runtime-controls">WASD 移动 · 鼠标观察 · Shift 快走 · Tab 换证词 · F 勘验 · M 勘误簿</div>

      <div className="touch-controls" aria-label="移动端控制"><div className="touch-move"><button type="button" aria-label="向前" onPointerDown={() => beginTouchMove("KeyW")} onPointerUp={() => keysRef.current.delete("KeyW")} onPointerCancel={() => keysRef.current.delete("KeyW")}>↑</button><button type="button" aria-label="向左" onPointerDown={() => beginTouchMove("KeyA")} onPointerUp={() => keysRef.current.delete("KeyA")} onPointerCancel={() => keysRef.current.delete("KeyA")}>←</button><button type="button" aria-label="向后" onPointerDown={() => beginTouchMove("KeyS")} onPointerUp={() => keysRef.current.delete("KeyS")} onPointerCancel={() => keysRef.current.delete("KeyS")}>↓</button><button type="button" aria-label="向右" onPointerDown={() => beginTouchMove("KeyD")} onPointerUp={() => keysRef.current.delete("KeyD")} onPointerCancel={() => keysRef.current.delete("KeyD")}>→</button></div><div className="touch-actions"><button type="button" onClick={switchMemory}>换证词</button><button type="button" onClick={interact}>勘验</button></div></div>

      {phase === "loading" && <RuntimeModal eyebrow="正在载入" title="搭建听雨轩空间…"><p>正在初始化渲染后端、碰撞世界、任务导演与雨夜记忆。</p></RuntimeModal>}

      {activeDialogue && <DialogueRunner key={activeDialogue.id} sequence={activeDialogue} settings={save.settings} restoredState={checkpoint.dialogueProgress?.sequenceId === activeDialogue.id ? checkpoint.dialogueProgress.inkStateJson : undefined} seenLineIds={checkpoint.seenDialogueLines} onCommand={applyDialogueCommand} onProgress={(inkStateJson) => commitCheckpoint((current) => ({ ...current, dialogueProgress: { sequenceId: activeDialogue.id, inkStateJson } }))} onSeen={(lineId) => commitCheckpoint((current) => ({ ...current, seenDialogueLines: unique([...current.seenDialogueLines, lineId]) }))} onComplete={() => completeDialogue(activeDialogue)} />}

      {!activeDialogue && ["playing", "chase"].includes(phase) && !hasPointerLock && !touchMode && !showNotebook && <button type="button" className="resume-control" onClick={requestPointerLock}><span>继续勘验</span><small>点击恢复第一人称视角</small></button>}

      {phase === "failed" && <RuntimeModal eyebrow="记忆断点" title="你的脸又被擦去一次"><p>失败不会抹去证据。你将回到追逐前，并自动切回能看见月洞门的夫人证词。</p><button type="button" className="primary-button" onClick={retryChase}>从漏窗前重试</button></RuntimeModal>}
      {phase === "complete" && !activeDialogue && <RuntimeModal eyebrow="V0.1R ONBOARDING SLICE" title="第一章完成"><p>你已完成两次独立证词交叉核对，并把动机判断写入责任链。下一条线索位于北楼墨账。</p><button type="button" className="primary-button" onClick={onExit}>返回章节总览</button></RuntimeModal>}
      {phase === "error" && <RuntimeModal eyebrow="可恢复错误" title="三维场景未能启动"><p>{error}</p><p>请在设置中强制 WebGL 2 或降低画质后重试；存档没有丢失。</p><button type="button" className="primary-button" onClick={onExit}>返回设置</button></RuntimeModal>}

      {showNotebook && <div className="notebook-backdrop"><section className="notebook" role="dialog" aria-modal="true" aria-label="勘误簿"><button type="button" className="notebook-close" onClick={() => { setShowNotebook(false); requestPointerLock(); }}>×</button><p className="eyebrow">SPATIAL CONTRADICTIONS</p><h2>西廊勘误簿</h2><div className="notebook-rule"><b>勘验规则</b><span>同一地点 · 两份独立证词 · 才能确认矛盾</span></div>{chapter.contradictions.map((item, index) => { const observed = checkpoint.observedBy[item.id] ?? []; const confirmed = checkpoint.contradictions.includes(item.id); return <article key={item.id} className={confirmed ? "confirmed" : ""}><b>0{index + 1}</b><div><strong>{confirmed ? item.label : "尚未确认的矛盾"}</strong><p>{confirmed ? item.description : `独立观察 ${observed.length} / ${item.requiredIndependentTestimonies.length}`}</p></div><span>{confirmed ? "已确认" : "待核对"}</span></article>; })}</section></div>}
    </main>
  );
}

function RuntimeModal({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return <div className="runtime-modal-backdrop"><section className="runtime-modal" role="dialog" aria-modal="true"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{children}</section></div>;
}
